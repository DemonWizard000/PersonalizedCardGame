import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { GetUserNameFromPlayerId } from "../../common/game/basic";

const PassCardModal = (
  props = {
    open: false,
    setOpen: false,
    players: [],
    numberOfCommunity: 5,
    PassCard: () => {},
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
      <DialogTitle>{"Choose"}</DialogTitle>
      <DialogContent>
        {props.players.map((obj, index) => (
          <button
            className="btn-sm btn-primary"
            key={index}
            onClick={() => {
              props.PassCard(obj.Sno, -1);
              props.setOpen(false);
            }}
            style={{ border: "none", marginTop: "3%", marginLeft: "1%" }}
          >
            {GetUserNameFromPlayerId(obj.PlayerId)}
          </button>
        ))}
        {Array.apply(null, Array(props.numberOfCommunity)).map((obj, index) => (
          <button
            key={index}
            className="btn-sm btn-primary"
            onClick={() => {
              props.PassCard("X", index);
              props.setOpen(false);
            }}
            style={{ border: "none", marginTop: "3%", marginLeft: "1%" }}
          >
            Community {index + 1}
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

export default PassCardModal;
