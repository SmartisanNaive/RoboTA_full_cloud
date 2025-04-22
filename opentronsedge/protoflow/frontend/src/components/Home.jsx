import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Opentrons Protoflow
        </Typography>
        <Typography variant="body1">
          This is the home page of your Protoflow application. Start exploring the features using the navigation menu.
        </Typography>
      </Paper>
    </Container>
  );
} 