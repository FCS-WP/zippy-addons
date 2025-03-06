import React, { useCallback, useEffect, useState } from "react";
import TableView from "../TableView";
import TablePaginationCustom from "../TablePagination";

import { callDeleteMappingItems, deleteConfirm } from "../../utils/bookingHelper";
import { Container, Typography } from "@mui/material";

const ListProductsBooking = ({ mappingData, updateListMapping }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loadingState, setLoadingState] = useState({
    global: true,
    rows: {},
  });

  const fetchData = () => {
    setLoadingState((prev) => ({ ...prev, global: true }));
    const formattedData = mappingData.map((item) => {
      return {
        ID: item.items_id,
        Name: item.item_name,
        Type: item.mapping_type,
        "Regular Price": item.item_price,
        "Extra Price": item.item_extra_price ?? null,
      };
    });

    setData(formattedData);
    setLoadingState((prev) => ({ ...prev, global: false }));
  };

  const columns = [
    "ID",
    "Name",
    "Regular Price",
    "Extra Price",
    "Type",
    "Actions",
  ];

  const columnWidths = {
    ID: "auto",
    Name: "auto",
    Type: "auto",
    "Regular Price": "auto",
    "Extra Price": "auto",
    Actions: "10%",
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

  const handleDeleteMappingItems = async (rows) => {
    const confirm = await deleteConfirm();
    if (!confirm) {
      return false;
    }
    const deletedMappingIds = [];
    paginatedData.map((item, index) => {
      rows[index]
        ? deletedMappingIds.push({
            items_id: item.ID,
            type: item.Type,
          })
        : null;
    });
    const del = await callDeleteMappingItems(deletedMappingIds);
    updateListMapping();
  };

  const AddSupportMessage = () => {
    return (
      <Container sx={{ textAlign: 'center', pb: 3 }}>
        <Typography fontWeight={'bold'}>No data. Please add new catgeory or product</Typography>
      </Container>
    )
  }

  useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [page, rowsPerPage, mappingData]);

  return (
    <div>
      {data.length !== 0 && (
        <>
          <TableView
            cols={columns}
            columnWidths={columnWidths}
            rows={paginatedData.map((row) => ({
              ...row,

            }))}
            canBeDeleted={true}
            onDeleteRows={handleDeleteMappingItems}
            onChangeList={updateListMapping}
          />
          <TablePaginationCustom
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      ) }
      
    </div>
  );
};

export default ListProductsBooking;
