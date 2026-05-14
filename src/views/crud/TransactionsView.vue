<template>
  <CrudPage
    empty-icon="mdi-swap-horizontal"
    :empty-text="emptyTransactionsText"
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-swap-horizontal"
    :items="filteredTransactions"
    :prepare-payload="prepareTransactionPayload"
    singular-title="transacción"
    :store="transactionsStore"
    subtitle="Fuente única para balances, crédito usado, presupuestos e insights."
    title="Transacciones"
  >
    <template #filters>
      <v-row align="center" dense>
        <v-col cols="12" md="5" lg="4">
          <v-select
            v-model="selectedAccountId"
            class="controlcash-field"
            clearable
            density="comfortable"
            hide-details
            :items="accountFilterItems"
            item-title="title"
            item-value="value"
            label="Filtrar por cuenta"
            prepend-inner-icon="mdi-wallet-outline"
          >
            <template #no-data>
              <v-list-item>
                <v-list-item-title class="text-body-medium controlcash-select-no-data">
                  No existen cuentas disponibles
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="5" lg="4">
          <v-select
            v-model="selectedExpenseType"
            class="controlcash-field"
            clearable
            density="comfortable"
            hide-details
            :items="expenseTypeFilterItems"
            item-title="title"
            item-value="value"
            label="Filtrar por tipo de gasto"
            prepend-inner-icon="mdi-cash-multiple"
          />
        </v-col>
      </v-row>
    </template>
  </CrudPage>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import CrudPage from '../../components/crud/CrudPage.vue'
import { useAccountsStore } from '../../stores/accounts'
import { useCardsStore } from '../../stores/cards'
import { useCategoriesStore } from '../../stores/categories'
import { useTransactionsStore } from '../../stores/transactions'
import { formRules } from '../../utils/formRules'

const accountsStore = useAccountsStore()
const cardsStore = useCardsStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const selectedAccountId = ref(null)
const selectedExpenseType = ref(null)

const headers = [
  { title: 'Fecha', key: 'date' },
  { title: 'Tipo', key: 'typeLabel' },
  { title: 'Descripción', key: 'description' },
  { title: 'Monto', key: 'amountLabel' },
  { title: 'Cuenta', key: 'accountLabel' },
  { title: 'Tarjeta', key: 'cardLabel' },
]

const accountItems = computed(() =>
  accountsStore.activeAccounts.map((account) => ({
    title: account.name,
    value: account.id,
  })),
)

const accountFilterItems = computed(() =>
  accountsStore.items.map((account) => ({
    title: account.name,
    value: account.id,
  })),
)

const cardItems = computed(() =>
  cardsStore.activeCards.map((card) => ({
    title: `${card.name} - ${card.bank}`,
    value: card.id,
  })),
)

const expenseTypeFilterItems = [
  { title: 'Efectivo', value: 'cash' },
  { title: 'Débito', value: 'debit' },
  { title: 'Crédito', value: 'credit' },
]

const fields = computed(() => [
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    defaultValue: 'expense',
    items: [
      { title: 'Ingreso', value: 'income' },
      { title: 'Gasto', value: 'expense' },
      { title: 'Transferencia', value: 'transfer' },
      { title: 'Pago de tarjeta', value: 'card_payment' },
    ],
    rules: [formRules.required],
    md: 6,
  },
  {
    key: 'date',
    label: 'Fecha',
    type: 'date',
    defaultValue: () => new Date().toISOString().slice(0, 10),
    rules: [formRules.required, formRules.date],
    md: 6,
  },
  {
    key: 'amount',
    label: 'Monto',
    type: 'number',
    prefix: 'S/.',
    rules: [formRules.required, formRules.positive],
    md: 6,
  },
  {
    key: 'paymentMethod',
    label: 'Método de pago',
    type: 'select',
    defaultValue: 'debit',
    showWhen: (form) => form.type === 'expense',
    items: [
      { title: 'Efectivo', value: 'cash' },
      { title: 'Débito', value: 'debit' },
      { title: 'Crédito', value: 'credit' },
    ],
    md: 6,
  },
  {
    key: 'description',
    label: 'Descripción',
  },
  {
    key: 'categoryId',
    label: 'Categoría',
    type: 'select',
    items: (form) => getCategoryItems(form.type),
    noDataText: 'No existen categorías activas para este tipo de transacción.',
    showWhen: (form) => ['income', 'expense'].includes(form.type),
    md: 6,
  },
  {
    key: 'accountId',
    label: (form) => {
      if (form.type === 'transfer') {
        return 'Cuenta origen'
      }

      if (form.type === 'expense') {
        return 'Cuenta a cargo'
      }

      return 'Cuenta'
    },
    type: 'select',
    items: accountItems.value,
    showWhen: (form) =>
      form.type === 'income' ||
      form.type === 'transfer' ||
      form.type === 'card_payment' ||
      (form.type === 'expense' && ['cash', 'debit'].includes(form.paymentMethod)),
    md: 6,
  },
  {
    key: 'destinationAccountId',
    label: 'Cuenta destino',
    type: 'select',
    items: accountItems.value,
    showWhen: (form) => form.type === 'transfer',
    md: 6,
  },
  {
    key: 'cardId',
    label: 'Tarjeta de crédito',
    type: 'select',
    items: cardItems.value,
    showWhen: (form) =>
      form.type === 'card_payment' || (form.type === 'expense' && form.paymentMethod === 'credit'),
    md: 6,
  },
])

const transactionTypeLabels = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  card_purchase: 'Compra tarjeta',
  card_payment: 'Pago tarjeta',
}

const emptyTransactionsText = computed(() =>
  selectedAccountId.value || selectedExpenseType.value
    ? 'No hay transacciones para los filtros seleccionados.'
    : 'Registra tu primer movimiento financiero.',
)

const filteredTransactions = computed(() => {
  return transactionsStore.transactionsByDate.filter((transaction) => {
    const matchesAccount =
      !selectedAccountId.value ||
      transaction.accountId === selectedAccountId.value ||
      transaction.destinationAccountId === selectedAccountId.value
    const matchesExpenseType =
      !selectedExpenseType.value ||
      (transaction.type === 'expense' && transaction.paymentMethod === selectedExpenseType.value)

    return matchesAccount && matchesExpenseType
  })
})

onMounted(() => {
  accountsStore.subscribeRealtime()
  cardsStore.subscribeRealtime()
  categoriesStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  accountsStore.stopRealtime()
  cardsStore.stopRealtime()
  categoriesStore.stopRealtime()
})

function findName(items, id, fallback = '-') {
  return items.find((item) => item.id === id)?.name || fallback
}

function getCategoryType(category) {
  return category.type || 'expense'
}

function getCategoryItems(transactionType) {
  if (!['income', 'expense'].includes(transactionType)) {
    return []
  }

  return categoriesStore.activeCategories
    .filter((category) => getCategoryType(category) === transactionType)
    .map((category) => ({
      title: category.name,
      value: category.id,
    }))
}

function getCompatibleCategoryId(transactionType, categoryId) {
  if (!['income', 'expense'].includes(transactionType) || !categoryId) {
    return null
  }

  const category = categoriesStore.items.find((item) => item.id === categoryId)

  return category && getCategoryType(category) === transactionType ? categoryId : null
}

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatRow(transaction) {
  return {
    ...transaction,
    typeLabel: transactionTypeLabels[transaction.type] || transaction.type,
    amountLabel: formatMoney(transaction.amount),
    accountLabel: findName(accountsStore.items, transaction.accountId),
    cardLabel: findName(cardsStore.items, transaction.cardId),
  }
}

function prepareTransactionPayload(payload) {
  const nextPayload = {
    ...payload,
    paymentMethod: payload.type === 'expense' ? payload.paymentMethod || 'debit' : null,
    categoryId: getCompatibleCategoryId(payload.type, payload.categoryId),
    accountId: shouldUseAccount(payload) ? payload.accountId : null,
    destinationAccountId: payload.type === 'transfer' ? payload.destinationAccountId : null,
    cardId: shouldUseCard(payload) ? payload.cardId : null,
  }

  return nextPayload
}

function shouldUseAccount(transaction) {
  return (
    transaction.type === 'income' ||
    transaction.type === 'transfer' ||
    transaction.type === 'card_payment' ||
    (transaction.type === 'expense' && ['cash', 'debit'].includes(transaction.paymentMethod))
  )
}

function shouldUseCard(transaction) {
  return (
    transaction.type === 'card_payment' ||
    (transaction.type === 'expense' && transaction.paymentMethod === 'credit')
  )
}
</script>
