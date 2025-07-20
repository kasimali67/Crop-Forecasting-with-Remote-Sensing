import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SatelliteViewer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [analysisMode, setAnalysisMode] = useState('ndvi');

  useEffect(() => {
    const fetchSatelliteImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/satellite-images');
        setImageList(response.data);
        if (response.data.length > 0) {
          setSelectedImage(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching satellite images:', error);
      }
    };

    fetchSatelliteImages();
  }, []);

  const handleImageSelection = (image) => {
    setSelectedImage(image);
  };

  const handleAnalysisModeChange = (mode) => {
    setAnalysisMode(mode);
  };

  return (
    <div className="satellite-viewer">
      <div className="viewer-header">
        <h3>Satellite Imagery Analysis</h3>
        <div className="analysis-controls">
          <button 
            className={`mode-btn ${analysisMode === 'ndvi' ? 'active' : ''}`}
            onClick={() => handleAnalysisModeChange('ndvi')}
          >
            NDVI
          </button>
          <button 
            className={`mode-btn ${analysisMode === 'rgb' ? 'active' : ''}`}
            onClick={() => handleAnalysisModeChange('rgb')}
          >
            True Color
          </button>
          <button 
            className={`mode-btn ${analysisMode === 'nir' ? 'active' : ''}`}
            onClick={() => handleAnalysisModeChange('nir')}
          >
            Near Infrared
          </button>
        </div>
      </div>

      <div className="viewer-content">
        <div className="image-display">
          {selectedImage && (
            <div className="satellite-image-container">
              <img 
                src={selectedImage[analysisMode]} 
                alt={`Satellite image - ${analysisMode.toUpperCase()}`}
                className="satellite-image"
              />
              <div className="image-info">
                <p>Date: {new Date(selectedImage.captureDate).toLocaleDateString()}</p>
                <p>Resolution: {selectedImage.resolution}m</p>
                <p>Cloud Cover: {selectedImage.cloudCover}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="image-timeline">
          <h4>Image Timeline</h4>
          <div className="timeline-images">
            {imageList.map((image, index) => (
              <div 
                key={index}
                className={`timeline-item ${selectedImage?.id === image.id ? 'active' : ''}`}
                onClick={() => handleImageSelection(image)}
              >
                <img 
                  src={image.thumbnail} 
                  alt={`Thumbnail ${index}`}
                  className="timeline-thumbnail"
                />
                <span className="timeline-date">
                  {new Date(image.captureDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analysis-results">
        <h4>Image Analysis Results</h4>
        {selectedImage && (
          <div className="analysis-metrics">
            <div className="metric">
              <label>Average NDVI:</label>
              <span>{selectedImage.avgNDVI}</span>
            </div>
            <div className="metric">
              <label>Vegetation Coverage:</label>
              <span>{selectedImage.vegetationCoverage}%</span>
            </div>
            <div className="metric">
              <label>Healthy Vegetation:</label>
              <span>{selectedImage.healthyVegetation}%</span>
            </div>
            <div className="metric">
              <label>Stressed Areas:</label>
              <span>{selectedImage.stressedAreas}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SatelliteViewer;
