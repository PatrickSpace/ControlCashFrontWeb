<template>
  <CrudPage
    empty-icon="mdi-shape-outline"
    empty-text="Crea categorías para clasificar ingresos y gastos."
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-shape-outline"
    :prepare-payload="prepareCategoryPayload"
    singular-title="categoría"
    :store="categoriesStore"
    subtitle="Clasificación de movimientos. Los totales por categoría se calcularán desde transactions."
    title="Categorías"
  />
</template>

<script setup>
import CrudPage from '../../components/crud/CrudPage.vue'
import { useCategoriesStore } from '../../stores/categories'
import { formRules } from '../../utils/formRules'

const categoriesStore = useCategoriesStore()

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Tipo', key: 'typeLabel' },
  { title: 'Estado', key: 'isActive' },
]

const fields = [
  { key: 'name', label: 'Nombre', rules: [formRules.required] },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    defaultValue: 'expense',
    items: [
      { title: 'Ingreso', value: 'income' },
      { title: 'Gasto', value: 'expense' },
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
]

const categoryTypeLabels = {
  income: 'Ingreso',
  expense: 'Gasto',
}

function formatRow(category) {
  const type = category.type || 'expense'

  return {
    ...category,
    type,
    typeLabel: categoryTypeLabels[type] || type,
  }
}

function getFieldValue(value) {
  return value && typeof value === 'object' ? value.value : value
}

function prepareCategoryPayload(payload) {
  return {
    ...payload,
    type: getFieldValue(payload.type) || 'expense',
    isActive: getFieldValue(payload.isActive),
  }
}
</script>
