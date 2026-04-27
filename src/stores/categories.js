import { computed } from 'vue'
import { defineStore } from 'pinia'

import { categoriesService } from '../services/categoriesService'
import { createCrudStoreState } from './crudStoreFactory'

export const useCategoriesStore = defineStore('categories', () => {
  const store = createCrudStoreState(categoriesService)

  const activeCategories = computed(() =>
    store.items.value.filter((category) => category.isActive !== false),
  )

  return {
    ...store,
    activeCategories,
  }
})
