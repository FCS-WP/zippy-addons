import React, { useEffect, useState, useCallback } from "react";
import TableView from "../../Components/TableView";
import { productListOrder } from "../../utils/tableHelper";
import { generalAPI } from "../../api/general";
import TablePaginationCustom from "../../Components/TablePagination";

const ProductItems = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState();
  const [loading, setLoading] = useState(false);

  /**
   * Fetch products with API call
   */

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        items: rowsPerPage,
        category_id: "",
        userID: userSettings.uid,
      };

      const { data } = await generalAPI.products(params);

      if (data?.status === "success" && Array.isArray(data.data?.data)) {
        const formattedData = convertRows(data.data.data);

        setData(formattedData);

        setTotal(data.data.pagination.total);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  const convertRows = (data) => {
    return data.map((item) => ({
      ID: item.id,
      NAME: item.name,
      QUANTITY: item.name,
      INVENTORY: item.stock,
    }));
  };
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Handlers
   */

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset page
  };

  /**
   * Table column widths
   */
  const columnWidths = {
    ID: "10%",
    Name: "auto",
    QUANTITY: "auto",
    INVENTORY: "10%",
  };

  return (
    <>
      {loading && <p>Loading products...</p>}

      {!loading && data.length > 0 && (
        <>
          <TableView
            cols={productListOrder}
            columnWidths={columnWidths}
            rows={data}
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

      {!loading && data.length === 0 && <p>No products found.</p>}
    </>
  );
};

export default ProductItems;
