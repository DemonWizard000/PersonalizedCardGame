import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import $ from "jquery";
import LogRocket from "../../util/LogRocketUtil";
const ShowButton = ({ CurrentPlayer, gameHash, Sno, SaveGameHash }) => {
  const ShowAllEventHandler = useCallback(
    (ev) => {
      let tempGameHash = { ...gameHash };
      // get selected cards
      const $selectedCard = MainV2.GetSelectedCardsBySno(Sno);
      const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

      // if none cards are selected, you show all of your cards to public
      if ($selectedCard.length === 0) {
        MainV2.SetPlayerCardsPresentation(currentPlayer.PlayerCards, "public");
      }

      // else only shows selected cards
      else {
        for (let count = 0; count < $selectedCard.length; count++) {
          currentPlayer.PlayerCards.filter(
            (x) => x.Value === $($selectedCard[count]).data("cardvalue")
          )[0].Presentation = "public";
          LogRocket.log(
            "Show Card " + $($selectedCard[count]).data("cardvalue"),
            { GameHash: tempGameHash }
          );
        }
      }

      // cancel selection
      $selectedCard.removeClass("Selected");

      SaveGameHash(tempGameHash);
      //setChooseCommunityModalOpen(false);
    },
    [SaveGameHash, Sno, gameHash]
  );

  return (
    <button
      className="btn-sm btn-info ShowAll ml-1 mt-1 mr-1"
      style={
        CurrentPlayer && CurrentPlayer.PlayerCards.length === 0
          ? { display: "none" }
          : {}
      }
      onClick={ShowAllEventHandler}
    >
      Show
    </button>
  );
};

export default ShowButton;
