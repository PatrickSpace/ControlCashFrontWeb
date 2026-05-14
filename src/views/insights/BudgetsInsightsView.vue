<template>
  <v-container class="controlcash-page-container controlcash-insight-page pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12" md="8">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-chart-donut" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Presupuestos</div>
            <div class="text-body-medium text-medium-emphasis">
              Uso mensual, riesgo de exceso y margen disponible.
            </div>
          </div>
        </div>
      </v-col>
      <v-col class="d-flex justify-md-end" cols="12" md="4">
        <v-chip color="primary" prepend-icon="mdi-calendar-month-outline" variant="tonal">
          Mes actual
        </v-chip>
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
      <v-col cols="12" lg="5">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-donut" />
              <span>Uso total</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5 text-center">
            <svg class="controlcash-donut" viewBox="0 0 220 220" role="img">
              <circle class="controlcash-donut-track" cx="110" cy="110" r="82" />
              <circle class="controlcash-donut-value" cx="110" cy="110" r="82" :stroke-dasharray="donutDashArray" />
              <text class="controlcash-donut-percent" x="110" y="104">{{ usageLabel }}</text>
              <text class="controlcash-donut-caption" x="110" y="130">usado</text>
            </svg>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-bar" />
              <span>Uso por presupuesto</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="budgetRows.length" class="controlcash-bars">
              <div v-for="budget in budgetRows" :key="budget.id" class="controlcash-bar-row">
                <div class="controlcash-bar-label">
                  <strong>{{ budget.name }}</strong>
                  <span>{{ budget.categoryLabel }}</span>
                </div>
                <div class="controlcash-bar-track">
                  <div
                    class="controlcash-bar-value"
                    :class="budget.usageClass"
                    :style="{ width: `${budget.percent}%` }"
                  />
                </div>
                <div class="controlcash-bar-amount">
                  <strong>{{ Math.round(budget.percent) }}%</strong>
                  <span>{{ formatMoney(budget.spent) }}</span>
                </div>
              </div>
            </div>
            <v-alert v-else color="primary" icon="mdi-chart-donut" variant="tonal">
              Crea presupuestos para analizar tus límites mensuales.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2" dense>
      <v-col cols="12">
        <v-card class="controlcash-panel" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-alert-outline" />
              <span>Presupuestos en riesgo</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <v-list bg-color="transparent" class="pa-0">
              <v-list-item
                v-for="budget in riskRows"
                :key="budget.id"
                class="controlcash-list-item mb-3"
                rounded="lg"
              >
                <template #prepend>
                  <v-avatar :color="budget.riskColor" rounded="lg" size="38" variant="tonal">
                    <v-icon icon="mdi-alert-circle-outline" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ budget.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ budget.categoryLabel }} · restante {{ formatMoney(budget.remaining) }}
                </v-list-item-subtitle>
                <template #append>
                  <strong>{{ Math.round(budget.percent) }}%</strong>
                </template>
              </v-list-item>
            </v-list>
            <v-alert v-if="!riskRows.length" color="success" icon="mdi-check-circle-outline" variant="tonal">
              Ningún presupuesto activo está por encima del 70% de uso.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import { useBudgetsStore } from '../../stores/budgets'
import { useCategoriesStore } from '../../stores/categories'
import { useTransactionsStore } from '../../stores/transactions'

const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const today = new Date()
const circumference = 515.22

const monthlyTransactions = computed(() =>
  transactionsStore.items.filter((transaction) => String(transaction.date || '').slice(0, 7) === formatMonthKey(today)),
)
const budgetRows = computed(() =>
  budgetsStore.activeBudgets
    .map((budget) => {
      const limit = Number(budget.limitAmount || 0)
      const spent = getCategoryExpense(budget.categoryId)
      const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
      const remaining = limit - spent
      return {
        ...budget,
        categoryLabel: getCategoryName(budget.categoryId),
        limit,
        percent,
        remaining,
        riskColor: percent >= 100 ? 'error' : percent >= 70 ? 'warning' : 'primary',
        spent,
        usageClass: percent >= 100 ? 'is-danger' : percent >= 70 ? 'is-warning' : '',
      }
    })
    .sort((first, second) => second.percent - first.percent),
)
const totalLimit = computed(() => budgetRows.value.reduce((total, budget) => total + budget.limit, 0))
const totalSpent = computed(() => budgetRows.value.reduce((total, budget) => total + budget.spent, 0))
const remainingTotal = computed(() => totalLimit.value - totalSpent.value)
const overLimitCount = computed(() => budgetRows.value.filter((budget) => budget.spent > budget.limit).length)
const usagePercent = computed(() =>
  totalLimit.value > 0 ? Math.min((totalSpent.value / totalLimit.value) * 100, 100) : 0,
)
const usageLabel = computed(() => `${Math.round(usagePercent.value)}%`)
const donutDashArray = computed(() => {
  const used = (circumference * usagePercent.value) / 100
  return `${used} ${circumference - used}`
})
const riskRows = computed(() => budgetRows.value.filter((budget) => budget.percent >= 70))
const metrics = computed(() => [
  {
    title: 'Presupuesto total',
    value: formatMoney(totalLimit.value),
    caption: `${budgetRows.value.length} activos`,
    captionIcon: 'mdi-chart-donut',
    color: 'primary',
    icon: 'mdi-wallet-bifold-outline',
  },
  {
    title: 'Usado',
    value: formatMoney(totalSpent.value),
    caption: `${usageLabel.value} del límite`,
    captionIcon: 'mdi-chart-bar',
    color: usagePercent.value >= 70 ? 'warning' : 'success',
    icon: 'mdi-receipt-text-outline',
  },
  {
    title: 'Restante',
    value: formatMoney(remainingTotal.value),
    caption: remainingTotal.value >= 0 ? 'Disponible' : 'Excedido',
    captionIcon: remainingTotal.value >= 0 ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline',
    color: remainingTotal.value >= 0 ? 'success' : 'error',
    icon: 'mdi-wallet-plus-outline',
  },
  {
    title: 'Excedidos',
    value: String(overLimitCount.value),
    caption: 'Presupuestos sobre límite',
    captionIcon: 'mdi-alert-outline',
    color: overLimitCount.value > 0 ? 'error' : 'success',
    icon: 'mdi-alert-circle-outline',
  },
])

onMounted(() => {
  budgetsStore.subscribeRealtime()
  categoriesStore.subscribeRealtime()
  transactionsStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  budgetsStore.stopRealtime()
  categoriesStore.stopRealtime()
  transactionsStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getCategoryName(categoryId) {
  return categoriesStore.items.find((category) => category.id === categoryId)?.name || 'Sin categoría'
}

function getCategoryExpense(categoryId) {
  return monthlyTransactions.value.reduce((total, transaction) => {
    if (transaction.categoryId !== categoryId) return total
    if (transaction.type === 'expense' || transaction.type === 'card_purchase') {
      return total + Number(transaction.amount || 0)
    }
    return total
  }, 0)
}
</script>

<style scoped>
@import './insightStyles.css';
</style>
