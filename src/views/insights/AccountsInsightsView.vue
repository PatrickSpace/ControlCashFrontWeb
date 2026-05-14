<template>
  <v-container class="controlcash-page-container controlcash-insight-page pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12" md="8">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-wallet-outline" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Cuentas</div>
            <div class="text-body-medium text-medium-emphasis">
              Saldos, composición y movimiento neto de tus cuentas.
            </div>
          </div>
        </div>
      </v-col>
      <v-col class="d-flex justify-md-end" cols="12" md="4">
        <v-chip color="primary" prepend-icon="mdi-wallet-outline" variant="tonal">
          {{ activeAccounts.length }} activas
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
      <v-col cols="12" lg="7">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-bar" />
              <span>Saldos por cuenta</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="accountRows.length" class="controlcash-bars">
              <div v-for="account in accountRows" :key="account.id" class="controlcash-bar-row">
                <div class="controlcash-bar-label">
                  <strong>{{ account.name }}</strong>
                  <span>{{ account.typeLabel }}</span>
                </div>
                <div class="controlcash-bar-track">
                  <div
                    class="controlcash-bar-value"
                    :class="{ 'is-danger': account.balance < 0 }"
                    :style="{ width: `${account.width}%` }"
                  />
                </div>
                <div class="controlcash-bar-amount">
                  <strong>{{ formatMoney(account.balance) }}</strong>
                  <span>{{ account.isActive === false ? 'Inactiva' : 'Activa' }}</span>
                </div>
              </div>
            </div>
            <v-alert v-else color="primary" icon="mdi-wallet-plus-outline" variant="tonal">
              Crea cuentas para analizar tus saldos.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-donut" />
              <span>Composición de activos</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <svg class="controlcash-donut" viewBox="0 0 220 220" role="img">
              <circle class="controlcash-donut-track" cx="110" cy="110" r="82" />
              <circle class="controlcash-donut-value" cx="110" cy="110" r="82" :stroke-dasharray="donutDashArray" />
              <text class="controlcash-donut-percent" x="110" y="104">{{ savingsShareLabel }}</text>
              <text class="controlcash-donut-caption" x="110" y="130">ahorro/inversión</text>
            </svg>
            <v-list bg-color="transparent" class="pa-0 mt-2">
              <v-list-item
                v-for="type in accountTypeRows"
                :key="type.type"
                class="controlcash-list-item mb-3"
                rounded="lg"
              >
                <v-list-item-title>{{ type.label }}</v-list-item-title>
                <template #append>
                  <strong>{{ formatMoney(type.total) }}</strong>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2" dense>
      <v-col cols="12">
        <v-card class="controlcash-panel" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-line" />
              <span>Movimiento neto mensual</span>
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
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import { useAccountsStore } from '../../stores/accounts'
import { useTransactionsStore } from '../../stores/transactions'

const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()
const today = new Date()
const circumference = 515.22

const accountTypeLabels = {
  cash: 'Efectivo',
  bank: 'Banco',
  savings: 'Ahorros',
  credit: 'Crédito',
  investments: 'Inversiones',
}

const activeAccounts = computed(() => accountsStore.activeAccounts)
const accountRows = computed(() => {
  const rows = accountsStore.items.map((account) => ({
    ...account,
    balance: getAccountBalance(account.id),
    typeLabel: accountTypeLabels[account.type] || account.type,
  }))
  const maxBalance = Math.max(...rows.map((account) => Math.abs(account.balance)), 1)

  return rows
    .map((account) => ({
      ...account,
      width: Math.max((Math.abs(account.balance) / maxBalance) * 100, 4),
    }))
    .sort((first, second) => second.balance - first.balance)
})
const totalPositiveBalance = computed(() =>
  accountRows.value.reduce((total, account) => total + Math.max(account.balance, 0), 0),
)
const totalNegativeBalance = computed(() =>
  accountRows.value.reduce((total, account) => total + Math.abs(Math.min(account.balance, 0)), 0),
)
const netBalance = computed(() => totalPositiveBalance.value - totalNegativeBalance.value)
const bestAccount = computed(() => accountRows.value[0])
const savingsAndInvestmentsTotal = computed(() =>
  accountRows.value
    .filter((account) => ['savings', 'investments'].includes(account.type))
    .reduce((total, account) => total + Math.max(account.balance, 0), 0),
)
const savingsShare = computed(() =>
  totalPositiveBalance.value > 0
    ? Math.min((savingsAndInvestmentsTotal.value / totalPositiveBalance.value) * 100, 100)
    : 0,
)
const savingsShareLabel = computed(() => `${Math.round(savingsShare.value)}%`)
const donutDashArray = computed(() => {
  const used = (circumference * savingsShare.value) / 100
  return `${used} ${circumference - used}`
})
const accountTypeRows = computed(() =>
  Object.entries(accountTypeLabels)
    .map(([type, label]) => ({
      type,
      label,
      total: accountRows.value
        .filter((account) => account.type === type)
        .reduce((sum, account) => sum + Math.max(account.balance, 0), 0),
    }))
    .filter((type) => type.total > 0),
)
const metrics = computed(() => [
  {
    title: 'Balance neto',
    value: formatMoney(netBalance.value),
    caption: `${formatMoney(totalPositiveBalance.value)} positivos`,
    captionIcon: 'mdi-scale-balance',
    color: netBalance.value >= 0 ? 'success' : 'error',
    icon: 'mdi-wallet-outline',
  },
  {
    title: 'Saldos positivos',
    value: formatMoney(totalPositiveBalance.value),
    caption: 'Disponible en cuentas',
    captionIcon: 'mdi-arrow-up-circle-outline',
    color: 'success',
    icon: 'mdi-bank-outline',
  },
  {
    title: 'Saldos negativos',
    value: formatMoney(totalNegativeBalance.value),
    caption: 'Cuentas bajo cero',
    captionIcon: 'mdi-arrow-down-circle-outline',
    color: totalNegativeBalance.value > 0 ? 'warning' : 'success',
    icon: 'mdi-alert-circle-outline',
  },
  {
    title: 'Cuenta principal',
    value: bestAccount.value?.name || '-',
    caption: bestAccount.value ? formatMoney(bestAccount.value.balance) : 'Sin datos',
    captionIcon: 'mdi-star-outline',
    color: 'primary',
    icon: 'mdi-wallet-outline',
  },
])
const trendMonths = computed(() => {
  const months = []
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1)
    months.push({ key: formatMonthKey(date), label: getShortMonthLabel(date), total: 0 })
  }
  transactionsStore.items.forEach((transaction) => {
    const month = months.find((item) => item.key === String(transaction.date || '').slice(0, 7))
    if (!month) return
    const amount = Number(transaction.amount || 0)
    if (transaction.type === 'income') month.total += amount
    if (transaction.type === 'expense' || transaction.type === 'card_payment') month.total -= amount
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
  accountsStore.subscribeRealtime()
  transactionsStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  accountsStore.stopRealtime()
  transactionsStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getShortMonthLabel(date) {
  return date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')
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

function getAccountBalance(accountId) {
  return transactionsStore.items.reduce((balance, transaction) => {
    const amount = Number(transaction.amount || 0)
    if (transaction.type === 'income' && transaction.accountId === accountId) return balance + amount
    if (transaction.type === 'expense' && transaction.accountId === accountId) return balance - amount
    if (transaction.type === 'card_payment' && transaction.accountId === accountId) return balance - amount
    if (transaction.type === 'transfer' && transaction.accountId === accountId) return balance - amount
    if (transaction.type === 'transfer' && transaction.destinationAccountId === accountId) return balance + amount
    return balance
  }, 0)
}
</script>

<style scoped>
@import './insightStyles.css';
</style>
