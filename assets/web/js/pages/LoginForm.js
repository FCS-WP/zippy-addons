import React, { useState } from 'react';
import AuthDialog from '../components/auth/AuthDialog';

const LoginForm = () => {
  const [open, setOpen] = useState(true)
  return (
    <>
      <AuthDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default LoginForm;
