import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { priceBooksAPI } from "../../api/priceBooks";
import { toast } from "react-toastify";

const DeletePriceBookAction = ({ priceBook, onDeleteSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await priceBooksAPI.deletePriceBook(priceBook.id);
      toast.success("Price Book removed.");
      setOpen(false);
      onDeleteSuccess();
    } catch (error) {
      toast.error("Error deleting Price Book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton color="error" onClick={() => setOpen(true)}>
        <DeleteIcon />
      </IconButton>

      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle>Delete Price Book?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{priceBook.name}</strong>?
          This will also remove all special pricing for products in this book.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeletePriceBookAction;
