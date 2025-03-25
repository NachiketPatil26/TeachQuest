import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Duty {
  id: string;
  examName: string;
  date: string;
  time: string;
  venue: string;
  teacherName: string;
  status: 'assigned' | 'completed' | 'pending';
}

const DutiesPage: React.FC = () => {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch duties from backend
    const fetchDuties = async () => {
      try {
        // Mock data for now
        const mockDuties: Duty[] = [
          {
            id: '1',
            examName: 'Mid Semester Exam',
            date: '2024-03-15',
            time: '10:00 AM',
            venue: 'Room 101',
            teacherName: 'John Doe',
            status: 'assigned',
          },
          {
            id: '2',
            examName: 'Final Exam',
            date: '2024-04-20',
            time: '2:00 PM',
            venue: 'Hall A',
            teacherName: 'Jane Smith',
            status: 'pending',
          },
        ];
        setDuties(mockDuties);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching duties:', error);
        setLoading(false);
      }
    };

    fetchDuties();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'primary';
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredDuties = duties.filter((duty) =>
    Object.values(duty).some(
      (value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exam Duties
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search duties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ width: 300 }}
        />
        <IconButton>
          <FilterListIcon />
        </IconButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredDuties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No duties found
                </TableCell>
              </TableRow>
            ) : (
              filteredDuties.map((duty) => (
                <TableRow key={duty.id}>
                  <TableCell>{duty.examName}</TableCell>
                  <TableCell>{duty.date}</TableCell>
                  <TableCell>{duty.time}</TableCell>
                  <TableCell>{duty.venue}</TableCell>
                  <TableCell>{duty.teacherName}</TableCell>
                  <TableCell>
                    <Chip
                      label={duty.status}
                      color={getStatusColor(duty.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DutiesPage;