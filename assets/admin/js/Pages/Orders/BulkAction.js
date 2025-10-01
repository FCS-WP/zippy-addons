import React, { useState } from "react";
import { Button, Select, MenuItem, FormControl, Stack } from "@mui/material";
import { toast } from "react-toastify";
import { Api } from "../../api";

const BulkAction = () => {
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(false);

  const statusOptions = {
    "wc-pending": "Pending payment",
    "wc-processing": "Processing",
    "wc-on-hold": "On hold",
    "wc-packed": "Packed",
    "wc-completed": "Completed",
    "wc-cancelled": "Cancelled",
  };

  const handleSubmit = async () => {
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"][name="id[]"]'
    );
    const selected = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    if (!selected.length) {
      toast.error("Please select at least one order.");
      return;
    }

    if (!action) {
      toast.error("Please choose an action.");
      return;
    }

    setLoading(true);

    try {
      if (action === "trash") {
        const { data } = await Api.moveToTrashOrder({
          order_ids: selected,
        });

        if (data.status === "success") {
          toast.success("Orders moved to trash!");
          data.data.trashed_orders.forEach((orderId) => {
            const row = document.querySelector(`#order-${orderId}`);
            if (row) {
              row.remove();
            }
          });
        } else {
          toast.error(data.message || "Failed to move orders to trash.");
        }
      } else {
        const { data } = await Api.updateOrderStatus({
          order_ids: selected,
          status: action,
        });

        if (data.status === "success") {
          toast.success("Orders updated!");
          data.data.updated_orders.forEach((orderId) => {
            const row = document.querySelector(`#order-${orderId}`);
            if (row) {
              const cleanStatus = action.replace(/^wc-/, "");
              const statusCell = row.querySelector(".column-order_status mark");
              if (statusCell) {
                statusCell.classList.forEach((cls) => {
                  if (cls.startsWith("status-")) {
                    statusCell.classList.remove(cls);
                  }
                });

                statusCell.classList.add(`status-${cleanStatus}`);
                const span = statusCell.querySelector("span");
                if (span) {
                  const statusText = statusOptions[action] || cleanStatus;
                  span.textContent = statusText;
                }
              }
            }
          });
        } else {
          toast.error(data.message || "Failed to update orders.");
        }
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedLabel =
    action === "trash"
      ? "Move to Trash"
      : statusOptions[action]
      ? `Change to ${statusOptions[action]}`
      : "Apply Action";

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <FormControl size="small">
        <Select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          displayEmpty
          sx={{ height: "32px", fontSize: "14px", minWidth: "180px" }}
          MenuProps={{
            PaperProps: {
              sx: {
                mt: 1,
                ml: 8,
              },
            },
          }}
        >
          <MenuItem value="">Bulk Actions</MenuItem>
          {Object.entries(statusOptions).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              Change status to {label}
            </MenuItem>
          ))}
          <MenuItem value="trash">Move to Trash</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        sx={{
          height: "32px",
          fontSize: "14px",
          borderRadius: "2px",
          background: "#f6f7f7",
          color: "#2271b1",
          border: "1px solid #2271b1",
          boxShadow: "none",
          "&:hover": { background: "#e1e4e6", boxShadow: "none" },
        }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Updating..." : selectedLabel}
      </Button>
    </Stack>
  );
};

export default BulkAction;
