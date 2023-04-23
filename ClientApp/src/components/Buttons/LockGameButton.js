import React, { useCallback, useEffect, useState } from "react";
import "../../css/MainGame.css";
import { SendRequest } from "../../util/AxiosUtil";

const LockGameButton = (props = { GameCode: "" }) => {
  const [isLocked, setIsLocked] = useState(false);
  const clickEventHandler = useCallback(() => {
    SendRequest({
      url: "GameV2/_LockGame",
      method: "POST",
      data: {
        GameCode: props.GameCode,
        IsLocked: !isLocked,
      },
    }).then((result) => {
      if (result.data === true) setIsLocked(!isLocked);
      else alert("You can't Lock the Game");
    });
  }, [isLocked, props.GameCode]);

  useEffect(() => {
    SendRequest({
      url: "GameV2/_GetLockStatus",
      method: "POST",
      data: {
        GameCode: props.GameCode,
      },
    }).then((result) => {
      setIsLocked(result.data);
    });
  }, [props.GameCode]);

  return (
    <button
      className="btn btn-danger BtnCancelHand m-2"
      onClick={clickEventHandler}
    >
      {isLocked ? "UnLock Game" : "Lock Game"}
    </button>
  );
};

export default LockGameButton;
