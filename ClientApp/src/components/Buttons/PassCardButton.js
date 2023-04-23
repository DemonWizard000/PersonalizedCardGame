import React, { useCallback, useEffect, useState } from "react";
import PassCardModal from "../Dialogs/PassCardModal";
import * as MainV2 from "../../common/game/MainV2";

const PassCardButton = ({
  PassCardBtnVisible,
  passCardModalOpen,
  setPassCardModalOpen,
  gameHash,
  PassCard,
  Sno,
}) => {
  return (
    <>
      <button
        className="btn btn-sm btn-primary PassCard"
        data-toggle="tooltip"
        data-html="true"
        title="..."
        style={{
          display: PassCardBtnVisible ? "" : "none",
        }}
        onClick={() => setPassCardModalOpen(true)}
      >
        Pass Card
      </button>
      <PassCardModal
        open={passCardModalOpen}
        setOpen={setPassCardModalOpen}
        players={MainV2.FilterActivePlayer(
          (x) => x.IsFolded === "N" && x.Sno !== Sno,
          gameHash
        )}
        PassCard={PassCard}
        numberOfCommunity={gameHash.NumberOfCommunities}
      />
    </>
  );
};

export default PassCardButton;
