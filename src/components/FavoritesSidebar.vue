<script setup>
import { defineProps, defineEmits } from 'vue'
import { getWeatherIcon } from '../utils/weatherIcons'

const props = defineProps({
  favorites: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['sort', 'remove', 'select'])

const sortFavorites = () => {
  emit('sort')
}

const removeFromFavorites = (index) => {
  emit('remove', index)
}

const searchFavoriteWeather = (city) => {
  emit('select', city)
}
</script>

<template>
  <div class="favorites-sidebar overflow-auto">
    <div class="favorites-header">
      <div class="d-flex justify-content-between align-items-center">
        <h2 class="sidebar-title">Città Preferite</h2>
        <button v-if="favorites.length" @click="sortFavorites" class="btn btn-sort">
          <i class="fas fa-sort"></i> Ordina
        </button>
      </div>
    </div>
    <div class="favorites-content">
      <div v-if="favorites.length" class="favorites-list">
        <div v-for="(city, index) in favorites" :key="index" class="favorite-item">
          <div @click="searchFavoriteWeather(city)" style="cursor: pointer;">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="favorite-city">{{ city.cityName }}, {{ city.country }}</h3>
              <button @click.stop="removeFromFavorites(index)" class="btn btn-remove">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div class="d-flex align-items-center">
              <div class="favorite-weather">
                <span class="favorite-icon">{{ getWeatherIcon(city.weather_code) }}</span>
                <span class="favorite-temp me-2">{{ Math.round(city.temperature_2m) }}°C</span>
                <div><i class="fas fa-tint"></i> {{ city.relative_humidity_2m }}%</div>
                <div><i class="fas fa-wind"></i> {{ Math.round(city.wind_speed_10m) }} km/h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-favorites">
        <div class="text-center p-4">
          <i class="fas fa-star empty-star mb-3"></i>
          <p class="empty-text">Non hai ancora città preferite</p>
          <p class="empty-suggestion">Cerca una città e aggiungila ai preferiti per visualizzarla qui</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}

.btn-sort:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
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

.btn-remove {
  background: rgba(255,59,48,0.2);
  color: #ff3b30;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: rgba(255,59,48,0.4);
  transform: translateY(-2px);
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

@media (max-width: 991.98px) {
  .favorites-sidebar {
    position: relative;
    width: 100%;
    max-height: 40vh;
  }
  
  .empty-favorites {
    min-height: 150px;
  }
}

@media (max-width: 576px) {
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
</style> 