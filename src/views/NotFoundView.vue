<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="5" sm="8">
        <v-card class="text-center" elevation="2">
          <v-card-title class="text-headline-medium pt-8">
            Página no encontrada
          </v-card-title>

          <v-card-text>
            La ruta que intentas abrir no existe en ControlCash.
          </v-card-text>

          <v-card-actions class="justify-center pb-8">
            <v-btn color="primary" prepend-icon="mdi-view-dashboard-outline" to="/dashboard">
              Volver al dashboard
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
