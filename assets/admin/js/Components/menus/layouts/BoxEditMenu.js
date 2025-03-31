import React, { useEffect, useState } from "react";
import { StyledPaper } from "../../mui-custom-styles";
import TableView from "../../TableView";
import { detailMenuColumn } from "../../../utils/tableHelper";
import CustomSwitch from "./CustomSwitch";
import { Button } from "@mui/material";
import { NavLink } from "react-router";
import { linkMenuAdmin } from "../../../utils/bookingHelper";
import DateTimeInput from "../inputs/DateTimeInput";
import { format } from "date-fns";
import { Api } from "../../../api";

const BoxEditMenu = ({ menu }) => {
  const [dataRows, setDataRows] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState(menu.days_of_week ? menu.days_of_week : []);
  const [startDate, setStartDate] = useState(menu.start_date);
  const [endDate, setEndDate] = useState(menu.end_date);
 
  const handleChangeMenuDate = (date, type) => {
    switch (type) {
      case "start":
        setStartDate(format(date, 'yyyy-MM-dd'));
        break;
      case "end":
        setEndDate(format(date, 'yyyy-MM-dd'));
        break;
      default:
        break;
    }
  };

  const columnWidths = {
    "Start Date": '15%',
    "End Date": '15%'
  }

  const handleChangeAvailableDate = (value, day) => {
    const valueInt = value ? 1 : 0;
    
    setDaysOfWeek((prevDays) => {
      let updatedData = Array.isArray(prevDays) ? [...prevDays] : [];
  
      const dayIndex = updatedData.findIndex((item) => item.weekday === day);
  
      if (dayIndex !== -1) {
        updatedData[dayIndex] = { ...updatedData[dayIndex], is_available: valueInt };
      } else {
        updatedData.push({ weekday: day, is_available: valueInt });
      }
  
      return updatedData;
    });
  };

  const handleDate = (val) => {
    const result =
      val === "0000-00-00" || val == "" ? "" : format(new Date(val), 'yyyy-MM-dd');
    return result;
  };
  
  const handleUpdateMenu = async () => {
    const data = {
      menu_id: parseInt(menu.id),
      days_of_week: daysOfWeek,
      start_date: handleDate(startDate),
      end_date: handleDate(endDate)
    }

    const { data: response } = await Api.updateMenu(data);
  }
 
  const convertData = () => {
    const rows = [];
    let result = {
      ID: menu.id,
      NAME: (
        <NavLink to={linkMenuAdmin + "&id=" + menu.id}>{menu.name}</NavLink>
      ),
      ACTIONS: <Button variant="contained" onClick={handleUpdateMenu}>Save</Button>,
      "Start Date": (
        <DateTimeInput
          onChange={handleChangeMenuDate}
          minDate={new Date()}
          type="start"
        />
      ),
      "End Date": (
        <DateTimeInput onChange={handleChangeMenuDate} minDate={startDate} type="end" />
      ),
    };

    const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    dayMap.forEach((dayName, index) => {
      const day = daysOfWeek.find((d) => d.weekday === index) || {
        weekday: index,
      };

      result[dayName] = (
        <CustomSwitch
          day={day}
          onChange={handleChangeAvailableDate}
        />
      );
    });
    rows.push(result);
    setDataRows(rows);
  };

  useEffect(() => {
    convertData();
  }, [startDate, endDate, daysOfWeek]);

  return (
    <>
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
