import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import ShippingConfigTable from "./ShippingConfigTable";
import theme from "../../../theme/theme";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MinimumOrderConfig from "./MinimumOrderConfig";

const TabPanelWrapper = ({
  tabIndex,
  setTabIndex,
  selectedStore,
  minimumOrderToDelivery,
  setMinimumOrderToDelivery,
  minimumOrderToFreeship,
  setMinimumOrderToFreeship,
  extraFee,
  setExtraFee,
  handleInputChange,
  handleBlur,
  handleDeleteRow,
  handleAddNewRow,
  minimumOrder,
}) => {
  return (
    <>
      <Tabs
        value={tabIndex}
        onChange={(e, idx) => setTabIndex(idx)}
        TabIndicatorProps={{
          style: {
            display: "none",
          },
        }}
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "bold",
          },
          "& .Mui-selected": {
            backgroundColor: theme.palette.info.main,
            color: "white",
          },
        }}
      >
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon fontSize="small" />
              <Typography variant="body2" fontWeight="600">
               Delivery Fee
              </Typography>
            </Box>
          }
        />
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon fontSize="small" />
              <Typography variant="body2" fontWeight="600">
                Minimum Order to Freeship
              </Typography>
            </Box>
          }
        />
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon fontSize="small" />
              <Typography variant="body2" fontWeight="600">
                Delivery Extra Fee
              </Typography>
            </Box>
          }
        />
        <Tab
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon fontSize="small" />
              <Typography variant="body2" fontWeight="600">
                Minimum Order Config
              </Typography>
            </Box>
          }
        />
      </Tabs>

      {tabIndex === 0 && (
        <ShippingConfigTable
          rows={minimumOrderToDelivery}
          setRows={setMinimumOrderToDelivery}
          disabled={!selectedStore}
          type="delivery_charge"
          onAddNewRow={() =>
            handleAddNewRow(setMinimumOrderToDelivery, {
              greater_than: "",
              lower_than: "",
              fee: "",
            })
          }
          onInputChange={(i, f, v) =>
            handleInputChange(
              i,
              f,
              v,
              setMinimumOrderToDelivery,
              minimumOrderToDelivery
            )
          }
          onBlur={(i, f) =>
            handleBlur(
              i,
              f,
              minimumOrderToDelivery,
              "minimum_order_to_delivery"
            )
          }
          onDeleteRow={(i) =>
            handleDeleteRow(
              i,
              setMinimumOrderToDelivery,
              minimumOrderToDelivery
            )
          }
        />
      )}

      {tabIndex === 1 && (
        <ShippingConfigTable
          rows={minimumOrderToFreeship}
          setRows={setMinimumOrderToFreeship}
          disabled={!selectedStore}
          type="minimum_order_to_freeship"
          onAddNewRow={() =>
            handleAddNewRow(setMinimumOrderToFreeship, {
              greater_than: "",
              lower_than: "",
              fee: "",
            })
          }
          onInputChange={(i, f, v) =>
            handleInputChange(
              i,
              f,
              v,
              setMinimumOrderToFreeship,
              minimumOrderToFreeship
            )
          }
          onBlur={(i, f) =>
            handleBlur(
              i,
              f,
              minimumOrderToFreeship,
              "minimum_order_to_freeship"
            )
          }
          onDeleteRow={(i) =>
            handleDeleteRow(
              i,
              setMinimumOrderToFreeship,
              minimumOrderToFreeship
            )
          }
        />
      )}

      {tabIndex === 2 && (
        <ShippingConfigTable
          rows={extraFee}
          setRows={setExtraFee}
          disabled={!selectedStore}
          type="extra_fee"
          onAddNewRow={() =>
            handleAddNewRow(setExtraFee, {
              type: "",
              from: "",
              to: "",
              fee: "",
            })
          }
          onInputChange={(i, f, v) =>
            handleInputChange(i, f, v, setExtraFee, extraFee)
          }
          onBlur={(i, f) => handleBlur(i, f, extraFee, "extra_fee")}
          onDeleteRow={(i) => handleDeleteRow(i, setExtraFee, extraFee)}
        />
      )}
      {tabIndex === 3 && (
        <MinimumOrderConfig currentTab={tabIndex} minimumOrder={minimumOrder} />
      )}
    </>
  );
};

export default TabPanelWrapper;
