import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import "../../css/MainGame.css";
import "../../css/Font-Awesome.min.css";
import { HubConnectionState } from "@microsoft/signalr";
import $ from "jquery";
import ModalInfoCancelHand from "../../components/Dialogs/ModalInfoCancelHand";
import MyModalEndHand from "../../components/Dialogs/MyModalEndHand";
import SettlementModalEndGame from "../../components/Dialogs/SettlementModalEndGame";
import SettlementModal from "../../components/Dialogs/SettlementModal";
import { SendRequest } from "../../util/AxiosUtil";
import { GeneratePlayerId, getInitGameHash } from "../../common/game/basic";
import { GetNewDeck } from "../../common/game/CommonGame";

import * as MainV2 from "../../common/game/MainV2";
import Logging from "../../components/MainGameComponents/Logging";
import Player from "../../components/MainGameComponents/Player";
import PotDiv from "../../components/MainGameComponents/PotDiv";
import CurrentPlayerDiv from "../../components/MainGameComponents/CurrentPlayer";
import DealerPanel from "../../components/MainGameComponents/DealerPanel";
import GameControlPanel from "../../components/MainGameComponents/GameControlPanel";
import LogRocket from "../../util/LogRocketUtil";

import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
} from "@videosdk.live/react-sdk";
import { authToken } from "../../util/VideoSDK";

const MainGame = ({ isVideoChatAllowed }) => {
  const [searchParams] = useSearchParams();

  //signalR connection value
  const [connection, setConnection] = useState({});
  const [isCreator, setIsCreator] = useState(false);

  // related with Game state
  const [gameHash, setGameHash] = useState(getInitGameHash());
  const [Sno, setSno] = useState(1);
  const [CurrentHandTransaction, setCurrentHandTransaction] = useState();
  const [PlayerNetStatus] = useState([]);

  // related with card drag and drop variable
  const [DragSrc, setDragSrc] = useState();
  // related with modal
  const [modalInfoCancelHandOpen, setModalInfoCancelHandOpen] = useState(false);
  const [myModalEndHandOpen, setMyModalEndHandOpen] = useState(false);

  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlementModalEndGameOpen, setSettlementModalEndGameOpen] =
    useState(false);
  const [settlementModalTransactions, setSettlementModalTransactions] =
    useState([]);

  const [
    settlementModalEndGameTransactions,
    setSettlementModalEndGameTransactions,
  ] = useState([]);

  // memo variables
  const user = useMemo(() => {
    let tUser = JSON.parse(localStorage.getItem("user"));
    return tUser;
  }, []);

  const GameCode = useMemo(() => searchParams.get("GameCode"), [searchParams]);

  //view related variables
  const OtherPlayers_Prev = useMemo(
    () => MainV2.FilterActivePlayer((x) => x.Sno < Sno, gameHash),
    [Sno, gameHash]
  );

  const OtherPlayers_Next = useMemo(
    () => MainV2.FilterActivePlayer((x) => x.Sno > Sno, gameHash),
    [gameHash, Sno]
  );
  const CurrentPlayer = useMemo(
    () => MainV2.FilterActivePlayer((x) => x.Sno === Sno, gameHash)[0],
    [gameHash, Sno]
  );

  /**
   * ------------ Common Functions BEGIN -------------
   */
  const SaveGameHash = useCallback(
    async (tempGamsHash, ActionMsg = "Joined") => {
      if (typeof connection.connectionId === "undefined") return;

      let model = {
        UserId: user.Id,
        GameCode: GameCode,
        GameHash: JSON.stringify(tempGamsHash),
        ConnectionId: connection.connectionId,
        PlayerUniqueId: user.Id,
        ActionMessage: ActionMsg,
      };

      SendRequest({
        url: "GameV2/_UpdateGameHash",
        method: "post",
        data: model,
      }).then((result) => {
        setGameHash(tempGamsHash);
      });
    },
    [user, GameCode, connection.connectionId]
  );

  const JoinGame = useCallback(async () => {
    if (typeof connection.connectionId === "undefined") return;

    const generatedPlayerId = GeneratePlayerId(user.UserName, user.Id);

    //update gamehash for join
    SendRequest({
      url: "GameV2/_JoinGame",
      method: "post",
      data: {
        UserId: generatedPlayerId,
        GameCode: GameCode,
        ConnectionId: connection.connectionId,
        PlayerUniqueId: user.Id,
      },
    }).then(async (result) => {
      if (result.data === -1) {
        alert("Game is Locked Now");
        window.location.href = "/";
        return;
      }

      if (result.data === -2) {
        alert("Only Invitees can join this game");
        window.location.href = "/";
        return;
      }

      if (result.data === "") {
        alert("Game over or no game found with Current Joining Code");
        window.location.href = "/";
      } else {
        let tempGameHash = JSON.parse(result.data.GameHash);

        tempGameHash.GameId = GameCode;

        //Sno of the player joined
        let tempSno;

        //If already joined player, get it
        let ExistingPlayer, dealer;
        dealer = MainV2.GetDealer(tempGameHash);
        ExistingPlayer = MainV2.FilterActivePlayer(
          (x) => x.PlayerUniqueId === user.Id,
          tempGameHash
        )[0];

        /*
            When there are less than 5 ActivePlayers and you didn't already joined there.
            Add you to the ActivePlayerList and Update.
        */
        if (
          tempGameHash.ActivePlayers.length < 6 &&
          ExistingPlayer === undefined
        ) {
          // Set Sno as next index
          tempSno = tempGameHash.ActivePlayers.length + 1;

          // IsCurrent1: if you are next to Dealer, set IsCurrent1 as true
          let IsCurrent1 = "N";

          // if player is second pos, set IsCurrent1 as true
          if (dealer !== undefined && tempSno === dealer.Sno + 1)
            IsCurrent1 = "Y";

          // Add Current User to the ActivePlayersLsit
          tempGameHash.ActivePlayers.push({
            PlayerId: generatedPlayerId,
            PlayerName: "P4",
            PlayerCards: [],
            PlayerAmount: 0,
            ConnectionId: connection.connectionId,
            Sno: tempSno,
            IsDealer: "N",
            IsCurrent: IsCurrent1,
            IsFolded: "N",
            IsRealTimeChat: "N",
            CurrentRoundStatus: 0,
            PlayerUniqueId: user.Id,
          });

          if (tempGameHash.IsRoundSettlement === "N") {
            const currentPlayer = MainV2.GetActivePlayerBySno(
              tempSno,
              tempGameHash
            );
            currentPlayer.IsFolded = "Y";
            tempGameHash.ContinuityPlayers.push(currentPlayer);
          }

          // Update GameHash in the GameHashTable in database and UpdateView also.
        }

        // When there are less than 5 ActivePlayers and you already joined and not foled there and also you added to the ContinuityPlayer list
        else if (
          tempGameHash.ActivePlayers.length < 6 &&
          MainV2.FilterActivePlayer(
            (x) => x.PlayerUniqueId === user.Id && x.IsFolded === "N",
            tempGameHash
          ).length === 1 &&
          MainV2.FilterContinuityPlayer(
            (x) => x.PlayerUniqueId === user.Id,
            tempGameHash
          ).length === 1
        ) {
          tempSno = ExistingPlayer.Sno;

          /*
                change GameHash ActivePlayers and ContinuityPlayers.
                1. Change ConnectionId of current player in GameHash.
                2. Remove current player from ContinuityPlayers
            */
          ExistingPlayer.ConnectionId = connection.connectionId;
          tempGameHash.ContinuityPlayers = MainV2.FilterContinuityPlayer(
            (x) => x.PlayerUniqueId !== user.Id,
            tempGameHash
          );
        }

        // When you already joined there but foleded
        else if (
          MainV2.FilterActivePlayer(
            (x) => x.PlayerUniqueId === user.Id && x.IsFolded === "Y",
            tempGameHash
          ).length === 1
        ) {
          tempSno = ExistingPlayer.Sno;

          // if you didn't added to ContinuityPlayers list, add you there.
          if (
            MainV2.FilterContinuityPlayer(
              (x) => x.PlayerUniqueId === user.Id,
              tempGameHash
            ).length === 0
          )
            tempGameHash.ContinuityPlayers.push(ExistingPlayer);
        }

        //set Sno
        let tSno = MainV2.FilterActivePlayer(
          (x) => x.PlayerUniqueId === user.Id,
          tempGameHash
        )[0].Sno;

        setSno(tSno);

        LogRocket.log("Joined Game" + GameCode, {
          GameHash: tempGameHash,
          GameCode: GameCode,
          Sno: tSno,
        });

        //Update GameHash
        SaveGameHash(tempGameHash);
      }
    });
  }, [GameCode, user, connection.connectionId, SaveGameHash]);

  const ShowSummaryV2 = useCallback(
    (ev) => {
      let tempGameHash = { ...gameHash };
      if (tempGameHash.PotSize === 0) {
        const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

        // Get Balance and transactionList
        const resp = MainV2.CalculateEndHand(tempGameHash);
        setSettlementModalEndGameTransactions(resp);
        setSettlementModalEndGameOpen(true);

        LogRocket.log("ShowSummary", {
          GameHash: tempGameHash,
          transactions: resp,
        });

        // If current player is Dealer, send EndGameSummary to all of players.
        if (currentPlayer.IsDealer === "Y") {
          MainV2.SendEndGameSummary(connection, tempGameHash.GameId);
        }
        return true;
      }

      // If PotSize is more than 0, you can't show summary
      else {
        alert(
          "Game cannot be ended when pot is not settled. Please distribute the Pot First"
        );
        return false;
      }
    },
    [gameHash, Sno, connection]
  );

  const SettleRound = useCallback(
    async (tempGameHash) => {
      let tempCurrentHandTrasaction =
        typeof CurrentHandTransaction === "undefined"
          ? undefined
          : { ...CurrentHandTransaction };
      if (tempGameHash === undefined) tempGameHash = { ...gameHash };

      try {
        // initialize CurrentHandTransaction if it's not set yet
        if (tempCurrentHandTrasaction === undefined) {
          tempCurrentHandTrasaction = {
            GameHand: tempGameHash.GameHand,
            TransactionList: ["========= unsettled =========="],
          };
        }

        tempGameHash.Transaction.push(CurrentHandTransaction);

        PlayerNetStatus.forEach(() =>
          tempGameHash.PlayerNetStatus.push(PlayerNetStatus)
        );

        tempCurrentHandTrasaction = {};

        // GameHash.PotSize = 0;
        tempGameHash.CommunityCards = [];

        tempGameHash.ActivePlayers.forEach((obj) => {
          if (
            MainV2.FilterContinuityPlayer(
              (x) => x.Sno === obj.Sno,
              tempGameHash
            ).length === 1
          ) {
            // only if sitout is lifted
            //if (ExistingPlayer !== undefined) {
            if (obj.IsSitOut !== "Y") {
              obj.IsFolded = "N";
              tempGameHash.ContinuityPlayers = MainV2.FilterContinuityPlayer(
                (x) => x.Sno !== obj.Sno,
                tempGameHash
              );
            } else obj.IsFolded = "Y";
            /* } else {
              obj.IsFolded = "Y";
              tempGameHash.ContinuityPlayers = MainV2.FilterContinuityPlayer(
                (x) => x.Sno !== obj.Sno,
                tempGameHash
              );
             */
            obj.IsCurrent = "N";
          }

          obj.PlayerCards = [];
          obj.CurrentRoundStatus = 0;
        });

        //Add Step
        tempGameHash.Steps.push({
          RoundId: tempGameHash.Round,
          Step: {
            PlayerId: MainV2.GetActivePlayerBySno(Sno, tempGameHash).PlayerId,
            PlayerSno: Sno,
            Action: " ended hand ",
            Amount: "0 New Hand -->",
          },
        });

        tempGameHash.Round = 1;
        tempGameHash.CurrentBet = 0;
        tempGameHash.Deck = GetNewDeck();
        tempGameHash.NumberOfCommunities = 5;
        tempGameHash.GameHand = tempGameHash.GameHand + 1;

        let DealerSno = 0;
        try {
          DealerSno = MainV2.GetDealer(tempGameHash).Sno;
        } catch (err) {
          //GameLogging(err, 2);
          tempGameHash.ActivePlayers.forEach((tmp1) => (tmp1.IsDealer = "N"));

          const tmplist = [];
          tempGameHash.ContinuityPlayers.forEach((objtmp2) =>
            tmplist.push(objtmp2.Sno)
          );

          DealerSno = MainV2.FilterActivePlayer(
            (x) => tmplist.filter((y) => y === x.Sno).length === 0,
            tempGameHash
          )[0].Sno;

          // for removing deal duplication
          tempGameHash.ActivePlayers.forEach((obj2) => {
            obj2.IsDealer = "N";
          });
          MainV2.FilterActivePlayer(
            (x) => tmplist.filter((y) => y === x.Sno).length === 0,
            tempGameHash
          )[0].IsDealer = "Y";
        }

        tempGameHash.ActivePlayers.forEach((obj) => (obj.IsCurrent = "N"));

        let SnoTemp = DealerSno;
        if (
          tempGameHash.ActivePlayers.sort(function (a, b) {
            return a.Sno - b.Sno;
          }).filter((y) => y.IsFolded === "N").length === 0
        ) {
          if (
            tempGameHash.ActivePlayers.sort(function (a, b) {
              return a.Sno - b.Sno;
            }).filter((y) => y.Sno > SnoTemp).length > 0
          ) {
            tempGameHash.ActivePlayers.sort(function (a, b) {
              return a.Sno - b.Sno;
            }).filter((y) => y.Sno > SnoTemp)[0].IsCurrent = "Y";
          } else {
            tempGameHash.ActivePlayers.sort(function (a, b) {
              return a.Sno - b.Sno;
            }).filter((y) => y.Sno < SnoTemp)[0].IsCurrent = "Y";
          }
        } else if (
          tempGameHash.ActivePlayers.sort(function (a, b) {
            return a.Sno - b.Sno;
          }).filter((y) => y.IsFolded === "N" && y.Sno > DealerSno).length === 0
        ) {
          SnoTemp = tempGameHash.ActivePlayers.sort(function (a, b) {
            return a.Sno - b.Sno;
          }).filter((y) => y.IsFolded === "N")[0].Sno; // for current
          MainV2.FilterActivePlayer(
            (x) => x.Sno === SnoTemp,
            tempGameHash
          )[0].IsCurrent = "Y";
        } else {
          if (
            tempGameHash.ActivePlayers.sort(function (a, b) {
              return a.Sno - b.Sno;
            }).filter((y) => y.IsFolded === "N" && y.Sno > SnoTemp).length > 0
          ) {
            SnoTemp = tempGameHash.ActivePlayers.sort(function (a, b) {
              return a.Sno - b.Sno;
            }).filter((y) => y.IsFolded === "N" && y.Sno > SnoTemp)[0].Sno;
          } // for current
          else {
            SnoTemp = tempGameHash.ActivePlayers.sort(function (a, b) {
              return a.Sno - b.Sno;
            }).filter((y) => y.IsFolded === "N")[0].Sno;
          } // for current

          tempGameHash.ActivePlayers.sort(function (a, b) {
            return a.Sno - b.Sno;
          }).filter((y) => y.Sno === SnoTemp)[0].IsCurrent = "Y";
        }

        let SummaryHand = "";
        if (tempGameHash.Transaction.length > 0) {
          tempGameHash.Transaction.forEach((obj, index) => {
            SummaryHand += index + ". " + obj;
          });
        }

        setSettlementModalOpen(false);

        tempGameHash.Steps.push({
          RoundId: tempGameHash.Round - 1,
          Step: {
            PlayerId: MainV2.FilterActivePlayer(
              (x) => x.Sno === Sno,
              tempGameHash
            )[0].PlayerId,
            PlayerSno: Sno,
            Action: " ended hand ",
            Amount: "0 ||Summary: " + SummaryHand + "||  New Hand -->",
          },
        });

        tempGameHash.BetStatus =
          "The bet is 0 to " +
          MainV2.FilterActivePlayer(
            (x) => x.IsCurrent === "Y",
            tempGameHash
          )[0].PlayerId.split("pk2")[0];

        if (
          MainV2.FilterActivePlayer((x) => x.IsDealer === "Y", tempGameHash)[0]
            .Sno === Sno
        ) {
          tempGameHash.IsRoundSettlement = "Y";
          setCurrentHandTransaction(tempCurrentHandTrasaction);
          MainV2.SendNotification(
            connection,
            tempGameHash.GameId,
            "",
            "Hand eneded by" + user.UserName
          );
          SaveGameHash(tempGameHash);
        }
      } catch (err) {
        //GameLogging(err, 2);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      CurrentHandTransaction,
      gameHash,
      PlayerNetStatus,
      user.UserName,
      Sno,
      connection,
      SaveGameHash,
    ]
  );

  const SettleRoundEventHandler = useCallback(
    (tempGameHash) => {
      if (typeof tempGameHash === "undefined") tempGameHash = { ...gameHash };

      // Update every active player's PlayerNetStatusFinal and set PlayerAmount, Balance, CurrentRoundStatus all 0 since we start a new deal.
      if (MainV2.CheckCurrentStation(tempGameHash) === false) return;

      tempGameHash.ActivePlayers.forEach((obj) => {
        if (obj.PlayerNetStatusFinal === undefined) {
          obj.PlayerNetStatusFinal = 0;
        }

        obj.PlayerNetStatusFinal = obj.PlayerNetStatusFinal + obj.PlayerAmount;
        obj.PlayerAmount = 0;
        obj.Balance = 0;
        obj.CurrentRoundStatus = 0;
      });

      SettleRound(tempGameHash);
    },
    [SettleRound, gameHash]
  );

  const MyModalEndHand_YesEventHandler = useCallback(
    (ev) => {
      SettleRound();
      setMyModalEndHandOpen(false);
    },
    [SettleRound]
  );

  const EndGameForCurrentEventHandler = useCallback(
    (ev) => {
      try {
        let flag =
          CurrentPlayer && CurrentPlayer.IsDealer === "Y" ? true : false;
        let tempGameHash = { ...gameHash };

        let currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

        if (currentPlayer) {
          // Set current player as folded.
          currentPlayer.IsFolded = "Y";

          // if current player is dealer
          if (currentPlayer.IsDealer === "Y") {
            // if there are players that joined after me and not folded
            if (
              MainV2.GetUnfoldedActivePlayersAfterSno(Sno, tempGameHash)
                .length > 0
            ) {
              // Set first unfolded player after Sno as dealer
              MainV2.SetFirstUnfoldedPlayerAsDealer(Sno, tempGameHash);
            }

            // if there are players that joined before me and not folded
            else if (
              MainV2.GetUnfoldedActivePlayersAfterSno(-1, tempGameHash).length >
              0
            ) {
              // Set first unfolded player as dealer.
              MainV2.SetFirstUnfoldedPlayerAsDealer(-1, tempGameHash);
            }
          }

          // is you are current player
          if (currentPlayer.IsCurrent === "Y") {
            // if there are players that joined after me and not folded
            if (
              MainV2.GetUnfoldedActivePlayersAfterSno(Sno, tempGameHash)
                .length > 0
            ) {
              // Set first unfolded player after Sno as Current player
              MainV2.SetFirstUnfoldedPlayerAsCurrent(Sno, tempGameHash);
            }

            // if there are players that joined before me and not folded
            else if (
              MainV2.GetUnfoldedActivePlayersAfterSno(-1, tempGameHash).length >
              0
            ) {
              // Set first unfolded player as dealer.
              MainV2.SetFirstUnfoldedPlayerAsCurrent(-1, tempGameHash);
            }
          }

          // Add Current Player into ContinuityPlayers
          tempGameHash.ContinuityPlayers.push(currentPlayer);
          currentPlayer.IsDealer = "N";
          currentPlayer.IsCurrent = "N";
        }
        if (flag) {
          SendRequest({
            url: "GameV2/_EndGame",
            method: "POST",
            data: { GameCode },
          }).then((res) => {
            if (res) {
              SaveGameHash(tempGameHash);
              window.location.href = "/";
            }
          });
        } else {
          window.location.href = "/";
        }
      } catch (err) {}
    },
    [CurrentPlayer, GameCode, SaveGameHash, Sno, gameHash]
  );

  const ShowHandSettleHand = useCallback(() => {
    let tempGameHash = { ...gameHash };
    try {
      // If PotSize is more than 0, show MyModalEndHand modal
      if (tempGameHash.PotSize > 0) {
        setMyModalEndHandOpen(true);
      }

      // Otherwise
      else if (tempGameHash.PotSize === 0) {
        tempGameHash.CurrentBet = 0;
        let SumOfEachPlayer = 0.0;
        tempGameHash.ActivePlayers.forEach((obj) => {
          SumOfEachPlayer = SumOfEachPlayer + obj.PlayerAmount;
        });
        setSettlementModalTransactions(tempGameHash.Transaction);
      }
    } catch (err) {
      //GameLogging(err, 2);
    }
  }, [gameHash]);

  const OtherPlayerDisconnected = useCallback(
    (UserId, UserName) => {
      let tempGameHash = { ...gameHash };

      //PlayerConnectionId += "pk2" + GetConnectionIdFromPlayerId(UserId);

      const disconnectedPlayerIndex = tempGameHash.ActivePlayers.findIndex(
        (x) => x.PlayerId.includes(UserId)
      );

      const disconnectedPlayer =
        disconnectedPlayerIndex === -1
          ? undefined
          : tempGameHash.ActivePlayers[disconnectedPlayerIndex];

      const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

      // if disconnected player is in ActivePlayerList
      if (disconnectedPlayer !== undefined) {
        // Remove that player from continuityPlayers.
        tempGameHash.ContinuityPlayers = MainV2.FilterContinuityPlayer(
          (x) => x.PlayerId.includes(UserId),
          tempGameHash
        );

        //if disconnectedPlayer was current
        if (disconnectedPlayer.IsCurrent === "Y") {
          if (
            MainV2.FilterActivePlayer(
              (x) => x.Sno > disconnectedPlayer.Sno && x.IsFolded === "N",
              tempGameHash
            ).length === 0
          ) {
            MainV2.SetFirstUnfoldedPlayerAsCurrent(-1, tempGameHash);
            tempGameHash.BetStatus = MainV2.GetBetStatus(
              MainV2.GetFirstUnfoldedPlayerAfterSno(-1, tempGameHash).Sno,
              tempGameHash
            );
          } else {
            MainV2.SetFirstUnfoldedPlayerAsCurrent(
              disconnectedPlayer.Sno,
              tempGameHash
            );
            tempGameHash.BetStatus = MainV2.GetBetStatus(
              MainV2.GetFirstUnfoldedPlayerAfterSno(
                disconnectedPlayer.Sno,
                tempGameHash
              ).Sno,
              tempGameHash
            );
          }
        }

        // if disconnectedPlayer was dealer
        if (disconnectedPlayer.IsDealer === "Y") {
          if (
            MainV2.FilterActivePlayer(
              (x) => x.Sno > disconnectedPlayer.Sno && x.IsFolded === "N",
              tempGameHash
            ).length === 0
          ) {
            MainV2.SetFirstUnfoldedPlayerAsDealer(-1, tempGameHash);
          } else {
            MainV2.SetFirstUnfoldedPlayerAsDealer(
              disconnectedPlayer.Sno,
              tempGameHash
            );
          }
        }

        // Set disconnected Player IsDealer = "N", IsCurrent = "N".
        disconnectedPlayer.IsDealer = "N";
        disconnectedPlayer.IsCurrent = "N";

        // Add to ContinuityPlayers
        tempGameHash.ContinuityPlayers.push(disconnectedPlayer);

        // If you are current or dealer, Update Game Hash.
        if (currentPlayer.IsDealer === "Y") SaveGameHash(tempGameHash);
      }
    },
    [SaveGameHash, Sno, gameHash]
  );

  const PassCard = useCallback(
    (Sno1, communityIndex) => {
      let tempGameHash = { ...gameHash };
      // Get selectedCard
      const $selectedCard = MainV2.GetSelectedCardsBySno(Sno);
      const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

      // If none slected
      if (Sno1 === -1) {
        $selectedCard.removeClass("Selected");
        //setCardsSelectedValue("");
        //setCardActionsVisible(false);
        return;
      }

      // If you select one of Community
      else if (Sno1 === "X") {
        // Get CommunityIndex from data-communityindex attr.

        for (let count = 0; count < $selectedCard.length; count++) {
          const cardvalue = $($selectedCard[count]).data("cardvalue");

          // push selected cards to CommunityCards
          const x1temp = currentPlayer.PlayerCards.filter(
            (y) => y.Value === cardvalue
          )[0];
          x1temp.Presentation = "public";

          tempGameHash.CommunityCards.push(x1temp);
          tempGameHash.CommunityCards.filter(
            (x) => x.Value === cardvalue
          )[0].CommunityIndex = communityIndex;

          // remove selected cards from playercards
          MainV2.RemoveCardFromPlayer(Sno, cardvalue, tempGameHash);

          LogRocket.log(
            "Passed Card " + cardvalue + " to Communtiy " + communityIndex,
            {
              GameHash: tempGameHash,
            }
          );
        }

        // when you insert to the last index, increase NumberOfCommunities.
        if (communityIndex === tempGameHash.NumberOfCommunities) {
          tempGameHash.NumberOfCommunities += 1;
        }

        MainV2.SendNotification(
          connection,
          GameCode,
          "",
          user.UserName + " moved card to community"
        );
      }

      // If you select specific player
      else {
        MainV2.FilterActivePlayer((x) => x.Sno === Sno, tempGameHash).forEach(
          () => {
            for (let count = 0; count < $selectedCard.length; count++) {
              MainV2.passCardToPlayer(
                Sno,
                Sno1,
                $($selectedCard[count]).data("cardvalue"),
                tempGameHash
              );
            }
          }
        );
      }

      //setCardsSelectedValue("");
      //$("div#pop-up").hide();
      $selectedCard.removeClass("Selected");

      // Update GameHash and send notification
      SaveGameHash(tempGameHash);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      GameCode,
      SaveGameHash,
      Sno,
      gameHash,
      user.UserName,
      connection.connectionId,
    ]
  );

  // start connection with user.Id
  useEffect(() => {
    const startConnection = async () => {
      let newConnection = await MainV2.startConnectionWithUserIdentity(user.Id);
      LogRocket.log("Connected to SignalR", newConnection.connectionId);
      setConnection(newConnection);
    };
    startConnection();
  }, [user]);

  useEffect(() => {
    SendRequest({
      url: "GameV2/_GetIsCreator",
      method: "POST",
      data: {
        GameCode: GameCode,
      },
    }).then((result) => {
      setIsCreator(result.data);
    });
  }, [GameCode]);

  // join game when you first render this page
  useEffect(() => {
    JoinGame();
  }, [JoinGame]);

  // register connection event
  useEffect(() => {
    if (connection.state === HubConnectionState.Connected) {
      connection.on("ReceiveMessage", (message) => {
        alert("Try again in few seconds..");
      });

      connection.on("RemovedNotification", () => {
        alert("You've been removed by Game Creator");
        window.location.href = "/";
      });

      connection.on("ReceiveCancelHandNotification", () => {
        setModalInfoCancelHandOpen(true);
      });

      connection.on("ReceiveEndGameSummary", (gamecode) => {
        try {
          //$('.EndGameForCurrent').show()

          // Only if you are in the same Game
          if (GameCode === gamecode) {
            // If you 're not dealer, hide Modal
            if (CurrentPlayer.IsDealer !== "Y") {
              ShowSummaryV2();
            }
          }
        } catch (err) {
          //GameLogging(err, 2)
        }
      });

      connection.on("ReceiveEndHandSummary", (gamecode) => {
        try {
          //$(".EndGameForCurrent").show();
          $(".SettleRound").show();

          // Only if you are in the same Game
          if (GameCode === gamecode) {
            // If you 're not dealer, hide Modal
            if (CurrentPlayer.IsDealer !== "Y") {
              $(".SettleRound").hide();
              ShowHandSettleHand();
            }
          }
        } catch (err) {
          // GameLogging(err, 2)
        }
      });

      connection.on("OtherPlayerDisconnected", (UserId, UserName) => {
        OtherPlayerDisconnected(UserId, UserName);
      });

      connection.on("ReceiveHashV1", () => {
        SendRequest({
          url: "GameV2/_GetGameHash",
          method: "post",
          data: { GameCode },
        }).then((result) => {
          LogRocket.log("Received GameHash on Game: " + GameCode, {
            GameHash: result.data,
          });

          setGameHash(result.data);
        });
      });

      setConnection(connection);
    }

    return () => {
      if (connection.state === HubConnectionState.Connected) {
        connection.off("ReceiveHashV1");
        connection.off("OtherPlayerDisconnected");
        connection.off("ReceiveEndHandSummary");
        connection.off("ReceiveEndGameSummary");
        connection.off("ReceiveCancelHandNotification");
        connection.off("RemovedNotification");
        connection.off("ReceiveMessage");

        setConnection(connection);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    CurrentPlayer,
    GameCode,
    OtherPlayerDisconnected,
    ShowHandSettleHand,
    ShowSummaryV2,
    connection.connectionId,
  ]);

  //VideoSDK related function

  const meetinAPI = useMeeting({
    onMeetingJoined: () => {
      meetinAPI.muteMic();
      meetinAPI.disableWebcam();
      alert("You've joined meeting");
      //meetinAPI.disableWebcam();
    },
    onMeetingLeft: () => {
      //alert("You've left meeting");
    },
  });

  useEffect(() => {
    if (isVideoChatAllowed && gameHash.MeetingId !== null) {
      try {
        meetinAPI.join();
        return () => {
          meetinAPI.leave();
        };
      } catch (e) {
        LogRocket.error("Join Meeting Error", e);
      }
    }
  }, [isVideoChatAllowed, gameHash.MeetingId]);

  return (
    <>
      <div className="container-fluid bg-black p-0" id="GameBoard">
        <div className="row">
          <Logging gameHash={gameHash} />
          <div className="col-8">
            <div className="row">
              <div className="logging col-12 alert alert-warning" id="logging">
                <span>Game Started</span>
              </div>
              <hr />
            </div>
            <div
              className="row GeneralMessage"
              style={{ position: "fixed:", zIndex: 400, width: "60%" }}
            ></div>
            <div id="table">
              <div className="row">
                <div className="col-4 seat">
                  <Player
                    ptr={3}
                    gameHash={gameHash}
                    Sno={Sno}
                    OtherPlayers_Next={OtherPlayers_Next}
                    OtherPlayers_Prev={OtherPlayers_Prev}
                    DragSrc={DragSrc}
                    setDragSrc={setDragSrc}
                    SaveGameHash={SaveGameHash}
                    isCreator={isCreator}
                    connection={connection}
                    GameCode={GameCode}
                  />
                </div>
                <div className="col-4 seat">
                  <Player
                    ptr={4}
                    gameHash={gameHash}
                    Sno={Sno}
                    OtherPlayers_Next={OtherPlayers_Next}
                    OtherPlayers_Prev={OtherPlayers_Prev}
                    DragSrc={DragSrc}
                    setDragSrc={setDragSrc}
                    SaveGameHash={SaveGameHash}
                    isCreator={isCreator}
                    connection={connection}
                    GameCode={GameCode}
                  />
                </div>
                <div className="col-4 seat">
                  <Player
                    ptr={5}
                    gameHash={gameHash}
                    Sno={Sno}
                    OtherPlayers_Next={OtherPlayers_Next}
                    OtherPlayers_Prev={OtherPlayers_Prev}
                    DragSrc={DragSrc}
                    setDragSrc={setDragSrc}
                    SaveGameHash={SaveGameHash}
                    isCreator={isCreator}
                    connection={connection}
                    GameCode={GameCode}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-4 seat">
                  <Player
                    ptr={2}
                    gameHash={gameHash}
                    Sno={Sno}
                    OtherPlayers_Next={OtherPlayers_Next}
                    OtherPlayers_Prev={OtherPlayers_Prev}
                    DragSrc={DragSrc}
                    setDragSrc={setDragSrc}
                    SaveGameHash={SaveGameHash}
                    isCreator={isCreator}
                    connection={connection}
                    GameCode={GameCode}
                  />
                </div>
                <div className="col-4" id="potdiv">
                  <PotDiv
                    gameHash={gameHash}
                    Sno={Sno}
                    setDragSrc={setDragSrc}
                    DragSrc={DragSrc}
                    SaveGameHash={SaveGameHash}
                    isDealer={CurrentPlayer && CurrentPlayer.IsDealer === "Y"}
                  />
                </div>
                <div className="col-4 seat">
                  <Player
                    ptr={6}
                    gameHash={gameHash}
                    Sno={Sno}
                    OtherPlayers_Next={OtherPlayers_Next}
                    OtherPlayers_Prev={OtherPlayers_Prev}
                    DragSrc={DragSrc}
                    setDragSrc={setDragSrc}
                    isCreator={isCreator}
                    SaveGameHash={SaveGameHash}
                    connection={connection}
                    GameCode={GameCode}
                  />
                </div>
              </div>
              <div className="row text-center mt-2 mb-2">
                <CurrentPlayerDiv
                  CurrentPlayer={CurrentPlayer}
                  Sno={Sno}
                  gameHash={gameHash}
                  DragSrc={DragSrc}
                  setDragSrc={setDragSrc}
                  PassCard={PassCard}
                  SaveGameHash={SaveGameHash}
                />
              </div>
            </div>
            <div className="row">
              <div className="text-center mx-auto col-12 text-center card bg-secondary align-self-center">
                {CurrentPlayer && CurrentPlayer.IsDealer === "Y" && (
                  <DealerPanel
                    gameHash={gameHash}
                    Sno={Sno}
                    SaveGameHash={SaveGameHash}
                  />
                )}
              </div>
            </div>
            <div className="row">
              <GameControlPanel
                isCreator={isCreator}
                GameCode={GameCode}
                CurrentPlayer={CurrentPlayer}
                gameHash={gameHash}
                Sno={Sno}
                SaveGameHash={SaveGameHash}
                setModalInfoCancelHandOpen={setModalInfoCancelHandOpen}
                SettleRoundEventHandler={SettleRoundEventHandler}
                ShowSummaryV2={ShowSummaryV2}
                user={user}
              />
            </div>
          </div>
          <div className="col-2 d-sm-block bg-black align-content-around">
            <div className="mb-1">
              <img
                alt=""
                className="img-fluid"
                src="/assets/images/images.png"
              />
            </div>
            <div className="mb-1">
              <img
                alt=""
                className="img-fluid"
                src="/assets/images/250x250Placeholder.png"
              />
            </div>
            <div className="mb-1">
              <img
                alt=""
                className="img-fluid"
                src="/assets/images/images.png"
              />
            </div>
            <div className="mb-1">
              <img
                alt=""
                className="img-fluid"
                src="/assets/images/250x250Placeholder.png"
              />
            </div>
          </div>
        </div>
      </div>

      <ModalInfoCancelHand
        open={modalInfoCancelHandOpen}
        setOpen={setModalInfoCancelHandOpen}
      />

      <MyModalEndHand
        open={myModalEndHandOpen}
        setOpen={setMyModalEndHandOpen}
        handleOK={MyModalEndHand_YesEventHandler}
      />

      <SettlementModal
        open={settlementModalOpen}
        setOpen={setSettlementModalOpen}
        handleOK={SettleRoundEventHandler}
        transactions={settlementModalTransactions}
      />

      <SettlementModalEndGame
        open={settlementModalEndGameOpen}
        setOpen={setSettlementModalEndGameOpen}
        transactions={settlementModalEndGameTransactions}
        handleOK={EndGameForCurrentEventHandler}
      />
    </>
  );
};

const MeetingProviderWrappedMainGame = () => {
  const [searchParams] = useSearchParams();
  const [meetingId, setMeetingId] = useState(null);

  const user = useMemo(() => {
    let tUser = JSON.parse(localStorage.getItem("user"));
    return tUser;
  }, []);

  const GameCode = useMemo(() => searchParams.get("GameCode"), [searchParams]);
  //const GameHash = useMemo(async () => {}, [GameCode]);

  //set Meeting Id
  useEffect(() => {
    const fetch = async () => {
      SendRequest({
        url: "GameV2/_GetGameHash",
        method: "post",
        data: { GameCode },
      }).then((result) => {
        setMeetingId(result.data.MeetingId);
      });
    };
    fetch();
  }, [GameCode]);

  if (meetingId === null) {
    return <MainGame isVideoChatAllowed={false} />;
  } else {
    return (
      <MeetingProvider
        config={{
          meetingId: meetingId,
          micEnabled: true,
          webcamEnabled: false,
          name: user.UserName,
          participantId: user.Id,
        }}
        token={authToken}
      >
        <MeetingConsumer>
          {() => <MainGame isVideoChatAllowed={true} />}
        </MeetingConsumer>
      </MeetingProvider>
    );
  }
};

export default MeetingProviderWrappedMainGame;
