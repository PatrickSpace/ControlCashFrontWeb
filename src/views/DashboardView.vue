<template>
  <v-container class="controlcash-page-container controlcash-dashboard pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12" md="8">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-view-dashboard-outline" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Home</div>
            <div class="text-body-medium text-medium-emphasis">
              Resumen financiero de {{ currentMonthLabel }}
            </div>
          </div>
        </div>
      </v-col>

      <v-col class="d-flex justify-md-end" cols="12" md="4">
        <div class="controlcash-period-actions">
          <v-btn
            color="primary"
            prepend-icon="mdi-calendar-sync-outline"
            variant="tonal"
            @click="resetSelectedPeriod"
          >
            Periodo actual
          </v-btn>
          <v-combobox
            v-model="selectedPeriod"
            class="controlcash-field controlcash-period-combobox"
            density="comfortable"
            hide-details
            :items="periodOptions"
            item-title="title"
            item-value="value"
            label="Periodo"
            prepend-inner-icon="mdi-calendar-month-outline"
            :return-object="false"
            variant="outlined"
          />
        </div>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col v-for="metric in mainMetrics" :key="metric.title" cols="12" md="6" xl="3">
        <v-card class="controlcash-panel controlcash-metric-card fill-height" elevation="0">
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
              <v-icon :color="metric.trendColor" :icon="metric.trendIcon" size="18" />
              <span>{{ metric.caption }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2" dense>
      <v-col cols="12" lg="8">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-scale-balance" />
              <span>Situación financiera</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <v-row dense>
              <v-col cols="12" md="5">
                <div class="controlcash-networth">
                  <div class="text-body-medium text-medium-emphasis">Patrimonio neto</div>
                  <div class="text-display-small font-weight-bold mt-1">
                    {{ formatMoney(netWorth) }}
                  </div>
                  <v-divider class="my-4" />
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">Activos</span>
                    <strong>{{ formatMoney(totalAssets) }}</strong>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span class="text-medium-emphasis">Deudas</span>
                    <strong>{{ formatMoney(totalLiabilities) }}</strong>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="7">
                <v-list bg-color="transparent" class="pa-0">
                  <v-list-item
                    v-for="account in accountBalances"
                    :key="account.id"
                    class="controlcash-list-item mb-3"
                    rounded="lg"
                  >
                    <template #prepend>
                      <v-avatar color="primary" rounded="lg" size="38" variant="tonal">
                        <v-icon :icon="account.icon" />
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ account.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ account.typeLabel }}</v-list-item-subtitle>
                    <template #append>
                      <div class="text-right">
                        <div class="font-weight-bold">{{ formatMoney(account.balance) }}</div>
                        <div class="text-caption text-medium-emphasis">
                          {{ account.isActive === false ? 'Inactiva' : 'Activa' }}
                        </div>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>

                <v-alert
                  v-if="!accountBalances.length"
                  color="primary"
                  icon="mdi-wallet-plus-outline"
                  variant="tonal"
                >
                  Crea cuentas para ver tus activos disponibles.
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-credit-card-clock-outline" />
              <span>Deudas</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <v-list bg-color="transparent" class="pa-0">
              <v-list-item
                v-for="card in cardDebts"
                :key="card.id"
                class="controlcash-list-item mb-3"
                rounded="lg"
              >
                <template #prepend>
                  <v-avatar color="warning" rounded="lg" size="38" variant="tonal">
                    <v-icon icon="mdi-credit-card-outline" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ card.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ card.bank }}</v-list-item-subtitle>
                <template #append>
                  <div class="text-right controlcash-card-amount">
                    <div class="font-weight-bold">{{ formatMoney(card.debt) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ Math.round(card.usage) }}% usado
                    </div>
                  </div>
                </template>
                <v-progress-linear
                  class="mt-3"
                  color="warning"
                  height="7"
                  :model-value="card.usage"
                  rounded
                />
              </v-list-item>
            </v-list>

            <v-alert
              v-if="!cardDebts.length"
              color="success"
              icon="mdi-check-circle-outline"
              variant="tonal"
            >
              No hay tarjetas registradas con deuda pendiente.
            </v-alert>
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
              <span>Presupuestos</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-body-medium text-medium-emphasis">Uso mensual</div>
                <div class="text-h5 font-weight-bold">{{ budgetUsageLabel }}</div>
              </div>
              <v-avatar color="primary" rounded="lg" size="52" variant="tonal">
                <v-icon icon="mdi-wallet-bifold-outline" size="28" />
              </v-avatar>
            </div>

            <v-progress-linear
              color="primary"
              height="10"
              :model-value="budgetUsagePercent"
              rounded
            />

            <v-list bg-color="transparent" class="mt-5 pa-0">
              <v-list-item
                v-for="budget in budgetRows"
                :key="budget.id"
                class="controlcash-list-item mb-3"
                rounded="lg"
              >
                <v-list-item-title>{{ budget.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ budget.categoryLabel }}</v-list-item-subtitle>
                <template #append>
                  <div class="text-right controlcash-card-amount">
                    <div class="font-weight-bold">{{ formatMoney(budget.spent) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      de {{ formatMoney(budget.limit) }}
                    </div>
                  </div>
                </template>
                <v-progress-linear
                  class="mt-3"
                  :color="budget.color"
                  height="7"
                  :model-value="budget.percent"
                  rounded
                />
              </v-list-item>
            </v-list>

            <v-alert
              v-if="!budgetRows.length"
              color="primary"
              icon="mdi-chart-donut"
              variant="tonal"
            >
              Crea presupuestos mensuales para controlar límites por categoría.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-shape-outline" />
              <span>Gastos por categorías</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <v-row dense>
              <v-col cols="12" md="5">
                <div class="controlcash-category-summary">
                  <div class="text-body-medium text-medium-emphasis">Categoría principal</div>
                  <div class="text-h5 font-weight-bold mt-1">{{ topCategoryLabel }}</div>
                  <div class="text-body-medium text-medium-emphasis mt-2">
                    {{ formatMoney(topCategoryAmount) }} gastados este mes
                  </div>
                  <v-divider class="my-4" />
                  <div class="d-flex justify-space-between">
                    <span class="text-medium-emphasis">Gasto total</span>
                    <strong>{{ formatMoney(monthlyExpenses) }}</strong>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="7">
                <v-list bg-color="transparent" class="pa-0">
                  <v-list-item
                    v-for="category in categoryExpenseRows"
                    :key="category.id"
                    class="controlcash-list-item mb-3"
                    rounded="lg"
                  >
                    <template #prepend>
                      <v-avatar color="primary" rounded="lg" size="38" variant="tonal">
                        <v-icon icon="mdi-tag-outline" />
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ category.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ category.share }}% del gasto mensual</v-list-item-subtitle>
                    <template #append>
                      <div class="font-weight-bold">{{ formatMoney(category.amount) }}</div>
                    </template>
                    <v-progress-linear
                      class="mt-3"
                      color="primary"
                      height="7"
                      :model-value="category.share"
                      rounded
                    />
                  </v-list-item>
                </v-list>

                <v-alert
                  v-if="!categoryExpenseRows.length"
                  color="primary"
                  icon="mdi-receipt-text-outline"
                  variant="tonal"
                >
                  Registra gastos con categoría para ver este desglose.
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2" dense>
      <v-col cols="12" md="4">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-body-medium text-medium-emphasis">Ingresos del mes</div>
                <div class="text-h5 font-weight-bold mt-1">{{ formatMoney(monthlyIncome) }}</div>
              </div>
              <v-icon color="success" icon="mdi-arrow-down-circle-outline" size="34" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-body-medium text-medium-emphasis">Gastos del mes</div>
                <div class="text-h5 font-weight-bold mt-1">{{ formatMoney(monthlyExpenses) }}</div>
              </div>
              <v-icon color="error" icon="mdi-arrow-up-circle-outline" size="34" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-body-medium text-medium-emphasis">Balance del mes</div>
                <div class="text-h5 font-weight-bold mt-1">{{ formatMoney(monthlyBalance) }}</div>
              </div>
              <v-icon :color="monthlyBalance >= 0 ? 'success' : 'error'" icon="mdi-finance" size="34" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useAccountsStore } from '../stores/accounts'
import { useBudgetsStore } from '../stores/budgets'
import { useCardsStore } from '../stores/cards'
import { useCategoriesStore } from '../stores/categories'
import { useTransactionsStore } from '../stores/transactions'

const accountsStore = useAccountsStore()
const budgetsStore = useBudgetsStore()
const cardsStore = useCardsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const currentDate = new Date()
const selectedPeriod = ref(formatPeriodValue(currentDate))

const accountTypeLabels = {
  cash: 'Efectivo',
  bank: 'Banco',
  savings: 'Ahorros',
  credit: 'Crédito',
  investments: 'Inversiones',
}

const accountTypeIcons = {
  cash: 'mdi-cash',
  bank: 'mdi-bank-outline',
  savings: 'mdi-piggy-bank-outline',
  credit: 'mdi-credit-card-outline',
  investments: 'mdi-chart-line',
}

const periodOptions = computed(() => {
  const options = []

  for (let offset = -12; offset <= 6; offset += 1) {
    const periodDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)

    options.push({
      title: formatPeriodLabel(periodDate),
      value: formatPeriodValue(periodDate),
    })
  }

  return options.reverse()
})

const selectedPeriodParts = computed(() => {
  const [year, month] = String(selectedPeriod.value || formatPeriodValue(currentDate))
    .split('-')
    .map(Number)

  return {
    month: Number.isInteger(month) ? month - 1 : currentDate.getMonth(),
    year: Number.isInteger(year) ? year : currentDate.getFullYear(),
  }
})

const currentMonthLabel = computed(() =>
  formatPeriodDate(selectedPeriod.value).toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  }),
)

const monthlyTransactions = computed(() =>
  transactionsStore.items.filter((transaction) => isSelectedPeriod(transaction.date)),
)

const monthlyIncome = computed(() =>
  sumTransactions(monthlyTransactions.value.filter((transaction) => transaction.type === 'income')),
)

const monthlyExpenses = computed(() =>
  sumTransactions(monthlyTransactions.value.filter((transaction) => isExpenseTransaction(transaction))),
)

const monthlyBalance = computed(() => monthlyIncome.value - monthlyExpenses.value)

const accountBalances = computed(() =>
  accountsStore.items
    .map((account) => ({
      ...account,
      balance: getAccountBalance(account.id),
      icon: accountTypeIcons[account.type] || 'mdi-wallet-outline',
      typeLabel: accountTypeLabels[account.type] || account.type,
    }))
    .sort((first, second) => Number(second.balance || 0) - Number(first.balance || 0)),
)

const totalAssets = computed(() =>
  accountBalances.value
    .filter((account) => account.type !== 'credit')
    .reduce((total, account) => total + Math.max(Number(account.balance || 0), 0), 0),
)

const cardDebts = computed(() =>
  cardsStore.items
    .map((card) => {
      const debt = Math.max(getCardDebt(card.id), 0)
      const limit = Number(card.creditLimit || 0)

      return {
        ...card,
        debt,
        usage: limit > 0 ? Math.min((debt / limit) * 100, 100) : 0,
      }
    })
    .filter((card) => card.debt > 0)
    .sort((first, second) => second.debt - first.debt),
)

const totalCardDebt = computed(() =>
  cardDebts.value.reduce((total, card) => total + Number(card.debt || 0), 0),
)

const totalLiabilities = computed(() => {
  const negativeAccountBalances = accountBalances.value.reduce(
    (total, account) => total + Math.abs(Math.min(Number(account.balance || 0), 0)),
    0,
  )

  return totalCardDebt.value + negativeAccountBalances
})

const netWorth = computed(() => totalAssets.value - totalLiabilities.value)

const budgetRows = computed(() =>
  budgetsStore.activeBudgets
    .map((budget) => {
      const limit = Number(budget.limitAmount || 0)
      const spent = getCategoryMonthlyExpense(budget.categoryId)
      const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0

      return {
        ...budget,
        categoryLabel: getCategoryName(budget.categoryId),
        color: percent >= 90 ? 'error' : percent >= 70 ? 'warning' : 'primary',
        limit,
        percent,
        spent,
      }
    })
    .sort((first, second) => second.percent - first.percent),
)

const totalBudgetLimit = computed(() =>
  budgetRows.value.reduce((total, budget) => total + Number(budget.limit || 0), 0),
)

const totalBudgetSpent = computed(() =>
  budgetRows.value.reduce((total, budget) => total + Number(budget.spent || 0), 0),
)

const budgetUsagePercent = computed(() =>
  totalBudgetLimit.value > 0 ? Math.min((totalBudgetSpent.value / totalBudgetLimit.value) * 100, 100) : 0,
)

const budgetUsageLabel = computed(() =>
  `${formatMoney(totalBudgetSpent.value)} / ${formatMoney(totalBudgetLimit.value)}`,
)

const categoryExpenseRows = computed(() => {
  const totals = monthlyTransactions.value.reduce((result, transaction) => {
    if (!isExpenseTransaction(transaction)) {
      return result
    }

    const categoryId = transaction.categoryId || 'uncategorized'
    result[categoryId] = (result[categoryId] || 0) + Number(transaction.amount || 0)

    return result
  }, {})

  return Object.entries(totals)
    .map(([categoryId, amount]) => ({
      id: categoryId,
      amount,
      name: categoryId === 'uncategorized' ? 'Sin categoría' : getCategoryName(categoryId),
      share: monthlyExpenses.value > 0 ? Math.round((amount / monthlyExpenses.value) * 100) : 0,
    }))
    .sort((first, second) => second.amount - first.amount)
    .slice(0, 6)
})

const topCategoryLabel = computed(() => categoryExpenseRows.value[0]?.name || 'Sin datos')
const topCategoryAmount = computed(() => categoryExpenseRows.value[0]?.amount || 0)

const mainMetrics = computed(() => [
  {
    title: 'Patrimonio neto',
    value: formatMoney(netWorth.value),
    caption: `${formatMoney(totalAssets.value)} en activos`,
    color: 'primary',
    icon: 'mdi-scale-balance',
    trendColor: netWorth.value >= 0 ? 'success' : 'error',
    trendIcon: netWorth.value >= 0 ? 'mdi-trending-up' : 'mdi-trending-down',
  },
  {
    title: 'Activos',
    value: formatMoney(totalAssets.value),
    caption: `${accountBalances.value.length} cuentas registradas`,
    color: 'success',
    icon: 'mdi-wallet-outline',
    trendColor: 'success',
    trendIcon: 'mdi-bank-outline',
  },
  {
    title: 'Deudas',
    value: formatMoney(totalLiabilities.value),
    caption: `${cardDebts.value.length} tarjetas con saldo pendiente`,
    color: 'warning',
    icon: 'mdi-credit-card-clock-outline',
    trendColor: totalLiabilities.value > 0 ? 'warning' : 'success',
    trendIcon: totalLiabilities.value > 0 ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline',
  },
  {
    title: 'Balance mensual',
    value: formatMoney(monthlyBalance.value),
    caption: `${formatMoney(monthlyIncome.value)} ingresos vs ${formatMoney(monthlyExpenses.value)} gastos`,
    color: monthlyBalance.value >= 0 ? 'success' : 'error',
    icon: 'mdi-calendar-month-outline',
    trendColor: monthlyBalance.value >= 0 ? 'success' : 'error',
    trendIcon: monthlyBalance.value >= 0 ? 'mdi-arrow-up-right' : 'mdi-arrow-down-right',
  },
])

onMounted(() => {
  accountsStore.subscribeRealtime()
  cardsStore.subscribeRealtime()
  categoriesStore.subscribeRealtime()
  budgetsStore.subscribeRealtime()
  transactionsStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  accountsStore.stopRealtime()
  cardsStore.stopRealtime()
  categoriesStore.stopRealtime()
  budgetsStore.stopRealtime()
  transactionsStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function resetSelectedPeriod() {
  selectedPeriod.value = formatPeriodValue(currentDate)
}

function getTransactionDate(date) {
  if (!date) {
    return null
  }

  const transactionDate = new Date(`${date}T00:00:00`)
  return Number.isNaN(transactionDate.getTime()) ? null : transactionDate
}

function formatPeriodValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${date.getFullYear()}-${month}`
}

function formatPeriodDate(periodValue) {
  const [year, month] = String(periodValue || formatPeriodValue(currentDate)).split('-').map(Number)

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  }

  return new Date(year, month - 1, 1)
}

function formatPeriodLabel(date) {
  return date.toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  })
}

function isSelectedPeriod(date) {
  const transactionDate = getTransactionDate(date)

  return (
    transactionDate &&
    transactionDate.getMonth() === selectedPeriodParts.value.month &&
    transactionDate.getFullYear() === selectedPeriodParts.value.year
  )
}

function isExpenseTransaction(transaction) {
  return transaction.type === 'expense' || transaction.type === 'card_purchase'
}

function sumTransactions(transactions) {
  return transactions.reduce((total, transaction) => total + Number(transaction.amount || 0), 0)
}

function getAccountBalance(accountId) {
  return transactionsStore.items.reduce((balance, transaction) => {
    const amount = Number(transaction.amount || 0)

    if (transaction.type === 'income' && transaction.accountId === accountId) {
      return balance + amount
    }

    if (transaction.type === 'expense' && transaction.accountId === accountId) {
      return balance - amount
    }

    if (transaction.type === 'transfer') {
      if (transaction.accountId === accountId) {
        return balance - amount
      }

      if (transaction.destinationAccountId === accountId) {
        return balance + amount
      }
    }

    if (transaction.type === 'card_payment' && transaction.accountId === accountId) {
      return balance - amount
    }

    return balance
  }, 0)
}

function getCardDebt(cardId) {
  return transactionsStore.items.reduce((debt, transaction) => {
    const amount = Number(transaction.amount || 0)

    if (transaction.cardId !== cardId) {
      return debt
    }

    if (
      transaction.type === 'card_purchase' ||
      (transaction.type === 'expense' && transaction.paymentMethod === 'credit')
    ) {
      return debt + amount
    }

    if (transaction.type === 'card_payment') {
      return debt - amount
    }

    return debt
  }, 0)
}

function getCategoryName(categoryId) {
  return categoriesStore.items.find((category) => category.id === categoryId)?.name || 'Sin categoría'
}

function getCategoryMonthlyExpense(categoryId) {
  return monthlyTransactions.value.reduce((total, transaction) => {
    if (!isExpenseTransaction(transaction) || transaction.categoryId !== categoryId) {
      return total
    }

    return total + Number(transaction.amount || 0)
  }, 0)
}
</script>

<style scoped>
.controlcash-dashboard {
  max-width: 1600px;
}

.controlcash-metric-card {
  min-height: 148px;
}

.controlcash-period-actions {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
}

.controlcash-period-combobox {
  flex: 0 1 220px;
  min-width: 190px;
}

.controlcash-networth,
.controlcash-category-summary {
  background: var(--cc-list-item);
  border-radius: 8px;
  min-height: 100%;
  padding: 20px;
}

.controlcash-card-amount {
  min-width: 96px;
}

.controlcash-list-item :deep(.v-list-item__content) {
  min-width: 0;
}

@media (max-width: 600px) {
  .controlcash-metric-card {
    min-height: 132px;
  }

  .controlcash-period-actions {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }

  .controlcash-period-combobox {
    flex-basis: auto;
    min-width: 0;
    width: 100%;
  }

  .controlcash-card-amount {
    min-width: 78px;
  }

  .controlcash-networth,
  .controlcash-category-summary {
    padding: 16px;
  }

  .controlcash-networth .text-display-small {
    font-size: 1.75rem;
    line-height: 1.15;
  }

  .controlcash-list-item :deep(.v-list-item__append) {
    padding-inline-start: 8px;
  }
}
</style>
