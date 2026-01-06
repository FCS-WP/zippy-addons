import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Stack,
  Box,
  Chip,
  Paper,
  InputBase,
  Divider,
  Alert,
  IconButton,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BoltIcon from "@mui/icons-material/Bolt";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import TableView from "../../Components/TableView";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import { NavLink } from "react-router";
import { dateToSGT } from "../../utils/dateHelper";
import { toast, ToastContainer } from "react-toastify";
import Loading from "../../Components/Loading";

import AddPriceBookModal from "./Modals/AddPriceBookModal";
import { priceBooksColumns, columnWidths } from "./data";
import { priceBooksAPI } from "../../api/priceBooks";
import { generalAPI } from "../../api/general";
import DeletePriceBookAction from "./DeletePriceBook";

const constructEditUrl = (id) => {
  const baseUrl = "?page=price_books";
  return baseUrl + "&id=" + id;
};

const getStatusChipProps = (statusLabel) => {
  switch (statusLabel) {
    case "Upcoming":
      return { label: statusLabel, color: "warning", variant: "outlined" };
    case "Ongoing":
      return { label: statusLabel, color: "success", variant: "filled" };
    case "Expired":
      return { label: statusLabel, color: "error", variant: "outlined" };
    default:
      return { label: statusLabel, color: "error", variant: "filled" };
  }
};
const getExclusiveChipProps = (exclusive) => {
  switch (exclusive) {
    case "0":
      return { label: "No", color: "success", variant: "outlined" };
    case "1":
      return { label: "Yes", color: "error", variant: "filled" };
    default:
      return { label: "No", color: "success", variant: "filled" };
  }
};

const PriceBooks = () => {
  const [priceBooks, setPriceBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [rules, setRules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [liveBooks, setLiveBooks] = useState([]);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  const filteredPriceBooks = priceBooks.filter(
    (pb) =>
      pb.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pb.ROLE.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConvertData = (rows, currentRules) => {
    return rows.map((value) => ({
      ID: value.id,
      NAME: value.name,
      ROLE: getRoleDisplayName(value.role_id, currentRules),
      "START DATE": value.start_date
        ? dateToSGT(value.start_date, "MMM dd, yyyy")
        : "N/A",
      "END DATE": value.end_date
        ? dateToSGT(value.end_date, "MMM dd, yyyy")
        : "N/A",
      STATUS: <Chip size="small" {...getStatusChipProps(value.status_label)} />,
      EXCLUSIVE: (
        <Chip size="small" {...getExclusiveChipProps(value.is_exclusive)} />
      ),
      "": (
        <>
          <NavLink to={constructEditUrl(value.id)}>
            <Button startIcon={<ModeEditOutlineIcon />} size="small">
              Edit
            </Button>
          </NavLink>
          <DeletePriceBookAction
            priceBook={value}
            onDeleteSuccess={handleDeletePriceBook}
          />
        </>
      ),
    }));
  };

  const handleDeletePriceBook = async () => await initData();
  const getRoleDisplayName = (slug, currentRules) => {
    const roleList = currentRules.length > 0 ? currentRules : rules;
    if (slug == "all") return "All";
    const role = roleList.find((r) => r.slug === slug);
    return role ? role.name : slug;
  };

  const fetchUserRole = useCallback(async () => {
    try {
      const { data } = await generalAPI.getAvailableRoles();
      if (data?.status === "success" && Array.isArray(data?.data)) {
        return data.data;
      } else {
        setRules([]);
        setHasError(true);
      }
    } catch (error) {}
  }, []);

  //fetch data
  const fetchPriceBooksData = useCallback(async () => {
    try {
      const response = await priceBooksAPI.getPriceBooks();
      return response.data?.data || [];
    } catch (error) {
      throw error;
    }
  }, []);

  const initData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const fetchedRules = await fetchUserRole();
      setRules(fetchedRules);

      const rawPriceBooks = await fetchPriceBooksData();

      const formatted = handleConvertData(rawPriceBooks, fetchedRules);
      setPriceBooks(formatted);
      fetchLive();
    } catch (error) {
      setHasError(true);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserRole, fetchPriceBooksData, fetchLive]);

  const handleSavePriceBook = async (params) => {
    setIsCreating(true);
    try {
      const response = await priceBooksAPI.createPriceBook(params);
      const { id, message } = response.data?.data || {};

      if (id) {
        toast.success(message || "Price Book created successfully.");
        await initData();
        handleClose();
      } else {
        toast.error(
          response.error?.message ||
            "Creation successful, but missing Price Book ID."
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Cannot create Price Book due to a server error.";
      toast.error(errorMessage);
      console.error("Price Book Creation Failed:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const fetchLive = useCallback(async () => {
    setIsLiveLoading(true);
    try {
      const response = await priceBooksAPI.getTodaysActive();
      setLiveBooks(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch live books");
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  const renderContent = () => {
    if (isLoading) return <Loading message={"Loading Price Books..."} />;

    if (hasError)
      return (
        <Alert severity="error" sx={{ mt: 5 }}>
          An error occurred while fetching data. Please refresh the page.
        </Alert>
      );

    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Table Toolbar */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#fafafa",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#fff",
              border: "1px solid #ddd",
              borderRadius: 1,
              px: 2,
              width: 300,
            }}
          >
            <SearchIcon fontSize="small" color="action" />
            <InputBase
              placeholder="Search name or role..."
              sx={{ ml: 1, flex: 1, fontSize: "0.875rem" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Showing {filteredPriceBooks.length} items
          </Typography>
        </Box>

        <Divider />

        <TableView
          hideCheckbox={true}
          cols={priceBooksColumns}
          columnWidths={columnWidths}
          rows={filteredPriceBooks}
          className="table-priceBook"
        />
      </Paper>
    );
  };

  const renderLiveSection = () => {
    if (isLiveLoading)
      return <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />;
    if (liveBooks.length === 0) return null;

    return (
      <Box sx={{ mb: 6 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <BoltIcon sx={{ color: "#ff9800" }} />
          <Typography variant="h6" fontWeight="700">
            Live Today
          </Typography>
          <Chip
            label="Affecting Current Store Prices"
            size="small"
            color="warning"
            variant="outlined"
          />
        </Stack>
        <Grid container spacing={2}>
          {liveBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <Card
                variant="outlined"
                sx={{ borderColor: "warning.light", bgcolor: "#fffbf2" }}
              >
                <CardContent sx={{ p: "0px !important" }}>
                  <Typography variant="subtitle2" fontWeight="800" noWrap>
                    {book.name}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip
                      label={
                        book.role_id === "all"
                          ? "Everyone"
                          : getRoleDisplayName(book.role_id, rules)
                      }
                      size="small"
                      sx={{ fontSize: "10px" }}
                    />
                    {book.is_exclusive == 1 && (
                      <Chip
                        label="Exclusive"
                        size="small"
                        color="secondary"
                        sx={{ fontSize: "10px" }}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* TOP HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="700" color="primary.main">
            Price Books
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage custom pricing and exclusive product visibility by user role.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          Add Price Book
        </Button>
      </Stack>

      {renderLiveSection()}

      {/* QUICK STATS CARDS */}
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography
                color="text.secondary"
                gutterBottom
                variant="overline"
                fontWeight="bold"
              >
                Total Price Books
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {priceBooks.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 2, bgcolor: "#e3f2fd", height: "100%" }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoIcon color="primary" fontSize="small" />
                <Typography
                  color="primary.main"
                  variant="overline"
                  fontWeight="bold"
                >
                  Pro Tip
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.primary">
                Specific role prices always override "All" role rules.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MAIN TABLE CONTENT */}
      {renderContent()}

      <AddPriceBookModal
        open={openModal}
        handleClose={handleClose}
        onSave={handleSavePriceBook}
        isSaving={isCreating}
        ruleData={rules}
      />
    </Container>
  );
};

export default PriceBooks;
