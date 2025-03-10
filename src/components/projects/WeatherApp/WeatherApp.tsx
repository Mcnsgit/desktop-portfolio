// components/projects/WeatherApp/WeatherApp.tsx
import React, { useState } from 'react';
import styles from './WeatherApp.module.scss';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const WeatherApp: React.FC = () => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  // Simulate weather fetch (in a real app, you'd call an actual API)
  const fetchWeather = (location: string) => {
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      if (location.trim() === '') {
        setError('Please enter a location');
        setLoading(false);
        return;
      }
      
      // Mock weather data
      setWeather({
        location: location,
        temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
        description: ['Sunny', 'Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
        windSpeed: Math.floor(Math.random() * 30) + 5, // 5-35 km/h
        icon: ['☀️', '☁️', '🌧️', '🌬️'][Math.floor(Math.random() * 4)]
      });
      
      setLoading(false);
    }, 1000);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(location);
  };
  
  return (
    <div className={styles.weatherApp}>
      <h2 className={styles.title}>Weather Forecast</h2>
      
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name..."
          className={styles.input}
        />
        <button type="submit" className={styles.searchButton} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {weather && (
        <div className={styles.weatherInfo}>
          <div className={styles.location}>{weather.location}</div>
          <div className={styles.mainInfo}>
            <div className={styles.icon}>{weather.icon}</div>
            <div className={styles.temperature}>{weather.temperature}°C</div>
          </div>
          <div className={styles.description}>{weather.description}</div>
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Humidity:</span>
              <span className={styles.value}>{weather.humidity}%</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Wind:</span>
              <span className={styles.value}>{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      )}
      
      {!weather && !loading && !error && (
        <div className={styles.initialMessage}>
          Enter a city name to see the weather forecast
        </div>
      )}
    </div>
  );
};

export default WeatherApp;