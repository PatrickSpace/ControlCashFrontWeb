import { COLLECTIONS } from '../utils/financeModel'
import { validateBudget } from '../utils/financeValidators'
import { createDomainService } from './domainServiceFactory'

export const budgetsService = createDomainService(COLLECTIONS.BUDGETS, validateBudget)
