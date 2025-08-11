import React, { useEffect, useState } from "react";
import { Typography, Grid2, TextField, Card, Box } from "@mui/material";

import { generalAPI } from "../../api/general";

const MinimumOrderConfig = ({ currentTab, minimumOrder }) => {
  const [munimum, setMinimum] = useState(0);
  const [loading, setLoading] = useState(false);
  const handleConfigMinumOrder = () => {
    if (currentTab != 3) {
      minimumOrder({});
      return;
    }
    const props = {
      key: "minimum_order",
      value: munimum,
    };
    minimumOrder(props);
  };

  const onInputChange = (value) => {
    setMinimum(value);
  };

  const fetchMinimumOrder = async () => {
    try {
      setLoading(true);
      const params = {
        option_name: ["minimum_order"],
      };
      const { data } = await generalAPI.getZippOptions(params);
      if (data.status === "success") {
        setMinimum(data.data.data?.minimum_order);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Minimum:", error);
    }
  };

  useEffect(() => {
    fetchMinimumOrder();
  }, []);

  useEffect(() => {
    handleConfigMinumOrder();
  }, [munimum]);

  return (
    <Grid2 color={6}>
      <Card>
        <div style={{ marginBottom: 10, fontSize: "14px" }}>
          <Typography style={{ fontSize: "14px", fontWeight: "bold" }}>
            Notes:{" "}
          </Typography>
          {"Setting for Minimum order customer can purchase"}
        </div>
        {!loading && (
          <Box display="flex" alignItems="center" gap={4}>
            <Typography variant="body2" fontWeight="600">
              Minimum Order
            </Typography>
            <TextField
              name="munimumOrder"
              value={munimum}
              onChange={(e) => onInputChange(e.target.value)}
            />
          </Box>
        )}
      </Card>
    </Grid2>
  );
};

export default MinimumOrderConfig;
