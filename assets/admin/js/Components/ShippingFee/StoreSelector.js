import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  Paper,
} from "@mui/material";

const StoreSelector = ({ stores, selectedStore, onChange }) => {
  return (
    <>
      <FormControl fullWidth style={{ marginBottom: 20 }}>
        <Typography sx={{ marginBottom: 1 }}>Select Store</Typography>
        <Select
          value={selectedStore || ""}
          onChange={onChange}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Please choose
          </MenuItem>
          {stores.map((store) => (
            <MenuItem key={store.id} value={store.id}>
              {store.outlet_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!selectedStore && (
        <Paper
          style={{
            padding: 5,
            paddingLeft: 20,
            marginBottom: 20,
            backgroundColor: "#eccdcda1",
          }}
        >
          <p style={{ color: "red", fontWeight: "bold" }}>
            Please select a store to configure shipping fees.
          </p>
        </Paper>
      )}
    </>
  );
};

export default StoreSelector;
