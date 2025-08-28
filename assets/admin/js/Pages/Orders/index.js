import React, { useState, useEffect } from "react";
import CustomeDatePicker from "../../Components/DatePicker/CustomeDatePicker";
import { Button } from "@mui/material";
import { generalAPI } from "../../api/general";
import { downloadBase64File } from "../../utils/searchHelper";
import { parseISO, format, isValid } from "date-fns";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

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

  const exportOrder = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const params = {
        date: format(date, "yyyy-MM-dd"),
        type: "csv",
      };
      const { data } = await generalAPI.fulfilmentReport(params);
      if (data.status === "success") {
        const { file_base64, file_name, file_type } = data.data;
        downloadBase64File(file_base64, file_name, file_type);
        toast.success("File already downloaded !");

        setLoading(false);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Can not download!");

      setLoading(false);
    }
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  return (
    <>
      <CustomeDatePicker
        startDate={date}
        placeholderText="Fulfilment Date"
        selectsRange={false}
        handleDateChange={handleDateChange}
        name={filterName}
      />

      <Button
        sx={{ marginLeft: "5px !important" }}
        className="button"
        disabled={!date}
        onClick={exportOrder}
      >
        {loading ? "Downloading" : "Download"}
      </Button>
      <ToastContainer />
    </>
  );
};

export default FilterOrder;
