import React, { useState } from 'react';
import { 
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Typography,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Header from 'components/client-portal/Header';
import Footer from 'components/client-portal/Footer';

interface Part {
  partName: string;
  brandName: string;
  quantityUsed: number;
}

interface SearchResult {
  seq: number;
  date: string;
  clientName: string;
  vehicleModel: string;
  arrivalDate: string;
  parts: Part[];
  releaseStatus: boolean;
  releaseDate: string | null;
  repairStatus: string;
  repairedDate: string | null;
  trackCode: string;
}

const ClientPortal: React.FC = () => {
  const [trackCode, setTrackCode] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSearchResult(null);
  
      const response = await fetch(`http://localhost:8080/api/v1/clientPortal/search?trackCode=${encodeURIComponent(trackCode)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResult(data.data);
      } else {
        setError(data.message || 'Error searching for vehicle');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && trackCode) {
      handleSearch();
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        height: '100%',
        overflow: 'auto'
      }}
    >
      <Header />
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          p: 4,
          maxWidth: '1200px',
          width: '100%',
          mx: 'auto',
          mb: 2, // Add some margin at the bottom to prevent content from being hidden behind footer
        }}
      >
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Vehicle Service Tracker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" mb={4}>
          Enter your tracking code to check your vehicle's service status
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          mb: 4,
          maxWidth: '500px',
          mx: 'auto',
        }}>
          <TextField
            variant="outlined"
            placeholder="Enter tracking code"
            value={trackCode}
            onChange={(e) => setTrackCode(e.target.value)}
            onKeyPress={handleKeyPress}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={isLoading || !trackCode}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {isLoading ? "Searching..." : "Track"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
            {error}
          </Alert>
        )}

        {searchResult && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">Service Details</Typography>
                  <Chip
                    label={searchResult.repairStatus || 'Pending'}
                    color={searchResult.releaseStatus ? 'success' : 'warning'}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={`Track Code: ${searchResult.trackCode}`}
                    variant="outlined"
                  />
                  <Chip
                    label={`Sequence: ${searchResult.seq}`}
                    variant="outlined"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Client Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {searchResult.clientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vehicle: {searchResult.vehicleModel}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Service Timeline
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Arrival Date:</strong> {searchResult.arrivalDate}
                  </Typography>
                  {searchResult.repairedDate && (
                    <Typography variant="body2">
                      <strong>Repair Completed:</strong> {searchResult.repairedDate}
                    </Typography>
                  )}
                  {searchResult.releaseDate && (
                    <Typography variant="body2">
                      <strong>Release Date:</strong> {searchResult.releaseDate}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {searchResult.parts && searchResult.parts.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Parts Used
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {searchResult.parts.map((part, index) => (
                      <Chip
                        key={index}
                        label={`${part.partName} - ${part.brandName} (${part.quantityUsed})`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default ClientPortal;