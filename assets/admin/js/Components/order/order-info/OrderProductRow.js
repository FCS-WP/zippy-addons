import {
  Box,
  TableCell,
  TableRow,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Api } from "../../../api";

const OrderProductRow = ({
  item_id,
  item,
  editingItemId,
  tempQuantity,
  setTempQuantity,
  setEditingItemId,
  orderId,
  refreshOrderInfo,
  handleDeleteItem,
}) => {
  const unitPriceInclTax =
    parseFloat(item.price_per_item) + parseFloat(item.tax_per_item);

  const saveQuantity = async () => {
    try {
      const { data: res } = await Api.updateOrderItemMetaData({
        order_id: orderId,
        item_id,
        quantity: tempQuantity,
      });
      if (res.status === "success") refreshOrderInfo();
      else console.error(res.message);
    } catch (err) {
      console.error(err);
    } finally {
      setEditingItemId(null);
    }
  };

  return (
    <TableRow key={item_id}>
      <TableCell>
        <img src={item.img_url} alt={item.name} width={50} />
      </TableCell>
      <TableCell>
        <Typography
          component="a"
          href={`/wp-admin/post.php?post=${item.product_id}&action=edit`}
          target="_blank"
          sx={{
            textDecoration: "none",
            color: "primary.main",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {item.name}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.65rem" }}
          >
            SKU: {item.sku || "N/A"}
          </Typography>
        </Box>
        {item.addons?.length > 0 && (
          <Box sx={{ ml: 1, mt: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ fontSize: "0.8rem" }}
            >
              Combo Products:
            </Typography>
            {item.addons.map((addon, i) => (
              <Typography
                key={i}
                component="a"
                href={`/wp-admin/post.php?post=${addon.addon_id}&action=edit`}
                target="_blank"
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: "0.75rem",
                  ml: 2,
                  display: "block",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {addon.name} × {addon.quantity}
              </Typography>
            ))}
          </Box>
        )}
        {item.parking_instructions && (
          <Box sx={{ mt: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ fontSize: "0.8rem" }}
            >
              Packing Instructions:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem", whiteSpace: "pre-wrap" }}
            >
              {item.parking_instructions}
            </Typography>
          </Box>
        )}
      </TableCell>
      <TableCell>${unitPriceInclTax.toFixed(2)}</TableCell>
      <TableCell>
        {editingItemId === item_id ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "20px",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setTempQuantity((prev) => Math.max(1, prev - 1))}
            >
              –
            </span>
            <span style={{ minWidth: "30px", textAlign: "center" }}>
              {tempQuantity}
            </span>
            <span
              style={{
                fontSize: "20px",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setTempQuantity((prev) => prev + 1)}
            >
              +
            </span>
          </div>
        ) : (
          item.quantity
        )}
      </TableCell>
      <TableCell>${(unitPriceInclTax * item.quantity).toFixed(2)}</TableCell>
      <TableCell>
        {editingItemId === item_id ? (
          <IconButton color="success" onClick={saveQuantity}>
            <SaveIcon />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            onClick={() => {
              setEditingItemId(item_id);
              setTempQuantity(item.quantity);
            }}
          >
            <EditIcon />
          </IconButton>
        )}
        <IconButton color="error" onClick={() => handleDeleteItem(item_id)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default OrderProductRow;
