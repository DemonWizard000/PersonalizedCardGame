import React, { useCallback, useEffect, useRef, useState } from "react";
import * as MainV2 from "../../common/game/MainV2";
import Cards from "./Cards";
import $ from "jquery";
import PassCardButton from "../Buttons/PassCardButton";
import BetButton from "../Buttons/BetButton";
import CheckButton from "../Buttons/CheckButton";
import CallButton from "../Buttons/CallButton";
import FoldButton from "../Buttons/FoldButton";
import ShowButton from "../Buttons/ShowButton";
import TakeButton from "../Buttons/TakeButton";
import AddToPotButton from "../Buttons/AddToPotButton";
import DiscardButton from "../Buttons/DiscardButton";
import ReturnToDeckButton from "../Buttons/ReturnToDeckButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useMeeting } from "@videosdk.live/react-sdk";

const CurrentPlayerDiv = ({
  CurrentPlayer,
  Sno,
  gameHash,
  DragSrc,
  setDragSrc,
  PassCard,
  SaveGameHash,
}) => {
  //button visible related variable
  const [DiscardBtnVisible, setDiscardBtnVisible] = useState(false);
  const [PassCardBtnVisible, setPassCardBtnVisible] = useState(false);
  const [ReturnToDeckBtnVisible, setReturnToDeckBtnVisible] = useState(false);
  //const [CardActionsVisible, setCardActionsVisible] = useState(true);
  const [passCardModalOpen, setPassCardModalOpen] = useState(false);

  const BetTakeValueRef = useRef(null);

  const AllowDrop = useCallback((ev) => {
    $(".fas").addClass("Droppable");
    ev.preventDefault();
  }, []);

  const DragEnd = useCallback((ev) => {
    $(ev.target).removeClass("Droppable");
    ev.preventDefault();
  }, []);

  const DropSelf = useCallback(
    (ev) => {
      let tempGameHash = { ...gameHash };
      let tmpFromElement, tmpToElement;
      try {
        var cardValue = $(DragSrc).data("cardvalue");
        ev.preventDefault();
        tmpFromElement = $(DragSrc).closest(".Player").data("sno");
        tmpToElement = $(ev.target).closest(".Player").data("sno");

        // for now opening modal for community
      } catch (ex) {
        alert("drop at the right place!");
      }
      if (
        tmpFromElement !== undefined &&
        tmpToElement !== undefined &&
        tmpFromElement !== tmpToElement
      ) {
        MainV2.PassCardToPlayerByDrop(
          tmpToElement,
          cardValue,
          tempGameHash,
          Sno
        );
        SaveGameHash(tempGameHash);
      }
    },
    [DragSrc, SaveGameHash, Sno, gameHash]
  );

  const DragEnter = useCallback((ev) => {
    ev.preventDefault();
  }, []);

  const PlayerCardEventHandler = useCallback(
    (ev) => {
      let tempGameHash = { ...gameHash };

      let currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

      // if current player is folded, just do nothing.
      if (currentPlayer.IsFolded === "Y") {
        return;
      }

      if ($(ev.currentTarget).hasClass("Selected")) {
        $(ev.currentTarget).removeClass("Selected");
        if ($(".PlayerCard.Selected").length === 0) {
          setDiscardBtnVisible(false);
          setPassCardBtnVisible(false);
          setReturnToDeckBtnVisible(false);
        }
      } else {
        $(ev.currentTarget).addClass("Selected");
        setDiscardBtnVisible(true);
        setPassCardBtnVisible(true);
        setReturnToDeckBtnVisible(true);
      }
    },
    [Sno, gameHash]
  );

  /* 
  useEffect(() => {
    try {
      disableWebcam();
      muteMic();
      join();
    } catch (e) {
      console.log("join error", e);
    }
  }, [disableWebcam, join, muteMic]); */

  /**
   * This function does bet action.
   * 1. Update CurrentBet to hieghest bet of current players.
   * 2. Update Dealer
   * 3. Update Current
   */
  const OnPlayerAction = useCallback(
    (tempGameHash) => {
      try {
        //GameLogging(GameHash, 1);

        // Get HighestBet of current players
        const HighestBet = tempGameHash.ActivePlayers.sort(function (a, b) {
          return b.CurrentRoundStatus - a.CurrentRoundStatus;
        })[0].CurrentRoundStatus;

        // Set CurrentBet as HighestBet
        tempGameHash.IsRoundSettlement = "N";
        tempGameHash.CurrentBet = HighestBet;

        // Get round dealer Sno
        const dealer = MainV2.GetDealer(tempGameHash);

        tempGameHash.PrevSno = Sno;

        // If there is no player that joined after current round dealer and not folded
        if (
          MainV2.FilterActivePlayer(
            (y) => y.IsFolded === "N" && y.Sno > Sno,
            tempGameHash
          ).length === 0
        ) {
          MainV2.SetFirstUnfoldedPlayerAsCurrent(-1, tempGameHash);
          tempGameHash.BetStatus = MainV2.GetBetStatus(
            MainV2.GetFirstUnfoldedPlayerAfterSno(-1, tempGameHash).Sno,
            tempGameHash
          );
        }

        // If there are somebody that joined after current round dealer and folded.
        else {
          MainV2.SetFirstUnfoldedPlayerAsCurrent(Sno, tempGameHash);
          tempGameHash.BetStatus = MainV2.GetBetStatus(
            MainV2.GetFirstUnfoldedPlayerAfterSno(Sno, tempGameHash).Sno,
            tempGameHash
          );
        }

        // change dealer and end hand

        // If current player is dealer, change dealer
        if (Sno === dealer.Sno) {
          // If current round dealer folded
          if (
            MainV2.FilterActivePlayer(
              (y) => y.IsFolded === "N" && y.Sno === dealer.Sno,
              tempGameHash
            ).length === 0
          ) {
            tempGameHash.ActivePlayers.forEach((obj) => {
              obj.IsCurrent = "N";
              obj.IsDealer = "N";
            });

            // If there is no body who joined after dealer and folded
            if (
              MainV2.FilterActivePlayer(
                (y) => y.IsFolded === "N" && y.Sno > dealer.Sno,
                tempGameHash
              ).length === 0
            ) {
              const firstUnfoldedPlayer = MainV2.GetFirstUnfoldedPlayerAfterSno(
                -1,
                tempGameHash
              );

              // change dealer and current
              MainV2.SetFirstUnfoldedPlayerAsDealer(-1, tempGameHash);
              MainV2.SetFirstUnfoldedPlayerAsCurrent(
                firstUnfoldedPlayer.Sno,
                tempGameHash
              );

              // Update betstatus
              tempGameHash.BetStatus = MainV2.GetBetStatus(
                firstUnfoldedPlayer.Sno,
                tempGameHash
              );
            } else {
              const fisrtUnfoldedPlayerAfterDealer =
                MainV2.GetFirstUnfoldedPlayerAfterSno(dealer.Sno, tempGameHash);
              let SnoTemp = fisrtUnfoldedPlayerAfterDealer.Sno;

              MainV2.SetFirstUnfoldedPlayerAsDealer(dealer.Sno, tempGameHash);

              if (
                MainV2.FilterActivePlayer(
                  (y) =>
                    y.IsFolded === "N" &&
                    y.Sno > fisrtUnfoldedPlayerAfterDealer.Sno,
                  tempGameHash
                ).length > 0
              ) {
                SnoTemp = MainV2.GetFirstUnfoldedPlayerAfterSno(
                  SnoTemp,
                  tempGameHash
                ).Sno;
              } else {
                SnoTemp = MainV2.GetFirstUnfoldedPlayerAfterSno(
                  -1,
                  tempGameHash
                ).Sno;
              }

              MainV2.GetActivePlayerBySno(SnoTemp, tempGameHash).IsCurrent =
                "Y";
              tempGameHash.BetStatus = MainV2.GetBetStatus(
                SnoTemp,
                tempGameHash
              );
            }
          }
        }

        if (
          MainV2.GetUnfoldedActivePlayersAfterSno(-1, tempGameHash).length ===
          MainV2.FilterActivePlayer(
            (x) =>
              x.IsFolded === "N" &&
              x.CurrentRoundStatus === tempGameHash.CurrentBet,
            tempGameHash
          ).length
        ) {
          tempGameHash.Round = tempGameHash.Round + 1;

          /* MainV2.SendNotification(
            connection,
            GameCode,
            "",
            "",
            "Round Settled"
          ); */

          tempGameHash.CurrentBet = 0;
          tempGameHash.ActivePlayers.forEach(
            (obj) => (obj.CurrentRoundStatus = 0)
          );
        }
        SaveGameHash(tempGameHash);
      } catch (err) {
        console.error(err);
        //GameLogging(err, 2);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [SaveGameHash, Sno]
  );

  const meetingAPI = useMeeting();

  /**
   * This function does bet action.
   * 1. Update CurrentBet to hieghest bet of current players.
   * 2. Update Dealer
   * 3. Update Current
   */
  const TurnOnVideoChat = useCallback(() => {
    let tempGameHash = { ...gameHash };
    let current = MainV2.FilterActivePlayer(
      (x) => x.Sno === Sno,
      tempGameHash
    )[0];
    if (current.IsRealTimeChat !== "Y") {
      current.IsRealTimeChat = "Y";
      meetingAPI.enableWebcam();
      meetingAPI.unmuteMic();
    } else {
      meetingAPI.disableWebcam();
      meetingAPI.muteMic();
      current.IsRealTimeChat = "N";
    }
    SaveGameHash(tempGameHash);
  }, [SaveGameHash, Sno, gameHash]);

  return (
    <>
      <div
        className="text-center mx-auto col-12 col-sm-8 col-lg-6 text-center card p-2 bg-white"
        style={
          Sno === gameHash.BetStatusSno
            ? {
                zIndex: 50,
                border: "3px solid red !important",
                backgroundColor: "#ffff006e",
              }
            : {
                zIndex: 50,
              }
        }
        id="self"
      >
        <div className="item show">
          <div>
            <div
              className={
                "PlayerView PlayerActive Player1 Player " +
                (CurrentPlayer && CurrentPlayer.IsFolded === "Y"
                  ? " PlayerFolded"
                  : "") +
                (CurrentPlayer && CurrentPlayer.IsCurrent === "Y"
                  ? "bg-active"
                  : "")
              }
              data-sno={CurrentPlayer !== undefined ? Sno : ""}
            >
              <div
                onDrop={DropSelf}
                onDragOver={AllowDrop}
                onDragEnter={DragEnter}
                onDragEnd={DragEnd}
                onDragLeave={DragEnd}
              >
                <span className="PlayerStatus badge badge-info p-2">
                  {CurrentPlayer !== undefined ? CurrentPlayer.PlayerAmount : 0}
                </span>
                <span className="PlayerStatusNet badge badge-success ml-2">
                  {CurrentPlayer !== undefined &&
                    (CurrentPlayer.PlayerNetStatusFinal === undefined
                      ? CurrentPlayer.PlayerAmount
                      : CurrentPlayer.PlayerAmount +
                        CurrentPlayer.PlayerNetStatusFinal)}
                </span>
                <span className="PlayerName p-2">
                  {CurrentPlayer !== undefined
                    ? CurrentPlayer.PlayerId.split("pk2")[0]
                    : "Empty seat"}
                </span>
                <div>
                  <span
                    className="ActiveStatus col-auto badge badge-danger ml-1 d-none"
                    style={{ display: "none" }}
                  >
                    A
                  </span>
                  <span
                    className="DealerStatus text-danger font-weight-bold"
                    style={{
                      display:
                        CurrentPlayer && CurrentPlayer.IsDealer === "Y"
                          ? ""
                          : "none",
                    }}
                  >
                    Dealer
                  </span>
                </div>
                <div className="PlayerDeck">
                  {CurrentPlayer &&
                    CurrentPlayer.PlayerCards.map((obj, index) => (
                      <Cards
                        key={index}
                        obj={obj}
                        Sno={Sno}
                        handleClick={PlayerCardEventHandler}
                        setDragSrc={setDragSrc}
                        isCurrent={true}
                      />
                    ))}
                </div>
                <br />
                <span className="PlayerAction badge badge-primary mx-auto">
                  {gameHash.LastActionPerformed &&
                    gameHash.LastActionPerformed.filter(
                      (x) => x.PlayerSno === Sno
                    )[0] &&
                    gameHash.LastActionPerformed.filter(
                      (x) => x.PlayerSno === Sno
                    )[0].Action.Action}
                </span>
                <div className="col-12 modal col-sm-8  col-md-6 CardActions h-50 mx-auto">
                  <div>
                    <div className="PassPlayers bg-white mb-2 mt-2 pt-2 pb-2">
                      <h3>Pass to</h3>
                      {MainV2.FilterActivePlayer(
                        (x) => x.Sno !== Sno,
                        gameHash
                      ).map((obj, index) => (
                        <div key={index}>
                          {index === 0 && (
                            <span className="text-dark">Player: </span>
                          )}
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => PassCard(obj.Sno)}
                            style={{
                              border: "none",
                              marginTop: "3%",
                              marginLeft: "1%",
                            }}
                          >
                            {obj.PlayerId.split("pk2")[0]}
                          </button>
                        </div>
                      ))}
                      {new Array(gameHash.NumberOfCommunities).map(
                        (obj, index) => (
                          <div key={index}>
                            {index === 0 && (
                              <>
                                <hr />
                                <span className="text-dark">Community: </span>
                              </>
                            )}
                            <button
                              className="btn-sm btn-success"
                              onClick={() => PassCard("X", index)}
                              style={{
                                border: "none",
                                marginTop: "3%",
                                marginRight: "2%",
                              }}
                            >
                              (index + 1)
                            </button>
                          </div>
                        )
                      )}
                      {gameHash.NumberOfCommunities === 0 && (
                        <>
                          <hr />
                          <span className="text-dark">Community: </span>
                        </>
                      )}
                      <button
                        className="btn-sm btn-success"
                        style={{
                          border: "none",
                          marginTop: "3%",
                          marginRight: "2%",
                        }}
                        onClick={() =>
                          PassCard("X", gameHash.NumberOfCommunities)
                        }
                      >
                        {gameHash.NumberOfCommunities + 1}
                      </button>
                    </div>
                    <div className="bg-white my-auto p-1 d-flex justify-content-around">
                      <button
                        className="btn-sm btn-info Discard"
                        style={{
                          border: DiscardBtnVisible ? "" : "none",
                          marginTop: "3%",
                        }}
                        data-playersno="X"
                      >
                        Discard
                      </button>
                      <button
                        className="btn-sm btn-warning Show"
                        style={{ border: "none", marginTop: "3%" }}
                        data-playersno="X"
                      >
                        Show
                      </button>
                    </div>
                    <div className="bg-white mt-2 p-1">
                      <button
                        className="btn-sm btn-danger mr-1 ml-1"
                        onClick={() => {}}
                        style={{ border: "none" }}
                        data-playersno="-1"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <PassCardButton
            PassCardBtnVisible={PassCardBtnVisible}
            setPassCardModalOpen={setPassCardModalOpen}
            passCardModalOpen={passCardModalOpen}
            gameHash={gameHash}
            PassCard={PassCard}
            Sno={Sno}
          />
        </div>
        <div className="row PlayerActions justify-content-around bg-white p-0 m-0">
          <div className="col-md-12">
            <input
              type="text"
              id="BetTakeValue"
              className="ml-1"
              ref={BetTakeValueRef}
            />
            <BetButton
              CurrentPlayer={CurrentPlayer}
              BetTakeValueRef={BetTakeValueRef}
              gameHash={gameHash}
              Sno={Sno}
              OnPlayerAction={OnPlayerAction}
            />
            <CheckButton
              CurrentPlayer={CurrentPlayer}
              gameHash={gameHash}
              Sno={Sno}
              OnPlayerAction={OnPlayerAction}
            />
            <CallButton
              CurrentPlayer={CurrentPlayer}
              gameHash={gameHash}
              Sno={Sno}
              OnPlayerAction={OnPlayerAction}
            />
            <FoldButton
              CurrentPlayer={CurrentPlayer}
              gameHash={gameHash}
              Sno={Sno}
              SaveGameHash={SaveGameHash}
            />
            <ShowButton
              CurrentPlayer={CurrentPlayer}
              gameHash={gameHash}
              Sno={Sno}
              SaveGameHash={SaveGameHash}
            />
            <TakeButton
              gameHash={gameHash}
              Sno={Sno}
              SaveGameHash={SaveGameHash}
              BetTakeValueRef={BetTakeValueRef}
            />
            <AddToPotButton
              gameHash={gameHash}
              Sno={Sno}
              SaveGameHash={SaveGameHash}
              BetTakeValueRef={BetTakeValueRef}
            />
            <DiscardButton
              DiscardBtnVisible={DiscardBtnVisible}
              gameHash={gameHash}
              Sno={Sno}
              SaveGameHash={SaveGameHash}
            />
            <ReturnToDeckButton
              ReturnToDeckBtnVisible={ReturnToDeckBtnVisible}
              gameHash={gameHash}
              Sno={Sno}
              SaveGameHash={SaveGameHash}
            />
            {gameHash && gameHash.MeetingId !== null && (
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      CurrentPlayer && CurrentPlayer.IsRealTimeChat === "Y"
                    }
                    onChange={TurnOnVideoChat}
                  />
                }
                label="Video Chat"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrentPlayerDiv;
