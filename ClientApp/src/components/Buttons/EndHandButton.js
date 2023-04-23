import React, { useCallback } from "react";

const EndHandButton = ({
  CurrentPlayer,
  gameHash,
  SettleRoundEventHandler,
}) => {
  const SettelEventHandler = useCallback(
    (ev) => {
      let tempGameHash = { ...gameHash };
      tempGameHash.LastActionPerformed = [];
      tempGameHash.IsRoundSettlement = "Y";
      SettleRoundEventHandler(tempGameHash);
    },
    [gameHash, SettleRoundEventHandler]
  );
  return (
    <>
      <button
        className="btn btn-danger BtnSettle m-2"
        onClick={SettelEventHandler}
        disabled={
          CurrentPlayer && CurrentPlayer.IsDealer === "Y" ? false : true
        }
      >
        End hand
      </button>
    </>
  );
};

export default EndHandButton;
