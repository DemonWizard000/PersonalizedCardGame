import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import LogRocket from "../../util/LogRocketUtil";

const AddToPotButton = ({ BetTakeValueRef, gameHash, Sno, SaveGameHash }) => {
  const AddToPotEventHandler = useCallback(
    (ev) => {
      // logic
      try {
        const betamount = parseInt(BetTakeValueRef.current.value); // for active user

        if (isNaN(betamount)) {
          alert("Input Correct Number!");
          return;
        }

        // check betamount is at least 1.
        if (betamount < 1) {
          alert("minimum amount: 1");
          return;
        } else {
          let tempGameHash = { ...gameHash };
          let currentPlayer = MainV2.GetActivePlayerBySno(Sno, gameHash);

          MainV2.AddAmountToPot(currentPlayer, betamount, tempGameHash);

          const actionMsg = " added " + betamount + "$ to pot";

          //Add step and set LastAction
          tempGameHash = MainV2.AddStepAndSetLastActionPerformed(
            tempGameHash,
            Sno,
            {
              Action: actionMsg,
              Amount: betamount,
            }
          );

          // Send Notification and UpdateGameHash
          /* MainV2.SendNotification(
            connection,
            tempGameHash.GameId,
            "",
            MainV2.GetNotificationMsg(actionMsg, user.UserName, betamount)
          ); */
          LogRocket.log("Added" + betamount + " To Pot", {
            GameHash: tempGameHash,
          });

          SaveGameHash(tempGameHash);
        }

        // initialize BetTakeValue to 1.
        BetTakeValueRef.current.value = "1";
      } catch (err) {
        //GameLogging(err, 2);
      }
    },
    [BetTakeValueRef, gameHash, Sno, SaveGameHash]
  );
  return (
    <button
      className="btn-sm btn-danger AddToPot ml-1 mt-1 mr-1"
      onClick={AddToPotEventHandler}
    >
      Add to pot
    </button>
  );
};

export default AddToPotButton;
