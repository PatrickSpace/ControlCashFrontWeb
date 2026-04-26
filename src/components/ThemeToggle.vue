<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :aria-label="label"
        color="primary"
        :icon="icon"
        variant="tonal"
        @click="toggleTheme"
      />
    </template>

    <span>{{ label }}</span>
  </v-tooltip>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const isDark = computed(() => theme.global.current.value.dark)
const icon = computed(() => (isDark.value ? 'mdi-white-balance-sunny' : 'mdi-weather-night'))
const label = computed(() => (isDark.value ? 'Activar modo claro' : 'Activar modo oscuro'))

function toggleTheme() {
  const nextTheme = isDark.value ? 'controlCashLight' : 'controlCashDark'

  theme.global.name.value = nextTheme
  window.localStorage.setItem('controlcash-theme', nextTheme)
}
</script>
