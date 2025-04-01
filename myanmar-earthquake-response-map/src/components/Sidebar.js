import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ markers, onMarkerSelect, filter, setFilter, onAddNewClick }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMarkers = markers.filter(marker => {
    // First apply type/status filter
    const passesFilter = filter === 'all' || marker.type === filter || marker.status === filter;
    
    // Then apply search filter if there is a search term
    const passesSearch = !searchTerm || 
      marker.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      marker.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return passesFilter && passesSearch;
  });

  const sortedMarkers = [...filteredMarkers].sort((a, b) => {
    // Sort by date, newest first
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Affected Areas</h2>
        <button className="add-btn" onClick={onAddNewClick}>+ Add New</button>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="filter-container">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Markers</option>
          <option value="damage">Damage Reports</option>
          <option value="shelter">Shelter Needed</option>
          <option value="medical">Medical Help</option>
          <option value="supplies">Supplies Needed</option>
          <option value="needsHelp">Needs Help</option>
          <option value="inProgress">Help In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      
      <div className="markers-list">
        {sortedMarkers.length > 0 ? (
          sortedMarkers.map(marker => (
            <div 
              key={marker.id} 
              className={`marker-item ${marker.status}`}
              onClick={() => onMarkerSelect(marker)}
            >
              <h3>{marker.title}</h3>
              <div className="marker-meta">
                <span className="marker-type">{marker.type}</span>
                <span className="marker-status">{marker.status}</span>
              </div>
              <p className="marker-description">
                {marker.description.length > 80 
                  ? `${marker.description.substring(0, 80)}...` 
                  : marker.description}
              </p>
              <div className="marker-date">
                {new Date(marker.date).toLocaleDateString()}, 
                {new Date(marker.date).toLocaleTimeString()}
              </div>
            </div>
          ))
        ) : (
          <div className="no-markers">
            <p>No markers match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;