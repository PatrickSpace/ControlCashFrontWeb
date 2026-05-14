<template>
  <v-container class="controlcash-page-container controlcash-credit-page pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12" md="8">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-credit-card-search-outline" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Tarjetas de crédito</div>
            <div class="text-body-medium text-medium-emphasis">
              Uso, deuda, pagos y tendencia de compras con crédito.
            </div>
          </div>
        </div>
      </v-col>

      <v-col class="d-flex justify-md-end" cols="12" md="4">
        <v-chip color="primary" prepend-icon="mdi-credit-card-multiple-outline" variant="tonal">
          {{ activeCards.length }} activas
        </v-chip>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col v-for="metric in metrics" :key="metric.title" cols="12" md="6" xl="3">
        <v-card class="controlcash-panel controlcash-credit-metric fill-height" elevation="0">
          <v-card-text class="pa-5">
            <div class="d-flex align-start justify-space-between ga-3">
              <div>
                <div class="text-body-medium text-medium-emphasis">{{ metric.title }}</div>
                <div class="text-h5 font-weight-bold mt-1">{{ metric.value }}</div>
              </div>
              <v-avatar :color="metric.color" rounded="lg" size="44" variant="tonal">
                <v-icon :icon="metric.icon" size="24" />
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
              <span>Uso total de línea</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div class="controlcash-donut-wrap">
              <svg class="controlcash-donut" viewBox="0 0 220 220" role="img">
                <circle class="controlcash-donut-track" cx="110" cy="110" r="82" />
                <circle
                  class="controlcash-donut-value"
                  cx="110"
                  cy="110"
                  r="82"
                  :stroke-dasharray="donutDashArray"
                  stroke-dashoffset="0"
                />
                <text class="controlcash-donut-percent" x="110" y="104">{{ totalUsageLabel }}</text>
                <text class="controlcash-donut-caption" x="110" y="130">usado</text>
              </svg>
            </div>

            <v-list bg-color="transparent" class="pa-0 mt-2">
              <v-list-item class="controlcash-list-item mb-3" rounded="lg">
                <template #prepend>
                  <v-avatar color="warning" rounded="lg" size="38" variant="tonal">
                    <v-icon icon="mdi-credit-card-clock-outline" />
                  </v-avatar>
                </template>
                <v-list-item-title>Crédito usado</v-list-item-title>
                <v-list-item-subtitle>{{ formatMoney(totalDebt) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item class="controlcash-list-item" rounded="lg">
                <template #prepend>
                  <v-avatar color="success" rounded="lg" size="38" variant="tonal">
                    <v-icon icon="mdi-credit-card-check-outline" />
                  </v-avatar>
                </template>
                <v-list-item-title>Crédito disponible</v-list-item-title>
                <v-list-item-subtitle>{{ formatMoney(availableCredit) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-chart-bar" />
              <span>Uso por tarjeta</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="cardRows.length" class="controlcash-bars">
              <div v-for="card in cardRows" :key="card.id" class="controlcash-bar-row">
                <div class="controlcash-bar-label">
                  <strong>{{ card.name }}</strong>
                  <span>{{ card.bank }}</span>
                </div>
                <div class="controlcash-bar-track">
                  <div
                    class="controlcash-bar-value"
                    :class="card.usageClass"
                    :style="{ width: `${card.usage}%` }"
                  />
                </div>
                <div class="controlcash-bar-amount">
                  <strong>{{ Math.round(card.usage) }}%</strong>
                  <span>{{ formatMoney(card.debt) }}</span>
                </div>
              </div>
            </div>

            <v-alert
              v-else
              color="primary"
              icon="mdi-credit-card-plus-outline"
              variant="tonal"
            >
              Registra tarjetas para ver su uso de línea.
            </v-alert>
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
              <span>Compras con crédito por mes</span>
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
              <v-icon color="primary" icon="mdi-calendar-alert-outline" />
              <span>Próximos pagos</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <v-list bg-color="transparent" class="pa-0">
              <v-list-item
                v-for="card in upcomingPaymentRows"
                :key="card.id"
                class="controlcash-list-item mb-3"
                rounded="lg"
              >
                <template #prepend>
                  <v-avatar :color="card.paymentColor" rounded="lg" size="38" variant="tonal">
                    <v-icon icon="mdi-calendar-clock-outline" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ card.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Pago {{ card.paymentDateLabel }} · Cierre día {{ card.billingDay }}
                </v-list-item-subtitle>
                <template #append>
                  <div class="text-right controlcash-payment-summary">
                    <div class="font-weight-bold">{{ formatMoney(card.debt) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ card.daysToPayment }} días
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <v-alert
              v-if="!upcomingPaymentRows.length"
              color="success"
              icon="mdi-check-circle-outline"
              variant="tonal"
            >
              No hay tarjetas activas con deuda pendiente.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import { useCardsStore } from '../../stores/cards'
import { useTransactionsStore } from '../../stores/transactions'

const cardsStore = useCardsStore()
const transactionsStore = useTransactionsStore()
const today = new Date()

const activeCards = computed(() => cardsStore.activeCards)

const cardRows = computed(() =>
  activeCards.value
    .map((card) => {
      const limit = Number(card.creditLimit || 0)
      const debt = Math.max(getCardDebt(card.id), 0)
      const usage = limit > 0 ? Math.min((debt / limit) * 100, 100) : 0

      return {
        ...card,
        available: Math.max(limit - debt, 0),
        debt,
        limit,
        usage,
        usageClass: usage >= 85 ? 'is-danger' : usage >= 65 ? 'is-warning' : 'is-primary',
      }
    })
    .sort((first, second) => second.debt - first.debt),
)

const totalLimit = computed(() => cardRows.value.reduce((total, card) => total + card.limit, 0))
const totalDebt = computed(() => cardRows.value.reduce((total, card) => total + card.debt, 0))
const availableCredit = computed(() => Math.max(totalLimit.value - totalDebt.value, 0))
const totalUsage = computed(() =>
  totalLimit.value > 0 ? Math.min((totalDebt.value / totalLimit.value) * 100, 100) : 0,
)
const totalUsageLabel = computed(() => `${Math.round(totalUsage.value)}%`)
const donutDashArray = computed(() => {
  const circumference = 515.22
  const used = (circumference * totalUsage.value) / 100

  return `${used} ${circumference - used}`
})

const mostUsedCard = computed(() => cardRows.value[0])
const nextPaymentCard = computed(() => upcomingPaymentRows.value[0])

const metrics = computed(() => [
  {
    title: 'Línea total',
    value: formatMoney(totalLimit.value),
    caption: `${activeCards.value.length} tarjetas activas`,
    captionIcon: 'mdi-credit-card-multiple-outline',
    color: 'primary',
    icon: 'mdi-credit-card-outline',
  },
  {
    title: 'Deuda actual',
    value: formatMoney(totalDebt.value),
    caption: `${totalUsageLabel.value} de uso total`,
    captionIcon: 'mdi-chart-donut',
    color: totalUsage.value >= 75 ? 'warning' : 'success',
    icon: 'mdi-credit-card-clock-outline',
  },
  {
    title: 'Disponible',
    value: formatMoney(availableCredit.value),
    caption: 'Línea no utilizada',
    captionIcon: 'mdi-credit-card-check-outline',
    color: 'success',
    icon: 'mdi-wallet-plus-outline',
  },
  {
    title: 'Mayor saldo',
    value: mostUsedCard.value ? mostUsedCard.value.name : '-',
    caption: mostUsedCard.value ? formatMoney(mostUsedCard.value.debt) : 'Sin deuda registrada',
    captionIcon: 'mdi-alert-circle-outline',
    color: mostUsedCard.value?.usage >= 75 ? 'warning' : 'primary',
    icon: 'mdi-credit-card-search-outline',
  },
])

const trendMonths = computed(() => {
  const months = []

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1)

    months.push({
      key: formatMonthKey(date),
      label: date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', ''),
      total: 0,
    })
  }

  transactionsStore.items.forEach((transaction) => {
    if (!isCreditPurchase(transaction)) {
      return
    }

    const month = months.find((item) => item.key === String(transaction.date || '').slice(0, 7))

    if (month) {
      month.total += Number(transaction.amount || 0)
    }
  })

  return months
})

const trendPoints = computed(() => {
  const maxValue = Math.max(...trendMonths.value.map((month) => month.total), 1)
  const width = 592
  const step = width / Math.max(trendMonths.value.length - 1, 1)

  return trendMonths.value.map((month, index) => ({
    ...month,
    x: 48 + index * step,
    y: 228 - (month.total / maxValue) * 186,
  }))
})

const linePoints = computed(() =>
  trendPoints.value.map((point) => `${point.x},${point.y}`).join(' '),
)

const areaPoints = computed(() => {
  if (!trendPoints.value.length) {
    return ''
  }

  const points = trendPoints.value.map((point) => `${point.x},${point.y}`).join(' ')
  const first = trendPoints.value[0]
  const last = trendPoints.value[trendPoints.value.length - 1]

  return `${first.x},228 ${points} ${last.x},228`
})

const upcomingPaymentRows = computed(() =>
  cardRows.value
    .filter((card) => card.debt > 0)
    .map((card) => {
      const paymentDate = getNextDayDate(card.paymentDueDay)
      const daysToPayment = getDaysBetween(today, paymentDate)

      return {
        ...card,
        daysToPayment,
        paymentColor: daysToPayment <= 5 ? 'error' : daysToPayment <= 10 ? 'warning' : 'primary',
        paymentDateLabel: paymentDate.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
        }),
      }
    })
    .sort((first, second) => first.daysToPayment - second.daysToPayment),
)

onMounted(() => {
  cardsStore.subscribeRealtime()
  transactionsStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  cardsStore.stopRealtime()
  transactionsStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function isCreditPurchase(transaction) {
  return (
    transaction.type === 'card_purchase' ||
    (transaction.type === 'expense' && transaction.paymentMethod === 'credit')
  )
}

function getCardDebt(cardId) {
  return transactionsStore.items.reduce((debt, transaction) => {
    const amount = Number(transaction.amount || 0)

    if (transaction.cardId !== cardId) {
      return debt
    }

    if (isCreditPurchase(transaction)) {
      return debt + amount
    }

    if (transaction.type === 'card_payment') {
      return debt - amount
    }

    return debt
  }, 0)
}

function getNextDayDate(dayOfMonth) {
  const safeDay = Math.min(Math.max(Number(dayOfMonth || 1), 1), 31)
  const nextDate = new Date(today.getFullYear(), today.getMonth(), safeDay)

  if (nextDate < startOfToday()) {
    nextDate.setMonth(nextDate.getMonth() + 1)
  }

  return nextDate
}

function startOfToday() {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function getDaysBetween(startDate, endDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  return Math.max(Math.ceil((endDate - startOfToday(startDate)) / millisecondsPerDay), 0)
}
</script>

<style scoped>
.controlcash-credit-page {
  max-width: 1600px;
}

.controlcash-credit-metric {
  min-height: 148px;
}

.controlcash-donut-wrap {
  display: grid;
  place-items: center;
}

.controlcash-donut {
  max-width: 280px;
  width: min(100%, 280px);
}

.controlcash-donut-track,
.controlcash-donut-value {
  fill: none;
  stroke-width: 22;
  transform: rotate(-90deg);
  transform-origin: 110px 110px;
}

.controlcash-donut-track {
  stroke: rgba(148, 163, 184, 0.24);
}

.controlcash-donut-value {
  stroke: rgb(var(--v-theme-primary));
  stroke-linecap: round;
  transition: stroke-dasharray 720ms var(--cc-ease-emphasized);
}

.controlcash-donut-percent,
.controlcash-donut-caption {
  fill: currentColor;
  text-anchor: middle;
}

.controlcash-donut-percent {
  font-size: 28px;
  font-weight: 700;
}

.controlcash-donut-caption {
  font-size: 13px;
  opacity: 0.68;
}

.controlcash-bars {
  display: grid;
  gap: 18px;
}

.controlcash-bar-row {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(120px, 180px) 1fr minmax(88px, 116px);
}

.controlcash-bar-label,
.controlcash-bar-amount {
  display: grid;
  gap: 2px;
}

.controlcash-bar-label span,
.controlcash-bar-amount span {
  color: rgba(var(--v-theme-on-surface), 0.64);
  font-size: 0.78rem;
}

.controlcash-bar-amount {
  text-align: right;
}

.controlcash-bar-track {
  background: rgba(148, 163, 184, 0.24);
  border-radius: 999px;
  height: 14px;
  overflow: hidden;
}

.controlcash-bar-value {
  background: rgb(var(--v-theme-primary));
  border-radius: inherit;
  height: 100%;
  min-width: 6px;
  transition: width 720ms var(--cc-ease-emphasized);
}

.controlcash-bar-value.is-warning {
  background: rgb(var(--v-theme-warning));
}

.controlcash-bar-value.is-danger {
  background: rgb(var(--v-theme-error));
}

.controlcash-line-chart {
  min-height: 240px;
  width: 100%;
}

.controlcash-chart-grid {
  fill: none;
  stroke: rgba(148, 163, 184, 0.22);
  stroke-width: 1;
}

.controlcash-line-area {
  fill: rgba(var(--v-theme-primary), 0.14);
  stroke: none;
}

.controlcash-line-value {
  fill: none;
  stroke: rgb(var(--v-theme-primary));
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.controlcash-line-point {
  fill: rgb(var(--v-theme-primary));
  stroke: rgb(var(--v-theme-surface));
  stroke-width: 3;
}

.controlcash-chart-label {
  fill: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 13px;
  text-anchor: middle;
  text-transform: capitalize;
}

.controlcash-payment-summary {
  min-width: 92px;
}

@media (max-width: 700px) {
  .controlcash-bar-row {
    align-items: start;
    grid-template-columns: 1fr;
  }

  .controlcash-bar-amount {
    text-align: left;
  }
}
</style>
