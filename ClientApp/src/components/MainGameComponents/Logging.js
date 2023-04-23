import React, { useCallback } from "react";

import * as MainV2 from "../../common/game/MainV2";
import { capitalizeFirstLetter } from "../../common/game/basic";
const Logging = ({ gameHash = {} }) => {
  const ShowLogging = useCallback(() => {
    let spanClass = "";
    let tempRound = "";

    let HandNumber = 1;
    return gameHash.Steps.map((obj, index) => {
      // If the current step object's RoundId DOES NOT equal 0...
      if (obj.RoundId !== 0) {
        // Used in the else block down below for further iterations of this $.each loop (should be removed once this doesn't rewrite the log's entirety)
        //prevMessage = obj.Step.Action;

        // Assign an even/odd class to be used for an alternating color pattern based on RoundId
        spanClass = obj.RoundId % 2 === 0 ? "even" : "odd";

        // Invoke helper function to build a log statement with a player action
        const actionText = MainV2.buildLogStatement(obj.Step);
        let flag = false;
        if (tempRound !== obj.RoundId) {
          tempRound = obj.RoundId;
          flag = true;
        }
        return (
          <div key={index}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#8594;&nbsp;
            <span className={spanClass}>
              <strong>
                {capitalizeFirstLetter(obj.Step.PlayerId.split("pk2")[0])}
              </strong>
              {actionText}
            </span>
            <br />
            <br />
            {flag && (
              <>
                &nbsp;&nbsp;&#8594;&nbsp;
                <span className={spanClass}>Round: {obj.RoundId}</span>
                <br />
                <br />
              </>
            )}
            {index === 0 && (
              <>
                <span style={{ color: "yellow" }}>New Hand {HandNumber++}</span>
                <br />
              </>
            )}
          </div>
        );
      }

      // Else (the current step object's RoundId DOES equal 0)...
      else {
        tempRound = "";
        return (
          <>
            <span style={{ color: "yellow" }}>New Hand {HandNumber++}</span>
            <br />
            <br />
          </>
        );
      }
    }).reverse();
  }, [gameHash]);

  return (
    <div className="d-none col-2 d-sm-block bg-black text-light my-top mx-auto">
      <div className="DivGameCode text-center mt-1" id="inviteCode">
        <span className="badge badge-success">
          Game #<br />
          {gameHash.GameId}
        </span>
      </div>
      <div className="CustomSideBar">{ShowLogging()}</div>
    </div>
  );
};

export default Logging;
