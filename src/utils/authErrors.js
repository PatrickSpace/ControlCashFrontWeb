const authErrorMessages = {
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método de inicio.',
  'auth/cancelled-popup-request': 'Ya hay una ventana de inicio de sesión abierta.',
  'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
  'auth/invalid-email': 'Ingresa un correo válido.',
  'auth/missing-password': 'Ingresa tu contraseña.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado en Firebase.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de inicio de sesión con Google.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de inicio de sesión antes de completar el proceso.',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo nuevamente en unos minutos.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
  'auth/user-not-found': 'No existe una cuenta con este correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/wrong-password': 'El correo o la contraseña no son correctos.',
}

export function getAuthErrorMessage(error) {
  return authErrorMessages[error?.code] || 'No pudimos completar la operación. Inténtalo nuevamente.'
}
