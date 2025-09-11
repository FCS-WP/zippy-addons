import React, { useEffect, useState, useCallback } from "react";
import TableView from "../../Components/TableView";
import { productListOrder } from "../../utils/tableHelper";
import { generalAPI } from "../../api/general";
import TablePaginationCustom from "../../Components/TablePagination";
import { TextField, Box, Link } from "@mui/material";
import ProductFilterbyCategories from "../../Components/Products/ProductFilterByCategories";

const ProductItems = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    items: 5,
    category: "",
    userID: userSettings.uid,
    search: "",
  });

  /**
   * Fetch products with API call
   */

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await generalAPI.products(params);

      if (data?.status === "success" && Array.isArray(data.data?.data)) {
        setData(convertRows(data.data.data));
        setTotal(data.data.pagination?.total || 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleFilter = (filter) => {
    setParams((prev) => ({
      ...prev,
      ...filter,
      page: 1, // reset to first page on filter change
    }));
    setPage(0);
  };

  const convertRows = (data) =>
    data.map((item) => ({
      ID: item.id,
      SKU: item.sku,
      LINK: item.link,
      NAME: item.name,
      QUANTITY: 0, // editable input
      INVENTORY: item.stock,
      SHOW_HIDDEN: false,
    }));

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: page + 1,
      items: rowsPerPage,
    }));
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Handlers
   */
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleQuantityChange = (id, value) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.ID === id
          ? { ...row, QUANTITY: value, SHOW_HIDDEN: parseInt(value) > 0 }
          : row
      )
    );
  };

  /**
   * Table column widths
   */
  const columnWidths = {
    ID: "15%",
    NAME: "auto",
    QUANTITY: "20%",
    INVENTORY: "10%",
  };

  const rowsWithInputs = data.map((row) => ({
    ...row,
    QUANTITY: (
      <Box>
        <TextField
          type="number"
          size="small"
          value={row.QUANTITY}
          onChange={(e) => handleQuantityChange(row.ID, e.target.value)}
          inputProps={{ min: 0 }}
          sx={{ width: "80px" }}
        />
        {row.SHOW_HIDDEN && (
          <input type="hidden" name="item_id" value={row.ID} />
        )}
      </Box>
    ),
    ID: (
      <Link href={row.LINK} target="_blank" underline="hover">
        {`${row.ID} (${row.SKU})`}
      </Link>
    ),
  }));

  return (
    <Box display={"flex"} flexDirection={"column"} justifyContent={"center"}>
      <ProductFilterbyCategories onFilter={handleFilter} />

      {loading && (
        <Box display={"flex"} justifyContent={"center"}>
          <p>Loading products...</p>
        </Box>
      )}

      {!loading && data.length > 0 && (
        <>
          <TableView
            hideCheckbox={true}
            cols={productListOrder}
            columnWidths={columnWidths}
            rows={rowsWithInputs}
            className="widefat"
          />

          <TablePaginationCustom
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {!loading && data.length === 0 && (
        <p style={{ textAlign: "center" }}>No products found.</p>
      )}
    </Box>
  );
};

export default ProductItems;
