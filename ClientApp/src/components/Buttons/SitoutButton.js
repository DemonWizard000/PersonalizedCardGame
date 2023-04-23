import React, { useCallback, useMemo, useState } from "react";
import * as MainV2 from "../../common/game/MainV2";
import { SendRequest } from "../../util/AxiosUtil";
import LogRocket from "logrocket";

const SitOutButton = ({ gameHash, Sno, GameCode, user, SaveGameHash }) => {
  const CurrentPlayer = useMemo(
    () => MainV2.GetActivePlayerBySno(Sno, gameHash),
    [Sno, gameHash]
  );
  const SitOutEventHandler = useCallback(
    async (ev) => {
      try {
        let tempGameHash = { ...gameHash };
        // Perform SitOut action

        const actionMsg = "fold";

        MainV2.AddStepAndSetLastActionPerformed(tempGameHash, Sno, {
          Action: actionMsg,
          Amount: 0,
        });

        const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);

        // Set current player's IsFolded as "Y"
        currentPlayer.IsFolded = "Y";
        currentPlayer.IsSitOut = "Y";

        // Add current player to ContinuityPlayers list.
        if (
          MainV2.FilterContinuityPlayer((x) => x.Sno === Sno, tempGameHash)
            .length === 0
        )
          tempGameHash.ContinuityPlayers.push(currentPlayer);

        // If all of the players that folded now has joined in the game before you
        if (
          MainV2.GetUnfoldedActivePlayersAfterSno(Sno, tempGameHash).length ===
          0
        ) {
          // Sort ActivePlayers by Sno and set first folded player's IsCurrent "Y".
          MainV2.SetFirstUnfoldedPlayerAsCurrent(-1, tempGameHash);

          // Set BetStatus as first folded player's betstatus.
          tempGameHash.BetStatus = MainV2.GetBetStatus(
            MainV2.GetFirstUnfoldedPlayerAfterSno(-1, tempGameHash).Sno,
            tempGameHash
          );
        }

        // there is at least one player folded that joined in the game after you.
        else {
          // Sort ActivePlayers by Sno and set first folded player that joined after me as current.
          MainV2.SetFirstUnfoldedPlayerAsCurrent(Sno, tempGameHash);

          // Set BetStatus as first after-me-joined unfolded player's betstatus.
          tempGameHash.BetStatus = MainV2.GetBetStatus(
            MainV2.GetFirstUnfoldedPlayerAfterSno(Sno, tempGameHash).Sno,
            tempGameHash
          );
        }

        // If current player is Dealer, set first unfolded player as Dealer
        if (currentPlayer.IsDealer === "Y") {
          // Set first unfolded player as dealer.
          MainV2.SetFirstUnfoldedPlayerAsDealer(-1, tempGameHash);
        }

        // SitOuted player's card must be all private until he rejoin again.
        currentPlayer.PlayerCards.forEach(
          (obj) => (obj.Presentation = "private")
        );
        // Set CurrentPlayer's Delaer state and current state as false
        currentPlayer.IsDealer = "N";
        currentPlayer.IsCurrent = "N";

        LogRocket.log("Sit Out", {
          GameHash: tempGameHash,
        });

        // UpdateGameHash
        SaveGameHash(tempGameHash);
        /* MainV2.SendNotification(
          connection,
          tempGameHash.GameId,
          "",
          MainV2.GetNotificationMsg(actionMsg, user.UserName)
        ); */
      } catch (err) {
        console.log("SitOutButton error", err);
      }
    },
    [SaveGameHash, Sno, gameHash]
  );
  const RejoinEventHandler = useCallback(
    async (ev) => {
      // Perform SitOut action

      let tempGameHash = { ...gameHash };
      const currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);
      currentPlayer.IsSitOut = "N";
      currentPlayer.IsRealTimeChat = "N";
      SaveGameHash(tempGameHash);
    },
    [SaveGameHash, Sno, gameHash]
  );

  return (
    <>
      {CurrentPlayer && CurrentPlayer.IsSitOut === "Y" ? (
        <button
          className="btn btn-primary BtnRejoin"
          onClick={RejoinEventHandler}
        >
          Rejoin
        </button>
      ) : (
        <button
          className="btn btn-primary BtnSitOut"
          onClick={SitOutEventHandler}
        >
          Sit Out
        </button>
      )}
    </>
  );
};

export default SitOutButton;
