import type { NextPage } from 'next';
import { Container, Typography, AppBar, Toolbar, Box } from '@mui/material';

const HomePage: NextPage = () => {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            E-commerce AI Assistant
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to the Next-Gen E-commerce Experience
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default HomePage;
