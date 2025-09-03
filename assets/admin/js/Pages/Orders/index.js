import React, { useState, useEffect } from "react";
import CustomeDatePicker from "../../Components/DatePicker/CustomeDatePicker";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Button,
} from "@mui/material";
import { generalAPI } from "../../api/general";
import { downloadBase64File } from "../../utils/searchHelper";
import { parseISO, format, isValid } from "date-fns";
import { toast, ToastContainer } from "react-toastify";

const FilterOrder = ({ filterValue, filterName }) => {
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filterValue) {
      const parsedDate = parseISO(filterValue);
      if (isValid(parsedDate)) {
        setDate(parsedDate);
      }
    } else {
      setDate(null);
    }
  }, [filterValue]);

  const handleExport = async (type) => {
    if (!date) {
      toast.error("Please select a fulfilment date first.");
      return;
    }
    setLoading(true);
    try {
      const params = {
        date: format(date, "yyyy-MM-dd"),
        type: type,
      };
      const { data } = await generalAPI.fulfilmentReport(params);
      if (data.status === "success") {
        if (!data.data || data.data.length === 0) {
          toast.warning("No data found for this date.");
          setLoading(false);
          return;
        }

        const { file_base64, file_name, file_type } = data.data;
        if (!file_base64) {
          toast.warning("The file is empty. Nothing to download.");
          setLoading(false);
          return;
        }

        downloadBase64File(file_base64, file_name, file_type);
        toast.success("File downloaded successfully!");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Cannot download!");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ height: "32px" }}
      >
        <CustomeDatePicker
          startDate={date}
          placeholderText="Fulfilment Date"
          selectsRange={false}
          handleDateChange={handleDateChange}
          name={filterName}
        />
        <FormControl size="small" sx={{ minWidth: 140, height: "32px" }}>
          <Select
            displayEmpty
            value=""
            sx={{ height: "32px", fontSize: "14px" }}
            onChange={(e) => {
              handleExport(e.target.value);
              e.target.value = ""; // reset after download
            }}
            renderValue={() => "Download"}
            disabled={!date || loading}
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <ToastContainer />
    </>
  );
};

export default FilterOrder;
