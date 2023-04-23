import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import LogRocket from "../../util/LogRocketUtil";

const CheckButton = ({ CurrentPlayer, gameHash, Sno, OnPlayerAction }) => {
  const CheckEventHandler = useCallback(
    (ev) => {
      try {
        let tempGameHash = { ...gameHash };
        const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

        // You can only check when the bet is 0
        if (tempGameHash.CurrentBet - currentPlayer.CurrentRoundStatus !== 0) {
          alert("Cannot check when the bet is not 0");
          return;
        } else {
          const actionMsg = " Pass";
          MainV2.AddStepAndSetLastActionPerformed(tempGameHash, Sno, {
            Action: actionMsg,
            Amount: 0,
          });
          // Update Game Status
          OnPlayerAction(tempGameHash);

          LogRocket.log("Checked", {
            GmaeHash: tempGameHash,
          });

          /* MainV2.SendNotification(
            connection,
            tempGameHash.GameId,
            "",
            MainV2.GetNotificationMsg(actionMsg, user.UserName, 0)
          ); */
        }
      } catch (err) {
        //GameLogging(err, 2);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [OnPlayerAction, Sno, gameHash]
  );
  return (
    <button
      className="btn-sm btn-primary Pass ml-1 mt-1"
      onClick={CheckEventHandler}
      disabled={CurrentPlayer && CurrentPlayer.IsCurrent !== "Y"}
      style={
        !(
          CurrentPlayer &&
          CurrentPlayer.IsCurrent === "Y" &&
          CurrentPlayer.PlayerCards.length > 0 &&
          gameHash.CurrentBet === 0
        )
          ? { display: "none" }
          : {}
      }
    >
      Check
    </button>
  );
};

export default CheckButton;
