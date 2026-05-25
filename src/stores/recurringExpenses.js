import { computed } from 'vue'
import { defineStore } from 'pinia'

import { recurringExpensesService } from '../services/recurringExpensesService'
import { createCrudStoreState } from './crudStoreFactory'

export const useRecurringExpensesStore = defineStore('recurringExpenses', () => {
  const store = createCrudStoreState(recurringExpensesService)

  const activeRecurringExpenses = computed(() =>
    store.items.value.filter((expense) => expense.isActive !== false),
  )

  return {
    ...store,
    activeRecurringExpenses,
  }
})
