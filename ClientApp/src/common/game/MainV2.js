import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { GetFullURL } from "../../util/AxiosUtil";
import $ from "jquery";
import LogRocket from "../../util/LogRocketUtil";

export const startConnectionWithUserIdentity = async (UniqueId) => {
  const connection = new HubConnectionBuilder()
    .withUrl(GetFullURL(`GameClass?UserIdentity=${UniqueId}`))
    .withAutomaticReconnect()
    .build();

  if (connection.state === HubConnectionState.Connected) return;

  await connection.start();

  return connection;
};

/**
 * Check if current game calculation is correct.
 * @param {*} gameHash
 * @returns
 */

export const CheckCurrentStation = (gameHash) => {
  let sum = 0;

  gameHash.ActivePlayers.forEach((obj) => {
    if (obj.PlayerNetStatusFinal !== undefined) {
      sum += obj.PlayerNetStatusFinal;
    }

    sum += obj.PlayerAmount;
  });

  if (sum !== 0 && gameHash.PotSize === 0) {
    alert("Something's wrong with the current calcuation.");
    return false;
  }
  return true;
};

/**
 * Get ActivePlayer by Sno.
 * @param
 * no: Sno tht you want to find
 */
export const GetActivePlayerBySno = (no, GameHash) => {
  let playerIndex = GameHash.ActivePlayers.findIndex((x) => x.Sno === no);

  if (playerIndex === -1) return undefined;

  return GameHash.ActivePlayers[playerIndex];
};

/**
 * Get Current round's Dealer
 */
export const GetDealer = (GameHash) => {
  let playerIndex = GameHash.ActivePlayers.findIndex((x) => x.IsDealer === "Y");

  if (playerIndex === -1) return undefined;

  return GameHash.ActivePlayers[playerIndex];
};

/**
 * Get Unfolded ActivePlayers that joined after Sno
 * @param
 * Sno: Get Players joined after this param(default -1)
 */
export const GetUnfoldedActivePlayersAfterSno = (Sno = -1, GameHash) => {
  return FilterActivePlayer((x) => x.Sno > Sno && x.IsFolded === "N", GameHash);
};

/*
 * Set First unfolded player after Sno as current player
 * @param
 * Sno: player's Sno(-1 as default)
 */
export const SetFirstUnfoldedPlayerAsCurrent = (Sno = -1, GameHash) => {
  GameHash.ActivePlayers.forEach((obj2) => (obj2.IsCurrent = "N"));

  GetFirstUnfoldedPlayerAfterSno(Sno, GameHash).IsCurrent = "Y";
};

/**
 * Get First unfolded player after Sno
 * @param {integer} Sno - Sno of the player
 */
export const GetFirstUnfoldedPlayerAfterSno = (Sno = -1, GameHash) => {
  let index = GameHash.ActivePlayers.sort(function (a, b) {
    return a.Sno - b.Sno;
  }).findIndex((y) => y.IsFolded === "N" && y.Sno > Sno);

  if (index === -1) return undefined;

  return GameHash.ActivePlayers[index];
};

/**
 * Set Dealer
 * @param {string} newdealerSno - new dealer's Sno
 */
export const SetDealer = (newdealerSno, GameHash) => {
  //set all player's IsDealer
  GameHash.ActivePlayers.forEach((obj2) => (obj2.IsDealer = "N"));

  const newDealer = GetActivePlayerBySno(newdealerSno, GameHash);
  newDealer.IsDealer = "Y";
};

/*
 * Set First unfolded player after Sno as dealer
 * @param
 * Sno: player's Sno(-1 as default)
 */
export const SetFirstUnfoldedPlayerAsDealer = (Sno = -1, GameHash) => {
  SetDealer(GetFirstUnfoldedPlayerAfterSno(Sno, GameHash).Sno, GameHash);
};

/*
 * Get Bet Status of player
 * @param
 * snoCurrent: player's Sno
 */
export const GetBetStatus = (snoCurrent, GameHash) => {
  const betamount = GameHash.CurrentBet;

  // current player call for continuing round
  const currentplayerbet =
    betamount -
    parseFloat(
      FilterActivePlayer((x) => x.Sno === snoCurrent, GameHash)[0]
        .CurrentRoundStatus
    );

  // adding betstatusSno
  GameHash.BetStatusSno = snoCurrent;

  return (
    "The bet is " +
    currentplayerbet +
    " to " +
    FilterActivePlayer((x) => x.Sno === snoCurrent, GameHash)[0].PlayerId.split(
      "pk2"
    )[0]
  );
};

/**
 * Get ActivePlayer by condition function.
 * @param
 * {function} condition: function to filter.
 */
export const FilterActivePlayer = (condition, GameHash) => {
  return GameHash.ActivePlayers.filter(condition);
};

/**
 * Get ContinuityPlayer by condition function.
 * @param
 * {function} condition: function to filter.
 */
export const FilterContinuityPlayer = (condition, GameHash) => {
  return GameHash.ContinuityPlayers.filter(condition);
};

/**
 * Returns a log statement with user action data
 *
 * @param {object} actionObj - The action data object
 */
export const buildLogStatement = (actionObj) => {
  let statement = "";
  const actionSplit = actionObj.Action.split(":");
  const amount = actionObj.Amount;

  switch (actionSplit[0]) {
    case "Ante":
      statement = " anted $" + amount;
      break;
    case "Bet":
      statement = " bet $" + amount;
      break;
    case "raised by":
      statement =
        " raised the bet by" + actionSplit[1].split("-")[0] + " to #" + amount;
      break;
    case "take":
      statement = " took $" + amount;
      break;
    case "discarded":
      statement = " discarded # coming soon cards";
      break;
    case "fold":
      statement = " folded";
      break;
    default:
      statement = actionObj.Action;
      break;
  }

  return statement;
};

/**
 * Add Step and Set LastAction
 * @param
 * Sno: player no
 * action: player action
 */
export const AddStepAndSetLastActionPerformed = (
  GameHash,
  Sno,
  action = {}
) => {
  let tempGameHash = { ...GameHash };

  //set init value
  action.PlayerId = GetActivePlayerBySno(Sno, tempGameHash).PlayerId;
  action.PlayerSno = Sno;

  //Add step
  tempGameHash.Steps.push({
    RoundId: GameHash.Round,
    Step: action,
  });

  //Set last action
  return SetLastActionPerformed(tempGameHash, Sno, action);
};

/*
 * Set Last Action Performed.
 * @param
 * current_sno: playerId that you want to set last performed action.
 * action: action of that player.
 */
export const SetLastActionPerformed = (GameHash, current_sno, action) => {
  let tempGameHash = { ...GameHash };

  // if already set last action performed, just update it.
  if (
    tempGameHash.LastActionPerformed.filter((x) => x.PlayerSno === current_sno)
      .length === 1
  ) {
    tempGameHash.LastActionPerformed.filter(
      (x) => x.PlayerSno === current_sno
    )[0].Action = action;
  }

  // not yet set, so add LastActionPerformed.
  else {
    tempGameHash.LastActionPerformed.push({
      PlayerSno: current_sno,
      Action: action,
    });
  }
  return tempGameHash;
};

/**
 * Decrease Player Amount and Increase Total Potsize
 */
export const AddAmountToPot = (player, amount, gameHash) => {
  player.PlayerAmount -= parseFloat(amount);
  gameHash.PotSize += parseFloat(amount);
};

/**
 * Get Notification Message from actionMsg and amount
 * @param {string} actionMsg - actionMsg of player
 * @param {float} amount - amount of player's action
 */
export const GetNotificationMsg = (actionMsg, userName, amount = -1) => {
  return actionMsg + " - by " + userName + amount === -1
    ? ""
    : " Amount : " + amount;
};

/**
 * Get Selected Cards of specific player
 * @param {integer} Sno - player Sno
 */
export const GetSelectedCardsBySno = (Sno) => {
  return $('.Player[data-sno="' + Sno + '"]').find(".PlayerCard.Selected");
};

/**
 * Set PlyaerCards Presentation
 * @param {PlayerCards} playerCards - cards to set presentation
 * @param {string} presentation - presentation @default 'private'
 */
export const SetPlayerCardsPresentation = (
  playerCards,
  presentation = "private"
) => {
  playerCards.forEach((obj) => (obj.Presentation = presentation));
};

/*
 * Calculate Balance of every active players and add transaction.
 * Decide who is looser and who is winner.
 */
export const CalculateEndHand = (val1) => {
  // temporary GameHash
  let tmpGameHash = JSON.stringify(val1);
  tmpGameHash = JSON.parse(tmpGameHash);

  // set each players PlayerNetStatusFinal property.
  tmpGameHash.ActivePlayers.forEach((obj) => {
    // if PlayerNetStatusFinal not set, set it to 0
    if (
      obj.PlayerNetStatusFinal === undefined ||
      obj.PlayerNetStatusFinal === null
    ) {
      obj.PlayerNetStatusFinal = 0;
    }

    // Set PlayerNetStatusFinal += PlayerAmount
    obj.PlayerNetStatusFinal = obj.PlayerNetStatusFinal + obj.PlayerAmount;

    // Set Balance as PlayerNetStatusFinal
    if (obj.Balance === undefined || obj.Balance === null) {
      obj.Balance = 0;
    }
    obj.Balance = obj.PlayerNetStatusFinal;
  });

  const resp = {};
  // Transaction list
  const ArrTransaction = []; // {from:'p1',to:'p2',amount:10};

  // only when potsize = 0
  if (tmpGameHash.PotSize === 0) {
    /*
     * Get Winners sort by Balance(PlayerNetStatusFinal).
     * Winners are players with positive balance.
     */
    const Winners = tmpGameHash.ActivePlayers.filter(
      (x) => x.PlayerNetStatusFinal > 0
    ).sort(function (a, b) {
      return b.PlayerNetStatusFinal - a.PlayerNetStatusFinal;
    });

    /*
     * Get Loosers sort by Blanace(PlayerNetStatusFinal).
     * Loosers are players with negative balance.
     */
    const Loosers = tmpGameHash.ActivePlayers.filter(
      (x) => x.PlayerNetStatusFinal < 0
    ).sort(function (a, b) {
      return a.PlayerNetStatusFinal - b.PlayerNetStatusFinal;
    });

    Loosers.forEach((obj1) => {
      if (obj1.Balance < 0) {
        for (let k = 0; k < Winners.length; k++) {
          // if both looser and winner balance is not 0, Add transaction
          if (obj1.Balance !== 0 && Winners[k].Balance !== 0) {
            /*
             * if Winner's balance is the same as looser's balance, set both of their balance as 0 and add transaction
             */
            if (obj1.Balance * -1 === Winners[k].Balance) {
              ArrTransaction.push({
                from: obj1.PlayerId,
                to: Winners[k].PlayerId,
                amount: Winners[k].Balance,
              });
              obj1.Balance = 0;
              Winners[k].Balance = 0;
            } else if (obj1.Balance * -1 > Winners[k].Balance) {
              /*
               * if loosers's negative balance is bigger than winner's positive balance, set looser's balance as looser.Balance + Winner.Balance
               */
              ArrTransaction.push({
                from: obj1.PlayerId,
                to: Winners[k].PlayerId,
                amount: Winners[k].Balance,
              });
              obj1.Balance = obj1.Balance + Winners[k].Balance;
              Winners[k].Balance = 0;
            } else if (obj1.Balance * -1 < Winners[k].Balance) {
              /*
               * if looser's negative balance is less than winner's positive balance, set winner's balance as looser.Balance + Winner.Balance
               */
              ArrTransaction.push({
                from: obj1.PlayerId,
                to: Winners[k].PlayerId,
                amount: obj1.Balance * -1,
              });
              Winners[k].Balance = obj1.Balance + Winners[k].Balance;
              obj1.Balance = 0;
            }
          }
        }
      }
    });
  }

  resp.GameHashTemp = tmpGameHash;
  resp.ArrTransaction = ArrTransaction;

  return resp;
};

/*
 * Remove Specific card in GameHash Deck
 */
export const RemoveCardInGameHashDeck = (no, GameHash) => {
  GameHash.Deck = GameHash.Deck.filter((x) => x !== GameHash.Deck[no]);
};

/**
 * Remove Card from Sno player
 * @param {integer} Sno - Player Sno
 * @param {string} _CardValue - card to remove
 */
export const RemoveCardFromPlayer = (Sno, _CardValue, GameHash) => {
  const player = GetActivePlayerBySno(Sno, GameHash);
  player.PlayerCards = player.PlayerCards.filter((y) => y.Value !== _CardValue);
};

/**
 * 1. Add _CardValue card to toPlayer.
 * 2. Remove _CardValue card from fromPlayer.
 * @param
 * fromPlayer: player that passes card.
 * toPlayer: player that receives card.
 * _CardValue: passing card value
 */
export const passCardToPlayer = (toPlayer, Card, GameHash) => {
  if (Card.CommunityIndex !== undefined)
    RemoveCardsFromCommunity(Card.CommunityIndex, Card.Value, GameHash);

  if (Card.Sno !== undefined)
    FilterActivePlayer((x) => x.Sno === toPlayer, GameHash)[0].PlayerCards.push(
      FilterActivePlayer(
        (x) => x.Sno === Card.Sno,
        GameHash
      )[0].PlayerCards.filter((y) => y.Value === Card.Value)[0]
    );

  LogRocket.log(
    "Passed Card " +
      Card.Value +
      " to Player " +
      FilterActivePlayer((x) => x.Sno === toPlayer, GameHash)[0].PlayerId,
    {
      GameHash: GameHash,
    }
  );

  if (Card.Sno !== undefined)
    RemoveCardFromPlayer(Card.Sno, Card.Value, GameHash);
};

export const PassCardToPlayerByDrop = (_ToPassPlayerSno, Card, GameHash) => {
  passCardToPlayer(_ToPassPlayerSno, Card, GameHash);
};

export const RemoveCardsFromCommunity = (CommunityIndex, Value, GameHash) => {
  GameHash.CommunityCards = GameHash.CommunityCards.filter(
    (x) => x.Value !== Value
  );
};

/**
 * PassCard to community by drag and drop
 */
// eslint-disable-next-line no-unused-vars
export const PassCardToCommunityDrop = (_Community, Card, GameHash) => {
  if (Card.Sno !== undefined)
    RemoveCardFromPlayer(Card.Sno, Card.Value, GameHash);
  else RemoveCardsFromCommunity(Card.CommunityIndex, Card.Value, GameHash);

  GameHash.CommunityCards.push({
    CommunityIndex: _Community,
    Value: Card.Value,
    Presentation: "public",
  });
};

/**
 * -----------  SignalR connection related function BEGIN -------------
 */
// methods for v1 enhancements
export const ReceiveNotification = (
  gamecode,
  playerid,
  notificationmessage
) => {};

export const SendRemoveNotification = (connection, gamecode, UserId) => {
  connection
    .invoke("SendRemoveNotification", gamecode, UserId)
    .catch(function (err) {
      return console.error(err.toString());
    });
};

//invoke "SendNotification"
export const SendNotification = (
  connection,
  gamecode,
  playerid,
  notificationmessage
) => {
  connection
    .invoke("SendNotification", gamecode, playerid, notificationmessage)
    .catch(function (err) {
      return console.error(err.toString());
    });
};

//Invoke SendEndGameSummary
export const SendEndGameSummary = (connection, gamecode) => {
  try {
    connection.invoke("SendEndGameSummary", gamecode).catch(function (err) {
      return console.error(err.toString());
    });
  } catch (err) {}
};

//Invoke "SendEndHandSummary"
export const SendEndHandSummary = (connection, gamecode) => {
  try {
    connection.invoke("SendEndHandSummary", gamecode).catch(function (err) {
      return console.error(err.toString());
    });
  } catch (err) {}
};

/**
 * -----------  SignalR connection related function END -------------
 */
