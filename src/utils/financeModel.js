export const COLLECTIONS = Object.freeze({
  ACCOUNTS: 'accounts',
  CARDS: 'cards',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  RECURRING_EXPENSES: 'recurringExpenses',
})

export const ACCOUNT_TYPES = Object.freeze(['cash', 'bank', 'savings', 'credit', 'investments'])
export const ACCOUNT_CLASSIFICATIONS = Object.freeze(['cash', 'non_liquid_asset'])
export const BUDGET_PERIODS = Object.freeze(['monthly'])
export const CATEGORY_TYPES = Object.freeze(['income', 'expense'])
export const TRANSACTION_TYPES = Object.freeze([
  'income',
  'expense',
  'transfer',
  'card_purchase',
  'card_payment',
])
export const PAYMENT_METHODS = Object.freeze(['cash', 'debit', 'credit'])
export const RECURRING_EXPENSE_FREQUENCIES = Object.freeze([
  'weekly',
  'biweekly',
  'semimonthly',
  'monthly',
  'bimonthly',
  'quarterly',
  'four_monthly',
  'semiannual',
  'annual',
])
export const RECURRING_EXPENSE_TYPES = Object.freeze([
  'necessary',
  'pet',
  'leisure',
  'optional',
  'subscription',
])
export const RECURRING_EXPENSE_PRORATION = Object.freeze({
  weekly: 52 / 12,
  biweekly: 26 / 12,
  semimonthly: 2,
  monthly: 1,
  bimonthly: 1 / 2,
  quarterly: 1 / 3,
  four_monthly: 1 / 4,
  semiannual: 1 / 6,
  annual: 1 / 12,
})

export function getRecurringExpenseProration(frequency) {
  return RECURRING_EXPENSE_PRORATION[frequency] ?? 1
}

export function calculateRecurringExpenseMonthlyAmount(amount, frequency) {
  const monthlyAmount = Number(amount || 0) * getRecurringExpenseProration(frequency)

  return Math.round((monthlyAmount + Number.EPSILON) * 100) / 100
}
