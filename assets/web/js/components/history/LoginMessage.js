import { Stack } from '@mui/material'
import React from 'react'

const LoginMessage = () => {
  const loginURL = window.location.origin + '/my-account'; 
  return (
    <Stack
        direction={"row"}
        sx={{ justifyContent: "center", alignItems: "center", py: 4 }}
    >
        <div>
            <h4>Please <a href={loginURL}>Login</a> to see your bookings.</h4>
        </div>
    </Stack>
  )
}

export default LoginMessage