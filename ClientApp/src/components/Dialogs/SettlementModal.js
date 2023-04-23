import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const SettlementModal = (
  props = { open: false, setOpen: false, transactions: [], handleOK: () => {} }
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
      <DialogTitle>
        Amount Settled
        <Button>New Deal</Button>
      </DialogTitle>
      <DialogContent>
        {props.transactions.map((obj, index) => {
          const tmp1 = obj;
          if (
            tmp1.TransactionList !== undefined &&
            tmp1.TransactionList.length > 0
          ) {
            return (
              <div className="row">
                <div className="col-md-12">
                  <span>Hand # {index + 1} *</span>
                </div>
                {new Array(tmp1.TransactionList.length).forEach((t, index1) => (
                  <>
                    <div className="col-md-2">{index1 + 1}</div>
                    <div className="col-md-10">{t}</div>
                  </>
                ))}
              </div>
            );
          }
          return <></>;
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={props.handleOK}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SettlementModal);
