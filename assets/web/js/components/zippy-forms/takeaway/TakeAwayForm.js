import { Box, Button } from '@mui/material'
import React, { useState } from 'react'
import FormHeading from '../FormHeading';
import LocationSearch from '../LocationSearch';
import OutletSelect from '../OutletSelect';
import { toast } from 'react-toastify';
import theme from '../../../../theme/customTheme';

const TakeAwayForm = ({ onChangeMode }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [takeawayData, setTakeawayData] = useState(null);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
  };

  const handletakeawayData = (data) => {
    setTakeawayData(data);
  };

  const handleConfirm = () => {
    if (!takeawayData) {
      toast.error("Please select all required field!");
      return;
    }
    const data = {
      method: 'takeaway',
      takeawayData: takeawayData,
    };
  };

  return (
    <Box>
      <Box>
        <FormHeading onBack={()=>onChangeMode('select-method')} title={"Take Away Details"} />

        <Box p={2}>
          <Box>
            <OutletSelect type='takeaway' onChangeData={handletakeawayData} selectedLocation={selectedLocation} />
          </Box>
        </Box>

        <Box p={2}>
          <Button fullWidth sx={{ paddingY: '10px', background: theme.palette.primary.main, color: "#fff", fontWeight: "600" }} onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Box>
  );s
}

export default TakeAwayForm