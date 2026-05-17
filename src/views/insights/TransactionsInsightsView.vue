<template>
  <v-container class="controlcash-page-container controlcash-insight-page pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12" md="7">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-swap-horizontal-circle-outline" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Transacciones</div>
            <div class="text-body-medium text-medium-emphasis">
              Flujo, mezcla de movimientos y actividad reciente {{ selectedPeriodScopeLabel }}.
            </div>
          </div>
        </div>
      </v-col>
      <v-col class="d-flex justify-md-end" cols="12" md="5">
        <PeriodControls
          v-model="selectedPeriod"
          :items="periodOptions"
          @reset="resetSelectedPeriod"
          @show-all="showAllPeriods"
        />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col v-for="metric in metrics" :key="metric.title" cols="12" md="6" xl="3">
        <v-card class="controlcash-panel controlcash-metric fill-height" elevation="0">
          <v-card-text class="pa-5">
            <div class="d-flex align-start justify-space-between ga-3">
              <div>
                <div class="text-body-medium text-medium-emphasis">{{ metric.title }}</div>
                <div class="text-h5 font-weight-bold mt-1">{{ metric.value }}</div>
              </div>
              <v-avatar :color="metric.color" rounded="lg" size="44" variant="tonal">
                <v-icon :icon="metric.icon" />
              </v-avatar>
            </div>
            <div class="d-flex align-center ga-2 mt-4 text-body-small text-medium-emphasis">
              <v-icon :color="metric.color" :icon="metric.captionIcon" size="18" />
              <span>{{ metric.caption }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2" dense>
      <v-col cols="12" lg="7">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-line" />
              <span>{{ isAllPeriods ? 'Balance por periodo' : 'Balance de los últimos 6 meses' }}</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <svg class="controlcash-line-chart" viewBox="0 0 680 280" role="img">
              <polyline class="controlcash-chart-grid" points="48,42 640,42" />
              <polyline class="controlcash-chart-grid" points="48,104 640,104" />
              <polyline class="controlcash-chart-grid" points="48,166 640,166" />
              <polyline class="controlcash-chart-grid" points="48,228 640,228" />
              <polyline class="controlcash-line-area" :points="areaPoints" />
              <polyline class="controlcash-line-value" :points="linePoints" />
              <g v-for="point in trendPoints" :key="point.label">
                <circle class="controlcash-line-point" :cx="point.x" :cy="point.y" r="5" />
                <text class="controlcash-chart-label" :x="point.x" y="258">{{ point.label }}</text>
              </g>
            </svg>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-bar" />
              <span>Movimientos por tipo</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="typeRows.length" class="controlcash-bars">
              <div v-for="type in typeRows" :key="type.type" class="controlcash-bar-row">
                <div class="controlcash-bar-label">
                  <strong>{{ type.label }}</strong>
                  <span>{{ type.count }} movimientos</span>
                </div>
                <div class="controlcash-bar-track">
                  <div class="controlcash-bar-value" :style="{ width: `${type.width}%` }" />
                </div>
                <div class="controlcash-bar-amount">
                  <strong>{{ formatMoney(type.total) }}</strong>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2" dense>
      <v-col cols="12">
        <v-card class="controlcash-panel" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-history" />
              <span>Actividad reciente</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <v-list bg-color="transparent" class="pa-0">
              <v-list-item
                v-for="transaction in recentTransactions"
                :key="transaction.id"
                class="controlcash-list-item mb-3"
                rounded="lg"
              >
                <template #prepend>
                  <v-avatar :color="transaction.color" rounded="lg" size="38" variant="tonal">
                    <v-icon :icon="transaction.icon" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ transaction.description || transaction.label }}</v-list-item-title>
                <v-list-item-subtitle>{{ transaction.date }} · {{ transaction.label }}</v-list-item-subtitle>
                <template #append>
                  <strong>{{ formatMoney(transaction.amount) }}</strong>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import PeriodControls from '../../components/PeriodControls.vue'
import { getPeriodKey, usePeriodFilter } from '../../composables/usePeriodFilter'
import { useTransactionsStore } from '../../stores/transactions'

const transactionsStore = useTransactionsStore()
const {
  getTrendPeriods,
  isAllPeriods,
  matchesSelectedPeriod,
  periodOptions,
  resetSelectedPeriod,
  selectedPeriod,
  selectedPeriodScopeLabel,
  showAllPeriods,
} = usePeriodFilter()
const typeLabels = {
  income: 'Ingresos',
  expense: 'Gastos',
  transfer: 'Transferencias',
  card_purchase: 'Compras tarjeta',
  card_payment: 'Pagos tarjeta',
}
const typeIcons = {
  income: 'mdi-arrow-down-circle-outline',
  expense: 'mdi-arrow-up-circle-outline',
  transfer: 'mdi-swap-horizontal',
  card_purchase: 'mdi-credit-card-outline',
  card_payment: 'mdi-credit-card-check-outline',
}
const typeColors = {
  income: 'success',
  expense: 'error',
  transfer: 'primary',
  card_purchase: 'warning',
  card_payment: 'primary',
}
const periodTransactions = computed(() =>
  transactionsStore.items.filter((transaction) => matchesSelectedPeriod(transaction.date)),
)
const monthlyIncome = computed(() => sumByType('income'))
const monthlyExpense = computed(() => sumByTypes(['expense', 'card_purchase']))
const monthlyNet = computed(() => monthlyIncome.value - monthlyExpense.value)
const typeRows = computed(() => {
  const rows = Object.entries(typeLabels).map(([type, label]) => {
    const transactions = periodTransactions.value.filter((transaction) => transaction.type === type)
    return {
      type,
      label,
      count: transactions.length,
      total: transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    }
  })
  const maxValue = Math.max(...rows.map((row) => row.total), 1)
  return rows
    .filter((row) => row.count > 0)
    .map((row) => ({ ...row, width: Math.max((row.total / maxValue) * 100, 4) }))
})
const recentTransactions = computed(() =>
  [...periodTransactions.value]
    .sort((first, second) => String(second.date).localeCompare(first.date))
    .slice(0, 8)
    .map((transaction) => ({
      ...transaction,
      label: typeLabels[transaction.type] || transaction.type,
      icon: typeIcons[transaction.type] || 'mdi-swap-horizontal',
      color: typeColors[transaction.type] || 'primary',
    })),
)
const metrics = computed(() => [
  {
    title: isAllPeriods.value ? 'Balance total' : 'Balance mensual',
    value: formatMoney(monthlyNet.value),
    caption: `${formatMoney(monthlyIncome.value)} ingresos`,
    captionIcon: 'mdi-scale-balance',
    color: monthlyNet.value >= 0 ? 'success' : 'error',
    icon: 'mdi-finance',
  },
  {
    title: 'Ingresos',
    value: formatMoney(monthlyIncome.value),
    caption: isAllPeriods.value ? 'Entradas totales' : 'Entradas del periodo',
    captionIcon: 'mdi-arrow-down-circle-outline',
    color: 'success',
    icon: 'mdi-cash-plus',
  },
  {
    title: 'Gastos',
    value: formatMoney(monthlyExpense.value),
    caption: isAllPeriods.value ? 'Salidas totales' : 'Salidas del periodo',
    captionIcon: 'mdi-arrow-up-circle-outline',
    color: 'error',
    icon: 'mdi-receipt-text-outline',
  },
  {
    title: 'Movimientos',
    value: String(periodTransactions.value.length),
    caption: isAllPeriods.value ? 'Registrados en total' : 'Registrados en el periodo',
    captionIcon: 'mdi-counter',
    color: 'primary',
    icon: 'mdi-swap-horizontal-circle-outline',
  },
])
const trendMonths = computed(() => {
  const months = getTrendPeriods(transactionsStore.items)

  transactionsStore.items.forEach((transaction) => {
    const month = months.find((item) => item.key === getPeriodKey(transaction.date))
    if (!month) return
    const amount = Number(transaction.amount || 0)
    if (transaction.type === 'income') month.total += amount
    if (transaction.type === 'expense' || transaction.type === 'card_purchase') month.total -= amount
  })
  return months
})
const trendPoints = computed(() => getTrendPoints(trendMonths.value))
const linePoints = computed(() => trendPoints.value.map((point) => `${point.x},${point.y}`).join(' '))
const areaPoints = computed(() => {
  if (!trendPoints.value.length) return ''
  const points = trendPoints.value.map((point) => `${point.x},${point.y}`).join(' ')
  const first = trendPoints.value[0]
  const last = trendPoints.value[trendPoints.value.length - 1]
  return `${first.x},228 ${points} ${last.x},228`
})

onMounted(() => {
  transactionsStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  transactionsStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function sumByType(type) {
  return periodTransactions.value
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
}

function sumByTypes(types) {
  return periodTransactions.value
    .filter((transaction) => types.includes(transaction.type))
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
}

function getTrendPoints(months) {
  const maxAbs = Math.max(...months.map((month) => Math.abs(month.total)), 1)
  const step = 592 / Math.max(months.length - 1, 1)
  return months.map((month, index) => ({
    ...month,
    x: 48 + index * step,
    y: 135 - (month.total / maxAbs) * 93,
  }))
}
</script>

<style scoped>
@import './insightStyles.css';
</style>
