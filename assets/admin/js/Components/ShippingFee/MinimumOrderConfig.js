import React, { useCallback, useEffect, useState } from "react";
import { Typography, TextField, Card, Box, Button, Grid2 } from "@mui/material";
import { generalAPI } from "../../api/general";

const MinimumOrderConfig = ({ currentTab, minimumOrder }) => {
  const [minimum, setMinimum] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMinimumOrder = useCallback(async () => {
    setLoading(true);
    try {
      const params = { option_name: ["minimum_order"] };
      const { data } = await generalAPI.getZippOptions(params);

      if (data.status === "success") {
        setMinimum(data.data.data?.minimum_order || 0);
      }
    } catch (error) {
      console.error("Error fetching Minimum:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMinimumOrder();
  }, [fetchMinimumOrder]);

  const handleConfigMinimumOrder = (value) => {
    setMinimum(value);
    if (currentTab === 3) {
      minimumOrder({ key: "minimum_order", value });
    } else {
      minimumOrder({});
    }
  };

  return (
    <Grid2 color={6}>
      <Card>
        <div style={{ marginBottom: 10, fontSize: "14px" }}>
          <Typography style={{ fontSize: "14px", fontWeight: "bold" }}>
            Notes:{" "}
          </Typography>
          {"Setting for Minimum order customer can purchase"}
        </div>
        {loading ? (
          <Button loading loadingIndicator="Loading…" variant="text">
            Loading
          </Button>
        ) : (
          <Box display="flex" flexDirection="column" gap={4}>
            <Box display="flex" alignItems="center" gap={4}>
              <Typography variant="body2" fontWeight="600" width="200px">
                Minimum Delivery Order($)
              </Typography>
              <TextField
                name="munimumOrder"
                value={minimum}
                onChange={(e) => handleConfigMinimumOrder(e.target.value)}
              />
            </Box>
          </Box>
        )}
      </Card>
    </Grid2>
  );
};

export default MinimumOrderConfig;
