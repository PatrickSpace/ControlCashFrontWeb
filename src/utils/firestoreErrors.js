import { FinanceValidationError } from './financeValidators'

const firestoreErrorMessages = {
  'permission-denied': 'No tienes permisos para acceder a estos datos.',
  unauthenticated: 'Debes iniciar sesion para continuar.',
  unavailable: 'Firestore no esta disponible. Intentalo nuevamente.',
  'not-found': 'El registro solicitado no existe.',
}

export function getFirestoreErrorMessage(error) {
  if (error instanceof FinanceValidationError) {
    return error.message
  }

  return firestoreErrorMessages[error?.code] || error?.message || 'No pudimos completar la operacion.'
}
