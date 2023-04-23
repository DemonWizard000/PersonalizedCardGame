import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import LogRocket from "../../util/LogRocketUtil";
const TakeButton = ({ BetTakeValueRef, gameHash, Sno, SaveGameHash }) => {
  const TakeEventHandler = useCallback(
    (ev) => {
      try {
        let tempGameHash = { ...gameHash };

        /*
          Get takeamount
          If BetTakeValue is more than 1, take BetTakeValue.
          Else, Take all of Game's Current PotSize.
      */
        const betTakeValule = BetTakeValueRef.current.value;
        const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);
        const takeamount =
          betTakeValule === "" || betTakeValule === "0"
            ? tempGameHash.PotSize
            : parseFloat(betTakeValule);

        // check if takeamount is between 0 ~ GameHash.Potsize
        if (takeamount > tempGameHash.PotSize || takeamount < 0) {
          /* MainV2.SendNotification(
            connection,
            GameCode,
            "",
            "" +
              GetUserNameFromPlayerId(currentPlayer.PlayerId) +
              " is trying to take " +
              takeamount +
              " from pot."
          ); */
          return;
        } else {
          MainV2.AddAmountToPot(currentPlayer, -takeamount, tempGameHash);

          const actionMsg = "take";

          MainV2.AddStepAndSetLastActionPerformed(tempGameHash, Sno, {
            Action: actionMsg,
            Amount: takeamount,
          });

          // initialilze BetTakeValue
          BetTakeValueRef.current.value = "";

          // Send Notification
          /* MainV2.SendNotification(
            connection,
            tempGameHash.GameId,
            "",
            MainV2.GetNotificationMsg(actionMsg, user.UserName, takeamount)
          ); */

          // UpdateGameHash
          LogRocket.log("Take " + takeamount + "from Pot", {
            GameHash: tempGameHash,
          });

          SaveGameHash(tempGameHash);
        }
      } catch (err) {
        //GameLogging(err, 2);
      }
    },
    [gameHash, BetTakeValueRef, Sno, SaveGameHash]
  );
  return (
    <button
      className="btn-sm btn-primary Take ml-1 mt-1 mr-1"
      onClick={TakeEventHandler}
    >
      Take
    </button>
  );
};

export default TakeButton;
