import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  Grid2,
  Input,
  InputLabel,
  MenuItem,
  NativeSelect,
  Select,
  styled,
  Typography,
} from "@mui/material";
import LocationSearch from "./LocationSearch";
import OutletSelect from "./OutletSelect";

const CustomSelect = styled(Select)({
  padding: "5px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ccc", // Default border color
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ec7265", // Outline color on hover
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline, &.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#ec7265", // Outline color on focus
    },
  "&.MuiOutlinedInput-root.Mui-focused": {
    boxShadow: "none",
    borderColor: "#ccc", // Default border color
  },
});

const DeliveryForm = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const onSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  const [age, setAge] = React.useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <Box>
      <Box className="method_shipping_popup">
        <Grid2 className="method_shipping_popup_section row_title_form">
          <Grid2 className="method_shipping_popup_back">
            <Button color="gray">Back</Button>
          </Grid2>
          <Grid2 className="method_shipping_popup_title">
            <h4 variant="h2" fontSize={20} fontWeight={600}>
              Delivery Details
            </h4>
          </Grid2>
          <Grid2 className="method_shipping_popup_exit">
            <Button color="gray">Exit</Button>
          </Grid2>
        </Grid2>

        <Box className="content_form_popup">
          <Box>
            <h5>Delivery to</h5>
            <LocationSearch onSelectLocation={onSelectLocation} />
          </Box>
          <Box>
            <OutletSelect />
          </Box>
        </Box>

        <Box className="method_shipping_popup_section">
          <Button className="button_action_confirm">Confirm</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DeliveryForm;
