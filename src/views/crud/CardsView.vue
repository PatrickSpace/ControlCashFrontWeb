<template>
  <CrudPage
    empty-icon="mdi-credit-card-outline"
    empty-text="Registra una tarjeta para controlar compras y pagos."
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-credit-card-outline"
    singular-title="tarjeta"
    :store="cardsStore"
    subtitle="Tarjetas de crédito. Crédito usado y disponible se calcularán desde transactions."
    title="Tarjetas"
  />
</template>

<script setup>
import CrudPage from '../../components/crud/CrudPage.vue'
import { useCardsStore } from '../../stores/cards'
import { formRules } from '../../utils/formRules'

const cardsStore = useCardsStore()

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Banco', key: 'bank' },
  { title: 'Línea', key: 'creditLimitLabel' },
  { title: 'Cierre', key: 'billingDayLabel' },
  { title: 'Pago', key: 'paymentDueDayLabel' },
  { title: 'Estado', key: 'isActive' },
]

const fields = [
  { key: 'name', label: 'Nombre', rules: [formRules.required] },
  { key: 'bank', label: 'Banco', rules: [formRules.required] },
  {
    key: 'creditLimit',
    label: 'Línea de crédito',
    type: 'number',
    prefix: 'S/.',
    defaultValue: 0,
    rules: [formRules.required, formRules.zeroOrPositive],
    md: 6,
  },
  {
    key: 'billingDay',
    label: 'Día de cierre',
    type: 'number',
    rules: [formRules.required, formRules.dayOfMonth],
    md: 4,
  },
  {
    key: 'paymentDueDay',
    label: 'Día de pago',
    type: 'number',
    rules: [formRules.required, formRules.dayOfMonth],
    md: 4,
  },
  {
    key: 'isActive',
    label: 'Estado',
    type: 'boolean',
    defaultValue: true,
    md: 4,
  },
]

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatRow(card) {
  return {
    ...card,
    creditLimitLabel: formatMoney(card.creditLimit),
    billingDayLabel: `Día ${card.billingDay}`,
    paymentDueDayLabel: `Día ${card.paymentDueDay}`,
  }
}
</script>
