import {
  ACCOUNT_CLASSIFICATIONS,
  ACCOUNT_TYPES,
  BUDGET_PERIODS,
  CATEGORY_TYPES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
} from './financeModel'

export class FinanceValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'FinanceValidationError'
  }
}

function hasOwn(payload, field) {
  return Object.prototype.hasOwnProperty.call(payload, field)
}

function shouldValidate(payload, field, partial) {
  return !partial || hasOwn(payload, field)
}

function requiredMessage(field) {
  return `${field} es obligatorio.`
}

function normalizeString(value, field, options = {}) {
  const { required = false, maxLength = 120 } = options

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new FinanceValidationError(requiredMessage(field))
    }

    return undefined
  }

  const normalizedValue = String(value).trim()

  if (!normalizedValue && required) {
    throw new FinanceValidationError(requiredMessage(field))
  }

  if (normalizedValue.length > maxLength) {
    throw new FinanceValidationError(`${field} no debe superar ${maxLength} caracteres.`)
  }

  return normalizedValue || undefined
}

function normalizeEnum(value, field, allowedValues, options = {}) {
  const normalizedValue = normalizeString(value, field, options)

  if (normalizedValue === undefined) {
    return undefined
  }

  if (!allowedValues.includes(normalizedValue)) {
    throw new FinanceValidationError(`${field} no tiene un valor valido.`)
  }

  return normalizedValue
}

function normalizeAmount(value, field, options = {}) {
  const { required = false, min = 0 } = options

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new FinanceValidationError(requiredMessage(field))
    }

    return undefined
  }

  const normalizedValue = Number(value)

  if (!Number.isFinite(normalizedValue)) {
    throw new FinanceValidationError(`${field} debe ser un numero valido.`)
  }

  if (normalizedValue < min) {
    throw new FinanceValidationError(`${field} debe ser mayor o igual a ${min}.`)
  }

  return normalizedValue
}

function normalizeInteger(value, field, options = {}) {
  const normalizedValue = normalizeAmount(value, field, options)

  if (normalizedValue === undefined) {
    return undefined
  }

  if (!Number.isInteger(normalizedValue)) {
    throw new FinanceValidationError(`${field} debe ser un numero entero.`)
  }

  if (options.max !== undefined && normalizedValue > options.max) {
    throw new FinanceValidationError(`${field} debe ser menor o igual a ${options.max}.`)
  }

  return normalizedValue
}

function normalizeBoolean(value, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue
  }

  return Boolean(value)
}

function normalizeDate(value, field, options = {}) {
  const normalizedValue = normalizeString(value, field, options)

  if (normalizedValue === undefined) {
    return undefined
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue) || Number.isNaN(Date.parse(normalizedValue))) {
    throw new FinanceValidationError(`${field} debe tener formato YYYY-MM-DD.`)
  }

  return normalizedValue
}

function assignIfPresent(target, field, value) {
  if (value !== undefined) {
    target[field] = value
  }
}

function assignOptionalString(target, field, value, label) {
  if (value === null) {
    target[field] = null
    return
  }

  assignIfPresent(target, field, normalizeString(value, label))
}

export function validateAccount(payload, options = {}) {
  const { partial = false } = options
  const account = {}

  if (shouldValidate(payload, 'name', partial)) {
    account.name = normalizeString(payload.name, 'Nombre', { required: true })
  }

  if (shouldValidate(payload, 'type', partial)) {
    account.type = normalizeEnum(payload.type, 'Tipo de cuenta', ACCOUNT_TYPES, { required: true })
  }

  if (shouldValidate(payload, 'classification', partial) || !partial) {
    account.classification = normalizeEnum(
      payload.classification || getDefaultAccountClassification(payload.type),
      'Clasificacion',
      ACCOUNT_CLASSIFICATIONS,
      { required: true },
    )
  }

  if (shouldValidate(payload, 'cardId', partial)) {
    assignIfPresent(account, 'cardId', normalizeString(payload.cardId, 'Tarjeta'))
  }

  if (account.type === 'credit') {
    account.cardId = normalizeString(payload.cardId, 'Tarjeta', { required: true })
  } else if (account.type && account.type !== 'credit') {
    account.cardId = null
  }

  if (shouldValidate(payload, 'isActive', partial)) {
    account.isActive = normalizeBoolean(payload.isActive, true)
  }

  return account
}

function getDefaultAccountClassification(type) {
  return type === 'investments' ? 'non_liquid_asset' : 'cash'
}

export function validateCard(payload, options = {}) {
  const { partial = false } = options
  const card = {}

  if (shouldValidate(payload, 'name', partial)) {
    card.name = normalizeString(payload.name, 'Nombre', { required: true })
  }

  if (shouldValidate(payload, 'bank', partial)) {
    card.bank = normalizeString(payload.bank, 'Banco', { required: true })
  }

  if (shouldValidate(payload, 'creditLimit', partial)) {
    card.creditLimit = normalizeAmount(payload.creditLimit, 'Linea de credito', {
      required: true,
      min: 0,
    })
  }

  if (shouldValidate(payload, 'billingDay', partial)) {
    card.billingDay = normalizeInteger(payload.billingDay, 'Dia de cierre', {
      required: true,
      min: 1,
      max: 31,
    })
  }

  if (shouldValidate(payload, 'paymentDueDay', partial)) {
    card.paymentDueDay = normalizeInteger(payload.paymentDueDay, 'Dia de pago', {
      required: true,
      min: 1,
      max: 31,
    })
  }

  if (shouldValidate(payload, 'isActive', partial)) {
    card.isActive = normalizeBoolean(payload.isActive, true)
  }

  return card
}

export function validateCategory(payload, options = {}) {
  const { partial = false } = options
  const category = {}

  if (shouldValidate(payload, 'name', partial)) {
    category.name = normalizeString(payload.name, 'Nombre', { required: true })
  }

  if (shouldValidate(payload, 'type', partial) || !partial) {
    category.type = normalizeEnum(payload.type || 'expense', 'Tipo de categoria', CATEGORY_TYPES, {
      required: true,
    })
  }

  if (shouldValidate(payload, 'isActive', partial) || !partial) {
    category.isActive = normalizeBoolean(payload.isActive, true)
  }

  return category
}

export function validateTransaction(payload, options = {}) {
  const { partial = false } = options
  const transaction = {}

  if (shouldValidate(payload, 'type', partial)) {
    transaction.type = normalizeEnum(payload.type, 'Tipo de transaccion', TRANSACTION_TYPES, {
      required: true,
    })
  }

  if (shouldValidate(payload, 'amount', partial)) {
    transaction.amount = normalizeAmount(payload.amount, 'Monto', { required: true, min: 0.01 })
  }

  if (shouldValidate(payload, 'date', partial)) {
    transaction.date = normalizeDate(payload.date, 'Fecha', { required: true })
  }

  if (shouldValidate(payload, 'description', partial)) {
    assignIfPresent(
      transaction,
      'description',
      normalizeString(payload.description, 'Descripcion', { maxLength: 180 }),
    )
  }

  if (shouldValidate(payload, 'categoryId', partial)) {
    assignOptionalString(transaction, 'categoryId', payload.categoryId, 'Categoria')
  }

  if (shouldValidate(payload, 'accountId', partial)) {
    assignOptionalString(transaction, 'accountId', payload.accountId, 'Cuenta')
  }

  if (shouldValidate(payload, 'cardId', partial)) {
    assignOptionalString(transaction, 'cardId', payload.cardId, 'Tarjeta')
  }

  if (shouldValidate(payload, 'destinationAccountId', partial)) {
    assignOptionalString(
      transaction,
      'destinationAccountId',
      payload.destinationAccountId,
      'Cuenta destino',
    )
  }

  if (shouldValidate(payload, 'paymentMethod', partial)) {
    if (payload.paymentMethod === null) {
      transaction.paymentMethod = null
    } else {
      assignIfPresent(
        transaction,
        'paymentMethod',
        normalizeEnum(payload.paymentMethod, 'Metodo de pago', PAYMENT_METHODS),
      )
    }
  }

  if (!partial) {
    validateTransactionReferences(transaction)
  }

  return transaction
}

function validateTransactionReferences(transaction) {
  if (transaction.type === 'income' && !transaction.accountId) {
    throw new FinanceValidationError('Un ingreso necesita una cuenta.')
  }

  if (transaction.type === 'expense') {
    if (transaction.paymentMethod === 'credit' && !transaction.cardId) {
      throw new FinanceValidationError('Un gasto con credito necesita una tarjeta.')
    }

    if (transaction.paymentMethod !== 'credit' && !transaction.accountId) {
      throw new FinanceValidationError('Un gasto en efectivo o debito necesita una cuenta.')
    }
  }

  if (transaction.type === 'transfer') {
    if (!transaction.accountId || !transaction.destinationAccountId) {
      throw new FinanceValidationError('Una transferencia necesita cuenta origen y destino.')
    }

    if (transaction.accountId === transaction.destinationAccountId) {
      throw new FinanceValidationError('La cuenta origen y destino deben ser distintas.')
    }
  }

  if (transaction.type === 'card_purchase' && !transaction.cardId) {
    throw new FinanceValidationError('Una compra con tarjeta necesita una tarjeta.')
  }

  if (transaction.type === 'card_payment' && (!transaction.cardId || !transaction.accountId)) {
    throw new FinanceValidationError('Un pago de tarjeta necesita una tarjeta y una cuenta.')
  }
}

export function validateBudget(payload, options = {}) {
  const { partial = false } = options
  const budget = {}

  if (shouldValidate(payload, 'name', partial)) {
    budget.name = normalizeString(payload.name, 'Nombre', { required: true })
  }

  if (shouldValidate(payload, 'categoryId', partial)) {
    budget.categoryId = normalizeString(payload.categoryId, 'Categoria', { required: true })
  }

  if (shouldValidate(payload, 'period', partial)) {
    budget.period = normalizeEnum(payload.period || 'monthly', 'Periodo', BUDGET_PERIODS, {
      required: true,
    })
  }

  if (shouldValidate(payload, 'limitAmount', partial)) {
    budget.limitAmount = normalizeAmount(payload.limitAmount, 'Limite', {
      required: true,
      min: 0.01,
    })
  }

  if (shouldValidate(payload, 'month', partial)) {
    budget.month = normalizeInteger(payload.month, 'Mes', { required: true, min: 1, max: 12 })
  }

  if (shouldValidate(payload, 'year', partial)) {
    budget.year = normalizeInteger(payload.year, 'Anio', { required: true, min: 2000, max: 2100 })
  }

  if (shouldValidate(payload, 'isActive', partial)) {
    budget.isActive = normalizeBoolean(payload.isActive, true)
  }

  return budget
}
