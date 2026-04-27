import { computed } from 'vue'
import { defineStore } from 'pinia'

import { budgetsService } from '../services/budgetsService'
import { createCrudStoreState } from './crudStoreFactory'

export const useBudgetsStore = defineStore('budgets', () => {
  const store = createCrudStoreState(budgetsService)

  const activeBudgets = computed(() =>
    store.items.value.filter((budget) => budget.isActive !== false),
  )

  return {
    ...store,
    activeBudgets,
  }
})
