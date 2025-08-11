import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { Api } from "../../api";
import StoreForm from "../../Components/Stores/StoreForm";
import StoreFormEdit from "../../Components/Stores/StoreFormEdit";
import theme from "../../../theme/theme";

const Store = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const lastFetchedStoreId = useRef(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await Api.getStore();
      if (response.data.status === "success") {
        const storeList = response.data.data;
        setStores(Array.isArray(storeList) ? storeList : [storeList]);
      } else {
        toast.error("Failed to fetch stores");
      }
    } catch (error) {
      // toast.error("Error fetching stores");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (store) => {
    setEditStore(store);
  };

  const handleCloseEditModal = () => {
    setEditStore(null);
    lastFetchedStoreId.current = null;
  };

  const handleDeleteClick = async (storeId) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;
    setLoading(true);
    try {
      const response = await Api.deleteStore({ outlet_id: storeId });
      if (response.data.status === "success") {
        setStores((prevStores) =>
          prevStores.filter((store) => store.id !== storeId)
        );
        toast.success("Store deleted successfully!");
      } else {
        toast.error("Failed to delete store");
      }
    } catch (error) {
      toast.error("Error deleting store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      minHeight="100vh"
      p={3}
      component={Paper}
    >
      <Box width="100%">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenAddModal(true)}
          sx={{ mb: 2 }}
        >
          Add Store
        </Button>
        <TableContainer
          sx={{
            border: "1px  solid",
            borderBottom: "none",
            borderColor: theme.palette.info.main,
            boxSizing: "border-box",
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.info.main }}>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    Phone
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    Postal Code
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    Address
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    Pre-order window period
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : stores.length > 0 ? (
                stores.map((s, index) => (
                  <TableRow key={index}>
                    <TableCell>{s.outlet_name}</TableCell>
                    <TableCell>{s.outlet_phone}</TableCell>
                    <TableCell>
                      {s.outlet_address?.postal_code || "N/A"}
                    </TableCell>
                    <TableCell>{s.outlet_address?.address || "N/A"}</TableCell>
                    <TableCell>{s.day_limited ?? "N/A"}</TableCell>

                    <TableCell>
                      <Button
                        onClick={() => handleEditClick(s)}
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(s.id)}
                        variant="contained"
                        color="error"
                        size="small"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No stores found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Store Modal */}
      <StoreForm
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onAddStore={() => {
          fetchStores();
          setOpenAddModal(false);
        }}
        loading={loading}
      />

      {/* Edit Store Modal */}
      <StoreFormEdit
        store={editStore}
        loading={loading}
        onClose={handleCloseEditModal}
        onSave={fetchStores}
      />

      <ToastContainer />
    </Box>
  );
};

export default Store;
