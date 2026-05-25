import { COLLECTIONS } from '../utils/financeModel'
import { validateRecurringExpense } from '../utils/financeValidators'
import { createDomainService } from './domainServiceFactory'

export const recurringExpensesService = createDomainService(
  COLLECTIONS.RECURRING_EXPENSES,
  validateRecurringExpense,
)
