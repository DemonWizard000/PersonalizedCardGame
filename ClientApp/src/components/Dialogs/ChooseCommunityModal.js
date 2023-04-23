import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const ChooseCommunityModal = (
  props = {
    open: false,
    setOpen: false,
    cardImage: "",
    isDealer: false,
    TakeCommunityCard: () => {},
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
      <DialogTitle>{"Community Card"}</DialogTitle>
      <DialogContent>
        <div className="imgSelectedCard">
          <img
            alt=""
            src={"/assets/Cards/" + props.cardImage + ".png"}
            id="SelectedCommunityCard"
            style={{ width: "50px", height: "100px" }}
          />
        </div>

        <label>Actions</label>
        <div className="TakeCommunityCard">
          <button
            className="btn-sm btn-primary"
            onClick={() => props.TakeCommunityCard("1")}
          >
            Take
          </button>
          <button
            className="btn-sm btn-primary"
            onClick={() => props.TakeCommunityCard("2")}
          >
            Show
          </button>
          {props.isDealer && (
            <button
              className="btn-sm btn-danger TakeToCommunity"
              onClick={() => props.TakeCommunityCard("-2")}
            >
              Move to deck
            </button>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChooseCommunityModal;
