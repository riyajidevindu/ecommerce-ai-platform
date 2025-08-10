import type { NextPage } from 'next';
import { Typography, Box } from '@mui/material';

const HomePage: NextPage = () => {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the Next-Gen E-commerce Experience
      </Typography>
    </Box>
  );
};

export default HomePage;
