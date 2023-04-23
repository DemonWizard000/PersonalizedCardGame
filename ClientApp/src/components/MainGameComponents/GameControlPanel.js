import React from "react";
import LockGameButton from "../Buttons/LockGameButton";
import CancelHandButton from "../Buttons/CancelHandButton";
import EndHandButton from "../Buttons/EndHandButton";
import LeaveButton from "../Buttons/LeaveButton";
import GameOverButton from "../Buttons/GameOverButton";
import SitOutButton from "../Buttons/SitoutButton";
import InviteButton from "../Buttons/InviteButton";

const GameControlPanel = ({
  isCreator,
  GameCode,
  CurrentPlayer,
  gameHash,
  Sno,
  SaveGameHash,
  setModalInfoCancelHandOpen,
  SettleRoundEventHandler,
  ShowSummaryV2,
  user,
}) => {
  return (
    <div className="col-12 text-center">
      {isCreator && <LockGameButton GameCode={GameCode} />}
      <CancelHandButton
        CurrentPlayer={CurrentPlayer}
        gameHash={gameHash}
        Sno={Sno}
        SaveGameHash={SaveGameHash}
        setModalInfoCancelHandOpen={setModalInfoCancelHandOpen}
      />
      <EndHandButton
        CurrentPlayer={CurrentPlayer}
        gameHash={gameHash}
        SettleRoundEventHandler={SettleRoundEventHandler}
      />
      <LeaveButton Sno={Sno} gameHash={gameHash} SaveGameHash={SaveGameHash} />
      <GameOverButton
        CurrentPlayer={CurrentPlayer}
        ShowSummaryV2={ShowSummaryV2}
      />
      <SitOutButton
        gameHash={gameHash}
        Sno={Sno}
        GameCode={GameCode}
        user={user}
        SaveGameHash={SaveGameHash}
      />
      {isCreator && <InviteButton GameCode={GameCode} />}
    </div>
  );
};

export default GameControlPanel;
