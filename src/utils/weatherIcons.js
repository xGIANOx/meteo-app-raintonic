export const weatherIcons = {
    0: {
      icon: '☀️',
      description: 'Cielo sereno'
    },
    1: {
      icon: '🌤️',
      description: 'Prevalentemente sereno'
    },
    2: {
      icon: '⛅',
      description: 'Parzialmente nuvoloso'
    },
    3: {
      icon: '☁️',
      description: 'Nuvoloso'
    },
    45: {
      icon: '🌫️',
      description: 'Nebbia'
    },
    48: {
      icon: '🌫️',
      description: 'Nebbia con brina'
    },
    51: {
      icon: '🌧️',
      description: 'Pioggia leggera'
    },
    53: {
      icon: '🌧️',
      description: 'Pioggia moderata'
    },
    55: {
      icon: '🌧️',
      description: 'Pioggia intensa'
    },
    61: {
      icon: '🌧️',
      description: 'Pioggia debole'
    },
    63: {
      icon: '🌧️',
      description: 'Pioggia moderata'
    },
    65: {
      icon: '🌧️',
      description: 'Pioggia forte'
    },
    71: {
      icon: '🌨️',
      description: 'Neve leggera'
    },
    73: {
      icon: '🌨️',
      description: 'Neve moderata'
    },
    75: {
      icon: '🌨️',
      description: 'Neve intensa'
    },
    95: {
      icon: '⛈️',
      description: 'Temporale'
    }
  }
  
  export const getWeatherIcon = (code) => {
    return weatherIcons[code]?.icon || '❓'
  }
  
  export const getWeatherDescription = (code) => {
    return weatherIcons[code]?.description || 'Condizione meteo sconosciuta'
  }