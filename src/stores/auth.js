import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'

import { auth } from '../firebase'
import { getAuthErrorMessage } from '../utils/authErrors'

let authReadyPromise
const gmailAccessTokenStorageKey = 'controlcash.gmailAccessToken'
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly')
googleProvider.setCustomParameters({
  include_granted_scopes: 'true',
  prompt: 'select_account',
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const gmailAccessToken = ref(getStoredGmailAccessToken())
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(user.value))
  const displayName = computed(() => user.value?.displayName || user.value?.email || 'Usuario')

  function initAuth() {
    if (authReadyPromise) {
      return authReadyPromise
    }

    authReadyPromise = new Promise((resolve) => {
      onAuthStateChanged(
        auth,
        (currentUser) => {
          user.value = currentUser
          initialized.value = true
          resolve(currentUser)
        },
        (authError) => {
          error.value = getAuthErrorMessage(authError)
          initialized.value = true
          resolve(null)
        },
      )
    })

    return authReadyPromise
  }

  async function login(email, password) {
    loading.value = true
    error.value = ''

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (authError) {
      error.value = getAuthErrorMessage(authError)
      throw authError
    } finally {
      loading.value = false
    }
  }

  async function register({ email, password, name }) {
    loading.value = true
    error.value = ''

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)

      if (name) {
        await updateProfile(credential.user, { displayName: name })
        user.value = auth.currentUser
      }
    } catch (authError) {
      error.value = getAuthErrorMessage(authError)
      throw authError
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = ''

    try {
      const credential = await signInWithPopup(auth, googleProvider)
      rememberGmailAccessToken(credential)
    } catch (authError) {
      error.value = getAuthErrorMessage(authError)
      throw authError
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = ''

    try {
      clearGmailAccessToken()
      await signOut(auth)
    } catch (authError) {
      error.value = getAuthErrorMessage(authError)
      throw authError
    } finally {
      loading.value = false
    }
  }

  function rememberGmailAccessToken(authResult) {
    const credential = GoogleAuthProvider.credentialFromResult(authResult)
    const accessToken = credential?.accessToken

    if (!accessToken) {
      return
    }

    gmailAccessToken.value = accessToken
    localStorage.setItem(gmailAccessTokenStorageKey, accessToken)
  }

  function clearGmailAccessToken() {
    gmailAccessToken.value = ''
    localStorage.removeItem(gmailAccessTokenStorageKey)
  }

  return {
    user,
    gmailAccessToken,
    initialized,
    loading,
    error,
    isAuthenticated,
    displayName,
    initAuth,
    login,
    register,
    loginWithGoogle,
    logout,
    clearGmailAccessToken,
  }
})

function getStoredGmailAccessToken() {
  return localStorage.getItem(gmailAccessTokenStorageKey) || ''
}
