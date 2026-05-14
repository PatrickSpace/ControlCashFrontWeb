export const formRules = {
  required: (value) => value !== undefined && value !== null && value !== '' || 'Este campo es obligatorio.',
  positive: (value) => Number(value) > 0 || 'Debe ser mayor a 0.',
  zeroOrPositive: (value) => Number(value) >= 0 || 'Debe ser mayor o igual a 0.',
  dayOfMonth: (value) => {
    const day = Number(value)
    return Number.isInteger(day) && day >= 1 && day <= 31 || 'Debe estar entre 1 y 31.'
  },
  month: (value) => {
    const month = Number(value)
    return Number.isInteger(month) && month >= 1 && month <= 12 || 'Debe estar entre 1 y 12.'
  },
  year: (value) => {
    const year = Number(value)
    return Number.isInteger(year) && year >= 2000 && year <= 2100 || 'Ingresa un año válido.'
  },
  date: (value) =>
    value instanceof Date && !Number.isNaN(value.getTime()) ||
    /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ||
    'Selecciona una fecha válida.',
}
