import { computed, ref } from 'vue'

import { getFirestoreErrorMessage } from '../utils/firestoreErrors'

export function createCrudStoreState(service) {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')
  const realtimeActive = ref(false)

  let realtimeUnsubscribe = null

  const count = computed(() => items.value.length)

  function clearError() {
    error.value = ''
  }

  async function runAction(action) {
    loading.value = true
    clearError()

    try {
      return await action()
    } catch (actionError) {
      error.value = getFirestoreErrorMessage(actionError)
      throw actionError
    } finally {
      loading.value = false
    }
  }

  async function fetchAll(options) {
    return runAction(async () => {
      items.value = await service.list(options)
      return items.value
    })
  }

  function subscribeRealtime(options) {
    stopRealtime()
    loading.value = true
    clearError()

    realtimeUnsubscribe = service.subscribe(
      (nextItems) => {
        items.value = nextItems
        loading.value = false
        realtimeActive.value = true
      },
      (subscriptionError) => {
        error.value = getFirestoreErrorMessage(subscriptionError)
        loading.value = false
        realtimeActive.value = false
      },
      options,
    )

    return realtimeUnsubscribe
  }

  function stopRealtime() {
    if (realtimeUnsubscribe) {
      realtimeUnsubscribe()
      realtimeUnsubscribe = null
    }

    realtimeActive.value = false
  }

  async function refreshWhenStatic() {
    if (!realtimeActive.value) {
      await fetchAll()
    }
  }

  async function createItem(payload, options) {
    return runAction(async () => {
      const documentId = await service.create(payload, options)
      await refreshWhenStatic()
      return documentId
    })
  }

  async function updateItem(documentId, payload, options) {
    return runAction(async () => {
      await service.update(documentId, payload, options)
      await refreshWhenStatic()
      return documentId
    })
  }

  async function removeItem(documentId, options) {
    return runAction(async () => {
      await service.remove(documentId, options)
      await refreshWhenStatic()
      return documentId
    })
  }

  async function getById(documentId, options) {
    return runAction(() => service.getById(documentId, options))
  }

  function clear() {
    stopRealtime()
    items.value = []
    loading.value = false
    clearError()
  }

  return {
    items,
    count,
    loading,
    error,
    realtimeActive,
    fetchAll,
    subscribeRealtime,
    stopRealtime,
    createItem,
    updateItem,
    removeItem,
    getById,
    clear,
    clearError,
  }
}
