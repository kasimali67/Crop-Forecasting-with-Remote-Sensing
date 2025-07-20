import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CropAnalysis = () => {
  const [ndviData, setNdviData] = useState({
    labels: [],
    datasets: [{
      label: 'NDVI Values',
      data: [],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      tension: 0.1
    }]
  });

  const [cropHealth, setCropHealth] = useState({
    labels: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
    datasets: [{
      label: 'Field Coverage (%)',
      data: [],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(101, 163, 13, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ]
    }]
  });

  const [fieldData, setFieldData] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [yieldPrediction, setYieldPrediction] = useState(null);

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/crop-analysis');
        const data = response.data;
        
        // Update NDVI time series data
        setNdviData({
          labels: data.ndvi.timestamps.map(ts => new Date(ts).toLocaleDateString()),
          datasets: [{
            ...ndviData.datasets[0],
            data: data.ndvi.values
          }]
        });

        // Update crop health distribution
        setCropHealth({
          ...cropHealth,
          datasets: [{
            ...cropHealth.datasets[0],
            data: data.healthDistribution
          }]
        });

        // Update field data
        setFieldData(data.fields);
        
        // Update yield prediction
        setYieldPrediction(data.yieldPrediction);
        
      } catch (error) {
        console.error('Error fetching crop analysis data:', error);
      }
    };

    fetchCropData();
    const interval = setInterval(fetchCropData, 300000); // Update every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const handleFieldSelection = (fieldId) => {
    const field = fieldData.find(f => f.id === fieldId);
    setSelectedField(field);
  };

  const getHealthColor = (health) => {
    switch(health.toLowerCase()) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-lime-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="crop-analysis">
      <div className="analysis-header">
        <h2>Crop Forecasting with Remote Sensing</h2>
        <p>NDVI Analytics & Time-series ML for Crop Health Monitoring</p>
      </div>

      <div className="analysis-grid">
        {/* NDVI Trend Chart */}
        <div className="chart-container">
          <h3>NDVI Time Series Analysis</h3>
          <Line 
            data={ndviData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Vegetation Index Trends Over Time'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 1,
                  title: {
                    display: true,
                    text: 'NDVI Value'
                  }
                }
              }
            }} 
          />
        </div>

        {/* Crop Health Distribution */}
        <div className="chart-container">
          <h3>Field Health Distribution</h3>
          <Bar 
            data={cropHealth}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: true,
                  text: 'Current Field Health Status'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Coverage Percentage'
                  }
                }
              }
            }}
          />
        </div>

        {/* Yield Prediction Summary */}
        {yieldPrediction && (
          <div className="prediction-summary">
            <h3>Yield Forecasting Results</h3>
            <div className="prediction-metrics">
              <div className="metric-card">
                <h4>Predicted Yield</h4>
                <span className="metric-value">{yieldPrediction.estimatedYield} tons/ha</span>
              </div>
              <div className="metric-card">
                <h4>Confidence Level</h4>
                <span className="metric-value">{yieldPrediction.confidence}%</span>
              </div>
              <div className="metric-card">
                <h4>Harvest Window</h4>
                <span className="metric-value">{yieldPrediction.harvestWindow}</span>
              </div>
            </div>
          </div>
        )}

        {/* Field Selection and Details */}
        <div className="field-management">
          <h3>Field-Level Analysis</h3>
          <div className="field-selector">
            <select 
              onChange={(e) => handleFieldSelection(e.target.value)}
              value={selectedField?.id || ''}
            >
              <option value="">Select a field...</option>
              {fieldData.map(field => (
                <option key={field.id} value={field.id}>
                  {field.name} - {field.area} ha
                </option>
              ))}
            </select>
          </div>

          {selectedField && (
            <div className="field-details">
              <h4>{selectedField.name}</h4>
              <div className="field-metrics">
                <div className="field-metric">
                  <span>Area: {selectedField.area} hectares</span>
                </div>
                <div className="field-metric">
                  <span>Crop Type: {selectedField.cropType}</span>
                </div>
                <div className="field-metric">
                  <span className={getHealthColor(selectedField.health)}>
                    Health: {selectedField.health}
                  </span>
                </div>
                <div className="field-metric">
                  <span>Current NDVI: {selectedField.currentNDVI}</span>
                </div>
                <div className="field-metric">
                  <span>Growth Stage: {selectedField.growthStage}</span>
                </div>
                <div className="field-metric">
                  <span>Last Updated: {new Date(selectedField.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Satellite Image Analysis Status */}
        <div className="satellite-status">
          <h3>Remote Sensing Status</h3>
          <div className="status-indicators">
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>Satellite Data: Active</span>
            </div>
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>NDVI Processing: Online</span>
            </div>
            <div className="status-item">
              <span className="status-dot yellow"></span>
              <span>Cloud Coverage: 15%</span>
            </div>
            <div className="status-item">
              <span className="status-dot green"></span>
              <span>ML Models: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropAnalysis;
