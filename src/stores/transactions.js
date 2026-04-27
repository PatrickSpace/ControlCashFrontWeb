import { computed } from 'vue'
import { defineStore } from 'pinia'

import { transactionsService } from '../services/transactionsService'
import { createCrudStoreState } from './crudStoreFactory'

export const useTransactionsStore = defineStore('transactions', () => {
  const store = createCrudStoreState(transactionsService)

  const transactionsByDate = computed(() =>
    [...store.items.value].sort((first, second) => String(second.date).localeCompare(first.date)),
  )

  return {
    ...store,
    transactionsByDate,
  }
})
