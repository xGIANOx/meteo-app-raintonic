<script setup>
import { ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import FavoritesSidebar from './FavoritesSidebar.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'chart.js/auto'
import { getWeatherIcon } from '../utils/weatherIcons'

const searchQuery = ref('')
const currentWeather = ref(null)
const favorites = ref([])
const errorMessage = ref('')
const hourlyForecast = ref(null)


const getCoordinates = async (city) => {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=it`)
    const data = await response.json()
    if (data.results?.length > 0) {
      return data.results[0]
    }
    throw new Error('Città non trovata')
  } catch (error) {
    throw new Error('Errore nella ricerca della città')
  }
}


const searchWeather = async () => {
  try {
    errorMessage.value = ''
    const cityData = await getCoordinates(searchQuery.value)
    
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${cityData.latitude}&longitude=${cityData.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&hourly=temperature_2m&forecast_days=1`
    )
    const weatherData = await response.json()
    
    currentWeather.value = {
      ...weatherData.current,
      cityName: cityData.name,
      country: cityData.country,
      latitude: cityData.latitude,
      longitude: cityData.longitude
    }
    
    hourlyForecast.value = {
      labels: weatherData.hourly.time.map(time => {
        const date = new Date(time)
        return `${date.getHours()}:00`
      }),
      datasets: [{
        label: 'Temperatura (°C)',
        data: weatherData.hourly.temperature_2m,
        borderColor: '#42b883',
        backgroundColor: 'rgba(66, 184, 131, 0.2)',
        fill: true,
        tension: 0.4
      }]
    }
  } catch (error) {
    errorMessage.value = error.message
    currentWeather.value = null
  }
}

const addToFavorites = () => {
  if (!favorites.value.some(f => f.cityName === currentWeather.value.cityName)) {
    favorites.value.push(currentWeather.value)
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }
}

const removeFromFavorites = (index) => {
  favorites.value.splice(index, 1)
  localStorage.setItem('favorites', JSON.stringify(favorites.value))
}

const sortFavorites = () => {
  favorites.value.sort((a, b) => a.temperature_2m - b.temperature_2m)
}

onMounted(() => {
  const savedFavorites = localStorage.getItem('favorites')
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites)
  }
})


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#fff',
        font: {
          size: 12
        }
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: '#fff',
        font: {
          size: 12
        },
        maxRotation: 45,
        minRotation: 45
      }
    }
  },
  elements: {
    line: {
      borderWidth: 2,
      tension: 0.4
    },
    point: {
      radius: 3,
      backgroundColor: '#42b883'
    }
  }
}


const searchFavoriteWeather = (city) => {
  searchQuery.value = city.cityName
  searchWeather()
}

const handleSortFavorites = () => {
  sortFavorites()
}

const handleRemoveFavorite = (index) => {
  removeFromFavorites(index)
}

const handleSelectFavorite = (city) => {
  searchFavoriteWeather(city)
}
</script>

<template>
  <div class="container-fluid vh-100 d-flex flex-column flex-lg-row">
    <div class="main-content flex-grow-1 p-5">
      <div class="content-wrapper">
        <h1 class="mb-4 app-title">MeteoTonic.it</h1>
        
        <div class="d-flex mb-5 gap-2">
          <input 
            v-model="searchQuery" 
            class="form-control search-input flex-grow-1"
            style="width: 200px;"
            placeholder="Inserisci una città..." 
            @keyup.enter="searchWeather"
          />
          <button @click="searchWeather" class="btn btn-search flex-grow-0">
            <i class="fas fa-search"></i> Cerca
          </button>
        </div>

        <p v-if="errorMessage" class="alert alert-warning rounded-4">{{ errorMessage }}</p>

        <div v-if="currentWeather" class="weather-card">
          <div class="card-body">
            <h2 class="mb-3 fs-4">{{ currentWeather.cityName }}, {{ currentWeather.country }}</h2>
            
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
              
              <div class="weather-info w-100">
                <div class="d-flex align-items-center gap-4">
                  <div class="d-flex align-items-center gap-3">
                    <span class="weather-icon">{{ getWeatherIcon(currentWeather.weather_code) }}</span>
                    <span class="temperature">{{ Math.round(currentWeather.temperature_2m) }}°C</span>
                  </div>
                  
                  <div class="weather-details d-flex flex-column flex-lg-row gap-4">
                    <p class="d-flex align-items-center gap-2 mb-0 small">
                      <i class="fas fa-tint" style="width: 16px;"></i> 
                      Umidità: {{ currentWeather.relative_humidity_2m }}%
                    </p>
                    <p class="d-flex align-items-center gap-2 mb-0 small">
                      <i class="fas fa-wind" style="width: 17px;"></i>
                      Vento: {{ Math.round(currentWeather.wind_speed_10m) }} km/h
                    </p>
                  </div>
                </div>
              </div>
              
              <button @click="addToFavorites" class="btn btn-favorite btn-sm mt-2 mt-sm-0">
                <i class="fas fa-star me-2"></i> 
                <span class="d-none d-sm-inline">Aggiungi ai preferiti</span>
              </button>
            </div>
            
            <div v-if="hourlyForecast" class="forecast-container d-none d-lg-block mt-4">
              <h3 class="forecast-title fs-5">Previsioni temperature 24 ore</h3>
              <Line :data="hourlyForecast" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <FavoritesSidebar 
      :favorites="favorites"
      @sort="handleSortFavorites"
      @remove="handleRemoveFavorite"
      @select="handleSelectFavorite"
    />
  </div>
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

:root {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.container-fluid {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  overflow: hidden;
}



.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  margin-bottom: 1rem;
}



.search-input {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 1rem;
  border-radius: 12px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.btn-search {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  &:hover{
    background: #45a049;
    transform: translateY(-2px);
  }
}

.card-body {
  padding: 1rem 1rem 4rem 1rem;
}

.weather-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  overflow-y: hidden;
  margin-bottom: 2rem;
  width: 100%;
  margin: 0 auto;
}

.temperature {
  font-size: 3rem;
  font-weight: 700;
}

.weather-icon {
  font-size: 3rem;
}

.btn-favorite {
  background: #ffd700;
  color: #000;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  line-height: 1;
  font-size: 0.9rem;
  height: fit-content;
  &:hover{
    background: #ffed4a;
    transform: translateY(-2px);
  }
}

.forecast-container {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  height: 250px;
}

.forecast-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.favorites-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 350px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  overflow-y: auto;
}

.sidebar-title {
  font-size: 1.5rem;
  margin: 0;
}

.btn-sort {
  background: rgba(255,255,255,0.1);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:hover{
    background: rgba(255,255,255,0.2);
    transform: translateY(-2px);
  }
}

.favorite-item {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
 
}

.favorite-city {
  font-size: 1.1rem;
}

.favorite-weather {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.favorite-icon {
  font-size: 1.5rem;
}

.favorite-temp {
  font-size: 1.3rem;
  font-weight: 600;
}

.favorite-details {
  font-size: 0.9rem;
  opacity: 0.8;
}

.btn-remove {
  background: rgba(255,59,48,0.2);
  color: #ff3b30;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:hover{
    background: rgba(255,59,48,0.4);
    transform: translateY(-2px);
  }
}

@media (max-width: 991.98px) {
  .favorites-sidebar {
    position: relative;
    width: 100%;
    max-height: 40vh;
  }
  
  .search-container {
    width: 100%;
    max-width: 100%;
  }
  
  .forecast-container {
    height: 200px;
  }
  
  .temperature {
    font-size: 2.5rem;
  }
  
  .weather-icon {
    font-size: 2.5rem;
  }
}

@media (min-width: 992px) {
  .main-content {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 350px;
  }
  
  .favorites-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 350px;
  }
  
  .content-wrapper {
    padding: 0 2rem;
  }
}

@media (max-width: 576px) {
  .main-content {
    padding: 1rem;
  }
  
  .search-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-search {
    width: 100%;
  }
  
  .city-title {
    font-size: 1.5rem;
  }
  
  .temperature {
    font-size: 2rem;
  }
  
  .weather-icon {
    font-size: 2rem;
  }
  
  .forecast-container {
    height: 180px;
  }
  
  .favorite-item {
    padding: 0.75rem;
  }
  
  .favorite-city {
    font-size: 1rem;
  }
  
  .favorite-icon,
  .favorite-temp {
    font-size: 1.2rem;
  }
}

@media (max-width: 360px) {
  .temperature {
    font-size: 1.8rem;
  }
  
  .weather-icon {
    font-size: 1.8rem;
  }
  
  .forecast-container {
    height: 150px;
  }
}

@media (min-width: 577px) and (max-width: 991.98px) {
  .weather-card {
    max-width: 800px;
    margin: 0 auto 2rem auto;
  }
  
  .search-container {
    max-width: 800px;
    margin: 0 auto 2rem auto;
  }
}

.empty-favorites {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-top: 1rem;
}

.empty-star {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.3);
  display: block;
}

.empty-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.empty-suggestion {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 200px;
  margin: 0 auto;
}

@media (max-width: 991.98px) {
  .favorites-sidebar {
    position: relative;
    width: 100%;
    max-height: 40vh;
  }
  
  .empty-favorites {
    min-height: 150px;
  }
  
  .content-wrapper {
    padding: 0 1rem;
  }
}

@media (max-width: 576px) {
  .weather-icon {
    font-size: 2rem;
  }
  
  .temperature {
    font-size: 2rem;
  }
  
  .weather-details {
    font-size: 0.9rem;
  }
  
  .btn-favorite {
    width: 100%;
    padding: 0.5rem;
  }
}

.weather-info {
  max-width: 100%;
}

.btn-favorite {
  white-space: nowrap;
}

.favorites-header {
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.favorites-content {
  padding: 1rem;
}
</style>