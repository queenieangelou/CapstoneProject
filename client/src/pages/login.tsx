import { useLogin } from '@pankod/refine-core';
import { Box, Container } from '@pankod/refine-mui';
import axios from 'axios'; // Import axios for API requests
import { CredentialResponse } from 'interfaces/google';
import { useEffect, useRef } from 'react';
import { yariga } from '../assets';

const GoogleButton: React.FC<{ onLogin: (res: CredentialResponse) => void }> = ({ onLogin }) => {
  const divRef = useRef<HTMLDivElement>(null);

  // In the useEffect:
  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !divRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        ux_mode: 'popup',
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: async (res: CredentialResponse) => {
          if (res.credential) {
            // Decode JWT to get user info
            const profileObj = JSON.parse(atob(res.credential.split('.')[1]));

            // Modify axios request to point to the correct backend URL
            const userResponse = await axios.get(`http://localhost:8080/api/v1/users?email=${profileObj.email}`);

            if (userResponse.data.isAllowed) {
              // User is allowed to log in
              onLogin(res);
            } else {
              alert('You are not allowed to log in.');
            }
          }
        },
      });
      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'filled_blue',
        size: 'medium',
        type: 'standard',
      });
    } catch (error) {
      console.log(error);
    }
  }, [onLogin]);

  return <div ref={divRef} />;
};

export const Login: React.FC = () => {
  const { mutate: login } = useLogin();

  return (
    <Box component="div" sx={{ backgroundColor: '#FCFCFC' }}>
      <Container component="main" maxWidth="xs" sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100vh',
      }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        >
          <img src={yariga} alt="Yariga Logo" />
          <Box mt={4}>
            <GoogleButton onLogin={login} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
