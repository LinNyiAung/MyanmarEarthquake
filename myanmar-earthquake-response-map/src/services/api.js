import axios from 'axios';

const API_URL = 'https://myanmar-earthquake-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchMarkers = async () => {
  try {
    const response = await api.get('/markers');
    return response.data;
  } catch (error) {
    console.error('Error fetching markers:', error);
    throw error;
  }
};

export const createMarker = async (markerData) => {
  try {
    const response = await api.post('/markers', markerData);
    return response.data;
  } catch (error) {
    console.error('Error creating marker:', error);
    throw error;
  }
};

export const updateMarkerStatus = async (id, status) => {
  try {
    const response = await api.patch(`/markers/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating marker status:', error);
    throw error;
  }
};

export const deleteMarker = async (id) => {
  try {
    const response = await api.delete(`/markers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting marker:', error);
    throw error;
  }
};

export default api;