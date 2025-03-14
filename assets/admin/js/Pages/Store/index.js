import React, { useState, useEffect } from "react";
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
import "react-toastify/dist/ReactToastify.css";
import { Api } from "../../api";
import StoreForm from "../../Components/StoreForm";
import FormEdit from "../../Components/FormEdit";

const Store = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editStore, setEditStore] = useState(null);

  useEffect(() => {
    editStore ? fetchStoreDetails(editStore.store_id) : fetchStores();
  }, [editStore]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await Api.getStore();
      if (response.data.status === "success") {
        setStores(response.data.data.data);
      } else {
        toast.error("Failed to fetch stores");
      }
    } catch (error) {
      toast.error("Error fetching stores");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (store) => setEditStore(store);
  const handleCloseEditModal = () => setEditStore(null);

  const handleDeleteClick = async (storeId) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    setLoading(true);
    try {
      const response = await Api.deleteStore({ store_id: storeId });

      if (response.data.status === "success") {
        setStores((prevStores) =>
          prevStores.filter((store) => store.store_id !== storeId)
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
      bgcolor="#f5f5f5"
      p={3}
    >
      <Box width="100%">
        <StoreForm onAddStore={fetchStores} loading={loading} />
        <Box mt={3}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Postal Code</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Address</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : stores.length > 0 ? (
                  stores.map((s, index) => (
                    <TableRow key={index}>
                      <TableCell>{s.store_name}</TableCell>
                      <TableCell>{s.postal_code}</TableCell>
                      <TableCell>{s.address}</TableCell>
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
                          onClick={() => handleDeleteClick(s.store_id)}
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
                    <TableCell colSpan={4} align="center">
                      No stores found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <FormEdit
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
