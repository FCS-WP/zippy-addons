import {
  Box,
  Checkbox,
  Container,
  Fade,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomTableRow from "./CustomTableRow";
import TablePaginationCustom from "../TablePagination";
import { Api } from "../../api";
import { toast } from "react-toastify";
import AdminLoader from "../AdminLoader";

const SubTableHeader = (props) => {
  const { cols, onChangeMasterCheckbox, selectedRows, maxRows } = props;
  const [isMasterChecked, setIsMasterChecked] = useState(false);
  const [isMasterIndeterminate, setIsMasterIndeterminate] = useState(false);

  const handleChangeMasterCheckbox = () => {
    if (!isMasterIndeterminate) {
      setIsMasterChecked(!isMasterChecked);
    }
    onChangeMasterCheckbox(!isMasterChecked);
  };

  useEffect(() => {
    const selectedLength = selectedRows ? Object.keys(selectedRows).length : 0;
    if (selectedLength > 0) {
      const allTrue = Object.values(selectedRows).every(
        (value) => value === true
      );
      if (allTrue && selectedLength == maxRows) {
        setIsMasterChecked(true);
        setIsMasterIndeterminate(false);
      } else {
        setIsMasterChecked(false);
        setIsMasterIndeterminate(true);
      }
    }
    const allFalse = Object.values(selectedRows).every(
      (value) => value === false
    );
    if (allFalse) {
      setIsMasterIndeterminate(false);
    }
  }, [selectedRows]);

  return (
    <TableHead>
      <TableRow>
        {cols &&
          cols.map((col, index) => (
            <TableCell
              key={index}
              style={{
                width: "auto",
              }}
            >
              {col}
            </TableCell>
          ))}
      </TableRow>
    </TableHead>
  );
};

const SubTableBody = (props) => {
  const {
    rows,
    cols,
    onChangeData,
    UpdateSelectedRows,
    masterCheckedControl = {},
  } = props;
  const columnWidths = [];
  const [selectedRows, setSelectedRows] = useState(masterCheckedControl);

  const handleRowCheckboxChange = (rowIndex) => {
    setSelectedRows({
      ...masterCheckedControl,
      [rowIndex]: !masterCheckedControl[rowIndex],
    });
  };

  useEffect(() => {
    UpdateSelectedRows(selectedRows);
  }, [selectedRows]);

  return (
    <TableBody sx={{ backgroundColor: "#fff" }}>
      {rows &&
        rows.map((row, rowIndex) => (
          <CustomTableRow
            isSubtableRow={true}
            hover={true}
            key={rowIndex}
            row={row}
            cols={cols}
            columnWidths={columnWidths}
            selectedRows={masterCheckedControl}
            rowIndex={rowIndex}
            onChangeList={onChangeData}
            onChangeCheckbox={handleRowCheckboxChange}
          />
        ))}
    </TableBody>
  );
};

const SubTable = (props) => {
  const { cols, category, onChangeData } = props;
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  const UpdateSelectedRows = (rows) => {
    setSelectedRows(rows);
  };

  const closeLoading = async () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getProductsInCategory = async () => {
    setIsLoading(true);
    const params = {
      category_id: category.ID,
    };

    const { data: response } = await Api.getProductsByCategory(params);

    if (response.status !== "success") {
      toast.error("Failed to get products!");
      closeLoading();
      return false;
    }

    if (response.data.length == 0) {
      toast.error("No product found!.");
      closeLoading();
      return false;
    }

    const products = parseProducts(response.data);
    if (products.length == 0) {
      toast.error("No product found!.");
      closeLoading();
      return false;
    }
    const formattedData = products.map((item) => {
      return {
        ID: item.product_id,
        Name: item.product_name,
        Type: "product",
        "Regular Price": item.product_price,
        "Extra Price": item.extra_price,
      };
    });
    closeLoading();
    setData(formattedData);
    return true;
  };

  const parseProducts = (res) => {
    const dataCategories = res.categories[0];
    let products = [];
    if (dataCategories.subcategories) {
      dataCategories.subcategories.map((item) => {
        products = [...products, ...item.products];
      });
    }
    products = [...products, ...dataCategories.products_in_category];
    return products;
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangeMasterCheckbox = (isChecked) => {
    if (!paginatedData) {
      return false;
    }
    const newSelection = {};
    paginatedData.map((item, index) => {
      newSelection[index] = isChecked ? true : false;
    });
    setSelectedRows(newSelection);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const ProductMessage = () => {
    return (
      <Container sx={{ textAlign: "center", pb: 3 }}>
        <Typography fontWeight={"bold"}>No Product Found!</Typography>
      </Container>
    );
  };

  useEffect(() => {
    getProductsInCategory();
  }, []);

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {isLoading ? (
        <AdminLoader />
      ) : (
        <Fade in={true} unmountOnExit>
          <Paper variant="outlined" sx={{ p: 3, pb: 1 }}>
            <Stack>
              <Typography fontWeight={"600"}>
                Products in {category.Name}
              </Typography>
            </Stack>
            {data.length == 0 ? (
              <>
                <ProductMessage />
              </>
            ) : (
              <TableContainer>
                <Table>
                  <SubTableHeader
                    maxRows={paginatedData.length}
                    selectedRows={selectedRows}
                    onChangeMasterCheckbox={handleChangeMasterCheckbox}
                    cols={cols}
                  />
                  <SubTableBody
                    rows={paginatedData}
                    cols={cols}
                    onChangeData={onChangeData}
                    UpdateSelectedRows={UpdateSelectedRows}
                    masterCheckedControl={selectedRows}
                  />
                </Table>
                <TablePaginationCustom
                  count={data.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                />
              </TableContainer>
            )}
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default SubTable;
