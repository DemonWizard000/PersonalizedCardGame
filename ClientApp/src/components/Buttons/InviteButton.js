import React, { useCallback, useState } from "react";
import "../../css/MainGame.css";
import InviteModal from "../Dialogs/InviteModal";
const InviteButton = (props = { GameCode: "" }) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const clickEventHandler = useCallback(() => {
    setInviteModalOpen(true);
  }, []);

  return (
    <>
      <button
        className="btn btn-danger BtnCancelHand m-2"
        onClick={clickEventHandler}
      >
        Invite
      </button>
      <InviteModal
        open={inviteModalOpen}
        setOpen={setInviteModalOpen}
        GameCode={props.GameCode}
      />
    </>
  );
};

export default InviteButton;
