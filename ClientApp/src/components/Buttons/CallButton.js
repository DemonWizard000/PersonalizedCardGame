import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import LogRocket from "../../util/LogRocketUtil";

const CallButton = ({ CurrentPlayer, gameHash, Sno, OnPlayerAction }) => {
  const CallEventHandler = useCallback(
    (ev) => {
      let tempGameHash = { ...gameHash };
      // You can only call when Current Bet is more than 0.
      if (tempGameHash.CurrentBet === 0) {
        alert("Cannot call on bet - 0");
      } else {
        const betamount = tempGameHash.CurrentBet;
        const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);
        const currentplayerbet = betamount - currentPlayer.CurrentRoundStatus;

        currentPlayer.CurrentRoundStatus = betamount;

        const actionMsg = " called with " + currentplayerbet;

        MainV2.AddAmountToPot(currentPlayer, currentplayerbet, tempGameHash);

        MainV2.AddStepAndSetLastActionPerformed(tempGameHash, Sno, {
          Action: actionMsg,
          currentplayerbet: betamount,
        });

        // Update Game status
        OnPlayerAction(tempGameHash);
        LogRocket.log("Called with " + currentplayerbet, {
          GameHash: tempGameHash,
        });

        /* MainV2.SendNotification(
          connection,
          tempGameHash.GameId,
          "",
          MainV2.GetNotificationMsg(actionMsg, user.UserName, currentplayerbet)
        ); */

        // BetTake value init
        //BetTakeValueRef.current.value = "";
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [OnPlayerAction, Sno, gameHash]
  );

  return (
    <button
      className="btn-sm btn-success Call ml-1 mt-1"
      onClick={CallEventHandler}
      disabled={CurrentPlayer && CurrentPlayer.IsCurrent !== "Y"}
      style={
        !(
          CurrentPlayer &&
          CurrentPlayer.IsCurrent === "Y" &&
          CurrentPlayer.PlayerCards.length > 0 &&
          gameHash.CurrentBet > 0
        )
          ? { display: "none" }
          : {}
      }
    >
      Call
    </button>
  );
};

export default CallButton;
