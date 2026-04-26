<template>
  <v-layout class="controlcash-gradient">
    <template v-if="authStore.isAuthenticated">
      <v-navigation-drawer
        v-model="drawer"
        class="controlcash-drawer"
        color="surface"
        width="280"
      >
        <v-sheet class="pa-6" color="transparent">
          <div class="d-flex align-center ga-4">
            <v-icon color="primary" icon="mdi-cash-fast" size="36" />
            <div class="text-h5">ControlCash</div>
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
            :active="item.active"
            :disabled="item.disabled"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            color="primary"
            rounded="0"
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
        <v-toolbar-title>ControlCash</v-toolbar-title>

        <v-spacer />

        <div class="controlcash-search-wrap mx-6 d-none d-md-flex">
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

        <v-avatar class="mr-2" color="surface-variant">
          {{ userInitial }}
        </v-avatar>

        <v-btn
          icon="mdi-chevron-down"
          variant="text"
          aria-label="Opciones de usuario"
        />
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import ThemeToggle from './ThemeToggle.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const drawer = ref(true)

const navigationItems = [
  {
    title: 'Home',
    icon: 'mdi-home-outline',
    to: '/dashboard',
    active: true,
  },
  {
    title: 'Tarjetas',
    icon: 'mdi-credit-card-outline',
    disabled: true,
  },
  {
    title: 'Situación Financiera',
    icon: 'mdi-file-chart-outline',
    disabled: true,
  },
]

const userInitial = computed(() => authStore.displayName.charAt(0).toUpperCase())

onMounted(() => {
  authStore.initAuth()
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
