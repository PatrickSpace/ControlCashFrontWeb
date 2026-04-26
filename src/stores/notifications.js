import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', () => {
  const visible = ref(false)
  const message = ref('')
  const color = ref('info')

  function show(nextMessage, nextColor = 'info') {
    message.value = nextMessage
    color.value = nextColor
    visible.value = true
  }

  function success(nextMessage) {
    show(nextMessage, 'success')
  }

  function error(nextMessage) {
    show(nextMessage, 'error')
  }

  return {
    visible,
    message,
    color,
    show,
    success,
    error,
  }
})
