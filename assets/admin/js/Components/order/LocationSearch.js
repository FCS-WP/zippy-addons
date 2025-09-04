import React, { useCallback, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  FormControl,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { debounce } from "../../utils/searchHelper";
import { Api } from "../../api";

const CustomOutlinedInput = styled(OutlinedInput)({
  padding: "5px",
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ec7265", // Outline color on hover
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ec7265", // Outline color on focus
  },
});

const SuggestionsContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 1000,
  backgroundColor: "#fff",
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.5s linear",
}));

const LocationSearch = ({ onSelectLocation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const handleChangeInput = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      onSelectLocation(null);
    }
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.ADDRESS);
    onSelectLocation(location);
    setLocations([]);
  };

  const handleSearchLocation = async (searchQuery) => {
    const params = { keyword: searchQuery };
    setIsLoading(true);
    const { data } = await Api.searchLocation(params);
    setIsLoading(false);
    return data.data.results;
  };

  const debounceSearchLocation = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.trim()) {
        const locationDatas = await handleSearchLocation(searchQuery);
        if (locationDatas) {
          setLocations(locationDatas);
        } else {
          toast.error("Search error");
        }
      } else {
        setLocations([]);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    if (selectedLocation?.ADDRESS !== searchQuery) {
      debounceSearchLocation(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      setSelectedLocation(null);
      onSelectLocation(null);
    };
  }, []);

  return (
    <Box position={"relative"}>
      <FormControl fullWidth>
        <CustomOutlinedInput
          value={searchQuery}
          onChange={handleChangeInput}
          size="md"
          id="input-with-icon-adornment"
          placeholder="SELECT YOUR ADDRESS"
          startAdornment={
            <InputAdornment position="start" sx={{ paddingLeft: "11px" }}>
              <LocationOnIcon sx={{ color: "#ec7265" }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end" sx={{ paddingRight: "11px" }}>
              <SearchIcon sx={{ color: "#ec7265" }} />
            </InputAdornment>
          }
        />
      </FormControl>
      {searchQuery && searchQuery !== selectedLocation?.ADDRESS && (
        <SuggestionsContainer>
          <List>
            {locations.length > 0 ? (
              locations.map((location, index) => (
                <ListItemButton
                  key={index}
                  divider={index !== locations.length - 1}
                  onClick={() => handleSelectLocation(location)}
                  fontSize={14}
                >
                  <LocationOnIcon sx={{ color: "#ccc", marginRight: "8px" }} />
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontSize={14}>
                        {location.ADDRESS}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))
            ) : (
              <>
                {searchQuery && (
                  <ListItemButton>
                    <ListItemText
                      primary={isLoading ? "Loading..." : "Address not found"}
                      sx={{ color: "text.secondary" }}
                    />
                  </ListItemButton>
                )}
              </>
            )}
          </List>
        </SuggestionsContainer>
      )}
    </Box>
  );
};

export default LocationSearch;
