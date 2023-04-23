import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { GetUserNameFromPlayerId } from "../../common/game/basic";

const PassDealPopUp = (
  props = { open: false, setOpen: false, players: [], PassDealPlayer: () => {} }
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
      <DialogTitle>{"Choose"}</DialogTitle>
      <DialogContent>
        {props.players.map((player, index) => (
          <button
            key={index}
            className="btn-sm btn-primary"
            onClick={() => props.PassDealPlayer(player.Sno)}
          >
            {GetUserNameFromPlayerId(player.PlayerId)}
          </button>
        ))}
        {props.players.length === 0 && "No active players"}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PassDealPopUp;
