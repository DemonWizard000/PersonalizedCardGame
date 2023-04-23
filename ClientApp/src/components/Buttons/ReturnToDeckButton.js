import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import $ from "jquery";
import LogRocket from "../../util/LogRocketUtil";

const ReturnToDeckButton = ({
  gameHash,
  Sno,
  SaveGameHash,
  ReturnToDeckBtnVisible,
}) => {
  const ReturnToDeckEventHandler = useCallback(
    (ev) => {
      let tempGameHash = { ...gameHash };
      // find selected card to discard
      const $selectedCard = MainV2.GetSelectedCardsBySno(Sno);
      const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

      /*
      1. Add Selected Cards to DiscardedCards list.
      2. Remove selected Cards from ActivePlayers PlayerCards list.
    */
      for (let count = 0; count < $selectedCard.length; count++) {
        const cardvalue = $($selectedCard[count]).data("cardvalue");

        // add to deck list
        tempGameHash.Deck.push(cardvalue);
        // remove selected cards from playercards list
        currentPlayer.PlayerCards = currentPlayer.PlayerCards.filter(
          (x) => x.Value !== cardvalue
        );

        LogRocket.log(cardvalue + " Return To Deck", {
          GameHash: tempGameHash,
        });
      }

      const actionMsg = " Return to Deck";

      // Add Discarded steps
      MainV2.AddStepAndSetLastActionPerformed(tempGameHash, Sno, {
        Action: actionMsg,
        Amount: 0,
      });

      SaveGameHash(tempGameHash);
      /* MainV2.SendNotification(
        connection,
        tempGameHash.GameId,
        "",
        MainV2.GetNotificationMsg(actionMsg, user.UserName)
      ); */
      //setChooseCommunityModalOpen(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [SaveGameHash, Sno, gameHash /* , connection.connectionId */]
  );
  return (
    <button
      className="btn-sm btn-danger Discard ml-1 mt-1 mr-1"
      data-playersno="X"
      style={{ display: ReturnToDeckBtnVisible ? "" : "none" }}
      onClick={ReturnToDeckEventHandler}
    >
      Return To Deck
    </button>
  );
};

export default ReturnToDeckButton;
