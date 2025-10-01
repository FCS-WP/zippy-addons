import React, { useState, useEffect, useMemo } from "react";
import { TextField, Autocomplete, Box } from "@mui/material";
import { Api } from "../../api";

export default function CustomerSelect() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRole, setSelectedRole] = useState(""); // role filter
  const [roles, setRoles] = useState([]); // available roles

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

  const handleChange = (event, value) => {
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
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Role filter */}
      <Autocomplete
        options={roles}
        value={selectedRole}
        onChange={(e, value) => setSelectedRole(value || "")}
        renderInput={(params) => (
          <TextField {...params} label="Filter by Role" variant="outlined" />
        )}
        clearOnEscape
        sx={{ my: 2 }}
        size="small"
      />

      {/* Customer select */}
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
