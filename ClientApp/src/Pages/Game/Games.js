import React, { useCallback, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { SendRequest } from "../../util/AxiosUtil";
import SettlementModalEndGame from "../../components/Dialogs/SettlementModalEndGame";
import * as MainV2 from "../../common/game/MainV2";
import {
  getInitGameHash,
  GeneratePlayerId,
  GenerateCode,
} from "../../common/game/basic";

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
    CurrentRoundStatus: 0,
    PlayerUniqueId: playerUniqueId,
  });

  return newGameHash;
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const Games = ({ isAuthorized }) => {
  const [pastGames, setPastGames] = useState([]);
  const [recurringGame, setRecurringGames] = useState([]);

  const [settlementModalEndGameOpen, setSettlementModalEndGameOpen] =
    useState(false);
  const [
    settlementModalEndGameTransactions,
    setSettlementModalEndGameTransactions,
  ] = useState([]);

  useEffect(() => {
    const fetchPastGames = () => {
      SendRequest({
        url: "GameV2/_GetPastGames",
        method: "POST",
      }).then((result) => {
        setPastGames(result.data);
      });
    };
    fetchPastGames();
  }, []);

  useEffect(() => {
    const fetchRecurringGames = () => {
      SendRequest({
        url: "GameV2/_GetRecurringGames",
        method: "POST",
      }).then((result) => {
        setRecurringGames(result.data);
      });
    };
    fetchRecurringGames();
  }, []);

  const StartRecurringGame = useCallback((Name) => {
    let user = JSON.parse(localStorage.getItem("user"));
    let GameCode = GenerateCode();
    const generatedPlayerId = GeneratePlayerId(user.UserName, user.Id);
    const gameHash = initializeGameHash(
      generatedPlayerId,
      user.Id,
      getInitGameHash(),
      GameCode
    );
    SendRequest({
      method: "post",
      url: "GameV2/_CreateGame",
      data: {
        HostName: Name,
        IsRecurring: false,
        UserId: generatedPlayerId,
        GameCode,
        GameHash: JSON.stringify(gameHash),
        PlayerUniqueId: user.Id,
        GamePlayerHash: JSON.stringify(gameHash.ActivePlayers),
      },
    }).then(() => {
      alert("Game Created Successfully!");
      window.location.href = "/game/main-game?GameCode=" + GameCode;
    });
  }, []);

  const ShowResult = useCallback((pastGame) => {
    setSettlementModalEndGameTransactions(
      MainV2.CalculateEndHand(JSON.parse(pastGame.GameHash))
    );
    setSettlementModalEndGameOpen(true);
  }, []);

  useEffect(() => {
    if (isAuthorized !== true) {
      alert("Login first");
      window.location.href = "/auth/sign-in";
    }
  }, [isAuthorized]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <Typography component="h1" variant="h5">
            Recurring games
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell align="right">Start</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recurringGame.map((row) => (
                  <StyledTableRow key={row.Name}>
                    <StyledTableCell component="th" scope="row">
                      {row.Name}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Button
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => StartRecurringGame(row.Name)}
                      >
                        Start
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={5}>
          <Typography component="h1" variant="h5">
            Past Games
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Host Name</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell align="right">Result</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pastGames.map((pastGame, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell scope="row">
                      {pastGame.HostName}
                    </StyledTableCell>
                    <StyledTableCell>{pastGame.Created}</StyledTableCell>
                    <StyledTableCell align="right">
                      <Button
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => ShowResult(pastGame)}
                      >
                        Result
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <SettlementModalEndGame
        open={settlementModalEndGameOpen}
        setOpen={setSettlementModalEndGameOpen}
        isShow={true}
        transactions={settlementModalEndGameTransactions}
        handleOK={() => setSettlementModalEndGameOpen(false)}
      />
    </>
  );
};

export default Games;
