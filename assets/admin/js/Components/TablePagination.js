import React from "react";
import { Pagination , Box } from "@mui/material";

const TablePaginationCustom = ({ count, page, rowsPerPage, onPageChange }) => {
  return (
    <Box
    sx={{
      display: "flex",
      justifyContent: "end",
      marginTop: "15px",
      marginBottom:"15px",
    }}
    >
      <Pagination
        count={Math.ceil(count / rowsPerPage)}
        page={page + 1}
        onChange={(_, newPage) => onPageChange(_, newPage - 1)} 
      />
    </Box>
  );
};

export default TablePaginationCustom;
