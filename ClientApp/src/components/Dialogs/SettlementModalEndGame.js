import React, { useCallback } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { GetUserNameFromPlayerId } from "../../common/game/basic";

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

const SettlementModalEndGame = (
  props = {
    open: false,
    setOpen: false,
    transactions: [],
    handleOK: () => {},
    isShow: false,
  }
) => {
  const handleClose = useCallback(() => {
    props.setOpen(false);
  }, [props]);

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      {!props.isShow && (
        <DialogTitle>Are you sure you want to end the game?</DialogTitle>
      )}
      <DialogContent>
        <TableContainer component={Paper}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Amount</StyledTableCell>
                <StyledTableCell align="right">Transaction</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.transactions.GameHashTemp &&
                props.transactions.GameHashTemp.ActivePlayers.sort(
                  (a, b) => a.PlayerNetStatusFinal - b.PlayerNetStatusFinal
                ).map((obj, index) => {
                  let tmpTransactionMessage = "";
                  props.transactions.ArrTransaction.filter(
                    (x) => x.from === obj.PlayerId
                  ).forEach((obj2) => {
                    tmpTransactionMessage +=
                      GetUserNameFromPlayerId(obj.PlayerId) +
                      " owes " +
                      obj2.amount +
                      " to " +
                      GetUserNameFromPlayerId(obj2.to);
                  });
                  return (
                    <StyledTableRow key={index}>
                      <StyledTableCell>
                        {obj.PlayerId.split("pk2")[0]}
                      </StyledTableCell>
                      <StyledTableCell>
                        {obj.PlayerNetStatusFinal}
                      </StyledTableCell>
                      <StyledTableCell>{tmpTransactionMessage}</StyledTableCell>
                    </StyledTableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleOK}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SettlementModalEndGame);
