import { Box, Button, IconButton, Paper, TableContainer } from "@mui/material";
import React, { useEffect, useState } from "react";
import theme from "../../../../theme/theme";
import TableView from "../../TableView";
import { happyHoursColumns } from "../../../utils/tableHelper";
import DeleteIcon from "@mui/icons-material/Delete";
import TimeInput from "../inputs/TimeInput";
import { format } from "date-fns";
import { Api } from "../../../api";
import { toast } from "react-toastify";

const BoxEditHappyHours = ({ menu }) => {
  const [dataTimes, setDataTimes] = useState(menu.happy_hours ?? []);
  const [dataRows, setDataRows] = useState([]);

  const handleDeleteRow = (indexToRemove) => {
    const updatedData = dataTimes.filter(
      (item, index) => index !== indexToRemove
    );
    setDataTimes(updatedData);
  };

  const handleChangeTime = (newValue, type, index) => {
    let updatedRows = [...dataTimes];
    if (type === "start") {
      updatedRows[index].start_time = newValue
        ? format(newValue, "yyyy-MM-dd HH:mm")
        : "";
    } else {
      updatedRows[index].end_time = newValue
        ? format(newValue, "yyyy-MM-dd HH:mm")
        : "";
    }
    setDataTimes(updatedRows);
  };

  const convertData = () => {
    const rows = dataTimes.map((item, index) => {
      return {
        "START TIME": (
          <TimeInput
            onChange={(date) => handleChangeTime(date, "start", index)}
            value={item.start_time}
            minDate={menu.start_date ?? null}
            maxDate={menu.end_date ?? null}
          />
        ),
        "END TIME": (
          <TimeInput
            onChange={(date) => handleChangeTime(date, "end", index)}
            minDate={item.start_time ?? null}
            value={item.end_time}
            maxDate={menu.end_date ?? null}
          />
        ),
        ACTIONS: (
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => handleDeleteRow(index)}
          >
            <DeleteIcon
              sx={{ fontSize: "20px", color: theme.palette.danger.main }}
            />
          </IconButton>
        ),
      };
    });
    setDataRows(rows);
  };

  const AddonsBox = () => {
    return (
      <Box display={"flex"} justifyContent={"end"} m={3} gap={2}>
        <Button variant="outlined" onClick={handleAddRow}>
          Add more time
        </Button>
        <Button variant="contained" onClick={handleSaveConfigHappyHour}>
          Save Configs
        </Button>
      </Box>
    );
  };

  const handleAddRow = (e) => {
    setDataTimes((prev) => [...prev, { start_time: "", end_time: "" }]);
  };

  const handleSaveConfigHappyHour = async () => {
    const data = {
      id: parseInt(menu.id),
      name: menu.name,
      happy_hours: dataTimes,
      days_of_week: menu.days_of_week,
      start_date: menu.start_date,
      end_date: menu.end_date,
    };

    const response = await Api.updateMenu(data);
    if (!response || response.error) {
      toast.error(response?.error?.message ?? "Update failed");
      return;
    }
    window.location.reload();
  };

  useEffect(() => {
    convertData();
  }, [dataTimes]);

  return (
    <Box mb={4}>
      <h3>Happy Hours</h3>
      <TableView
        hideCheckbox={true}
        cols={happyHoursColumns}
        rows={dataRows}
        addRow={true}
        addonsBox={<AddonsBox />}
      />
    </Box>
  );
};

export default BoxEditHappyHours;
