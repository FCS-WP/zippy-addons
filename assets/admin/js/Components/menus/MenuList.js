import React, { useContext, useEffect, useState } from "react";
import MenuContext from "../../contexts/MenuContext";
import TableView from "../TableView";
import TablePaginationCustom from "../TablePagination";
import CustomSwitch from "./CustomSwitch";
import ButtonEditMenu from "./actions/ButtonEditMenu";
import { menuListColumns } from "../../utils/tableHelper";
import { NavLink } from "react-router";
import { linkMenuAdmin } from "../../utils/bookingHelper";
import MenuActions from "./MenuActions";

const MenuList = () => {
  const { menus } = useContext(MenuContext);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);

  const handleChangeAvailableDate = (event, id, day) => {
    // console.log("Change event: ", event);
    // console.log("Change id: ", id);
    // console.log("Change day: ", day);
  };

  const columns = menuListColumns;

  const convertData = () => {
    const formattedData = menus.map((menu) => {
      let result = {
        ID: menu.id,
        NAME: <NavLink to={linkMenuAdmin + "&id=" + menu.id}>{menu.name}</NavLink>,
        ACTIONS: <MenuActions menu={menu}/>
      };

      menu.availables.map((day) => {
        const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const dayName = dayMap[day.weekday];
        result[dayName] = <CustomSwitch menu={menu} day={day} onChange={handleChangeAvailableDate} />;
      });

      return result;
    });

    setData(formattedData);
  };

  const columnWidths = {
    ID: "auto",
    Name: "20%",
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    convertData();
  }, [menus]);

  return (
    <>
      {menus?.length > 0 && (
        <>
          <TableView
            cols={columns}
            columnWidths={columnWidths}
            rows={paginatedData.map((row) => ({
              ...row,
            }))}
            canBeDeleted={true}
            onDeleteRows={() => console.log("deleted")}
            onChangeList={() => console.log("change list")}
          />
          <TablePaginationCustom
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </>
  );
};

export default MenuList;
