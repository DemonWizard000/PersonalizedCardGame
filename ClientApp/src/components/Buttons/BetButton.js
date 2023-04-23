import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import LogRocket from "../../util/LogRocketUtil";

const BetButton = ({
  CurrentPlayer,
  BetTakeValueRef,
  gameHash,
  Sno,
  OnPlayerAction,
}) => {
  const BetEventHandler = useCallback(
    (ev) => {
      try {
        // you should input betammount
        if (BetTakeValueRef.current.value === "") {
          // eslint-disable-next-line no-undef
          alert("bet amount is required");
          return;
        }

        // get betamount
        let tempGameHash = { ...gameHash };
        let betamount = parseInt(BetTakeValueRef.current.value);
        if (isNaN(betamount)) {
          alert("Input correct number");
          return;
        }
        const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);
        betamount = parseFloat(betamount);

        // betamount must be more than currentBet amount - your current round status
        if (
          betamount <
          tempGameHash.CurrentBet - currentPlayer.CurrentRoundStatus
        ) {
          // eslint-disable-next-line no-undef
          alert(
            "Minimum bet is:" +
              (tempGameHash.CurrentBet -
                currentPlayer.CurrentRoundStatus.toString())
          );
          return;
        }

        // if betamount is suitable.
        else {
          MainV2.AddAmountToPot(currentPlayer, betamount, tempGameHash);

          // for continuing round
          currentPlayer.CurrentRoundStatus += betamount;

          let actionMsg = " bet:" + betamount;

          // if you betted more than Game's CurrentBet
          if (tempGameHash.CurrentBet < betamount) {
            actionMsg =
              " raised by:" +
              (betamount - tempGameHash.CurrentBet) +
              "- bet:" +
              betamount;
            tempGameHash.CurrentBet = betamount;
          }

          MainV2.AddStepAndSetLastActionPerformed(tempGameHash, Sno, {
            Action: actionMsg,
            Amount: betamount,
          });

          // Update GameStatus
          OnPlayerAction(tempGameHash);

          LogRocket.log("Betted " + BetTakeValueRef.current.value, {
            GameHash: tempGameHash,
          });

          /* MainV2.SendNotification(
            connection,
            tempGameHash.GameId,
            "",
            MainV2.GetNotificationMsg(actionMsg, user.UserName, betamount)
          ); */
        }

        // init BetTakeValue
        BetTakeValueRef.current.value = "";
      } catch (err) {}
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [OnPlayerAction, Sno, gameHash]
  );

  return (
    <button
      className="btn-sm btn-success Bet mt-1"
      onClick={BetEventHandler}
      disabled={CurrentPlayer && CurrentPlayer.IsCurrent !== "Y"}
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
      &nbsp;Bet&nbsp;
    </button>
  );
};

export default BetButton;
