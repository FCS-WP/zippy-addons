import React, { useContext, useEffect, useState } from "react";
import TableView from "../../TableView";
import { detailMenuColumn } from "../../../utils/tableHelper";
import CustomSwitch from "./CustomSwitch";
import { Button, TextField, Typography } from "@mui/material";
import DateTimeInput from "../inputs/DateTimeInput";
import { format } from "date-fns";
import { Api } from "../../../api";
import { toast } from "react-toastify";
import MenuContext from "../../../contexts/MenuContext";
import { handleDateData } from "../../../utils/dateHelper";

const BoxEditMenu = ({ menu }) => {
  const [dataRows, setDataRows] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState(
    menu.days_of_week ? menu.days_of_week : []
  );
  const [startDate, setStartDate] = useState(menu.start_date);
  const [endDate, setEndDate] = useState(menu.end_date);
  const [menuName, setMenuName] = useState(menu.name);

  const { disabledRanges, refetchMenus } = useContext(MenuContext);

  const handleChangeMenuDate = (date, type) => {
    switch (type) {
      case "start":
        setStartDate(format(date, "yyyy-MM-dd"));
        break;
      case "end":
        setEndDate(format(date, "yyyy-MM-dd"));
        break;
      default:
        break;
    }
  };

  const columnWidths = {
    "Start Date": "15%",
    "End Date": "15%",
  };

  const handleChangeAvailableDate = (value, day) => {
    const valueInt = value ? 1 : 0;

    setDaysOfWeek((prevDays) => {
      let updatedData = Array.isArray(prevDays) ? [...prevDays] : [];

      const dayIndex = updatedData.findIndex(
        (item) => item.weekday === day.weekday
      );

      if (dayIndex !== -1) {
        updatedData[dayIndex] = {
          ...updatedData[dayIndex],
          is_available: valueInt,
        };
      } else {
        updatedData.push({ weekday: day.weekday, is_available: valueInt });
      }

      return updatedData;
    });
  };

  const handleChangeName = (name) => {
    setMenuName(name);
  };

  const handleUpdateMenu = async () => {
    const data = {
      id: parseInt(menu.id),
      name: menuName,
      happy_hours: [],
      days_of_week: daysOfWeek,
      start_date: handleDateData(startDate),
      end_date: handleDateData(endDate),
    };

    const response = await Api.updateMenu(data);
    if (!response || response.error) {
      toast.error(response?.error?.message ?? "Update failed");
      return;
    }
    window.location.reload();
  };

  const InputChangeName = ({ val, handleChangeName }) => {
    const [name, setName] = useState(val);
    const handleChange = (e) => {
      setName(e.target.value);
      handleChangeName(e.target.value);
    };
    return <TextField value={name} onChange={handleChange} />;
  };

  const convertData = () => {
    const rows = [];
    let result = {
      ID: menu.id,
      NAME: (
        <InputChangeName val={menuName} handleChangeName={handleChangeName} />
      ),
      ACTIONS: (
        <Button variant="contained" onClick={handleUpdateMenu}>
          Save
        </Button>
      ),
      "Start Date": (
        <DateTimeInput
          onChange={handleChangeMenuDate}
          disabledRanges={disabledRanges}
          minDate={new Date()}
          value={menu.start_date}
          type="start"
        />
      ),
      "End Date": (
        <DateTimeInput
          onChange={handleChangeMenuDate}
          disabledRanges={disabledRanges}
          minDate={startDate}
          value={menu.end_date}
          type="end"
        />
      ),
    };

    const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    dayMap.forEach((dayName, index) => {
      const day = daysOfWeek.find((d) => d.weekday === index) || {
        weekday: index,
      };

      result[dayName] = (
        <CustomSwitch day={day} onChange={handleChangeAvailableDate} />
      );
    });
    rows.push(result);
    setDataRows(rows);
  };

  useEffect(() => {
    convertData();
  }, [startDate, endDate, daysOfWeek, disabledRanges]);

  return (
    <>
      <Typography variant="h6" mb={2} fontWeight={600}>
        Menu Configs
      </Typography>
      <TableView
        hideCheckbox={true}
        columnWidths={columnWidths}
        cols={detailMenuColumn}
        rows={dataRows}
      />
    </>
  );
};

export default BoxEditMenu;
