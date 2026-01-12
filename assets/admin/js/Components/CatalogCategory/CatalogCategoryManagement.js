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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            mb: 1,
            letterSpacing: "-0.5px",
          }}
        >
          Catalog Category Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage role-based category access control
        </Typography>
      </Box>

      {/* Add New Mapping Card */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            px: 3,
            py: 2.5,
            borderRadius: "10px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AddIcon />
            Add New Role-Category Mapping
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Grid2 container spacing={3}>
            {/* Role Select */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>User Role</InputLabel>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  label="User Role"
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "divider",
                    },
                  }}
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
            </Grid2>

            {/* Categories Multi-Select */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={newCategories}
                  onChange={(e) =>
                    setNewCategories(
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value
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
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "divider",
                    },
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </MenuItem>
                  ))}

                  <MenuItem value="uncategorized">
                    <em>Uncategorized</em>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid2>

            {/* Preview selected categories */}
            {newCategories.length > 0 && (
              <Grid2 size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    border: "1px dashed",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block", fontWeight: 600 }}
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
                            newCategories.filter((c) => c !== cat)
                          )
                        }
                        deleteIcon={<CloseIcon />}
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          fontWeight: 500,
                          "& .MuiChip-deleteIcon": {
                            color: "white",
                            "&:hover": {
                              color: "grey.200",
                            },
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
                fullWidth
                size="large"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                Add Role-Category Mapping
              </Button>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>

      {/* Existing Role-Category Mappings */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: "grey.800",
            px: 3,
            py: 2.5,
            borderRadius: "10px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "white",
            }}
          >
            Active Role-Category Mappings
          </Typography>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {Object.entries(roleCategories).length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "text.secondary",
              }}
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                No role-category mappings yet
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Add your first mapping above to get started
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {Object.entries(roleCategories).map(([role, cats], index) => (
                <Paper
                  key={role}
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 3,
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          color: "text.primary",
                          textTransform: "capitalize",
                        }}
                      >
                        {role}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRoleCategory(role)}
                      sx={{
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "error.lighter",
                        },
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {cats.map((cat) => {
                      const catObj = categories.find((c) => c.slug === cat);
                      return (
                        <Chip
                          key={cat}
                          label={catObj ? catObj.name : cat}
                          size="medium"
                          sx={{
                            color: "primary.dark",
                            fontWeight: 500,
                            borderRadius: 1.5,
                            px: 0.5,
                            "& .MuiChip-label": {
                              px: 2,
                            },
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CatalogCategoryManagement;
