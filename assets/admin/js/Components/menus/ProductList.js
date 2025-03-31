import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { productListColumns } from "../../utils/tableHelper";
import TableView from "../TableView";
import TablePaginationCustom from "../TablePagination";
import BoxAddProducts from "./layouts/BoxAddProducts";
import ButtonDelete from "./actions/ButtonDelete";

const ProductList = ({ products, menuId }) => {
  const columns = productListColumns;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);

  const convertData = () => {
    const formattedData = products.map((product) => {
      let result = {
        ID: product.id,
        NAME: product.name,
        ACTIONS: <ButtonDelete data={product} type="product" />
      };

      return result;
    });

    setData(formattedData);
  };

  const columnWidths = {
    ID: "10%",
    Name: "auto",
    ACTIONS: "10%"
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
  }, [products]);

  return (
    <Box>
      <Typography variant="h5" mb={2} fontWeight={600}>PRODUCTS IN MENU</Typography>
      {products.length > 0 && (
        <>
          <TableView
            headerElement={<BoxAddProducts selectedMenu={menuId} />}
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
    </Box>
  );
};

export default ProductList;
