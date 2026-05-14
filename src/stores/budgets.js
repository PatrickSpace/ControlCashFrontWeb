import { computed } from 'vue'
import { defineStore } from 'pinia'

import { budgetsService } from '../services/budgetsService'
import { createCrudStoreState } from './crudStoreFactory'
import { FinanceValidationError } from '../utils/financeValidators'

export const useBudgetsStore = defineStore('budgets', () => {
  const store = createCrudStoreState(budgetsService)

  const activeBudgets = computed(() =>
    store.items.value.filter((budget) => budget.isActive !== false),
  )

  function assertUniqueCategory(categoryId, budgetId) {
    if (!categoryId) {
      return
    }

    const categoryHasBudget = store.items.value.some(
      (budget) => budget.id !== budgetId && budget.categoryId === categoryId,
    )

    if (categoryHasBudget) {
      throw new FinanceValidationError('Esta categoría ya pertenece a otro presupuesto.')
    }
  }

  function validateUniqueCategory(categoryId, budgetId) {
    try {
      assertUniqueCategory(categoryId, budgetId)
    } catch (validationError) {
      store.setError(validationError.message)
      throw validationError
    }
  }

  async function createItem(payload, options) {
    store.clearError()
    validateUniqueCategory(payload.categoryId)

    return store.createItem(payload, options)
  }

  async function updateItem(documentId, payload, options) {
    store.clearError()
    validateUniqueCategory(payload.categoryId, documentId)

    return store.updateItem(documentId, payload, options)
  }

  return {
    ...store,
    activeBudgets,
    createItem,
    updateItem,
  }
})
