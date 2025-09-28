import React, { useEffect, useState, useCallback, useMemo } from "react";
import TableView from "../../../Components/TableView";
import { productListOrder } from "../../../utils/tableHelper";
import { generalAPI } from "../../../api/general";
import TablePaginationCustom from "../../../Components/TablePagination";

import {
  TextField,
  Box,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

import ProductFilterbyCategories from "../../../Components/Products/ProductFilterByCategories";
import { toast } from "react-toastify";

const AddProductsDialog = ({ onClose, open, orderID }) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const [params, setParams] = useState({
    page: 1,
    items: 5,
    category: "",
    userID: userSettings.uid,
    search: "",
  });

  const [simpleProduct, setSimpleProduct] = useState({});
  /**
   * Fetch products with API call
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await generalAPI.products(params);

      if (data?.status === "success" && Array.isArray(data.data?.data)) {
        setData(convertRows(data.data.data));
        setPagination((prev) => ({
          ...prev,
          total: data.data.pagination?.total || 0,
        }));
      } else {
        setData([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setData([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [params]);

  const addSimpleProduct = useCallback(
    async (row) => {
      // if (Object.keys(simpleProduct).length === 0) return;
      try {
        const params = {
          order_id: orderID.orderID,
          parent_product_id: row.productID,
          quantity: row.quantity,
          packing_instructions: row.packingInstructions || "",
        };

        const { data } = await generalAPI.addProductsToOrder(params);

        if (data?.status === "success") {
          toast.success("Product added to order successfully");
        } else {
          // Handle error case
          console.error("Failed to add product to order:", data?.message);
        }
      } catch (error) {
        console.error("Error adding product to order:", error);
      } finally {
        window.location.reload();
      }
    },
    [simpleProduct, fetchProducts]
  );

  const convertRows = (rows) =>
    rows.map((item) => ({
      ID: item.id,
      productID: item.id,
      orderID: orderID,
      SKU: item.sku,
      LINK: item.link,
      IMAGE: item.img_url,
      NAME: item.name,
      INVENTORY: item.stock,
      SHOW_HIDDEN: false,
      MinAddons: item.min_addons,
      MinOrder: item.min_order,
      ADDONS: item.addons || {},
      packingInstructions: "",
      quantity: item.min_order,
    }));

  /**
   * Pagination + Params sync
   */
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: pagination.page + 1,
      items: pagination.rowsPerPage,
    }));
  }, [pagination.page, pagination.rowsPerPage]);

  useEffect(() => {
    if (open) fetchProducts();
  }, [fetchProducts, open]);

  /**
   * Handlers
   */
  const handleFilter = (filter) => {
    setParams((prev) => ({
      ...prev,
      ...filter,
      page: 1,
    }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleChangePage = (event, newPage) =>
    setPagination((prev) => ({ ...prev, page: newPage }));

  const handleChangeRowsPerPage = (event) =>
    setPagination((prev) => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    }));

  /**
   * Table rows with inputs (memoized)
   */
  const rowsWithInputs = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        ID: (
          <Link href={row.LINK} target="_blank" underline="hover">
            {`${row.ID} (${row.SKU})`}
          </Link>
        ),
        IMAGE: row.IMAGE ? (
          <img
            src={row.IMAGE}
            alt={row.NAME}
            style={{ width: "50px", height: "50px", objectFit: "cover" }}
          />
        ) : (
          "No Image"
        ),
      })),
    [data]
  );

  const handleSubTableChange = (row) => {
    // const params = {
    //   order_id: orderID.orderID,
    //   parent_product_id: row.productID,
    //   quantity: row.quantity,
    //   packing_instructions: row.packingInstructions || "",
    // };
    // setSimpleProduct(params);
  };

  const handleSubTableAddProduct = (row) => {
    addSimpleProduct(row);
    setSimpleProduct({});
  };

  /**
   * Table column widths
   */
  const columnWidths = {
    IMAGE: "10%",
    ID: "10%",
    NAME: "auto",
    QUANTITY: "20%",
    ACTION: "20%",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="add_products_model"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Add Products to Order</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <ProductFilterbyCategories onFilter={handleFilter} />

          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : data.length > 0 ? (
            <>
              <TableView
                hideCheckbox
                cols={productListOrder}
                columnWidths={columnWidths}
                rows={rowsWithInputs}
                className="table-products"
                handleSubTableAddProduct={handleSubTableAddProduct}
                handleSubTableChange={handleSubTableChange}
              />

              <TablePaginationCustom
                count={pagination.total}
                rowsPerPage={pagination.rowsPerPage}
                page={pagination.page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              py={3}
            >
              No products found.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductsDialog;
