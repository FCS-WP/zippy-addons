import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import theme from "../../../theme/theme";

const ShippingConfigTable = ({
  rows,
  setRows,
  disabled,
  type,
  onAddNewRow,
  onInputChange,
  onBlur,
  onDeleteRow,
}) => {
  const isExtraFee = type === "extra_fee";
  const isDeliveryOrFreeship =
    type === "delivery_charge"
      ? "delivery_charge"
      : "minimum_order_to_delivery";

  return (
    <Paper style={{ padding: 20 }}>
      <div style={{ marginBottom: 10, fontSize: "14px" }}>
        <Typography style={{ fontSize: "14px", fontWeight: "bold" }}>
          Notes:{" "}
        </Typography>
        {isExtraFee
          ? "Set additional fees based on specific criteria, such as postal codes or distance ranges."
          : "Define the minimum order amount required for delivery or free shipping. Each row represents a range of order values and the corresponding fee."}
      </div>

      <div style={{ marginBottom: 10, fontSize: "14px" }}>
        <Typography style={{ fontSize: "14px", fontWeight: "bold" }}>
          Example:{" "}
        </Typography>
        {isExtraFee
          ? "Type: postal_code , From: 12345 , To: 67890 , Fee: 15($)"
          : "From(meter): 100 , To(meter) : 500 , Fee: 15($)"}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <Button variant="contained" onClick={onAddNewRow} disabled={disabled}>
          Add New
        </Button>
      </div>

      <TableContainer
        sx={{
          border: "1px  solid",
          borderBottom: "none",
          borderColor: theme.palette.info.main,
          boxSizing: "border-box",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.info.main }}>
            <TableRow>
              {isExtraFee ? (
                <>
                  <TableCell>
                    <Typography fontWeight="bold" fontSize="14px">
                      Type{" "}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <Typography fontWeight="bold" fontSize="14px">
                      From{" "}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <Typography fontWeight="bold" fontSize="14px">
                      To
                    </Typography>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>
                    {" "}
                    <Typography fontWeight="bold" fontSize="14px">
                      From (meter)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <Typography fontWeight="bold" fontSize="14px">
                      To (meter)
                    </Typography>
                  </TableCell>
                </>
              )}
              <TableCell>
                {" "}
                <Typography fontWeight="bold" fontSize="14px">
                  {isExtraFee
                    ? "Extra Charges ($)"
                    : isDeliveryOrFreeship === "delivery_charge"
                    ? "Delivery Charges ($)"
                    : "Min Purchase ($)"}
                </Typography>
              </TableCell>
              <TableCell>
                {" "}
                <Typography fontWeight="bold" fontSize="14px">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {isExtraFee ? (
                  <>
                    <TableCell>
                      <TextField
                        value={row.type || ""}
                        onChange={(e) =>
                          onInputChange(index, "type", e.target.value)
                        }
                        disabled={disabled}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={row.from || ""}
                        onChange={(e) =>
                          onInputChange(index, "from", e.target.value)
                        }
                        onBlur={() => onBlur(index, "from")}
                        disabled={disabled}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={row.to || ""}
                        onChange={(e) =>
                          onInputChange(index, "to", e.target.value)
                        }
                        onBlur={() => onBlur(index, "to")}
                        disabled={disabled}
                        fullWidth
                      />
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <TextField
                        type="number"
                        value={row.greater_than || ""}
                        onChange={(e) =>
                          onInputChange(index, "greater_than", e.target.value)
                        }
                        onBlur={() => onBlur(index, "greater_than")}
                        disabled={disabled}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={row.lower_than || ""}
                        onChange={(e) =>
                          onInputChange(index, "lower_than", e.target.value)
                        }
                        onBlur={() => onBlur(index, "lower_than")}
                        disabled={disabled}
                      />
                    </TableCell>
                  </>
                )}
                <TableCell>
                  <TextField
                    type="number"
                    value={row.fee || ""}
                    onChange={(e) =>
                      onInputChange(index, "fee", e.target.value)
                    }
                    disabled={disabled}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => onDeleteRow(index)}
                    disabled={disabled}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ShippingConfigTable;
