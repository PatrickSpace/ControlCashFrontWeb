<template>
  <v-container class="controlcash-page-container controlcash-credit-page pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12" md="7">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-credit-card-search-outline" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Tarjetas de crédito</div>
            <div class="text-body-medium text-medium-emphasis">
              Uso, deuda, pagos y tendencia de compras con crédito {{ selectedPeriodScopeLabel }}.
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
                  <v-btn
                    class="mt-2"
                    color="primary"
                    prepend-icon="mdi-credit-card-check-outline"
                    size="small"
                    variant="tonal"
                    @click="openCardPaymentDialog(card)"
                  >
                    Pagar tarjeta
                  </v-btn>
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
              <span>{{ isAllPeriods ? 'Compras con crédito por periodo' : 'Compras con crédito por mes' }}</span>
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

    <v-dialog v-model="cardPaymentDialog" max-width="620" :persistent="savingCardPayment">
      <v-card class="controlcash-panel controlcash-dialog-panel" elevation="0">
        <v-card-title class="controlcash-card-title px-4 px-md-6 py-5">
          Pagar tarjeta
        </v-card-title>

        <v-card-text class="pa-4 pa-md-6">
          <div v-if="selectedPaymentCard" class="mb-4">
            <div class="text-title-medium font-weight-bold">{{ selectedPaymentCard.name }}</div>
            <div class="text-body-small text-medium-emphasis">{{ selectedPaymentCard.bank }}</div>
          </div>

          <v-form v-model="cardPaymentFormValid" @submit.prevent="registerCardPayment">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="paymentAccountId"
                  class="controlcash-field"
                  density="comfortable"
                  :items="accountItems"
                  item-title="title"
                  item-value="value"
                  label="Cuenta de cargo"
                  prepend-inner-icon="mdi-wallet-outline"
                  :return-object="false"
                  :rules="[formRules.required]"
                  variant="outlined"
                >
                  <template #no-data>
                    <v-list-item>
                      <v-list-item-title class="text-body-medium controlcash-select-no-data">
                        No existen cuentas activas disponibles
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-date-input
                  v-model="paymentDate"
                  class="controlcash-field"
                  clearable
                  density="comfortable"
                  label="Fecha de pago"
                  prepend-icon=""
                  prepend-inner-icon="mdi-calendar-month-outline"
                  :rules="[formRules.required, formRules.date]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="paymentAvailableAmount"
                  class="controlcash-field"
                  density="comfortable"
                  label="Disponible actual de la tarjeta"
                  prefix="S/."
                  prepend-inner-icon="mdi-credit-card-check-outline"
                  :rules="availableAmountRules"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-alert color="primary" density="comfortable" variant="tonal">
                  <div class="d-flex justify-space-between ga-4 mb-1">
                    <span>Consumo registrado</span>
                    <strong>{{ formatMoney(selectedPaymentCardDebt) }}</strong>
                  </div>
                  <div class="d-flex justify-space-between ga-4 mb-1">
                    <span>Disponible registrado</span>
                    <strong>{{ formatMoney(selectedPaymentCardRegisteredAvailable) }}</strong>
                  </div>
                  <div class="d-flex justify-space-between ga-4">
                    <span>Pago a registrar</span>
                    <strong>{{ formatMoney(calculatedCardPaymentAmount) }}</strong>
                  </div>
                </v-alert>
              </v-col>

              <v-col v-if="hasPaymentAvailableAmount && calculatedCardPaymentAmount <= 0" cols="12">
                <v-alert color="warning" density="comfortable" variant="tonal">
                  El disponible ingresado no genera un pago a registrar. Si el disponible real es menor al registrado,
                  primero faltan consumos por cargar.
                </v-alert>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 px-md-6 pb-4 pb-md-6">
          <v-spacer />
          <v-btn :disabled="savingCardPayment" variant="text" @click="closeCardPaymentDialog()">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!canRegisterCardPayment || savingCardPayment"
            :loading="savingCardPayment"
            variant="tonal"
            @click="registerCardPayment"
          >
            Registrar pago
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import PeriodControls from '../../components/PeriodControls.vue'
import { getPeriodKey, usePeriodFilter } from '../../composables/usePeriodFilter'
import { useAccountsStore } from '../../stores/accounts'
import { useCardsStore } from '../../stores/cards'
import { useNotificationStore } from '../../stores/notifications'
import { useTransactionsStore } from '../../stores/transactions'
import { formRules } from '../../utils/formRules'

const accountsStore = useAccountsStore()
const cardsStore = useCardsStore()
const notificationStore = useNotificationStore()
const transactionsStore = useTransactionsStore()
const {
  currentDate: today,
  getTrendPeriods,
  isAllPeriods,
  matchesSelectedPeriod,
  periodOptions,
  resetSelectedPeriod,
  selectedPeriod,
  selectedPeriodScopeLabel,
  showAllPeriods,
} = usePeriodFilter()
const cardPaymentDialog = ref(false)
const cardPaymentFormValid = ref(false)
const selectedPaymentCard = ref(null)
const paymentAccountId = ref(null)
const paymentAvailableAmount = ref('')
const paymentDate = ref(new Date())
const savingCardPayment = ref(false)

const activeCards = computed(() => cardsStore.activeCards)
const accountItems = computed(() =>
  accountsStore.activeAccounts.map((account) => ({
    title: account.name,
    value: account.id,
  })),
)
const periodTransactions = computed(() =>
  transactionsStore.items.filter((transaction) => matchesSelectedPeriod(transaction.date)),
)

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
    title: isAllPeriods.value ? 'Deuda actual' : 'Deuda del periodo',
    value: formatMoney(totalDebt.value),
    caption: `${totalUsageLabel.value} de uso total`,
    captionIcon: 'mdi-chart-donut',
    color: totalUsage.value >= 75 ? 'warning' : 'success',
    icon: 'mdi-credit-card-clock-outline',
  },
  {
    title: 'Disponible',
    value: formatMoney(availableCredit.value),
    caption: isAllPeriods.value ? 'Línea no utilizada' : 'Luego del periodo',
    captionIcon: 'mdi-credit-card-check-outline',
    color: 'success',
    icon: 'mdi-wallet-plus-outline',
  },
  {
    title: isAllPeriods.value ? 'Mayor saldo' : 'Mayor uso',
    value: mostUsedCard.value ? mostUsedCard.value.name : '-',
    caption: mostUsedCard.value ? formatMoney(mostUsedCard.value.debt) : 'Sin uso registrado',
    captionIcon: 'mdi-alert-circle-outline',
    color: mostUsedCard.value?.usage >= 75 ? 'warning' : 'primary',
    icon: 'mdi-credit-card-search-outline',
  },
])

const trendMonths = computed(() => {
  const months = getTrendPeriods(transactionsStore.items)

  transactionsStore.items.forEach((transaction) => {
    if (!isCreditPurchase(transaction)) {
      return
    }

    const month = months.find((item) => item.key === getPeriodKey(transaction.date))

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
const selectedPaymentCardLimit = computed(() => Number(selectedPaymentCard.value?.creditLimit || 0))
const selectedPaymentCardDebt = computed(() =>
  selectedPaymentCard.value
    ? Math.max(getCardDebt(selectedPaymentCard.value.id, transactionsStore.items), 0)
    : 0,
)
const selectedPaymentCardRegisteredAvailable = computed(() =>
  Math.max(selectedPaymentCardLimit.value - selectedPaymentCardDebt.value, 0),
)
const hasPaymentAvailableAmount = computed(
  () => paymentAvailableAmount.value !== null && paymentAvailableAmount.value !== '',
)
const normalizedPaymentAvailableAmount = computed(() =>
  hasPaymentAvailableAmount.value ? Number(paymentAvailableAmount.value) : 0,
)
const paymentAvailableExceedsLimit = computed(
  () => normalizedPaymentAvailableAmount.value > selectedPaymentCardLimit.value,
)
const targetCardDebt = computed(() =>
  Math.max(selectedPaymentCardLimit.value - normalizedPaymentAvailableAmount.value, 0),
)
const calculatedCardPaymentAmount = computed(() =>
  Math.max(selectedPaymentCardDebt.value - targetCardDebt.value, 0),
)
const availableAmountRules = computed(() => [
  formRules.required,
  formRules.zeroOrPositive,
  (value) =>
    Number(value) <= selectedPaymentCardLimit.value ||
    `No puede superar la línea de crédito (${formatMoney(selectedPaymentCardLimit.value)}).`,
])
const canRegisterCardPayment = computed(
  () =>
    cardPaymentFormValid.value &&
    Boolean(selectedPaymentCard.value) &&
    Boolean(paymentAccountId.value) &&
    Boolean(paymentDate.value) &&
    hasPaymentAvailableAmount.value &&
    !paymentAvailableExceedsLimit.value &&
    calculatedCardPaymentAmount.value > 0,
)

onMounted(() => {
  accountsStore.subscribeRealtime()
  cardsStore.subscribeRealtime()
  transactionsStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  accountsStore.stopRealtime()
  cardsStore.stopRealtime()
  transactionsStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function openCardPaymentDialog(card) {
  selectedPaymentCard.value = card
  paymentAccountId.value = null
  paymentAvailableAmount.value = selectedPaymentCardRegisteredAvailable.value
  paymentDate.value = new Date()
  cardPaymentFormValid.value = false
  cardPaymentDialog.value = true
}

function closeCardPaymentDialog(force = false) {
  if (savingCardPayment.value && !force) {
    return
  }

  cardPaymentDialog.value = false
  selectedPaymentCard.value = null
  paymentAccountId.value = null
  paymentAvailableAmount.value = ''
  paymentDate.value = new Date()
  cardPaymentFormValid.value = false
}

async function registerCardPayment() {
  if (!canRegisterCardPayment.value || savingCardPayment.value) {
    if (hasPaymentAvailableAmount.value && calculatedCardPaymentAmount.value <= 0) {
      notificationStore.show('El disponible ingresado no genera un pago a registrar.', 'warning')
    }

    return
  }

  savingCardPayment.value = true

  try {
    await transactionsStore.createItem({
      type: 'card_payment',
      amount: calculatedCardPaymentAmount.value,
      date: formatDateValue(paymentDate.value),
      description: `Pago ${selectedPaymentCard.value.name}`,
      paymentMethod: null,
      categoryId: null,
      accountId: paymentAccountId.value,
      destinationAccountId: null,
      cardId: selectedPaymentCard.value.id,
    })

    notificationStore.success(`Pago registrado por ${formatMoney(calculatedCardPaymentAmount.value)}.`)
    closeCardPaymentDialog(true)
  } catch (error) {
    notificationStore.error(transactionsStore.error || error?.message || 'No se pudo registrar el pago.')
  } finally {
    savingCardPayment.value = false
  }
}

function formatDateValue(value) {
  if (!value) {
    return value
  }

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  return value
}

function isCreditPurchase(transaction) {
  return (
    transaction.type === 'card_purchase' ||
    (transaction.type === 'expense' && transaction.paymentMethod === 'credit')
  )
}

function getCardDebt(cardId, transactions = periodTransactions.value) {
  return transactions.reduce((debt, transaction) => {
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
  grid-template-columns: minmax(120px, 180px) 1fr minmax(132px, 156px);
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
  .controlcash-credit-metric {
    min-height: 132px;
  }

  .controlcash-donut {
    max-width: 220px;
  }

  .controlcash-donut-track,
  .controlcash-donut-value {
    stroke-width: 18;
  }

  .controlcash-donut-percent {
    font-size: 24px;
  }

  .controlcash-bars {
    gap: 14px;
  }

  .controlcash-bar-row {
    align-items: start;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .controlcash-bar-amount {
    text-align: left;
  }

  .controlcash-bar-track {
    height: 12px;
  }

  .controlcash-line-chart {
    min-height: 190px;
  }

  .controlcash-chart-label {
    font-size: 11px;
  }

  .controlcash-payment-summary {
    min-width: 76px;
  }
}
</style>
