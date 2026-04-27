<template>
  <CrudPage
    empty-icon="mdi-shape-outline"
    empty-text="Crea categorías para clasificar ingresos y gastos."
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-shape-outline"
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
  { title: 'Estado', key: 'isActive' },
]

const fields = [
  { key: 'name', label: 'Nombre', rules: [formRules.required] },
]
</script>
