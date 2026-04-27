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
    subtitle="Cuentas de efectivo, bancos, ahorros, crédito e inversiones. El balance se calculará desde transactions."
    title="Cuentas"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import CrudPage from '../../components/crud/CrudPage.vue'
import { useAccountsStore } from '../../stores/accounts'
import { useCardsStore } from '../../stores/cards'
import { formRules } from '../../utils/formRules'

const accountsStore = useAccountsStore()
const cardsStore = useCardsStore()

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Tipo', key: 'typeLabel' },
  { title: 'Tarjeta', key: 'cardLabel' },
  { title: 'Moneda', key: 'currency' },
  { title: 'Saldo inicial', key: 'initialBalanceLabel' },
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
    key: 'currency',
    label: 'Moneda',
    type: 'select',
    defaultValue: 'PEN',
    items: [
      { title: 'Soles', value: 'PEN' },
      { title: 'Dólares', value: 'USD' },
    ],
    rules: [formRules.required],
    md: 6,
  },
  {
    key: 'initialBalance',
    label: 'Saldo inicial',
    type: 'number',
    prefix: 'S/.',
    defaultValue: 0,
    rules: [formRules.required, formRules.zeroOrPositive],
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

onMounted(() => {
  cardsStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  cardsStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatRow(account) {
  return {
    ...account,
    typeLabel: accountTypeLabels[account.type] || account.type,
    cardLabel: cardsStore.items.find((card) => card.id === account.cardId)?.name || '-',
    initialBalanceLabel: formatMoney(account.initialBalance),
  }
}
</script>
