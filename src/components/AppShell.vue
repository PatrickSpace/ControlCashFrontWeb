<template>
  <v-layout class="controlcash-gradient">
    <template v-if="authStore.isAuthenticated">
      <v-navigation-drawer
        v-model="drawer"
        class="controlcash-drawer"
        color="surface"
        :temporary="mobile"
        width="280"
      >
        <v-sheet class="pa-6" color="transparent">
          <div class="d-flex align-center ga-4">
            <v-icon color="primary" icon="mdi-cash-fast" size="36" />
            <div class="text-headline-small">ControlCash</div>
            <v-spacer />
            <v-btn
              icon="mdi-chevron-double-left"
              variant="text"
              aria-label="Ocultar menú"
              @click="drawer = false"
            />
          </div>

          <v-text-field
            class="controlcash-field mt-8"
            density="compact"
            hide-details
            placeholder="Search"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
          />
        </v-sheet>

        <v-list class="pt-2" density="comfortable" nav>
          <v-list-item
            v-for="item in navigationItems"
            :key="item.title"
            :disabled="item.disabled"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            color="primary"
            rounded="0"
            @click="handleNavigation"
          />
        </v-list>

        <template #append>
          <div class="pa-6">
            <v-btn
              block
              class="justify-start"
              :loading="authStore.loading"
              prepend-icon="mdi-power"
              variant="text"
              @click="handleLogout"
            >
              Cerrar sesión
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>

      <v-app-bar class="controlcash-app-bar" color="surface" flat>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-toolbar-title class="controlcash-toolbar-title">ControlCash</v-toolbar-title>

        <div class="controlcash-search-wrap d-none d-md-flex">
          <v-text-field
            class="controlcash-field"
            density="compact"
            hide-details
            placeholder="Search"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
          />
        </div>

        <ThemeToggle />
      </v-app-bar>
    </template>

    <v-main class="controlcash-main">
      <v-progress-linear
        v-if="!authStore.initialized"
        color="primary"
        indeterminate
      />

      <router-view v-else />
    </v-main>

    <v-snackbar v-model="notificationStore.visible" :color="notificationStore.color">
      {{ notificationStore.message }}

      <template #actions>
        <v-btn variant="text" @click="notificationStore.visible = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

import ThemeToggle from './ThemeToggle.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const { mobile } = useDisplay()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const drawer = ref(!mobile.value)

const navigationItems = [
  {
    title: 'Home',
    icon: 'mdi-home-outline',
    to: '/dashboard',
  },
  {
    title: 'Cuentas',
    icon: 'mdi-wallet-outline',
    to: '/accounts',
  },
  {
    title: 'Tarjetas',
    icon: 'mdi-credit-card-outline',
    to: '/cards',
  },
  {
    title: 'Categorías',
    icon: 'mdi-shape-outline',
    to: '/categories',
  },
  {
    title: 'Transacciones',
    icon: 'mdi-swap-horizontal',
    to: '/transactions',
  },
  {
    title: 'Presupuestos',
    icon: 'mdi-chart-donut',
    to: '/budgets',
  },
  {
    title: 'Situación financiera',
    icon: 'mdi-file-chart-outline',
    disabled: true,
  },
]

onMounted(() => {
  authStore.initAuth()
})

watch(mobile, (isMobile) => {
  drawer.value = !isMobile
})

function handleNavigation() {
  if (mobile.value) {
    drawer.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
