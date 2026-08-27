export const restaurantConfig = {
  name: import.meta.env.VITE_RESTAURANT_NAME || 'Romani',
  tagline: import.meta.env.VITE_RESTAURANT_TAGLINE || 'Buffet & Sabores',
  timeZone: import.meta.env.VITE_RESTAURANT_TIME_ZONE || 'America/Sao_Paulo',
  serviceHours: import.meta.env.VITE_RESTAURANT_SERVICE_HOURS || '',
}
