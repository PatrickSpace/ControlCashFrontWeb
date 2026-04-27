import { computed } from 'vue'
import { defineStore } from 'pinia'

import { cardsService } from '../services/cardsService'
import { createCrudStoreState } from './crudStoreFactory'

export const useCardsStore = defineStore('cards', () => {
  const store = createCrudStoreState(cardsService)

  const activeCards = computed(() => store.items.value.filter((card) => card.isActive !== false))

  return {
    ...store,
    activeCards,
  }
})
