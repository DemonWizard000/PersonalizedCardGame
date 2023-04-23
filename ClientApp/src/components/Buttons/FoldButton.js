import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import LogRocket from "../../util/LogRocketUtil";

const FoldButton = ({ CurrentPlayer, gameHash, Sno, SaveGameHash }) => {
  const FoldEventHandler = useCallback(
    (ev) => {
      try {
        let tempGameHash = { ...gameHash };
        const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);
        const actionMsg = " fold";

        //Add step and set last action of player
        MainV2.AddStepAndSetLastActionPerformed(tempGameHash, Sno, {
          Action: actionMsg,
          Amount: 0,
        });

        // Set IsFolded
        currentPlayer.IsFolded = "Y";

        // Add you to ContinuityPlayers because you folded out.
        if (
          MainV2.FilterContinuityPlayer((x) => x.Sno === Sno, tempGameHash)
            .length === 0
        )
          tempGameHash.ContinuityPlayers.push(currentPlayer);

        // alert when all of the players folded.
        if (
          MainV2.FilterActivePlayer((x) => x.IsFolded === "N", tempGameHash)
            .length === 0
        )
          alert("all players folded");
        // If there is somebody not folded and joined after current player
        else if (
          MainV2.GetUnfoldedActivePlayersAfterSno(Sno, tempGameHash).length ===
          0
        ) {
          MainV2.SetFirstUnfoldedPlayerAsCurrent(-1, tempGameHash);
          tempGameHash.BetStatus = MainV2.GetBetStatus(
            MainV2.GetFirstUnfoldedPlayerAfterSno(-1, tempGameHash).Sno,
            tempGameHash
          );
        }

        // Otherwise
        else {
          MainV2.SetFirstUnfoldedPlayerAsCurrent(Sno, tempGameHash);
          tempGameHash.BetStatus = MainV2.GetBetStatus(
            MainV2.GetFirstUnfoldedPlayerAfterSno(Sno, tempGameHash).Sno,
            tempGameHash
          );
        }

        // when you fold, you have to make all of your cards to private.
        MainV2.SetPlayerCardsPresentation(currentPlayer.PlayerCards, "private");

        // mark your current as "N" since you are leaving
        currentPlayer.IsCurrent = "N";
        /* LogRocket.log("Folded", {
          GameHash: tempGameHash,
        }); */
        SaveGameHash(tempGameHash);
        /* MainV2.SendNotification(
          connection,
          tempGameHash.GameId,
          "",
          MainV2.GetNotificationMsg(actionMsg, user.UserName)
        ); */
      } catch (err) {
        //GameLogging(err, 2);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [SaveGameHash, Sno, gameHash]
  );
  return (
    <button
      className="btn-sm btn-warning Fold ml-1 mt-1"
      onClick={FoldEventHandler}
      style={
        !(
          CurrentPlayer &&
          CurrentPlayer.IsCurrent === "Y" &&
          CurrentPlayer.PlayerCards.length > 0
        )
          ? { display: "none" }
          : {}
      }
    >
      Fold
    </button>
  );
};

export default FoldButton;
