<template>
  <v-container class="controlcash-page-container pa-4 pa-md-8" fluid>
    <v-row class="mb-2" dense>
      <v-col cols="12">
        <div class="text-medium-emphasis text-title-large">Disponible</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="4" md="5">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-text class="d-flex align-center justify-center pa-4 pa-md-8">
            <v-progress-circular
              color="primary"
              :model-value="76"
              rotate="-90"
              :size="mobile ? 220 : 260"
              :width="mobile ? 18 : 22"
            >
              <div class="text-center">
                <v-icon color="primary" icon="mdi-currency-usd" size="44" />
                <div class="text-body-small text-medium-emphasis mt-2">Puedes gastar:</div>
                <div class="d-flex align-end justify-center mt-1">
                  <span class="text-title-large text-medium-emphasis mr-1">S/.</span>
                  <span class="text-display-small">1,325</span>
                </div>
                <div class="d-flex align-center justify-center ga-2 mt-4 text-body-small">
                  <v-icon color="primary" icon="mdi-credit-card-outline" />
                  <span>Usando tu tarjeta: <strong>Interbank</strong></span>
                </div>
              </div>
            </v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4" md="7">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-6 py-4">
            Activos
          </v-card-title>
          <v-card-text class="pa-4 pa-md-6">
            <v-list bg-color="transparent" class="pa-0">
              <v-list-item
                v-for="asset in assets"
                :key="asset.title"
                class="controlcash-list-item mb-4"
                :subtitle="asset.amount"
                :title="asset.title"
                rounded="lg"
              >
                <template #prepend>
                  <v-icon color="primary" icon="mdi-account-cash-outline" />
                </template>
                <template #append>
                  <v-icon icon="mdi-chevron-right" />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-6 py-4">
            Pasivos
          </v-card-title>
          <v-card-text class="pa-4 pa-md-6">
            <v-list bg-color="transparent" class="pa-0">
              <v-list-item
                v-for="liability in liabilities"
                :key="liability.title"
                class="controlcash-list-item mb-4"
                :subtitle="liability.amount"
                :title="liability.title"
                rounded="lg"
              >
                <template #prepend>
                  <v-icon color="primary" icon="mdi-account-cash-outline" />
                </template>
                <template #append>
                  <v-icon icon="mdi-chevron-right" />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-alert class="controlcash-panel" color="primary" icon="mdi-information-outline" variant="tonal">
          Base visual aplicada. Los valores mostrados son placeholders hasta conectar los servicios CRUD.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const assets = [
  { title: 'Saldo bancario BBVA', amount: 'S/. 1200.00' },
  { title: 'Saldo bancario Interbank', amount: 'S/. 200.00' },
]

const liabilities = [
  { title: 'Saldo bancario BBVA', amount: 'S/. 1200.00' },
  { title: 'Saldo bancario BBVA', amount: 'S/. 1200.00' },
  { title: 'Saldo bancario BBVA', amount: 'S/. 1200.00' },
]
</script>
