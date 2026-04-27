import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('controlcash-theme') : null
const defaultTheme = ['controlCashDark', 'controlCashLight'].includes(savedTheme)
  ? savedTheme
  : 'controlCashDark'

export const vuetify = createVuetify({
  defaults: {
    VCard: {
      rounded: 'lg',
    },
    VTextField: {
      density: 'comfortable',
      variant: 'outlined',
    },
    VSelect: {
      density: 'comfortable',
      variant: 'outlined',
    },
  },
  theme: {
    defaultTheme,
    themes: {
      controlCashDark: {
        dark: true,
        colors: {
          background: '#222934',
          surface: '#2d394a',
          primary: '#0DB2BD',
          secondary: '#6BD9FF',
          accent: '#7bd8dd',
          error: '#ff6b6b',
          info: '#78c6ff',
          success: '#2ee59d',
          warning: '#f6bd60',
          'on-background': '#f4f7fb',
          'on-surface': '#f4f7fb',
          'surface-bright': '#405575',
          'surface-variant': '#344257',
        },
      },
      controlCashLight: {
        dark: false,
        colors: {
          background: '#eaf3f6',
          surface: '#ffffff',
          primary: '#0DB2BD',
          secondary: '#405575',
          accent: '#048f98',
          error: '#c24141',
          info: '#1d75a8',
          success: '#168260',
          warning: '#c77700',
          'on-background': '#1d2633',
          'on-surface': '#1d2633',
          'surface-bright': '#f8fbfc',
          'surface-variant': '#d9e7ed',
        },
      },
    },
  },
})
