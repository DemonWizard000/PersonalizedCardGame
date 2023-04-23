import React, { useCallback, useMemo, useRef, useEffect } from "react";
import * as MainV2 from "../../common/game/MainV2";
import Cards from "./Cards";
import $ from "jquery";
import LogRocket from "logrocket";
import ReactPlayer from "react-player";
import { useParticipant } from "@videosdk.live/react-sdk";

const colors = ["text-danger", "text-warning", "text-info", "text-primary", ""];

const ParticipantView = ({ participantId }) => {
  const micRef = useRef(null);

  const meetingAPI = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (meetingAPI.webcamOn && meetingAPI.webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(meetingAPI.webcamStream.track);
      return mediaStream;
    }
  }, [meetingAPI.webcamStream, meetingAPI.webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (meetingAPI.micOn && meetingAPI.micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(meetingAPI.micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [meetingAPI.micStream, meetingAPI.micOn]);

  return (
    <>
      <audio ref={micRef} autoPlay muted={meetingAPI.isLocal} />
      <ReactPlayer
        playsinline
        pip={false}
        light={false}
        controls={false}
        muted={true}
        playing={true}
        url={videoStream}
        height={"100px"}
        width={"100px"}
        onError={(err) => {
          console.log(err, "participant video error");
        }}
      />
    </>
  );
};

const Player = ({
  ptr,
  gameHash,
  Sno,
  OtherPlayers_Next,
  OtherPlayers_Prev,
  DragSrc,
  setDragSrc,
  SaveGameHash,
  isCreator,
  connection,
  GameCode,
}) => {
  const GetPlayerInfo = useCallback(
    (ptr) => {
      let index;

      // this ptr belongs to OtherPlayers_Next
      if (ptr < 2 + OtherPlayers_Next.length) {
        index = ptr - 2 + 1;
        const next = OtherPlayers_Next.filter((x) => x.Sno === Sno + index)[0];
        const netstatusnext =
          next.PlayerNetStatusFinal === undefined
            ? next.PlayerAmount
            : next.PlayerNetStatusFinal + next.PlayerAmount;

        return {
          Sno: next.Sno,
          Name: next.PlayerId.split("pk2")[0],
          Status: next.PlayerAmount,
          StatusNet: netstatusnext,
          IsDealer: next.IsDealer,
          IsCurrent: next.IsCurrent,
        };
      } else if (ptr > 6 - OtherPlayers_Prev.length) {
        index = 6 - ptr + 1;

        const prev = OtherPlayers_Prev.filter((x) => x.Sno === Sno - index)[0];

        const netstatusprev =
          prev.PlayerNetStatusFinal === undefined
            ? prev.PlayerAmount
            : prev.PlayerNetStatusFinal + prev.PlayerAmount;

        return {
          Sno: prev.Sno,
          Name: prev.PlayerId.split("pk2")[0],
          Status: prev.PlayerAmount,
          StatusNet: netstatusprev,
          IsDealer: prev.IsDealer,
          IsCurrent: prev.IsCurrent,
        };
      } else {
        return {
          Sno: "",
          Name: "Empty seat",
          Status: 0,
          StatusNet: "",
          IsDealer: "N",
          IsCurrent: "N",
        };
      }
    },
    [Sno, OtherPlayers_Prev, OtherPlayers_Next]
  );

  const Drop = useCallback(
    (ev, toSno) => {
      let tempGamsHash = { ...gameHash };
      try {
        $(".fas").removeClass("Droppable");
        ev.preventDefault();
      } catch (ex) {
        alert("drop at the right place!");
      }
      if (
        DragSrc &&
        DragSrc.Sno !== undefined &&
        toSno !== undefined &&
        DragSrc.Sno !== toSno
      ) {
        MainV2.PassCardToPlayerByDrop(toSno, DragSrc, tempGamsHash);
        SaveGameHash(tempGamsHash);
      }
      setDragSrc(undefined);
    },
    [DragSrc, SaveGameHash, gameHash, setDragSrc]
  );

  const AllowDrop = useCallback((ev) => {
    $(".fas").addClass("Droppable");
    ev.preventDefault();
  }, []);

  const DragEnd = useCallback((ev) => {
    $(ev.target).removeClass("Droppable");
    ev.preventDefault();
  }, []);

  const RemovePlayer = useCallback(
    (Player) => {
      let tempGameHash = { ...gameHash };
      MainV2.GetActivePlayerBySno(Player.Sno, tempGameHash).IsFolded = "Y";
      tempGameHash.ContinuityPlayers = MainV2.FilterContinuityPlayer(
        (x) => x.Sno !== Player.Sno,
        tempGameHash
      );

      MainV2.SendRemoveNotification(
        connection,
        GameCode,
        Player.PlayerId.split("pk2")[1]
      );
      // UpdateGameHash

      LogRocket.log("Removed Player " + Player.PlayerId.split("pk2")[1], {
        GameCode: GameCode,
        GameHash: tempGameHash,
      });

      SaveGameHash(tempGameHash);
    },
    [GameCode, SaveGameHash, connection, gameHash]
  );

  const PlayerInfo = useMemo(() => GetPlayerInfo(ptr), [GetPlayerInfo, ptr]);
  const Player = useMemo(() => {
    let P = { PlayerCards: [] };
    if (PlayerInfo.Sno !== "") {
      P = MainV2.FilterActivePlayer(
        (x) => x.Sno === PlayerInfo.Sno,
        gameHash
      )[0];
    }
    return P;
  }, [PlayerInfo.Sno, gameHash]);

  return (
    <div
      className={
        "Player" +
        ptr +
        " Player" +
        (Player.IsFolded === "Y" ? " PlayerFolded" : "") +
        (Player.IsCurrent === "Y" ? " bg-active" : "")
      }
      data-sno={PlayerInfo.Sno}
      data-sliderindex="0"
    >
      <div>
        <div className="row m-0 p-1">
          <div className="PlayerName col badge badge-danger">
            {PlayerInfo.Name}
          </div>
          <div className="PlayerStatus col-auto badge badge-primary ml-1">
            {PlayerInfo.Status}
          </div>
          <div className="PlayerStatusNet col-auto badge badge-info ml-1">
            {PlayerInfo.StatusNet}
          </div>
          <div
            className="DealerStatus col-auto badge badge-danger ml-1"
            style={{ display: Player.IsDealer === "Y" ? "" : "none" }}
          >
            D
          </div>
          {PlayerInfo.Sno !== "" && isCreator && (
            <button
              className="btn-sm btn-primary"
              onClick={() => RemovePlayer(Player)}
            >
              Remove {PlayerInfo.Name}
            </button>
          )}
        </div>
        <div
          id={"Player" + ptr}
          onDrop={(ev) => Drop(ev, PlayerInfo.Sno)}
          onDragOver={AllowDrop}
          onDragEnd={DragEnd}
          onDragLeave={DragEnd}
        >
          {Player.IsRealTimeChat === "Y" ? (
            <ParticipantView participantId={Player.PlayerId.split("pk2")[1]} />
          ) : (
            <i className={"fas fa-user " + colors[ptr - 2]}></i>
          )}
          <span
            className="ActiveStatus col-auto badge badge-danger ml-1 d-none"
            style={{ display: "none" }}
          >
            A
          </span>
        </div>
        <div className="PlayerDeck">
          {Player.PlayerCards &&
            Player.PlayerCards.map((obj, index) => {
              return (
                <Cards
                  obj={obj}
                  Sno={PlayerInfo.Sno}
                  setDragSrc={setDragSrc}
                  handleClick={() => alert("Card does not belong to you.")}
                  key={index}
                />
              );
            })}
        </div>

        <span className="PlayerAction badge badge-primary mx-auto">
          {gameHash.LastActionPerformed &&
            gameHash.LastActionPerformed.filter(
              (x) => x.PlayerSno === PlayerInfo.Sno
            )[0] &&
            gameHash.LastActionPerformed.filter(
              (x) => x.PlayerSno === PlayerInfo.Sno
            )[0].Action.Action}
        </span>
      </div>
    </div>
  );
};

export default Player;
