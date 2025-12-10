import React, { useEffect } from "react";
import { Container, Typography, Button, Stack, Box } from "@mui/material";
import ListItem from "@mui/material";
import TableView from "../../Components/TableView";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";

export const priceBooksColumns = [
  "NAME",
  "ROLE",
  "START DATE",
  "END DATE",
  "STATUS",
  "",
];

const data = [
  {
    id: 101,
    name: "Laptop",
    role: 1200.5,
    start_date: "2024",
    end_date: "2025",
  },
  {
    id: 102,
    name: "Mouse",
    role: 25.99,
    start_date: "2024",
    end_date: "2025",
  },
  {
    id: 103,
    name: "Keyboard",
    role: 75.0,
    start_date: "2024",
    end_date: "2025",
  },
];
const handleConvertData = (rows) =>
  rows.map((value) => ({
    ID: value.id,
    NAME: value.name,
    ROLE: value.name,
    "START DATE": value.name || "",
    "END DATE": value.name,
    STATUS: value.role,
  }));

const dataConverted = handleConvertData(data);

const columnWidths = {
  NAME: "auto",
  ROLE: "20%",
};

const rowsWithIcon = dataConverted.map((row) => ({
  ...row,
  "": <ModeEditOutlineIcon />,
}));

const PriceBooks = () => {
  return (
    <Container maxWidth="100" mt={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" style={{ marginBottom: 10 }}>
            Price Books
          </Typography>
          <Typography variant="body" style={{ marginBottom: 20 }}>
            Price Books will be apply for member by role.
          </Typography>
        </Box>
        <Box>
          <Button variant="contained">Add Price Book</Button>
        </Box>
      </Stack>
      {/* Filter function here  */}
      {/* Table View  */}
      <Stack mt={5}>
        <TableView
          hideCheckbox={true}
          cols={priceBooksColumns}
          columnWidths={columnWidths}
          rows={dataConverted}
          className="table-priceBook"
        />
      </Stack>
    </Container>
  );
};

export default PriceBooks;
