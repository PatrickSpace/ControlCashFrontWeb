<template>
  <CrudPage
    empty-icon="mdi-swap-horizontal"
    empty-text="Registra tu primer movimiento financiero."
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-swap-horizontal"
    singular-title="transacción"
    :store="transactionsStore"
    subtitle="Fuente única para balances, crédito usado, presupuestos e insights."
    title="Transacciones"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

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

const cardItems = computed(() =>
  cardsStore.activeCards.map((card) => ({
    title: `${card.name} - ${card.bank}`,
    value: card.id,
  })),
)

const categoryItems = computed(() =>
  categoriesStore.activeCategories.map((category) => ({
    title: category.name,
    value: category.id,
  })),
)

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
      { title: 'Compra con tarjeta', value: 'card_purchase' },
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
    items: categoryItems.value,
    md: 6,
  },
  {
    key: 'accountId',
    label: 'Cuenta origen',
    type: 'select',
    items: accountItems.value,
    md: 6,
  },
  {
    key: 'destinationAccountId',
    label: 'Cuenta destino',
    type: 'select',
    items: accountItems.value,
    md: 6,
  },
  {
    key: 'cardId',
    label: 'Tarjeta',
    type: 'select',
    items: cardItems.value,
    md: 6,
  },
  {
    key: 'installments',
    label: 'Cuotas',
    type: 'number',
    defaultValue: 1,
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
</script>
