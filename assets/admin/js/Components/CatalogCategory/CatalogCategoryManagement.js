import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  Divider,
  Container,
  Stack,
  IconButton,
} from "@mui/material";
import { generalAPI } from "../../api/general";
import Grid2 from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";

const CatalogCategoryManagement = () => {
  const [roleCategories, setRoleCategories] = useState({});
  const [newRole, setNewRole] = useState("");
  const [newCategories, setNewCategories] = useState([]);
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);

  // fetch roles
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

  // fetch categories
  const fetchCategory = async () => {
    try {
      const { data } = await generalAPI.categories();
      setCategories(data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchCategory();
    fetchCatalogCategory();
  }, []);

  const fetchCatalogCategory = async () => {
    try {
      const { data } = await generalAPI.getCatalogCategory();

      if (data?.status === "success") {
        setRoleCategories(data.data || {});
      } else {
        setRoleCategories({});
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(roleCategories);
  }, [roleCategories]);

  // Add role + selected categories & send to backend
  const handleAddRoleCategory = async () => {
    if (!newRole || !newCategories.length) return;

    // Prepare updated mapping
    const updatedMapping = {
      ...roleCategories,
      [newRole]: newCategories,
    };

    try {
      await generalAPI.updateCatalogCategory({
        role_categories: updatedMapping,
      });
      setRoleCategories(updatedMapping);
      setNewRole("");
      setNewCategories([]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteRoleCategory = async (role) => {
    confirm("Are you sure you want to delete this role-category mapping?");

    try {
      await generalAPI.deleteCatalogCategory({ role });
      const updated = { ...roleCategories };
      delete updated[role];
      setRoleCategories(updated);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ py: 3, px: 3, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#2c3e50",
            mb: 0.5,
          }}
        >
          Catalog Category Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage role-based category access control
        </Typography>
      </Box>

      {/* Configuration Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            bgcolor: "#fff",
            px: 3,
            py: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
            }}
          >
            1. Configuration
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid2 container spacing={2}>
            {/* Role Select */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "0.875rem" }}>
                  Applied User Role
                </InputLabel>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  label="Applied User Role"
                  sx={{
                    bgcolor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d0d0d0",
                    },
                  }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  {rules.map((role) => (
                    <MenuItem key={role.slug} value={role.slug}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            {/* Categories Multi-Select */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "0.875rem" }}>
                  Categories
                </InputLabel>
                <Select
                  multiple
                  value={newCategories}
                  onChange={(e) =>
                    setNewCategories(
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value,
                    )
                  }
                  renderValue={(selected) =>
                    selected
                      .map((slug) => {
                        const catObj = categories.find((c) => c.slug === slug);
                        return catObj
                          ? catObj.name
                          : slug === "uncategorized"
                            ? "Uncategorized"
                            : slug;
                      })
                      .join(", ")
                  }
                  sx={{
                    bgcolor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#d0d0d0",
                    },
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="uncategorized">Uncategorized</MenuItem>
                </Select>
              </FormControl>
            </Grid2>

            {/* Preview selected categories */}
            {newCategories.length > 0 && (
              <Grid2 size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#f9f9f9",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Selected Categories ({newCategories.length})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {newCategories.map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        onDelete={() =>
                          setNewCategories(
                            newCategories.filter((c) => c !== cat),
                          )
                        }
                        size="small"
                        sx={{
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          "& .MuiChip-deleteIcon": {
                            color: "#1976d2",
                            fontSize: "1rem",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Grid2>
            )}

            {/* Add Button */}
            <Grid2 size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={handleAddRoleCategory}
                disabled={!newRole || !newCategories.length}
                size="medium"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                Add Role-Category Mapping
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>

      {/* Role-Category Mappings Table */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#fff",
            px: 3,
            py: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
            }}
          >
            Role-Category Mappings
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {Object.entries(roleCategories).length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                No role-category mappings configured yet
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              {/* Table Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 80px",
                  bgcolor: "#b8c5d9",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Box sx={{ p: 1.5, textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#2c3e50" }}
                  >
                    NO
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#2c3e50" }}
                  >
                    ROLE & CATEGORIES
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "#2c3e50" }}
                  >
                    ACTIONS
                  </Typography>
                </Box>
              </Box>

              {/* Table Body */}
              {Object.entries(roleCategories).map(([role, cats], index) => (
                <Box
                  key={role}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 80px",
                    borderBottom:
                      index < Object.entries(roleCategories).length - 1
                        ? "1px solid #e0e0e0"
                        : "none",
                    bgcolor: "#fff",
                    "&:hover": {
                      bgcolor: "#f5f5f5",
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2">{index + 1}</Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        textTransform: "capitalize",
                        color: "#2c3e50",
                      }}
                    >
                      {role}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {cats.map((cat) => {
                        const catObj = categories.find((c) => c.slug === cat);
                        return (
                          <Chip
                            key={cat}
                            label={catObj ? catObj.name : cat}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "0.75rem",
                              height: "22px",
                              borderColor: "#d0d0d0",
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRoleCategory(role)}
                      sx={{
                        color: "#d32f2f",
                        "&:hover": {
                          bgcolor: "#ffebee",
                        },
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: "1.2rem" }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CatalogCategoryManagement;
