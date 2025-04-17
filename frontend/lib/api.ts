import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string, role: string) => {
    const response = await api.post('/users/login', { email, password, role });
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: string) => {
    const response = await api.post('/users/register', { name, email, password, role });
    return response.data;
  },
};

interface ElectionData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  candidates: Array<{ name: string; motto: string }>;
}

interface UpdateElectionData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  candidates?: Array<{ name: string; motto: string }>;
}

interface CastVoteData {
  electionId: string
  candidateId: string
  hashedVoterId: string
}

export const electionService = {
  async getAllElections() {
    try {
      const response = await api.get('/elections');
      return response.data;
    } catch (error) {
      console.error('Error fetching elections:', error);
      throw error;
    }
  },

  async getElections() {
    try {
      const response = await api.get('/elections');
      return response.data;
    } catch (error) {
      console.error('Error fetching elections:', error);
      throw error;
    }
  },

  async getElectionById(id: string) {
    try {
      const response = await api.get(`/elections/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching election:', error);
      throw error;
    }
  },

  async createElection(data: ElectionData) {
    try {
      const response = await api.post('/elections', data);
      return response.data;
    } catch (error) {
      console.error('Error creating election:', error);
      throw error;
    }
  },

  async updateElection(id: string, data: UpdateElectionData) {
    try {
      const response = await api.put(`/elections/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating election:', error);
      throw error;
    }
  },

  async deleteElection(id: string) {
    try {
      const response = await api.delete(`/elections/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting election:', error);
      throw error;
    }
  },

  async getElectionResults(id: string) {
    try {
      const response = await api.get(`/votes/election/${id}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching election results:', error);
      throw error;
    }
  },

  async castVote(data: { electionId: string; candidateId: string }) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Please login to cast your vote')
      }

      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('Please login to cast your vote')
      }

      const user = JSON.parse(userStr)
      const voterEmail = user.email
      if (!voterEmail) {
        throw new Error('User information is incomplete')
      }

      // Hash the voter email for anonymity
      const hashedVoterId = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(voterEmail)
      ).then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''))

      const voteData: CastVoteData = {
        electionId: data.electionId,
        candidateId: data.candidateId,
        hashedVoterId
      }

      const response = await api.post('/votes', voteData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error casting vote:', error)
      throw error
    }
  },

  checkVoteStatus: async (electionId: string) => {
    try {
      const response = await fetch(`${API_URL}/elections/${electionId}/vote-status`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to check vote status');
      }
      return response.json();
    } catch (error) {
      console.error('Error checking vote status:', error);
      throw error;
    }
  },

  async startElection(id: string) {
    try {
      const response = await fetch(`${API_URL}/elections/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start election');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error starting election:', error);
      throw error;
    }
  },

  async endElection(id: string) {
    try {
      const response = await fetch(`${API_URL}/elections/${id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to end election');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error ending election:', error);
      throw error;
    }
  },
};

export default api;