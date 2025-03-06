import React, { useState } from "react";
import { webApi } from "../../js/api";
import { showAlert } from "../../js/helper/showAlert";
import { Box } from "@mui/material";

const Login = ({ onSuccess, onClose , onSwitch}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();

    let usernameValue = username;
    let passwordValue = password;

    // Prepare sign in parameters
    const params = {
      username: usernameValue,
      password: passwordValue,
    };
    
    const response = await webApi.signIn(params);

    window.admin_data.userID = response.data.data.data.ID;
    window.admin_data.user_email = response.data.data.data.email;
    
    if(response.data.status == "success"){
      showAlert(
        "success",
        "Login Success",
        "Continute booking"
      );
      if (onSuccess) {
        onSuccess(); 
      }
      
    }else{
      showAlert(
        "warning",
        "Login Fails",
        "Wrong username or password"
      );
    }
    return;
  };


  return (
    <Box className="login-container">
      <div className="booking_login_page">
        <form onSubmit={handleSubmit}>
          <h2 className="login100-form-title">Sign In</h2>
          <div className="box_input">
            <input
              type="text"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <div className="button_submit_login">
              <input type="submit" value="Sign In" />
            </div>
          </div>
          <div className="register_label">
            <span className="register_label_span">Don’t have an account?</span>
            <a href="#" className="register_label_link" onClick={() => onSwitch("register")}>
              Sign up now
            </a>
          </div>
        </form>
      </div>
    </Box>
  );
};

export default Login;
