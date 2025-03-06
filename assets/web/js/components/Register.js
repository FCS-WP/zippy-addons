import React, { useState } from "react";
import { webApi } from "../../js/api";
import { showAlert } from "../../js/helper/showAlert";
import { Box } from "@mui/material";

const Register = ({ onSuccess, onClose, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    let emailRegisterValue = email;
    let passwordRegisterValue = password;
    let ConfirmPasswordRegisterValue = confirmPassword;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRegisterValue)) {
        showAlert(
          "warning",
          "Invalid email",
          "Please enter the correct email format."
        );
        return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordRegisterValue)) {
        showAlert(
          "warning",
          "Invalid password",
          "Password must have at least 8 characters, including letters, numbers and special characters."
        );
        return;
    }

    if (passwordRegisterValue !== ConfirmPasswordRegisterValue) {
        showAlert(
          "warning",
          "Invalid confirm password",
          "Confirm passwords do not match. Please check again."
        );
        return;
    }
    
    // Prepare register parameters
    const params = {
      email: emailRegisterValue,
      password: passwordRegisterValue,
    };

    try {
        const response = await webApi.registerAccount(params);

        if (response.data.status === "success") {
            showAlert(
                "success",
                "Register Success",
                "Continue to Sign In"
            );
            if (onSuccess) {
                onSuccess();
            }
        } else {
            showAlert(
                "warning",
                "Register Failed",
                "Please register again"
            );
        }
    } catch (error) {
        console.error("Registration error:", error);
        showAlert(
            "error",
            "Server Error",
            "Something went wrong. Please try again later."
        );
    }
};


  return (
    <Box className="register-container">
      <div className="booking_login_page">
        <form onSubmit={handleRegister}>
          <h2 className="login100-form-title">Register</h2>
          <div className="box_input">
            <input
              type="email"
              id="emailRegister"
              name="emailRegister"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              type="password"
              id="passwordRegister"
              name="passwordRegister"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <input
              type="password"
              id="ConfirmPasswordRegister"
              name="ConfirmPasswordRegister"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
            />
            <div className="button_submit_login">
              <input type="submit" value="Register Account" />
            </div>
          </div>
          <div className="register_label">
            <span className="register_label_span">Already have an account?</span>
            <a href="#" className="register_label_link" onClick={() => onSwitch("login")}>
              Sign in now
            </a>
          </div>
        </form>
      </div>
    </Box>
  );
};

export default Register;
