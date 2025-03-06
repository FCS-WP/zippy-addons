import { Box, Grid2, InputAdornment, TextField } from "@mui/material";
import { BsSearch } from "react-icons/bs";
import FilterContainer from "../../../web/js/components/history/FilterContainer";
import React, { useEffect, useState } from "react";

const BookingFilter = ({
  onChangeSearchQuery,
  onChangeFilterDate,
  onChangeFilterStatus,
}) => {

  const [searchQuery, setSearchQuery] = useState();
  const onChangeDates = (dates) => {
    onChangeFilterDate(dates);
  };
  const onChangeStatus = (status) => {
    onChangeFilterStatus(status);
  };
  const onChangeQuery = (query) => {
    onChangeSearchQuery(query);
  };

  return (
    <Box className="custom-input-filter" my={2}>
      <Grid2 container spacing={4}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box maxWidth={{ lg: '600px', sm: '100%'}}>
            <TextField
              fullWidth
              label="Search bookings"
              variant="outlined"
              placeholder="Search by email, product name ..."
              value={searchQuery}
              onChange={(e) => onChangeQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BsSearch />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FilterContainer
            handleFilterDate={onChangeDates}
            handleFilterStatus={onChangeStatus}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default BookingFilter;
