import { Box, Button, FormControl, Stack, TextField } from "@mui/material";
import { useEffect } from "react";

const PackingInstruction = ({ value, onChange }) => (
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
  </Box>
);

export default PackingInstruction;
