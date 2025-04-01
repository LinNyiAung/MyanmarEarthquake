import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MarkerForm from './components/MarkerForm';
import './App.css';
import { fetchMarkers, createMarker, updateMarkerStatus, deleteMarker } from './services/api';

// Fix for Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
function MapClickHandler({ onMapClick, isAddingMarker }) {
  useMapEvents({
    click: (e) => {
      if (isAddingMarker) {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      }
    }
  });
  return null;
}

// Component to handle flying to selected marker
function MapController({ selectedMarker }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedMarker) {
      map.flyTo([selectedMarker.lat, selectedMarker.lng], 12, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedMarker, map]);
  
  return null;
}

function App() {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [center] = useState([21.9162, 95.9560]); // Myanmar center coordinates
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const mapRef = useRef(null);

  // Track window resize to handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load markers from API on initial load
  useEffect(() => {
    loadMarkers();
  }, []);

  const loadMarkers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMarkers();
      setMarkers(data);
    } catch (err) {
      setError('Failed to load markers. Please try again later.');
      console.error('Error loading markers:', err);
      
      // Fallback to localStorage if API fails
      const savedMarkers = localStorage.getItem('earthquakeMarkers');
      if (savedMarkers) {
        setMarkers(JSON.parse(savedMarkers));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Keep localStorage as a backup
  useEffect(() => {
    localStorage.setItem('earthquakeMarkers', JSON.stringify(markers));
  }, [markers]);

  const handleMapClick = (lat, lng) => {
    setNewMarkerPosition({ lat, lng });
    setIsFormOpen(true);
    setIsAddingMarker(false); // Exit the "adding marker" mode after click
  };

  const startAddingMarker = () => {
    setIsAddingMarker(true);
    setNewMarkerPosition(null);
    setIsFormOpen(false);
  };

  const handleMarkerSelect = (marker) => {
    setSelectedMarker(marker);
    // Close any open forms or adding marker mode
    setIsAddingMarker(false);
    setIsFormOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const addMarker = async (newMarkerData) => {
    if (!newMarkerPosition) return;
    
    try {
      setIsLoading(true);
      
      const markerToAdd = {
        ...newMarkerData,
        lat: newMarkerPosition.lat,
        lng: newMarkerPosition.lng
      };
      
      const addedMarker = await createMarker(markerToAdd);
      setMarkers([...markers, addedMarker]);
      setIsFormOpen(false);
      setNewMarkerPosition(null);
    } catch (err) {
      setError('Failed to add marker. Please try again.');
      console.error('Error adding marker:', err);
      
      // Fallback to local handling if API fails
      const markerWithId = {
        ...newMarkerData,
        lat: newMarkerPosition.lat,
        lng: newMarkerPosition.lng,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setMarkers([...markers, markerWithId]);
      setIsFormOpen(false);
      setNewMarkerPosition(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMarker = async (id) => {
    try {
      setIsLoading(true);
      await deleteMarker(id);
      setMarkers(markers.filter(marker => marker._id !== id));
      setSelectedMarker(null);
    } catch (err) {
      setError('Failed to delete marker. Please try again.');
      console.error('Error deleting marker:', err);
      
      // Fallback to local handling
      setMarkers(markers.filter(marker => marker._id !== id || marker.id !== id));
      setSelectedMarker(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMarkerStatus = async (id, newStatus) => {
    try {
      setIsLoading(true);
      const updatedMarker = await updateMarkerStatus(id, newStatus);
      
      setMarkers(markers.map(marker => 
        marker._id === id ? updatedMarker : marker
      ));
    } catch (err) {
      setError('Failed to update marker status. Please try again.');
      console.error('Error updating marker status:', err);
      
      // Fallback to local handling
      setMarkers(markers.map(marker => 
        (marker._id === id || marker.id === id) ? { ...marker, status: newStatus } : marker
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setNewMarkerPosition(null);
    setIsAddingMarker(false);
  };

  const filteredMarkers = filter === 'all' 
    ? markers 
    : markers.filter(marker => marker.type === filter || marker.status === filter);

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <Sidebar 
          markers={markers} 
          onMarkerSelect={handleMarkerSelect} 
          filter={filter}
          setFilter={setFilter}
          onAddNewClick={startAddingMarker}
          isLoading={isLoading}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        
        {/* Sidebar toggle button - only shows on mobile */}
        <button 
          className={`sidebar-toggle ${isSidebarOpen ? 'open' : ''}`} 
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? '←' : '→'}
        </button>
        
        <div className={`map-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}
          <MapContainer 
            center={center} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler 
              onMapClick={handleMapClick} 
              isAddingMarker={isAddingMarker} 
            />
            <MapController selectedMarker={selectedMarker} />
            {filteredMarkers.map(marker => (
              <Marker 
                key={marker._id || marker.id} 
                position={[marker.lat, marker.lng]}
                eventHandlers={{
                  click: () => {
                    if (!isAddingMarker) {
                      setSelectedMarker(marker);
                    }
                  },
                }}
              >
                <Popup>
                  <div>
                    <h3>{marker.title}</h3>
                    <p><strong>Type:</strong> {marker.type}</p>
                    <p><strong>Status:</strong> {marker.status}</p>
                    <p><strong>Description:</strong> {marker.description}</p>
                    
                    {/* Display images from the images array if available */}
                    {marker.images && marker.images.length > 0 ? (
                      <div className="popup-images">
                        {marker.images.map((imgSrc, idx) => (
                          <img 
                            key={idx}
                            src={imgSrc.startsWith('data:') 
                              ? imgSrc 
                              : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imgSrc}`
                            } 
                            alt={`Damage ${idx + 1}`} 
                            style={{ maxWidth: '100%', maxHeight: '150px', marginBottom: '5px' }} 
                          />
                        ))}
                      </div>
                    ) : marker.imageUrl ? (
                      // Fallback to legacy imageUrl if images array is empty
                      <img 
                        src={marker.imageUrl.startsWith('data:') 
                          ? marker.imageUrl 
                          : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${marker.imageUrl}`
                        } 
                        alt="Damage" 
                        style={{ maxWidth: '100%', maxHeight: '150px' }} 
                      />
                    ) : null}
                    
                    <div className="popup-actions">
                      <select 
                        value={marker.status}
                        onChange={(e) => handleUpdateMarkerStatus(marker._id || marker.id, e.target.value)}
                      >
                        <option value="needsHelp">Needs Help</option>
                        <option value="inProgress">Help In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <button onClick={() => handleDeleteMarker(marker._id || marker.id)}>Delete</button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            {newMarkerPosition && (
              <Marker position={[newMarkerPosition.lat, newMarkerPosition.lng]}>
                <Popup>
                  <p>New marker will be placed here</p>
                </Popup>
              </Marker>
            )}
          </MapContainer>
          
          {isAddingMarker && (
            <div className="map-instruction-overlay">
              <div className="map-instruction">
                Click on the map to place a marker
                <button onClick={() => setIsAddingMarker(false)}>Cancel</button>
              </div>
            </div>
          )}
          
          {isFormOpen && newMarkerPosition && (
            <div className="form-overlay">
              <MarkerForm 
                onSubmit={addMarker} 
                onCancel={handleCloseForm}
                coordinates={`${newMarkerPosition.lat.toFixed(6)}, ${newMarkerPosition.lng.toFixed(6)}`}
                isLoading={isLoading}
              />
            </div>
          )}
          
          {!isAddingMarker && !isFormOpen && (
            <button 
              className="add-marker-button" 
              onClick={startAddingMarker}
              disabled={isLoading}
            >
              Add New Marker
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;