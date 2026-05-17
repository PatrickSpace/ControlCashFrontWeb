<template>
  <CrudPage
    empty-icon="mdi-wallet-outline"
    empty-text="Crea tu primera cuenta para registrar movimientos."
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-wallet-outline"
    singular-title="cuenta"
    :store="accountsStore"
    subtitle="Clasifica tus cuentas como efectivo/líquidas o activos no líquidos. El balance se calculará desde transactions."
    title="Cuentas"
    :totals="totals"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import CrudPage from '../../components/crud/CrudPage.vue'
import { useAccountsStore } from '../../stores/accounts'
import { useCardsStore } from '../../stores/cards'
import { useTransactionsStore } from '../../stores/transactions'
import { formRules } from '../../utils/formRules'

const accountsStore = useAccountsStore()
const cardsStore = useCardsStore()
const transactionsStore = useTransactionsStore()

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Tipo', key: 'typeLabel' },
  { title: 'Clasificación', key: 'classificationLabel' },
  { title: 'Tarjeta', key: 'cardLabel' },
  { title: 'Saldo', key: 'balanceLabel' },
  { title: 'Estado', key: 'isActive' },
]

const cardItems = computed(() =>
  cardsStore.activeCards.map((card) => ({
    title: `${card.name} - ${card.bank}`,
    value: card.id,
  })),
)

const fields = computed(() => [
  {
    key: 'name',
    label: 'Nombre',
    rules: [formRules.required],
  },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    defaultValue: 'bank',
    items: [
      { title: 'Efectivo', value: 'cash' },
      { title: 'Banco', value: 'bank' },
      { title: 'Ahorros', value: 'savings' },
      { title: 'Crédito', value: 'credit' },
      { title: 'Inversiones', value: 'investments' },
    ],
    rules: [formRules.required],
    md: 6,
  },
  {
    key: 'cardId',
    label: 'Tarjeta de crédito',
    type: 'select',
    items: cardItems.value,
    noDataText: 'No existen tarjetas disponibles, crea una tarjeta nueva o habilita alguna',
    rules: [formRules.required],
    showWhen: (form) => form.type === 'credit',
    md: 6,
  },
  {
    key: 'classification',
    label: 'Clasificación',
    type: 'select',
    defaultValue: 'cash',
    items: [
      { title: 'Cuenta de efectivo / líquida', value: 'cash' },
      { title: 'Activo no líquido', value: 'non_liquid_asset' },
    ],
    rules: [formRules.required],
    md: 6,
  },
  {
    key: 'isActive',
    label: 'Estado',
    type: 'boolean',
    defaultValue: true,
    md: 6,
  },
])

const accountTypeLabels = {
  cash: 'Efectivo',
  bank: 'Banco',
  savings: 'Ahorros',
  credit: 'Crédito',
  investments: 'Inversiones',
}

const accountClassificationLabels = {
  cash: 'Efectivo / líquida',
  non_liquid_asset: 'Activo no líquido',
}

const totals = computed(() => ({
  balanceLabel: formatMoney(accountsStore.items.reduce((total, account) => total + getAccountBalance(account), 0)),
}))

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

function getAccountBalance(account) {
  return transactionsStore.items.reduce((balance, transaction) => {
    const amount = Number(transaction.amount || 0)

    if (transaction.type === 'income') {
      return transaction.accountId === account.id ? balance + amount : balance
    }

    if (transaction.type === 'expense') {
      return transaction.accountId === account.id ? balance - amount : balance
    }

    if (transaction.type === 'card_payment') {
      return transaction.accountId === account.id ? balance - amount : balance
    }

    if (transaction.type === 'transfer') {
      if (transaction.accountId === account.id) {
        return balance - amount
      }

      if (transaction.destinationAccountId === account.id) {
        return balance + amount
      }
    }

    return balance
  }, 0)
}

function formatRow(account) {
  return {
    ...account,
    typeLabel: accountTypeLabels[account.type] || account.type,
    classificationLabel: getAccountClassificationLabel(account),
    cardLabel: cardsStore.items.find((card) => card.id === account.cardId)?.name || '-',
    balanceLabel: formatMoney(getAccountBalance(account)),
  }
}

function getAccountClassificationLabel(account) {
  const classification = account.classification || getDefaultAccountClassification(account.type)

  return accountClassificationLabels[classification] || '-'
}

function getDefaultAccountClassification(type) {
  return type === 'investments' ? 'non_liquid_asset' : 'cash'
}
</script>
