export const COLLECTIONS = Object.freeze({
  ACCOUNTS: 'accounts',
  CARDS: 'cards',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
})

export const ACCOUNT_TYPES = Object.freeze(['cash', 'bank', 'savings', 'credit', 'investments'])
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
