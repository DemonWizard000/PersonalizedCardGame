import React, { useRef, useState, useCallback } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  getInitGameHash,
  GeneratePlayerId,
  GenerateCode,
} from "../../common/game/basic";
import { SendRequest } from "../../util/AxiosUtil";
import { useMemo } from "react";
import { v4 as uuid } from "uuid";
import { createMeeting } from "../../util/VideoSDK";

/**
 * Initialize GameHash
 *  {string} playerId - playerid of the game creater.
 *  {string} playerUniqueId - playerUniqueId generated from server.
 *  {object} oldGameHash - initialized game hash
 *  {object} gameCode - gameCode to initialize
 */
const initializeGameHash = (
  playerId,
  playerUniqueId,
  oldGameHash,
  gameCode
) => {
  let newGameHash = { ...oldGameHash };
  newGameHash.IsEnded = false;
  newGameHash.Steps = [];
  newGameHash.CommunityCards = [];
  newGameHash.ActivePlayers = [];
  newGameHash.ContinuityPlayers = [];
  newGameHash.DiscardedCards = [];
  newGameHash.GameId = gameCode;
  newGameHash.IsRoundSettlement = "Y";

  newGameHash.ActivePlayers.push({
    PlayerId: playerId,
    PlayerName: "P1",
    PlayerCards: [],
    PlayerAmount: 0, // taken - bet = amount
    ConnectionId: "",
    Sno: 1,
    IsDealer: "Y",
    IsCurrent: "N",
    IsFolded: "N",
    IsRealTimeChat: "N",
    CurrentRoundStatus: 0,
    PlayerUniqueId: playerUniqueId,
  });

  return newGameHash;
};

const Home = ({ isAuthorized }) => {
  const host_name_ref = useRef(null);
  const invitation_code_ref = useRef(null);
  const create_user_name_ref = useRef(null);
  const join_user_name_ref = useRef(null);
  const game_code_ref = useRef(null);
  const [recurring, setRecurring] = useState(false);
  const [onlyInvitees, setOnlyInvitees] = useState(false);
  const [videoChatAllow, setVideoChatAllow] = useState(false);

  const user = useMemo(() => {
    if (!isAuthorized) {
      localStorage.removeItem("user");
    }
    let tUser = JSON.parse(localStorage.getItem("user"));
    if (tUser === null || tUser === undefined) {
      tUser = {
        Id: uuid(),
        UserName: null,
        isTemp: true,
      };
    }
    return tUser;
  }, [isAuthorized]);

  const copyInvitation = useCallback(() => {
    /* Select the text field */
    invitation_code_ref.current.select();
    invitation_code_ref.current.setSelectionRange(0, 99999);

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(invitation_code_ref.current.value);

    /* Alert the copied text */
    alert("Copied code: " + invitation_code_ref.current.value);
  }, [invitation_code_ref]);

  const handleCreate = useCallback(() => {
    if (
      !isAuthorized &&
      create_user_name_ref.current.value.trim().length === 0
    ) {
      alert("Input User Name");
    }
    if (isAuthorized && host_name_ref.current.value.trim().length === 0) {
      alert("Input host name");
    } else invitation_code_ref.current.value = GenerateCode();
  }, [isAuthorized]);

  const handleStart = useCallback(async () => {
    let tUser = { ...user };
    if (
      !isAuthorized &&
      create_user_name_ref.current.value.trim(" ").length === 0
    ) {
      alert("Input User Name");
      return;
    }

    if (isAuthorized && host_name_ref.current.value.trim(" ").length === 0) {
      alert("Input Host Name");
      return;
    }

    if (invitation_code_ref.current.value.trim(" ").length === 0) {
      alert("Generate Invitation code first");
      return;
    }

    if (!isAuthorized) {
      tUser.UserName = create_user_name_ref.current.value;
      localStorage.setItem("user", JSON.stringify(tUser));
    }

    const generatedPlayerId = GeneratePlayerId(tUser.UserName, tUser.Id);
    const gameHash = initializeGameHash(
      generatedPlayerId,
      user.Id,
      getInitGameHash(),
      invitation_code_ref.current.value
    );

    //video chat allowed
    if (videoChatAllow) {
      gameHash.MeetingId = await createMeeting();
      if (gameHash.MeetingId === null) {
        alert("Can't Create Video Meeting.");
        return;
      }
    } else gameHash.MeetingId = null;

    SendRequest({
      method: "post",
      url: "GameV2/_CreateGame",
      data: {
        HostName: isAuthorized ? host_name_ref.current.value : "",
        IsRecurring: recurring,
        IsInviteesOnly: onlyInvitees,
        UserId: generatedPlayerId,
        GameCode: invitation_code_ref.current.value,
        GameHash: JSON.stringify(gameHash),
        PlayerUniqueId: user.Id,
        GamePlayerHash: JSON.stringify(gameHash.ActivePlayers),
      },
    }).then(() => {
      alert("Game Created Successfully!");
      window.location.href =
        "/game/main-game?GameCode=" + invitation_code_ref.current.value;
    });
  }, [user, isAuthorized, videoChatAllow, recurring, onlyInvitees]);

  const JoinGame = useCallback(() => {
    let tUser = { ...user };
    if (
      !isAuthorized &&
      join_user_name_ref.current.value.trim(" ").length === 0
    ) {
      alert("Input User Name");
      return;
    } else if (game_code_ref === null) {
      alert("Input Game Code");
      return;
    }

    if (!isAuthorized) {
      tUser.UserName = join_user_name_ref.current.value;
      localStorage.setItem("user", JSON.stringify(tUser));
    }

    window.location.href =
      "/game/main-game?GameCode=" + game_code_ref.current.value;
  }, [isAuthorized, user]);

  return (
    <div className="row p-2">
      <div className="row">
        <div className="col-md-8">
          <h1>Premium Hosts can</h1>
          <ul>
            <li>
              <h3>Save guest lists</h3>
            </li>
            <li>
              <h3>Schedule games</h3>
            </li>
            <li>
              <h3>Save game history</h3>
            </li>
            <li>
              <h3>
                Access premium features like ad-free games, in-game video, and
                more!
              </h3>
            </li>
          </ul>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 m-2 MainPageDivs">
          <h2>Create Game</h2>
          <ul>
            <li>Click the "Create" button</li>
            <li>Share the invitation code number with your friends</li>
            <li>Click the "Start" button</li>
          </ul>
          <div className="form-group mt-2">
            <label htmlFor="GameName">
              {!isAuthorized ? "UserName" : "GameName"}
            </label>
            {!isAuthorized ? (
              <input
                ref={create_user_name_ref}
                type="text"
                className="form-control d-inline w-50"
                placeholder="Your name please..."
                name="UserName"
                required
              />
            ) : (
              <input
                ref={host_name_ref}
                type="text"
                className="form-control d-inline w-50"
                id="GameName"
                placeholder="Host name"
                name="GameName"
                required
              />
            )}

            <button className="btn btn-primary" onClick={handleCreate}>
              Create
            </button>
          </div>
          <div className="form-group">
            <div className="d-flex m-2 text-center"></div>
            <div>
              <label htmlFor="pwd">Invitation Code:</label>
              <input
                type="text"
                className="form-control w-50 d-inline"
                id="GameCode"
                placeholder="Code to share"
                name="GameCode"
                ref={invitation_code_ref}
                required
                readOnly
              />
              <button className="ml-2">
                <ContentCopyIcon onClick={copyInvitation} />
              </button>
            </div>
          </div>
          {isAuthorized && (
            <>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox onChange={() => setRecurring(!recurring)} />
                  }
                  label="Create as recurring game"
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  checked={onlyInvitees}
                  control={
                    <Checkbox onChange={() => setOnlyInvitees(!onlyInvitees)} />
                  }
                  label="Only Invitees can join this game"
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  checked={videoChatAllow}
                  control={
                    <Checkbox
                      onChange={() => setVideoChatAllow(!videoChatAllow)}
                    />
                  }
                  label="Allow Video Chat"
                />
              </FormGroup>
            </>
          )}
          &nbsp;
          <button
            type="submit"
            className="btn btn-primary mb-2"
            onClick={handleStart}
          >
            Start
          </button>
          <br />
        </div>
        <div className="col-md-5 m-2 MainPageDivs">
          <h2>Join Game</h2>
          <ul>
            <li>Paste the invitation code</li>
            <li>Click the "Join" button</li>
          </ul>
          {!isAuthorized && (
            <div className="form-group">
              <label htmlFor="UserName">UserName</label>
              <input
                ref={join_user_name_ref}
                type="text"
                className="form-control d-inline w-50"
                placeholder="Your name please..."
                name="UserName"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="GameCode">Game Code</label>
            <input
              ref={game_code_ref}
              type="text"
              className="form-control d-inline w-50"
              placeholder="Game Code"
              name="GameCode"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary mb-2"
            onClick={JoinGame}
          >
            Join
          </button>
          <br />
        </div>
      </div>
    </div>
  );
};

export default Home;
