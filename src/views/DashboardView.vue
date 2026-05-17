<template>
  <v-container class="controlcash-page-container controlcash-dashboard pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12">
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
    </v-row>

    <v-row class="mb-2" dense>
      <v-col cols="12" lg="5">
        <v-card class="controlcash-panel controlcash-spend-advice-card fill-height" elevation="0">
          <v-card-text class="pa-5">
            <div class="d-flex align-start justify-space-between ga-3">
              <div>
                <div class="text-body-medium text-medium-emphasis">Puedes gastar con tarjeta</div>
                <div class="text-display-small font-weight-bold mt-1">
                  {{ formatMoney(recommendedSpendAmount) }}
                </div>
                <div class="text-body-small text-medium-emphasis mt-2">
                  Margen recomendado sin pasar {{ healthyUtilizationTarget }}% de uso.
                </div>
                <div class="text-body-medium font-weight-medium mt-3">
                  {{ dailyCardSpendLabel }}
                </div>
              </div>
              <v-avatar color="primary" rounded="lg" size="52" variant="tonal">
                <v-icon icon="mdi-credit-card-check-outline" size="30" />
              </v-avatar>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex justify-space-between mb-2">
              <span class="text-medium-emphasis">Disponible total</span>
              <strong>{{ formatMoney(totalCreditAvailable) }}</strong>
            </div>
            <div class="d-flex justify-space-between">
              <span class="text-medium-emphasis">Uso actual</span>
              <strong>{{ Math.round(totalCreditUsage) }}%</strong>
            </div>

            <v-list
              v-if="cardDailySpendRows.length"
              bg-color="transparent"
              class="controlcash-card-daily-list mt-4 pa-0"
            >
              <v-list-item
                v-for="card in cardDailySpendRows"
                :key="card.id"
                class="controlcash-list-item mb-2"
                rounded="lg"
              >
                <v-list-item-title>{{ card.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatMoney(card.dailySpend) }} diarios · corte en {{ card.daysToBilling }} días
                </v-list-item-subtitle>
                <template #append>
                  <div class="text-right controlcash-card-amount">
                    <div class="font-weight-bold">{{ formatMoney(card.spendRoom) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ Math.round(card.usage) }}% usado
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card class="controlcash-panel fill-height" elevation="0">
          <v-card-title class="controlcash-card-title px-5 py-4">
            <div class="d-flex align-center ga-3">
              <v-icon color="primary" icon="mdi-credit-card-search-outline" />
              <span>Tarjeta recomendada para gastar ahora</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <div v-if="recommendedCard" class="controlcash-recommended-card">
              <div>
                <div class="text-h5 font-weight-bold">{{ recommendedCard.name }}</div>
                <div class="text-body-medium text-medium-emphasis">{{ recommendedCard.bank }}</div>
              </div>
              <div class="controlcash-recommended-card-metrics">
                <div>
                  <span>Margen recomendado</span>
                  <strong>{{ formatMoney(recommendedCard.spendRoom) }}</strong>
                </div>
                <div>
                  <span>Disponible</span>
                  <strong>{{ formatMoney(recommendedCard.available) }}</strong>
                </div>
                <div>
                  <span>Uso</span>
                  <strong>{{ Math.round(recommendedCard.usage) }}%</strong>
                </div>
              </div>
              <v-progress-linear
                class="mt-4"
                :color="recommendedCard.usageColor"
                height="9"
                :model-value="recommendedCard.usage"
                rounded
              />
              <div class="controlcash-card-calendar mt-4">
                <v-chip color="primary" prepend-icon="mdi-calendar-end" variant="tonal">
                  Cierra en {{ recommendedCard.daysToBilling }} días
                </v-chip>
                <v-chip :color="recommendedCard.paymentColor" prepend-icon="mdi-calendar-clock" variant="tonal">
                  Pago en {{ recommendedCard.daysToPayment }} días
                </v-chip>
              </div>
              <div class="text-body-small text-medium-emphasis mt-4">
                {{ recommendedCard.reason }}
              </div>
            </div>

            <v-alert
              v-else
              color="primary"
              icon="mdi-credit-card-plus-outline"
              variant="tonal"
            >
              Registra una tarjeta activa con línea de crédito para recibir una recomendación.
            </v-alert>
          </v-card-text>
        </v-card>
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
              <v-icon color="primary" icon="mdi-wallet-bifold-outline" />
              <span>Dónde puedes gastar más o menos</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-5">
            <v-row dense>
              <v-col cols="12" md="6">
                <div class="controlcash-budget-advice is-positive">
                  <v-avatar color="success" rounded="lg" size="42" variant="tonal">
                    <v-icon icon="mdi-arrow-up-circle-outline" />
                  </v-avatar>
                  <div>
                    <div class="text-body-medium text-medium-emphasis">Puedes gastar más en</div>
                    <div class="text-h6 font-weight-bold mt-1">
                      {{ bestBudgetToSpend?.name || 'Sin presupuesto' }}
                    </div>
                    <div class="text-body-small text-medium-emphasis mt-1">
                      {{ bestBudgetToSpend ? `${formatMoney(bestBudgetToSpend.remaining)} disponibles` : 'Crea presupuestos para recibir sugerencias.' }}
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="controlcash-budget-advice is-warning">
                  <v-avatar :color="tightestBudget?.color || 'warning'" rounded="lg" size="42" variant="tonal">
                    <v-icon icon="mdi-alert-circle-outline" />
                  </v-avatar>
                  <div>
                    <div class="text-body-medium text-medium-emphasis">Gasta menos en</div>
                    <div class="text-h6 font-weight-bold mt-1">
                      {{ tightestBudget?.name || 'Sin alerta' }}
                    </div>
                    <div class="text-body-small text-medium-emphasis mt-1">
                      {{ tightestBudget ? `${Math.round(tightestBudget.percent)}% usado · ${formatMoney(tightestBudget.remaining)} restante` : 'Ningún presupuesto está presionado.' }}
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-list v-if="budgetAdviceRows.length" bg-color="transparent" class="mt-5 pa-0">
              <v-list-item
                v-for="budget in budgetAdviceRows"
                :key="budget.id"
                class="controlcash-list-item mb-3"
                rounded="lg"
              >
                <v-list-item-title>{{ budget.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ budget.categoryLabel }} · {{ budget.advice }}
                </v-list-item-subtitle>
                <template #append>
                  <div class="text-right controlcash-card-amount">
                    <div class="font-weight-bold">{{ formatMoney(budget.remaining) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ Math.round(budget.percent) }}% usado
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
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
      <v-col cols="12">
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
import { computed, onBeforeUnmount, onMounted } from 'vue'

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
const healthyUtilizationTarget = 80
const flexibleUtilizationTarget = 70

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

const currentMonthLabel = 'todos los periodos'

const monthlyTransactions = computed(() =>
  transactionsStore.items,
)

const monthlyIncome = computed(() =>
  sumTransactions(
    monthlyTransactions.value.filter(
      (transaction) => transaction.type === 'income' && isCashAccount(transaction.accountId),
    ),
  ),
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

const creditCardAdviceRows = computed(() =>
  cardsStore.activeCards
    .map((card) => {
      const limit = Number(card.creditLimit || 0)
      const debt = Math.max(getCardDebt(card.id), 0)
      const available = Math.max(limit - debt, 0)
      const usage = limit > 0 ? Math.min((debt / limit) * 100, 100) : 0
      const healthyRoom = Math.max(limit * (healthyUtilizationTarget / 100) - debt, 0)
      const flexibleRoom = Math.max(limit * (flexibleUtilizationTarget / 100) - debt, 0)
      const spendRoom = Math.min(available, healthyRoom || flexibleRoom)
      const daysToBilling = getDaysToCardDay(card.billingDay)
      const daysToPayment = getDaysToCardDay(card.paymentDueDay)
      const utilizationScore = Math.max(100 - usage, 0)
      const timingScore = daysToBilling * 2
      const paymentPenalty = debt > 0 && daysToPayment <= 5 ? 35 : 0
      const overusePenalty = usage >= 90 ? 45 : usage >= 70 ? 20 : 0
      const score = spendRoom + utilizationScore + timingScore - paymentPenalty - overusePenalty

      return {
        ...card,
        available,
        daysToBilling,
        daysToPayment,
        debt,
        limit,
        paymentColor: daysToPayment <= 5 ? 'error' : daysToPayment <= 10 ? 'warning' : 'primary',
        reason: getCardRecommendationReason({ available, daysToBilling, daysToPayment, debt, spendRoom, usage }),
        score,
        spendRoom,
        usage,
        usageColor: usage >= 85 ? 'error' : usage >= 65 ? 'warning' : 'primary',
      }
    })
    .filter((card) => card.limit > 0 && card.available > 0)
    .sort((first, second) => second.score - first.score),
)

const recommendedCard = computed(() => creditCardAdviceRows.value[0])

const recommendedSpendAmount = computed(() =>
  creditCardAdviceRows.value.reduce((total, card) => total + Number(card.spendRoom || 0), 0),
)

const dailyCardSpend = computed(() => {
  if (!recommendedCard.value) {
    return 0
  }

  return recommendedCard.value.spendRoom / Math.max(recommendedCard.value.daysToBilling, 1)
})

const dailyCardSpendLabel = computed(() =>
  recommendedCard.value
    ? `${formatMoney(dailyCardSpend.value)} diarios hasta el próximo corte de ${recommendedCard.value.name}.`
    : 'Agrega una tarjeta para calcular tu gasto diario recomendado.',
)

const cardDailySpendRows = computed(() =>
  creditCardAdviceRows.value.map((card) => ({
    ...card,
    dailySpend: card.spendRoom / Math.max(card.daysToBilling, 1),
  })),
)

const totalCreditAvailable = computed(() =>
  creditCardAdviceRows.value.reduce((total, card) => total + Number(card.available || 0), 0),
)

const totalCreditLimit = computed(() =>
  cardsStore.activeCards.reduce((total, card) => total + Number(card.creditLimit || 0), 0),
)

const totalCreditUsage = computed(() =>
  totalCreditLimit.value > 0 ? Math.min((totalCardDebt.value / totalCreditLimit.value) * 100, 100) : 0,
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
      const remaining = limit - spent

      return {
        ...budget,
        categoryLabel: getCategoryName(budget.categoryId),
        color: percent >= 90 ? 'error' : percent >= 70 ? 'warning' : 'primary',
        limit,
        percent,
        remaining,
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

const bestBudgetToSpend = computed(() =>
  budgetRows.value
    .filter((budget) => budget.remaining > 0)
    .sort((first, second) => second.remaining - first.remaining)[0],
)

const tightestBudget = computed(() =>
  budgetRows.value
    .filter((budget) => budget.spent > 0 || budget.percent >= 70)
    .sort((first, second) => second.percent - first.percent)[0],
)

const budgetAdviceRows = computed(() =>
  budgetRows.value.slice(0, 4).map((budget) => ({
    ...budget,
    advice:
      budget.remaining < 0
        ? 'Presupuesto excedido'
        : budget.percent >= 90
          ? 'Evita nuevos gastos'
          : budget.percent >= 70
            ? 'Gasta con cuidado'
            : 'Todavía hay margen',
  })),
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
    title: 'Balance total',
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

function getDaysToCardDay(dayOfMonth) {
  const safeDay = Math.min(Math.max(Number(dayOfMonth || 1), 1), 31)
  const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
  const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), safeDay)

  if (targetDate < today) {
    targetDate.setMonth(targetDate.getMonth() + 1)
  }

  return Math.ceil((targetDate - today) / (24 * 60 * 60 * 1000))
}

function getCardRecommendationReason(card) {
  if (card.spendRoom <= 0) {
    return 'Tiene línea disponible, pero ya superó el margen recomendado de uso.'
  }

  if (card.debt > 0 && card.daysToPayment <= 5) {
    return 'Aún conviene por margen, pero revisa el pago próximo antes de aumentar el saldo.'
  }

  if (card.daysToBilling >= 20 && card.usage < healthyUtilizationTarget) {
    return 'Tiene buen margen, bajo uso y más días antes del cierre del ciclo.'
  }

  if (card.usage < healthyUtilizationTarget) {
    return 'Tiene bajo uso frente a su límite y margen saludable disponible.'
  }

  return 'Es la mejor opción disponible por balance entre límite, uso actual y fechas.'
}

function isExpenseTransaction(transaction) {
  return transaction.type === 'expense' || transaction.type === 'card_purchase'
}

function sumTransactions(transactions) {
  return transactions.reduce((total, transaction) => total + Number(transaction.amount || 0), 0)
}

function isCashAccount(accountId) {
  const account = accountsStore.items.find((item) => item.id === accountId)

  return account ? getAccountClassification(account) === 'cash' : false
}

function getAccountClassification(account) {
  return account.classification || (account.type === 'investments' ? 'non_liquid_asset' : 'cash')
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

.controlcash-spend-advice-card {
  min-height: 100%;
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

.controlcash-recommended-card {
  display: grid;
  gap: 4px;
}

.controlcash-recommended-card-metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.controlcash-recommended-card-metrics div {
  background: var(--cc-list-item);
  border-radius: 8px;
  display: grid;
  gap: 3px;
  min-width: 0;
  padding: 12px;
}

.controlcash-recommended-card-metrics span {
  color: rgba(var(--v-theme-on-surface), 0.66);
  font-size: 0.76rem;
}

.controlcash-recommended-card-metrics strong {
  overflow-wrap: anywhere;
}

.controlcash-budget-advice {
  align-items: flex-start;
  background: var(--cc-list-item);
  border-radius: 8px;
  display: flex;
  gap: 12px;
  height: 100%;
  padding: 16px;
}

.controlcash-budget-advice > div:last-child {
  min-width: 0;
}

.controlcash-card-calendar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.controlcash-card-daily-list {
  display: grid;
  gap: 8px;
}

.controlcash-list-item :deep(.v-list-item__content) {
  min-width: 0;
}

@media (max-width: 600px) {
  .controlcash-metric-card {
    min-height: 132px;
  }

  .controlcash-spend-advice-card .text-display-small {
    font-size: 1.85rem;
    line-height: 1.15;
  }

  .controlcash-card-amount {
    min-width: 78px;
  }

  .controlcash-recommended-card-metrics {
    grid-template-columns: 1fr;
  }

  .controlcash-card-calendar {
    align-items: stretch;
    flex-direction: column;
  }

  .controlcash-card-calendar .v-chip {
    justify-content: flex-start;
    width: 100%;
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
