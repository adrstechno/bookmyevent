import React from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import HomeNavbar from "../../src/components/layout/HomeNavbar";

const HomePage = () => {
  return (
    <Box>
      <HomeNavbar />

      <Container sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to EventSite 🎉
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={3}>
          Your one-stop solution for event management and vendor services.
        </Typography>

        <Button variant="contained" size="large" color="primary">
          Explore Services
        </Button>
      </Container>
    </Box>
  );
};

export default HomePage;
