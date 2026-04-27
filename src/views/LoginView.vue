<template>
  <v-container class="fill-height controlcash-gradient" fluid>
    <div class="controlcash-login-actions">
      <ThemeToggle />
    </div>

    <v-row align="center" justify="center">
      <v-col cols="12" lg="4" md="6" sm="8">
        <v-card class="controlcash-panel" elevation="0">
          <v-card-title class="controlcash-card-title text-headline-medium pt-8 px-8 pb-5">
            <div class="d-flex align-center ga-4">
              <v-icon color="primary" icon="mdi-cash-fast" size="36" />
              <span>ControlCash</span>
            </div>
          </v-card-title>

          <v-card-subtitle class="px-8 pt-4 pb-4">
            Finanzas personales con datos claros y decisiones simples.
          </v-card-subtitle>

          <v-tabs v-model="mode" color="primary" grow>
            <v-tab value="login">Ingresar</v-tab>
            <v-tab value="register">Crear cuenta</v-tab>
          </v-tabs>

          <v-card-text class="pa-8">
            <v-alert
              v-if="authStore.error"
              class="mb-6"
              density="comfortable"
              type="error"
              variant="tonal"
            >
              {{ authStore.error }}
            </v-alert>

            <v-form v-model="formValid" @submit.prevent="handleSubmit">
              <v-text-field
                v-if="mode === 'register'"
                v-model.trim="name"
                class="controlcash-field"
                autocomplete="name"
                label="Nombre"
                prepend-inner-icon="mdi-account-outline"
              />

              <v-text-field
                v-model.trim="email"
                class="controlcash-field"
                autocomplete="email"
                label="Correo"
                prepend-inner-icon="mdi-email-outline"
                :rules="[rules.required, rules.email]"
                type="email"
              />

              <v-text-field
                v-model="password"
                class="controlcash-field"
                autocomplete="current-password"
                label="Contraseña"
                prepend-inner-icon="mdi-lock-outline"
                :rules="[rules.required, rules.password]"
                type="password"
              />

              <v-btn
                block
                class="mt-4"
                color="primary"
                :disabled="!formValid"
                :loading="authStore.loading"
                type="submit"
                variant="flat"
              >
                {{ submitLabel }}
              </v-btn>
            </v-form>

            <v-divider class="my-6">
              o
            </v-divider>

            <v-btn
              block
              color="primary"
              prepend-icon="mdi-google"
              :loading="authStore.loading"
              variant="tonal"
              @click="handleGoogleLogin"
            >
              Continuar con Google
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ThemeToggle from '../components/ThemeToggle.vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const mode = ref('login')
const formValid = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')

const submitLabel = computed(() => (mode.value === 'login' ? 'Ingresar' : 'Crear cuenta'))

const rules = {
  required: (value) => Boolean(value) || 'Este campo es obligatorio.',
  email: (value) => /.+@.+\..+/.test(value) || 'Ingresa un correo válido.',
  password: (value) => value.length >= 6 || 'Debe tener al menos 6 caracteres.',
}

async function handleSubmit() {
  if (!formValid.value) {
    return
  }

  try {
    if (mode.value === 'login') {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register({
        email: email.value,
        password: password.value,
        name: name.value,
      })
    }

    router.replace(route.query.redirect || '/dashboard')
  } catch {
    password.value = ''
  }
}

async function handleGoogleLogin() {
  try {
    await authStore.loginWithGoogle()
    notificationStore.success('Sesión iniciada con Google.')
    router.replace(route.query.redirect || '/dashboard')
  } catch {
    notificationStore.error(authStore.error)
  }
}
</script>
