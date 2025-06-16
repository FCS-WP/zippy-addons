import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { productListColumns } from "../../utils/tableHelper";
import TableView from "../TableView";
import TablePaginationCustom from "../TablePagination";
import BoxAddProducts from "./layouts/BoxAddProducts";
import ButtonDelete from "./actions/ButtonDelete";
import { alertConfirmDelete } from "../../utils/alertHelper";
import { Api } from "../../api";
import { toast } from "react-toastify";

const ProductList = ({ refetchProducts, products, menuId }) => {
  const columns = productListColumns;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);

  const convertData = () => {
    const formattedData = products.map((product) => {
      let result = {
        ID: product.id,
        NAME: product.name,
        ACTIONS: (
          <ButtonDelete
            data={product}
            type="product"
            menuId={menuId}
            onDeleted={refetchProducts}
          />
        ),
      };

      return result;
    });

    setData(formattedData);
  };

  const columnWidths = {
    ID: "10%",
    Name: "auto",
    ACTIONS: "10%",
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

  const handleDeletedRows = async (rows) => {
    const confirm = await alertConfirmDelete();
    if (!confirm) {
      return false;
    }
    const deletedIds = [];
    paginatedData.map((item, index) => {
      rows[index] ? deletedIds.push(item.ID) : null;
    });
    const params = {
      menu_id: menuId,
      product_ids: deletedIds,
    };
    const { data: del } = await Api.removeProductsFromMenu(params);
    if (!del || del.status !== "success") {
      toast.error(del.message ?? "Delete Failed!");
      return;
    }
    toast.success(del.message);
    refetchProducts();
  };

  useEffect(() => {
    convertData();
  }, [products]);

  return (
    <Box>
      <Typography variant="h6" mb={2} fontWeight={600}>
        Products
      </Typography>
      <>
        <TableView
          headerElement={
            <BoxAddProducts
              selectedMenu={menuId}
              refetchProducts={refetchProducts}
            />
          }
          cols={columns}
          columnWidths={columnWidths}
          rows={paginatedData.map((row) => ({
            ...row,
          }))}
          canBeDeleted={true}
          onDeleteRows={handleDeletedRows}
        />
        <TablePaginationCustom
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    </Box>
  );
};

export default ProductList;
