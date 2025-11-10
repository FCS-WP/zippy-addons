import React, { useEffect, useState } from "react";
import { Box, CircularProgress, TextField } from "@mui/material";
import { Api } from "../../api";
import HiddenData from "../../Components/order/HiddenData";
import OrderProvider from "../../providers/OrderProvider";

export default function InputAdminCreatedOrder({ orderId }) {
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setAdminName(e.target.value);
  };

  const getAdminName = async () => {
    try {
      setLoading(true);
      if (!orderId) return;
      const { data } = await Api.getAdminNameFromOrder({ order_id: orderId });

      if (data.status === "success" && data.data.admin_name) {
        setAdminName(data.data.admin_name);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching admin name:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminName();
  }, [orderId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <OrderProvider>
      <Box sx={{ mt: 3 }}>
        <TextField
          name="name_admin_created_order"
          value={adminName}
          multiline
          rows={1.5}
          variant="outlined"
          onChange={onChange}
          label="Staff Name"
          sx={{
            width: "100%",
            "& .MuiInputBase-input::placeholder": {
              fontSize: "0.8rem",
            },
            "& .MuiOutlinedInput-root": {
              padding: "8px !important",
            },
          }}
          required
        />

        <input
          type="hidden"
          name="name_admin_created_order"
          value={adminName}
        />
        <HiddenData />
      </Box>
    </OrderProvider>
  );
}
