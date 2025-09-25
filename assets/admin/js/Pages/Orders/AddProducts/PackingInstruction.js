import { Box, Button, FormControl, TextField } from "@mui/material";

const PackingInstruction = ({
  value,
  onChange,
  showButton,
  onAdd,
  disabled,
}) => (
  <Box mb={2} mt={1}>
    <FormControl fullWidth>
      <TextField
        name="packingInstructions"
        value={value}
        multiline
        rows={2}
        placeholder="Packing Instructions"
        variant="outlined"
        size="small"
        onChange={onChange}
        label="Packing Instructions"
      />
    </FormControl>

    {showButton && (
      <Box mt={1} textAlign="right">
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={onAdd}
          disabled={disabled}
        >
          Add to Order
        </Button>
      </Box>
    )}
  </Box>
);

export default PackingInstruction;
