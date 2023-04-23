import React, { useCallback, useState } from "react";
import * as MainV2 from "../../common/game/MainV2";
import ModalInfoCancelHandPrompt from "../Dialogs/ModalInfoCancelHandPrompt";
import { GetNewDeck } from "../../common/game/CommonGame";
import { SendRequest } from "../../util/AxiosUtil";
import LogRocket from "../../util/LogRocketUtil";

const CancelHandButton = ({
  CurrentPlayer,
  gameHash,
  Sno,
  SaveGameHash,
  setModalInfoCancelHandOpen,
}) => {
  const [modalInfoCancelHandPromptOpen, setModalInfoCancelHandPromptOpen] =
    useState(false);

  const CancelEventHandler = useCallback(
    (ev) => setModalInfoCancelHandPromptOpen(true),
    []
  );

  const ModalInfoCancelHandPrompt_Yes = useCallback(() => {
    setModalInfoCancelHandPromptOpen(false);
    let tempGameHash = { ...gameHash };
    tempGameHash.ActivePlayers.forEach((obj, index) => {
      // init PlayerNetStatusFinal
      if (obj.PlayerNetStatusFinal === undefined) {
        obj.PlayerNetStatusFinal = 0;
      }

      // calcualte PotSize
      if (obj.PlayerAmount < 0) {
        tempGameHash.PotSize = tempGameHash.PotSize + obj.PlayerAmount;
      }

      // initialze
      obj.PlayerAmount = 0;
      obj.Balance = 0;
      obj.CurrentRoundStatus = 0;

      obj.PlayerCards = [];
    });
    tempGameHash.BetStatus = "Hand Cancelled";
    // initialize
    tempGameHash.CommunityCards = [];
    tempGameHash.Deck = GetNewDeck();

    // Add Cancel Hande steps.
    tempGameHash.Steps.push({
      RoundId: tempGameHash.Round,
      Step: {
        PlayerId: MainV2.GetActivePlayerBySno(Sno, tempGameHash).PlayerId,
        PlayerSno: Sno,
        Action: " Cancelled Hand",
        Amount: 0,
      },
    });

    LogRocket.log("Cancel Hand", {
      GameHash: tempGameHash,
    });

    // Update GameHash
    SaveGameHash(tempGameHash);

    // Send Cancel hand notification
    SendRequest({
      url: "GameV2/_SendCancelHandNotification",
      method: "POST",
      data: {
        NotificationType: "CancelHand",
        GameCode: tempGameHash.GameId,
        NotificationMessage: "hand has been cancelled by dealer",
      },
    }).then(() => {
      setModalInfoCancelHandOpen(true);
    });
  }, [SaveGameHash, Sno, gameHash, setModalInfoCancelHandOpen]);

  return (
    <>
      <button
        className="btn btn-danger BtnCancelHand m-2"
        onClick={CancelEventHandler}
        disabled={
          CurrentPlayer && CurrentPlayer.IsDealer === "Y" ? false : true
        }
      >
        Cancel Hand
      </button>
      <ModalInfoCancelHandPrompt
        open={modalInfoCancelHandPromptOpen}
        setOpen={setModalInfoCancelHandPromptOpen}
        handleOK={ModalInfoCancelHandPrompt_Yes}
      />
    </>
  );
};

export default CancelHandButton;
