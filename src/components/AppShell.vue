<template>
  <v-layout class="controlcash-gradient">
    <v-app>


      <template v-if="authStore.isAuthenticated">
        <v-navigation-drawer v-model="drawer" class="controlcash-drawer" color="surface" :temporary="mobile"
          width="280">
          <v-sheet class="pa-6" color="transparent">
            <div class="d-flex align-center ga-4">
              <v-icon color="primary" icon="mdi-cash-fast" size="36" />
              <div class="text-title-large">ControlCash</div>
              <v-spacer/>
            </div>

            <v-text-field class="controlcash-field mt-8" density="compact" hide-details placeholder="Search"
              prepend-inner-icon="mdi-magnify" variant="solo-filled" />
          </v-sheet>

          <v-list class="pt-2" density="comfortable" nav>
            <v-list-item v-for="item in navigationItems" :key="item.title" :disabled="item.disabled"
              :prepend-icon="item.icon" :title="item.title" :to="item.to" color="primary" rounded="0"
              @click="handleNavigation" />
          </v-list>

          <template #append>
            <div class="pa-6">
              <v-btn block class="justify-start" :loading="authStore.loading" prepend-icon="mdi-power" variant="text"
                @click="handleLogout">
                Cerrar sesión
              </v-btn>
            </div>
          </template>
        </v-navigation-drawer>


  <v-app-bar class="controlcash-app-bar mb-4 pr-5 bg-transparent" color="surface" >
    <v-btn
      :aria-label="drawer ? 'Ocultar navegacion' : 'Mostrar navegacion'"
      class="controlcash-nav-button"
      icon
      variant="text"
      @click="drawer = !drawer"
    >
      <svg
        v-if="drawer"
        aria-hidden="true"
        class="controlcash-double-left-icon"
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d="M10.7 6.45 6.15 12l4.55 5.55-1.65 1.35L3.4 12l5.65-6.9 1.65 1.35Z" />
        <path d="M18.7 6.45 14.15 12l4.55 5.55-1.65 1.35L11.4 12l5.65-6.9 1.65 1.35Z" />
      </svg>
      <v-icon v-else icon="$menu" />
    </v-btn>
    <v-toolbar-title class="controlcash-toolbar-title">ControlCash</v-toolbar-title>
    
    <div class="controlcash-search-wrap d-none d-md-flex">
      <v-text-field class="controlcash-field" density="compact" hide-details placeholder="Search"
      prepend-inner-icon="mdi-magnify" variant="solo-filled" />
    </div>
    
    <ThemeToggle />
  
  </v-app-bar>

      </template>

      <v-main class="controlcash-main">
        <v-progress-linear v-if="!authStore.initialized" color="primary" indeterminate />

        <router-view v-else />
      </v-main>
    </v-app>
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

<style scoped>
.controlcash-double-left-icon {
  color: currentColor;
  display: block;
  height: 24px;
  width: 24px;
}

.controlcash-double-left-icon path {
  fill: currentColor;
}
</style>
