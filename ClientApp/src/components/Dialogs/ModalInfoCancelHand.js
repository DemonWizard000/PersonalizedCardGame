import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const ModalInfoCancelHand = (props = { open: false, setOpen: false }) => {
  const handleOK = useCallback(() => {
    props.setOpen(false);
  }, [props]);

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
      <DialogTitle>{"Dialog"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Current Hand has been Cancelled By The Dealer
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOK}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(ModalInfoCancelHand);
