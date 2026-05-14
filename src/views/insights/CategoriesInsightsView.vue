<template>
  <v-container class="controlcash-page-container controlcash-insight-page pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12" md="8">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-shape-plus-outline" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Categorías</div>
            <div class="text-body-medium text-medium-emphasis">
              Clasificación de ingresos y gastos del mes actual.
            </div>
          </div>
        </div>
      </v-col>
      <v-col class="d-flex justify-md-end" cols="12" md="4">
        <v-chip color="primary" prepend-icon="mdi-shape-outline" variant="tonal">
          {{ activeCategories.length }} activas
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
              <span>Tipos de categoría</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5 text-center">
            <svg class="controlcash-donut" viewBox="0 0 220 220" role="img">
              <circle class="controlcash-donut-track" cx="110" cy="110" r="82" />
              <circle class="controlcash-donut-value" cx="110" cy="110" r="82" :stroke-dasharray="donutDashArray" />
              <text class="controlcash-donut-percent" x="110" y="104">{{ expenseCategoryShareLabel }}</text>
              <text class="controlcash-donut-caption" x="110" y="130">gasto</text>
            </svg>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-bar" />
              <span>Gastos por categoría</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="expenseRows.length" class="controlcash-bars">
              <div v-for="category in expenseRows" :key="category.id" class="controlcash-bar-row">
                <div class="controlcash-bar-label">
                  <strong>{{ category.name }}</strong>
                  <span>{{ category.share }}% del gasto</span>
                </div>
                <div class="controlcash-bar-track">
                  <div class="controlcash-bar-value is-danger" :style="{ width: `${category.width}%` }" />
                </div>
                <div class="controlcash-bar-amount">
                  <strong>{{ formatMoney(category.total) }}</strong>
                </div>
              </div>
            </div>
            <v-alert v-else color="primary" icon="mdi-receipt-text-outline" variant="tonal">
              Registra gastos con categoría para ver este análisis.
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
              <v-icon color="primary" icon="mdi-cash-plus" />
              <span>Ingresos por categoría</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="incomeRows.length" class="controlcash-bars">
              <div v-for="category in incomeRows" :key="category.id" class="controlcash-bar-row">
                <div class="controlcash-bar-label">
                  <strong>{{ category.name }}</strong>
                  <span>{{ category.share }}% del ingreso</span>
                </div>
                <div class="controlcash-bar-track">
                  <div class="controlcash-bar-value" :style="{ width: `${category.width}%` }" />
                </div>
                <div class="controlcash-bar-amount">
                  <strong>{{ formatMoney(category.total) }}</strong>
                </div>
              </div>
            </div>
            <v-alert v-else color="primary" icon="mdi-cash-plus" variant="tonal">
              Registra ingresos con categoría para ver este análisis.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import { useCategoriesStore } from '../../stores/categories'
import { useTransactionsStore } from '../../stores/transactions'

const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const today = new Date()
const circumference = 515.22

const activeCategories = computed(() => categoriesStore.activeCategories)
const incomeCategories = computed(() => activeCategories.value.filter((category) => getCategoryType(category) === 'income'))
const expenseCategories = computed(() => activeCategories.value.filter((category) => getCategoryType(category) === 'expense'))
const monthlyTransactions = computed(() =>
  transactionsStore.items.filter((transaction) => String(transaction.date || '').slice(0, 7) === formatMonthKey(today)),
)
const expenseRows = computed(() => buildCategoryRows('expense'))
const incomeRows = computed(() => buildCategoryRows('income'))
const monthlyExpenseTotal = computed(() => expenseRows.value.reduce((total, row) => total + row.total, 0))
const monthlyIncomeTotal = computed(() => incomeRows.value.reduce((total, row) => total + row.total, 0))
const topExpense = computed(() => expenseRows.value[0])
const topIncome = computed(() => incomeRows.value[0])
const expenseCategoryShare = computed(() =>
  activeCategories.value.length > 0 ? (expenseCategories.value.length / activeCategories.value.length) * 100 : 0,
)
const expenseCategoryShareLabel = computed(() => `${Math.round(expenseCategoryShare.value)}%`)
const donutDashArray = computed(() => {
  const used = (circumference * expenseCategoryShare.value) / 100
  return `${used} ${circumference - used}`
})
const metrics = computed(() => [
  {
    title: 'Categorías',
    value: String(activeCategories.value.length),
    caption: `${incomeCategories.value.length} ingresos · ${expenseCategories.value.length} gastos`,
    captionIcon: 'mdi-shape-outline',
    color: 'primary',
    icon: 'mdi-shape-plus-outline',
  },
  {
    title: 'Gasto mensual',
    value: formatMoney(monthlyExpenseTotal.value),
    caption: topExpense.value ? `Mayor: ${topExpense.value.name}` : 'Sin gastos categorizados',
    captionIcon: 'mdi-arrow-up-circle-outline',
    color: 'error',
    icon: 'mdi-receipt-text-outline',
  },
  {
    title: 'Ingreso mensual',
    value: formatMoney(monthlyIncomeTotal.value),
    caption: topIncome.value ? `Mayor: ${topIncome.value.name}` : 'Sin ingresos categorizados',
    captionIcon: 'mdi-arrow-down-circle-outline',
    color: 'success',
    icon: 'mdi-cash-plus',
  },
  {
    title: 'Sin categoría',
    value: String(uncategorizedCount.value),
    caption: 'Movimientos del mes',
    captionIcon: 'mdi-tag-off-outline',
    color: uncategorizedCount.value > 0 ? 'warning' : 'success',
    icon: 'mdi-tag-outline',
  },
])
const uncategorizedCount = computed(() =>
  monthlyTransactions.value.filter(
    (transaction) => ['income', 'expense'].includes(transaction.type) && !transaction.categoryId,
  ).length,
)

onMounted(() => {
  categoriesStore.subscribeRealtime()
  transactionsStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  categoriesStore.stopRealtime()
  transactionsStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getCategoryType(category) {
  return category.type || 'expense'
}

function buildCategoryRows(type) {
  const totals = monthlyTransactions.value.reduce((result, transaction) => {
    if (transaction.type !== type || !transaction.categoryId) return result
    result[transaction.categoryId] = (result[transaction.categoryId] || 0) + Number(transaction.amount || 0)
    return result
  }, {})
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0)
  const maxValue = Math.max(...Object.values(totals), 1)

  return Object.entries(totals)
    .map(([categoryId, amount]) => ({
      id: categoryId,
      name: categoriesStore.items.find((category) => category.id === categoryId)?.name || 'Sin categoría',
      share: total > 0 ? Math.round((amount / total) * 100) : 0,
      total: amount,
      width: Math.max((amount / maxValue) * 100, 4),
    }))
    .sort((first, second) => second.total - first.total)
}
</script>

<style scoped>
@import './insightStyles.css';
</style>
