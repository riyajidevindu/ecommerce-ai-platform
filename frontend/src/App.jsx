import React from 'react';
import { Container, Typography, AppBar, Toolbar } from '@mui/material';

function App() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            E-commerce AI Assistant
          </Typography>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: '2rem' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Future of E-commerce
        </Typography>
        <Typography variant="body1">
          This is the main application interface. Components and pages will be rendered here.
        </Typography>
      </Container>
    </div>
  );
}

export default App;
