<template>
  <CrudPage
    empty-icon="mdi-chart-donut"
    empty-text="Crea presupuestos mensuales por categoría."
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-chart-donut"
    singular-title="presupuesto"
    :store="budgetsStore"
    subtitle="El restante y porcentaje usado se calcularán desde transactions."
    title="Presupuestos"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

import CrudPage from '../../components/crud/CrudPage.vue'
import { useBudgetsStore } from '../../stores/budgets'
import { useCategoriesStore } from '../../stores/categories'
import { formRules } from '../../utils/formRules'

const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()
const currentDate = new Date()

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Categoría', key: 'categoryLabel' },
  { title: 'Periodo', key: 'periodLabel' },
  { title: 'Límite', key: 'limitAmountLabel' },
  { title: 'Mes', key: 'month' },
  { title: 'Año', key: 'year' },
  { title: 'Estado', key: 'isActive' },
]

function getCategoryItems(editingBudget) {
  const usedCategoryIds = budgetsStore.items
    .filter((budget) => budget.id !== editingBudget?.id)
    .map((budget) => budget.categoryId)

  return categoriesStore.activeCategories
    .filter((category) => !usedCategoryIds.includes(category.id))
    .map((category) => ({
      title: category.name,
      value: category.id,
    }))
}

const fields = computed(() => [
  { key: 'name', label: 'Nombre', rules: [formRules.required] },
  {
    key: 'categoryId',
    label: 'Categoría',
    type: 'select',
    items: (_form, editingBudget) => getCategoryItems(editingBudget),
    noDataText: 'Todas las categorías activas ya tienen un presupuesto.',
    rules: (_form, editingBudget) => [
      formRules.required,
      (value) => isCategoryAvailable(value, editingBudget) || 'Esta categoría ya pertenece a otro presupuesto.',
    ],
    md: 6,
  },
  {
    key: 'period',
    label: 'Periodo',
    type: 'select',
    defaultValue: 'monthly',
    items: [{ title: 'Mensual', value: 'monthly' }],
    rules: [formRules.required],
    md: 6,
  },
  {
    key: 'limitAmount',
    label: 'Límite',
    type: 'number',
    prefix: 'S/.',
    rules: [formRules.required, formRules.positive],
    md: 6,
  },
  {
    key: 'month',
    label: 'Mes',
    type: 'number',
    defaultValue: currentDate.getMonth() + 1,
    rules: [formRules.required, formRules.month],
    md: 3,
  },
  {
    key: 'year',
    label: 'Año',
    type: 'number',
    defaultValue: currentDate.getFullYear(),
    rules: [formRules.required, formRules.year],
    md: 3,
  },
  {
    key: 'isActive',
    label: 'Estado',
    type: 'boolean',
    defaultValue: true,
    md: 6,
  },
])

onMounted(() => {
  categoriesStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  categoriesStore.stopRealtime()
})

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatRow(budget) {
  return {
    ...budget,
    categoryLabel: categoriesStore.items.find((category) => category.id === budget.categoryId)?.name || '-',
    periodLabel: budget.period === 'monthly' ? 'Mensual' : budget.period,
    limitAmountLabel: formatMoney(budget.limitAmount),
  }
}

function isCategoryAvailable(categoryId, editingBudget) {
  return !budgetsStore.items.some(
    (budget) => budget.id !== editingBudget?.id && budget.categoryId === categoryId,
  )
}
</script>
