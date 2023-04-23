import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useCallback } from "react";
const GameOverButton = ({ CurrentPlayer, ShowSummaryV2 }) => {
  const meetingAPI = useMeeting();

  const BackToMenuEventHandler = useCallback(
    (ev) => {
      // Show Summary
      if (ShowSummaryV2() && meetingAPI !== undefined) {
        try {
          meetingAPI.end();
        } catch (e) {
          console.log("end meeting error", e);
        }
      }
    },
    [ShowSummaryV2]
  );
  return (
    <>
      <button
        className="btn btn-danger BackToMenu m-2"
        onClick={BackToMenuEventHandler}
        disabled={
          CurrentPlayer && CurrentPlayer.IsDealer === "Y" ? false : true
        }
      >
        Game Over
      </button>
    </>
  );
};

export default GameOverButton;
