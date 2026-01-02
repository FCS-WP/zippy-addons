import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { priceBooksAPI } from "../../../api/priceBooks";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95%",
  maxWidth: 550,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const BulkImportModal = ({ open, handleClose, priceBookId, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const steps = ["Select File", "Validate & Confirm", "Importing"];

  const REQUIRED_HEADERS = ["sku", "price_type", "price_value", "visibility"];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        setError("The CSV file appears to be empty.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const hasAllHeaders = REQUIRED_HEADERS.every((rh) =>
        headers.includes(rh)
      );

      if (!hasAllHeaders) {
        setError(`Header mismatch! Required: ${REQUIRED_HEADERS.join(", ")}`);
        return;
      }

      const firstRow = lines[1].split(",");
      if (firstRow.length < headers.length) {
        setError("Data format error in the first row.");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setActiveStep(1);
    };
    reader.readAsText(selectedFile);
  };

  const handleStartImport = async () => {
    setLoading(true);
    setActiveStep(2);

    const formData = new FormData();
    formData.append("csv", file);
    formData.append("pricebook_id", priceBookId);

    try {
      const { data } = await priceBooksAPI.bulkImport(formData);
      if (data.status == "success") {
        setResults(data.data.imported_count);
        setActiveStep(3); // Success Step
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error("Import failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseButoon = () => {
    setActiveStep(0);

    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper sx={style}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Bulk Product Import
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP 0: Upload */}
        {activeStep === 0 && (
          <Box textAlign="center" py={2}>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Please use our template to ensure your product IDs and pricing
              formats are correct.
            </Typography>

            <Button
              variant="outlined"
              size="small"
              sx={{ mb: 0, marginLeft: 1 }}
              href={`${window.zippyConfig.apiUrl}/price-books/download-template`}
              download
            >
              Download Sample CSV
            </Button>

            {/* ERROR DISPLAY */}
            {error && (
              <Alert
                severity="error"
                variant="filled"
                sx={{
                  width: "100%",
                  textAlign: "left",
                  borderRadius: 2,
                  mt: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Invalid File Structure
                </Typography>
                <Typography variant="caption">{error}</Typography>
              </Alert>
            )}

            <Divider sx={{ my: 2 }}>OR</Divider>
            <Button
              variant="contained"
              component="label"
              startIcon={<FileUploadIcon />}
              color={error ? "error" : "primary"}
            >
              {error ? "Try Another File" : "Choose CSV File"}
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileChange}
              />
            </Button>
            <Typography
              variant="caption"
              display="block"
              mt={2}
              color="text.secondary"
            >
              Supported format: .csv only
            </Typography>
          </Box>
        )}

        {/* STEP 1: Confirm */}
        {activeStep === 1 && (
          <Stack spacing={2}>
            <Alert severity="info">
              File <b>{file?.name}</b> is ready for processing.
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartImport}
              fullWidth
              size="large"
            >
              Start Processing Data
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() => setActiveStep(0)}
            >
              Change File
            </Button>
          </Stack>
        )}

        {/* STEP 2: Progress Indicator */}
        {activeStep === 2 && (
          <Box textAlign="center" py={4}>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              gap={1}
              mb={2}
            >
              <CloudDownloadIcon
                sx={{ fontSize: 40, color: "primary.main" }}
                className="animate-pulse"
              />
              <Typography variant="body1" fontWeight="medium">
                Importing Product Rules...
              </Typography>
            </Box>
            <LinearProgress color="primary" />
            <Typography
              variant="caption"
              color="text.secondary"
              mt={2}
              display="block"
            >
              Please do not close this window or refresh the page.
            </Typography>
          </Box>
        )}

        {/* STEP 3: Final Results */}
        {activeStep === 3 && (
          <Box textAlign="center" py={2}>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" fontWeight="bold">
              Processing Complete
            </Typography>

            <Stack spacing={2} sx={{ mt: 3, mb: 3 }}>
              <Box
                bgcolor="#f0fdf4"
                p={2}
                borderRadius={2}
                border="1px solid #bbf7d0"
              >
                <Typography
                  variant="body1"
                  color="success.dark"
                  fontWeight="bold"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />{" "}
                  {results?.imported} Products Updated
                </Typography>
              </Box>

              {results?.skipped?.length > 0 && (
                <Box
                  bgcolor="#fff1f2"
                  p={2}
                  borderRadius={2}
                  border="1px solid #fecdd3"
                  textAlign="left"
                >
                  <Typography
                    variant="body2"
                    color="error.main"
                    fontWeight="bold"
                    mb={1}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <CloseIcon sx={{ fontSize: 24, color: "red" }} />{" "}
                    {results.skipped.length} SKUs Not Found:
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ wordBreak: "break-all" }}
                  >
                    {results.skipped.join(", ")}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Button
              variant="contained"
              onClick={handleCloseButoon}
              fullWidth
              size="large"
            >
              Back To Price book
            </Button>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};

export default BulkImportModal;
