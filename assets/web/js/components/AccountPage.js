import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Fade,
  Slide,
} from "@mui/material";
import { styled } from "@mui/system";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  transition: "all 0.3s ease-in-out",
}));

const BannerContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  padding: theme.spacing(4),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease-in-out",
}));

const AccountPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [transition, setTransition] = useState(true);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleLayoutChange = () => {
    setTransition(false);
    setTimeout(() => {
      setIsSignUp(!isSignUp);
      setTransition(true);
    }, 300);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";

    if (isSignUp) {
      if (!formData.name) newErrors.name = "Name is required";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ height: "100vh", py: 4 }}>
      <Grid container spacing={4} sx={{ height: "80vh" }}>
        {isSignUp ? (
          <>
            <Fade in={transition} timeout={300}>
              <Grid item xs={12} md={6}>
                <Slide direction="right" in={transition} timeout={300}>
                  <BannerContainer>
                    <Typography variant="h3" gutterBottom>
                      Hello!
                    </Typography>
                    <Typography variant="h6" gutterBottom align="center" sx={{ mb: 4 }}>
                      Already have an account?
                    </Typography>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      onClick={handleLayoutChange}
                    >
                      Sign In
                    </Button>
                  </BannerContainer>
                </Slide>
              </Grid>
            </Fade>
            <Fade in={transition} timeout={300}>
              <Grid item xs={12} md={6}>
                <Slide direction="left" in={transition} timeout={300}>
                  <StyledPaper elevation={3}>
                    <Typography variant="h4" gutterBottom align="center">
                      Create Account
                    </Typography>
                    <form onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiUser />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiMail />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiLock />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleTogglePassword} edge="end">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiLock />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Sign Up
                      </Button>
                    </form>
                  </StyledPaper>
                </Slide>
              </Grid>
            </Fade>
          </>
        ) : (
          <>
            <Fade in={transition} timeout={300}>
              <Grid item xs={12} md={6}>
                <Slide direction="right" in={transition} timeout={300}>
                  <StyledPaper elevation={3}>
                    <Typography variant="h4" gutterBottom align="center">
                      Welcome Back
                    </Typography>
                    <form onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiMail />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FiLock />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleTogglePassword} edge="end">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Sign In
                      </Button>
                    </form>
                  </StyledPaper>
                </Slide>
              </Grid>
            </Fade>
            <Fade in={transition} timeout={300}>
              <Grid item xs={12} md={6}>
                <Slide direction="left" in={transition} timeout={300}>
                  <BannerContainer>
                    <Typography variant="h3" gutterBottom>
                      Hello!
                    </Typography>
                    <Typography variant="h6" gutterBottom align="center" sx={{ mb: 4 }}>
                      Don"t have an account yet?
                    </Typography>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      onClick={handleLayoutChange}
                    >
                      Sign Up
                    </Button>
                  </BannerContainer>
                </Slide>
              </Grid>
            </Fade>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default AccountPage;