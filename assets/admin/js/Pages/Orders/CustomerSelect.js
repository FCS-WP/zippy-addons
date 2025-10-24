import React, { useState, useEffect, useMemo, act } from "react";
import {
  TextField,
  Autocomplete,
  Box,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { Api } from "../../api";

export default function CustomerSelect({ orderId }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await Api.getCustomers();
      if (data.status === "success") {
        const formatted = data.data.map((c) => ({
          ...c,
          label: `${c.label} (#${c.id} – ${c.email})`,
        }));
        setCustomers(formatted);

        const allRoles = Array.from(
          new Set(
            data.data.flatMap((c) => {
              if (!c.roles) return [];
              if (Array.isArray(c.roles)) return c.roles;
              if (typeof c.roles === "object") return Object.values(c.roles);
              return [String(c.roles)];
            })
          )
        );
        setRoles(allRoles);

        const originalSelect = document.getElementById("customer_user");
        if (originalSelect && originalSelect.value) {
          const match = formatted.find(
            (c) => String(c.id) === originalSelect.value
          );
          if (match) setSelectedCustomer(match);
        }
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!selectedRole) return customers;
    return customers.filter((c) => {
      if (!c.roles) return false;
      if (Array.isArray(c.roles)) return c.roles.includes(selectedRole);
      if (typeof c.roles === "object")
        return Object.values(c.roles).includes(selectedRole);
      return String(c.roles) === selectedRole;
    });
  }, [customers, selectedRole]);

  const handleChange = async (event, value) => {
    if (!value) {
      setSelectedCustomer(null);
      return;
    }

    if (selectedCustomer && value.id !== selectedCustomer.id) {
      const confirmed = window.confirm(
        "Changing the customer may update product prices based on their pricing rules. Do you want to continue?"
      );
      if (!confirmed) return;
    }

    setSelectedCustomer(value);

    const originalSelect = document.getElementById("customer_user");
    if (originalSelect) {
      if (
        value &&
        !Array.from(originalSelect.options).some(
          (o) => o.value === String(value.id)
        )
      ) {
        const opt = new Option(value.label, value.id, true, true);
        originalSelect.add(opt);
      }

      jQuery(originalSelect)
        .val(value?.id || "")
        .trigger("change")
        .trigger({
          type: "select2:select",
          params: { data: { id: value?.id, text: value?.label } },
        });
    }

    const inputEl = document.getElementById("my_customer_select");
    if (inputEl) {
      const customEvent = new CustomEvent("customer:changed", {
        detail: value,
        bubbles: true,
      });
      inputEl.dispatchEvent(customEvent);
    }

    if (orderId) {
      await updateUserIdAndPriceProduct(value?.id);
    }
  };

  const updateUserIdAndPriceProduct = async (userId) => {
    try {
      await Api.updatePriceProductByUser({
        order_id: orderId,
        user_id: userId || 0,
        action: "admin_edit_order",
      });

      window.location.reload();
    } catch (error) {
      console.error("Error updating price product by user:", error);
    }
  };

  return (
    <Box sx={{ mt: 3, position: "relative" }}>
      <Autocomplete
        options={filteredCustomers}
        getOptionLabel={(option) => {
          if (!option) return "";
          if (typeof option === "string") return option;
          if (option.label) return String(option.label);
          return String(option.id || "");
        }}
        value={selectedCustomer}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Customer"
            placeholder="Type to search..."
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    displayEmpty
                    size="small"
                    variant="standard"
                    IconComponent={() => null}
                    sx={{
                      minWidth: 40,
                      "& .MuiSelect-select": { paddingRight: "24px" },
                    }}
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </InputAdornment>
              ),
            }}
            inputProps={{
              ...params.inputProps,
              id: "my_customer_select",
            }}
          />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        fullWidth
        clearOnEscape
      />
    </Box>
  );
}
