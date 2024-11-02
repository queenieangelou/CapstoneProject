// client/src/pages/client-portal.tsx
import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  Container,
  CircularProgress,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Header from 'components/client-portal/Header';
import Footer from 'components/client-portal/Footer';


interface SearchResult {
  clientName: string;
  vehicle: string;
  status: string;
  estimatedCompletion: string;
}

const ClientPortal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSearchResult(null);
  
      const response = await fetch(`http://localhost:8080/api/v1/clientPortal/search?searchQuery=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResult(data.data);
      } else {
        setError(data.message || 'Error searching for client');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchQuery) {
      handleSearch();
    }
  };

  return (
    <Box> 
      <Header/>
      <Box justifyContent="center" textAlign="center" mb={4} width={'100%'}>
        <Typography variant="h3" component="h1" gutterBottom>
          Vehicle Service Status Portal
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Track your vehicle's service status by entering your name
        </Typography>

        {/* Search Section */}
        <Box display="flex" justifyContent="center" gap={2} mb={4}>
          <TextField
            variant="outlined"
            placeholder="Enter your name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ width: '300px' }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={isLoading || !searchQuery}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Results Section */}
        {searchResult && (
          <Box justifyContent="center" flex={'flex-wrap'} flexDirection={'row'} display={'flex'}>
            <Paper elevation={3} sx={{ maxWidth: '1000px'}}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Vehicle Status
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" mb={3}>
                  Current service status and details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Client Name
                    </Typography>
                    <Typography color="text.secondary">
                      {searchResult.clientName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Vehicle Model
                    </Typography>
                    <Typography color="text.secondary">
                      {searchResult.vehicle}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Status
                    </Typography>
                    <Typography color="text.secondary">
                      {searchResult.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Release Date
                    </Typography>
                    <Typography color="text.secondary">
                      {searchResult.estimatedCompletion}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Paper>
            </Box>
        )}
        <Footer/>
      </Box>
    </Box>
      
  );
};

export default ClientPortal;