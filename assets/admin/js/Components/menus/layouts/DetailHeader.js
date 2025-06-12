import React from "react";
import { linkMenuAdmin } from "../../../utils/bookingHelper";
import { NavLink } from "react-router";
import { Grid2, Typography } from "@mui/material";

const DetailHeader = ({ menu }) => {
  return (
    <Grid2 container spacing={3}>
      <Grid2 size={6}>
        <NavLink style={{ fontSize: "13px" }} to={linkMenuAdmin}>
          Back
        </NavLink>
        <Typography fontWeight={600} variant="h5" my={2} pb={4}>
          Edit for Menu: {menu.name}
        </Typography>
      </Grid2>
    </Grid2>
  );
};

export default DetailHeader;
