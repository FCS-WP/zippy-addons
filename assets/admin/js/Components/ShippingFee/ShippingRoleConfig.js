import React, { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Card,
  Box,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { generalAPI } from "../../api/general";
import { shippingRoleConfigAPI } from "../../api/shipping-role-config";
import ShippingRoleConfigConst from "../../const/shipping-role-config/shipping-role-config-const";

const ShippingRoleConfig = ({
  currentTab,
  setUpdateRoleConfig,
  selectedStore,
}) => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    role_user: "",
    delivery: { visible: true, min_order: 0 },
    take_away: { visible: true, min_order: 0 },
  });
  const [rules, setRules] = useState([]);
  const fetchUserRole = async () => {
    try {
      const { data } = await generalAPI.getAvailableRoles();
      if (data?.status === "success" && Array.isArray(data?.data)) {
        setRules(data.data);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUserRole();
    getShippingRoleConfigs();
  }, []);

  const handleAddRole = async () => {
    if (!newRole.role_user) return;

    const payload = {
      outlet_id: selectedStore,
      configs: {
        [newRole.role_user]: {
          delivery: newRole.delivery,
          take_away: newRole.take_away,
        },
      },
    };

    try {
      await shippingRoleConfigAPI.createShippingRoleConfig(payload);

      await getShippingRoleConfigs();

      // reset form
      setNewRole({
        role_user: "",
        delivery: { visible: true, min_order: 0 },
        take_away: { visible: true, min_order: 0 },
      });

      setOpen(false);
    } catch (error) {
      console.error("Add role config failed", error);
    }
  };

  const getShippingRoleConfigs = async () => {
    try {
      const { data } = await shippingRoleConfigAPI.getShippingRoleConfigs({
        outlet_id: selectedStore,
      });

      if (data?.status === "success" && data?.data) {
        const rolesArray = Object.entries(data.data).map(
          ([role_user, services]) => ({
            role_user,
            delivery: services.delivery ?? { visible: false, min_order: 0 },
            take_away: services.take_away ?? { visible: false, min_order: 0 },
          })
        );

        setRoles(rolesArray);
      } else {
        setRoles([]);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const transformApiDataToRoles = (apiData) => {
    if (!apiData || typeof apiData !== "object") return [];

    return Object.entries(apiData).map(([roleUser, services]) => {
      const role = { role_user: roleUser };

      Object.entries(ShippingRoleConfigConst.SERVICE_KEYS).forEach(
        ([serviceType, serviceKey]) => {
          role[serviceKey] = services[serviceType] ?? {
            visible: false,
            min_order: 0,
          };
        }
      );

      return role;
    });
  };

  const updateRole = (roleIndex, serviceKey, field, value) => {
    setRoles((prev) =>
      prev.map((role, index) => {
        if (index !== roleIndex) return role;

        return {
          ...role,
          [serviceKey]: {
            ...role[serviceKey],
            [field]: value,
          },
        };
      })
    );

    const roleUser = roles[roleIndex].role_user;

    setUpdateRoleConfig((prev) => ({
      ...prev,
      [roleUser]: {
        ...(prev[roleUser] || {}),
        [serviceKey]: {
          ...(prev[roleUser]?.[serviceKey] || {}),
          [field]: value,
        },
      },
    }));
  };

  useEffect(() => {
    console.log("ROLES UPDATED:", roles);
  }, [roles]);

  return (
    <div>
      <Box mb={2}>
        <Button variant="contained" size="small" onClick={() => setOpen(true)}>
          + Add Role Config
        </Button>
      </Box>

      <Grid2 container spacing={2}>
        {!loading &&
          roles.map((role, roleIndex) => (
            <Grid2 xs={12} md={6} key={role.role_user}>
              <Card sx={{ p: 2 }}>
                <Typography fontWeight="bold" mb={2}>
                  {role.role_user.toUpperCase()}
                </Typography>

                <Box mt={3}>
                  <Grid2 container alignItems="center" spacing={2}>
                    <Grid2 xs="auto">
                      <Switch
                        checked={role.delivery.visible}
                        onChange={(e) =>
                          updateRole(
                            roleIndex,
                            "delivery",
                            "visible",
                            e.target.checked
                          )
                        }
                      />
                    </Grid2>

                    <Grid2 sx={{ width: 120 }}>
                      <Typography fontSize={14} fontWeight={600}>
                        Delivery
                      </Typography>
                    </Grid2>

                    <Grid2 xs>
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        label="Minimum Order ($)"
                        value={role.delivery.min_order}
                        disabled={!role.delivery.visible}
                        onChange={(e) =>
                          updateRole(
                            roleIndex,
                            "delivery",
                            "min_order",
                            Number(e.target.value)
                          )
                        }
                      />
                    </Grid2>
                  </Grid2>
                </Box>

                {/* TAKE AWAY */}
                <Box mt={2}>
                  <Grid2 container alignItems="center" spacing={2}>
                    <Grid2 xs="auto">
                      <Switch
                        checked={role.take_away.visible}
                        onChange={(e) =>
                          updateRole(
                            roleIndex,
                            "take_away",
                            "visible",
                            e.target.checked
                          )
                        }
                      />
                    </Grid2>

                    <Grid2 sx={{ width: 120 }}>
                      <Typography fontSize={14} fontWeight={600}>
                        Take Away
                      </Typography>
                    </Grid2>

                    <Grid2 xs>
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        label="Minimum Order ($)"
                        value={role.take_away.min_order}
                        disabled={!role.take_away.visible}
                        onChange={(e) =>
                          updateRole(
                            roleIndex,
                            "take_away",
                            "min_order",
                            Number(e.target.value)
                          )
                        }
                      />
                    </Grid2>
                  </Grid2>
                </Box>
              </Card>
            </Grid2>
          ))}
      </Grid2>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Role Configuration</DialogTitle>

        <DialogContent
          sx={{
            "&&": {
              pt: 2,
            },
          }}
        >
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Role */}
            <FormControl fullWidth required size="small">
              <InputLabel>User Role</InputLabel>
              <Select
                name="role"
                value={newRole.role_user}
                onChange={(e) =>
                  setNewRole({ ...newRole, role_user: e.target.value })
                }
                label=" User Role"
              >
                <MenuItem value="all">
                  <em>All Users</em>
                </MenuItem>
                {rules.map((role) => (
                  <MenuItem key={role.slug} value={role.slug}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* DELIVERY */}
            <Typography fontWeight={600}>Delivery</Typography>

            <Box display="flex" alignItems="center" gap={2}>
              {/* Switch */}
              <Switch
                checked={newRole.delivery.visible}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    delivery: {
                      ...newRole.delivery,
                      visible: e.target.checked,
                    },
                  })
                }
              />

              {/* Label */}
              <Typography fontSize={14} width={80}>
                Visible
              </Typography>

              {/* Input */}
              <TextField
                size="small"
                type="number"
                label="Minimum Order ($)"
                sx={{ flex: 1 }}
                disabled={!newRole.delivery.visible}
                value={newRole.delivery.min_order}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    delivery: {
                      ...newRole.delivery,
                      min_order: Number(e.target.value),
                    },
                  })
                }
              />
            </Box>

            {/* TAKE AWAY */}
            <Typography fontWeight={600}>Take Away</Typography>

            <Box display="flex" alignItems="center" gap={2}>
              <Switch
                checked={newRole.take_away.visible}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    take_away: {
                      ...newRole.take_away,
                      visible: e.target.checked,
                    },
                  })
                }
              />

              <Typography fontSize={14} width={80}>
                Visible
              </Typography>

              <TextField
                size="small"
                type="number"
                label="Minimum Order ($)"
                sx={{ flex: 1 }}
                disabled={!newRole.take_away.visible}
                value={newRole.take_away.min_order}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    take_away: {
                      ...newRole.take_away,
                      min_order: Number(e.target.value),
                    },
                  })
                }
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddRole}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShippingRoleConfig;
