import React, { useContext, useEffect, useState } from "react";
import TableView from "../TableView";
import TablePaginationCustom from "../TablePagination";
import { menuListColumns } from "../../utils/tableHelper";
import { NavLink } from "react-router";
import { linkMenuAdmin } from "../../utils/bookingHelper";
import MenuActions from "./MenuActions";
import { format } from "date-fns";
import { alertConfirmDelete } from "../../utils/alertHelper";
import { callToDeleteItems } from "../../utils/bookingHelper";
import { getDateExpired } from "../../utils/dateHelper";
import { Typography } from "@mui/material";
import theme from "../../../theme/theme";
import { useMenuProvider } from "../../providers/MenuProvider";

const MenuList = () => {
  const { menus, refetchMenus } = useMenuProvider();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const columns = menuListColumns;

  const convertData = () => {
    const formattedData = menus.map((menu) => {
      let result = {
        ID: menu.id,
        NAME: (
          <NavLink
            to={linkMenuAdmin + "&id=" + menu.id}
            style={{ fontWeight: 700 }}
          >
            {menu.name}
          </NavLink>
        ),
        STATUS: <StatusInfo menuInfo={getDateExpired(menu.start_date, menu.end_date)} />,
        ACTIONS: <MenuActions menu={menu} />,
        "Start Date":
          menu.start_date !== "0000-00-00"
            ? format(new Date(menu.start_date), "yyyy-MM-dd")
            : "Invalid date",
        "End Date":
          menu.end_date !== "0000-00-00"
            ? format(new Date(menu.end_date), "yyyy-MM-dd")
            : "Invalid date",
      };
      return result;
    });

    setData(formattedData);
  };

  const StatusInfo = ({ menuInfo }) => {
    const textColor =
      menuInfo.status === "danger"
        ? theme.palette.danger.main
        : menuInfo.status === "info"
        ? theme.palette.info.main
        : theme.palette.warning.main;
    return (
      <Typography fontSize={14} color={textColor} fontWeight={600}>
        {menuInfo.message}
      </Typography>
    );
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

  const handleDeleteMenus = async (rows) => {
    const confirm = await alertConfirmDelete();
    if (!confirm) {
      return false;
    }
    const deletedIds = [];
    paginatedData.map((item, index) => {
      rows[index] ? deletedIds.push(item.ID) : null;
    });
    const del = await callToDeleteItems(deletedIds);
    refetchMenus();
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
            onDeleteRows={handleDeleteMenus}
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
