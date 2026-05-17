<template>
  <v-container class="controlcash-page-container controlcash-functions-page pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-cloud-check-outline" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Prueba Functions</div>
            <div class="text-body-medium text-medium-emphasis">
              Ejecuta la función HTTP de ejemplo publicada en Firebase.
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-card class="controlcash-panel" elevation="0">
      <v-card-title class="controlcash-card-title px-5 py-4">
        <div class="d-flex align-center ga-3">
          <v-icon color="primary" icon="mdi-function-variant" />
          <span>helloControlCash</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-5">
        <v-text-field
          v-model="functionUrl"
          class="controlcash-field"
          density="comfortable"
          label="URL de la función"
          prepend-inner-icon="mdi-link-variant"
          variant="outlined"
        />

        <div class="d-flex flex-wrap ga-3 mt-2">
          <v-btn
            color="primary"
            :loading="loading"
            prepend-icon="mdi-play-circle-outline"
            variant="tonal"
            @click="testFunction"
          >
            Probar función
          </v-btn>

          <v-btn
            :disabled="loading"
            prepend-icon="mdi-refresh"
            variant="text"
            @click="resetFunctionUrl"
          >
            Restaurar URL
          </v-btn>
        </div>

        <v-alert
          v-if="error"
          class="mt-5"
          color="error"
          density="comfortable"
          icon="mdi-alert-circle-outline"
          variant="tonal"
        >
          {{ error }}
        </v-alert>

        <pre v-if="errorDetails" class="controlcash-function-response mt-4">{{ formattedErrorDetails }}</pre>

        <v-alert
          v-if="result"
          class="mt-5"
          color="success"
          density="comfortable"
          icon="mdi-check-circle-outline"
          variant="tonal"
        >
          La función respondió correctamente.
        </v-alert>

        <pre v-if="result" class="controlcash-function-response mt-4">{{ formattedResult }}</pre>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'

const defaultFunctionUrl = getDefaultFunctionUrl()
const functionUrl = ref(defaultFunctionUrl)
const loading = ref(false)
const result = ref(null)
const error = ref('')
const errorDetails = ref(null)

const formattedResult = computed(() => JSON.stringify(result.value, null, 2))
const formattedErrorDetails = computed(() => JSON.stringify(errorDetails.value, null, 2))

function resetFunctionUrl() {
  functionUrl.value = defaultFunctionUrl
}

async function testFunction() {
  if (!functionUrl.value) {
    error.value = 'Ingresa la URL de la función.'
    return
  }

  loading.value = true
  error.value = ''
  errorDetails.value = null
  result.value = null

  try {
    const response = await fetch(functionUrl.value)
    const contentType = response.headers.get('content-type') || ''
    const responseBody = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      const httpError = new Error(`La función respondió con HTTP ${response.status}.`)
      httpError.details = {
        body: responseBody,
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      }
      throw httpError
    }

    result.value = responseBody
  } catch (requestError) {
    error.value = getReadableErrorMessage(requestError)
    errorDetails.value = buildErrorDetails(requestError)
  } finally {
    loading.value = false
  }
}

function getReadableErrorMessage(requestError) {
  const message = requestError?.message || 'No se pudo ejecutar la función.'

  if (message === 'Load failed' || message === 'Failed to fetch') {
    return 'No se pudo cargar la función. Puede ser CORS, URL incorrecta, función no desplegada o un bloqueo de red.'
  }

  return message
}

function buildErrorDetails(requestError) {
  return {
    errorName: requestError?.name || 'Error',
    errorMessage: requestError?.message || 'Sin mensaje',
    functionUrl: functionUrl.value,
    hint: getErrorHint(requestError),
    httpDetails: requestError?.details || null,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  }
}

function getErrorHint(requestError) {
  const message = requestError?.message || ''

  if (message === 'Load failed' || message === 'Failed to fetch') {
    return 'Revisa que la URL abra en una pestaña, que la función esté desplegada y que tenga headers CORS. Si usas emulador, revisa que esté encendido.'
  }

  return 'Revisa el status, body y logs de Firebase Functions.'
}

function getDefaultFunctionUrl() {
  const explicitUrl = import.meta.env.VITE_HELLO_FUNCTION_URL

  if (explicitUrl) {
    return explicitUrl
  }

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1'

  return projectId ? `https://${region}-${projectId}.cloudfunctions.net/helloControlCash` : ''
}
</script>

<style scoped>
.controlcash-functions-page {
  max-width: 1000px;
}

.controlcash-function-response {
  background: rgba(15, 23, 42, 0.88);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  overflow-x: auto;
  padding: 16px;
}
</style>
