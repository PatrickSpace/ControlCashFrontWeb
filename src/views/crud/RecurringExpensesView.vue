<template>
  <CrudPage
    empty-icon="mdi-calendar-sync-outline"
    empty-text="Registra tus gastos recurrentes para mensualizar el presupuesto."
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-calendar-sync-outline"
    :items="sortedRecurringExpenses"
    :prepare-payload="prepareRecurringExpensePayload"
    singular-title="gasto recurrente"
    :store="recurringExpensesStore"
    subtitle="Calcula prorrateo e importe mensualizado por cada gasto registrado."
    title="Gastos recurrentes"
    :totals="totals"
    totals-label="Presupuesto mensual"
  />
</template>

<script setup>
import { computed } from 'vue'

import CrudPage from '../../components/crud/CrudPage.vue'
import { useRecurringExpensesStore } from '../../stores/recurringExpenses'
import {
  calculateRecurringExpenseMonthlyAmount,
  getRecurringExpenseProration,
} from '../../utils/financeModel'
import { formRules } from '../../utils/formRules'

const recurringExpensesStore = useRecurringExpensesStore()

const frequencyItems = [
  { title: 'Semanal', value: 'weekly' },
  { title: 'Quincenal', value: 'biweekly' },
  { title: 'Dos veces al mes', value: 'semimonthly' },
  { title: 'Mensual', value: 'monthly' },
  { title: 'Bimestral', value: 'bimonthly' },
  { title: 'Trimestral', value: 'quarterly' },
  { title: 'Cuatrimestral', value: 'four_monthly' },
  { title: 'Semestral', value: 'semiannual' },
  { title: 'Anual', value: 'annual' },
]

const typeItems = [
  { title: 'Necesario', value: 'necessary' },
  { title: 'Mascota', value: 'pet' },
  { title: 'Ocio', value: 'leisure' },
  { title: 'Opcional', value: 'optional' },
  { title: 'Suscripción', value: 'subscription' },
]

const frequencyLabels = createLabelMap(frequencyItems)
const typeLabels = createLabelMap(typeItems)

const headers = [
  { title: 'Descripción', key: 'description' },
  { title: 'Importe', key: 'amountLabel' },
  { title: 'Frecuencia', key: 'frequencyLabel' },
  { title: 'Prorrateo', key: 'prorationLabel' },
  { title: 'Importe mensualizado', key: 'monthlyAmountLabel' },
  { title: 'Tipo', key: 'typeLabel' },
  { title: 'Estado', key: 'isActive' },
]

const fields = [
  {
    key: 'description',
    label: 'Descripción',
    rules: [formRules.required],
  },
  {
    key: 'amount',
    label: 'Importe',
    type: 'number',
    prefix: 'S/.',
    rules: [formRules.required, formRules.positive],
    md: 6,
  },
  {
    key: 'frequency',
    label: 'Frecuencia',
    type: 'select',
    defaultValue: 'monthly',
    items: frequencyItems,
    rules: [formRules.required],
    md: 6,
  },
  {
    key: 'proration',
    label: 'Prorrateo',
    computedValue: (form) => formatProration(getRecurringExpenseProration(form.frequency)),
    hint: 'Se calcula desde la frecuencia.',
    md: 6,
  },
  {
    key: 'monthlyAmount',
    label: 'Importe mensualizado',
    prefix: 'S/.',
    computedValue: (form) =>
      calculateRecurringExpenseMonthlyAmount(form.amount, form.frequency).toFixed(2),
    hint: 'Importe multiplicado por el prorrateo.',
    md: 6,
  },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    defaultValue: 'necessary',
    items: typeItems,
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
]

const sortedRecurringExpenses = computed(() =>
  [...recurringExpensesStore.items].sort((firstExpense, secondExpense) =>
    String(firstExpense.description || '').localeCompare(
      String(secondExpense.description || ''),
      'es',
      { sensitivity: 'base' },
    ),
  ),
)

const totals = computed(() => ({
  monthlyAmountLabel: formatMoney(
    recurringExpensesStore.activeRecurringExpenses.reduce(
      (total, expense) => total + getMonthlyAmount(expense),
      0,
    ),
  ),
}))

function prepareRecurringExpensePayload(payload) {
  const proration = getRecurringExpenseProration(payload.frequency)

  return {
    ...payload,
    proration,
    monthlyAmount: calculateRecurringExpenseMonthlyAmount(payload.amount, payload.frequency),
  }
}

function formatRow(expense) {
  return {
    ...expense,
    amountLabel: formatMoney(expense.amount),
    frequencyLabel: frequencyLabels[expense.frequency] || expense.frequency || '-',
    prorationLabel: formatProration(getRecurringExpenseProration(expense.frequency)),
    monthlyAmountLabel: formatMoney(getMonthlyAmount(expense)),
    typeLabel: typeLabels[expense.type] || expense.type || '-',
  }
}

function getMonthlyAmount(expense) {
  return calculateRecurringExpenseMonthlyAmount(expense.amount, expense.frequency)
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-PE', {
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(Number(value || 0))
}

function formatProration(value) {
  const proration = Number(value || 0)

  if (Number.isInteger(proration)) {
    return String(proration)
  }

  return proration.toFixed(9).replace(/0+$/, '').replace(/\.$/, '')
}

function createLabelMap(items) {
  return items.reduce((labels, item) => {
    labels[item.value] = item.title
    return labels
  }, {})
}
</script>
