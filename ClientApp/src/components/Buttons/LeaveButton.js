import React, { useCallback, useState } from "react";
import MyModalLeave from "../Dialogs/MyModalLeave";
import * as MainV2 from "../../common/game/MainV2";
import LogRocket from "../../util/LogRocketUtil";
import { useMeeting } from "@videosdk.live/react-sdk";

const LeaveButton = ({ Sno, gameHash, SaveGameHash }) => {
  const [myModalLeaveOpen, setMyModalLeaveOpen] = useState(false);
  const meetingAPI = useMeeting({
    onMeetingLeft: () => {},
  });

  const LeaveEventHandler = useCallback((ev) => {
    setMyModalLeaveOpen(true);
  }, []);

  const Leave_YesEventHandler = useCallback(
    (ev) => {
      // Set currentPlayer's IsFolded "Y" and add you to the ContinuityPlayers.
      let tempGameHash = { ...gameHash };
      let currentPlayer = MainV2.GetActivePlayerBySno(Sno, tempGameHash);
      currentPlayer.IsFolded = "Y";
      currentPlayer.IsRealTimeChat = "N";
      tempGameHash.ContinuityPlayers = MainV2.FilterContinuityPlayer(
        (x) => x.Sno !== Sno,
        tempGameHash
      );

      LogRocket.log("Left game", {
        GameHash: tempGameHash,
      });

      if (meetingAPI !== undefined) {
        try {
          //leave meeting
          meetingAPI.leave();
        } catch (e) {
          console.log("leave game error", e);
        }
      }

      // UpdateGameHash
      SaveGameHash(tempGameHash);

      window.location.href = "/";
    },
    [gameHash, Sno, SaveGameHash]
  );

  return (
    <>
      <button
        className="btn btn-outline-danger BtnLeave m-2"
        onClick={LeaveEventHandler}
      >
        Leave Game
      </button>
      <MyModalLeave
        open={myModalLeaveOpen}
        setOpen={setMyModalLeaveOpen}
        handleOK={Leave_YesEventHandler}
      />
    </>
  );
};

export default LeaveButton;
