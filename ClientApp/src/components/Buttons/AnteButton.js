import React, { useCallback } from "react";
import * as MainV2 from "../../common/game/MainV2";
import LogRocket from "../../util/LogRocketUtil";

const AnteButton = ({ gameHash, txtAnteRef, Sno, SaveGameHash }) => {
  const AnteEventHandler = useCallback(
    (ev) => {
      if (
        MainV2.FilterActivePlayer(
          (x) => x.IsFolded === "N" && x.IsDealer === "N",
          gameHash
        ).length > 0
      ) {
        let tempGameHash = { ...gameHash };

        const anteValue = parseInt(txtAnteRef.current.value);
        if (isNaN(anteValue)) {
          alert("Input Correct Number!");
          return;
        }
        if (anteValue <= 0) {
          alert("Input value greater than 0");
          return;
        }

        tempGameHash = MainV2.AddStepAndSetLastActionPerformed(
          tempGameHash,
          Sno,
          {
            Action: "Ante: " + anteValue,
            Amount: anteValue,
          }
        );

        // Update every ActivePlayer's PlayerAmount
        let potAdd = 0;
        MainV2.FilterActivePlayer(
          (x) => x.IsFolded === "N",
          tempGameHash
        ).forEach((obj) => {
          obj.PlayerAmount -= anteValue;
          potAdd += anteValue;
        });

        // Update GameHash's total potsize(+= anteValue * ActivePlayers.length)
        tempGameHash.PotSize += potAdd;

        // Send Notification
        /* MainV2.SendNotification(
          connection,
          tempGameHash.GameId,
          "",
          "Ante: " + anteValue + ""
        ); */

        // Update GameHash
        LogRocket.log("Anted " + anteValue, {
          GameHash: tempGameHash,
        });

        SaveGameHash(tempGameHash);
      }

      // If not
      else {
        alert("No Active Player");
      }
    },
    [gameHash, txtAnteRef, Sno, SaveGameHash]
  );
  return (
    <button
      className="btn btn-sm btn-primary Ante mt-0"
      onClick={AnteEventHandler}
    >
      Ante
    </button>
  );
};

export default AnteButton;
