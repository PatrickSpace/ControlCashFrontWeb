import { computed } from 'vue'
import { defineStore } from 'pinia'

import { accountsService } from '../services/accountsService'
import { createCrudStoreState } from './crudStoreFactory'

export const useAccountsStore = defineStore('accounts', () => {
  const store = createCrudStoreState(accountsService)

  const activeAccounts = computed(() =>
    store.items.value.filter((account) => account.isActive !== false),
  )

  return {
    ...store,
    activeAccounts,
  }
})
