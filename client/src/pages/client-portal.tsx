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
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
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
          <Card sx={{ mb: 4 }}>
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
          </Card>
        )}

        {/* Contact Section */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" mb={3}>
              Contact our support team
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <PhoneIcon color="primary" />
                  <Typography>
                    Call us: (555) 123-4567
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <EmailIcon color="primary" />
                  <Typography>
                    Email: support@autorepair.com
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <AccessTimeIcon color="primary" />
                  <Typography>
                    Business Hours: Mon-Fri 8AM-6PM
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ClientPortal;