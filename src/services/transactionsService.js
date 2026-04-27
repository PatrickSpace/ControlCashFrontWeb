import { COLLECTIONS } from '../utils/financeModel'
import { validateTransaction } from '../utils/financeValidators'
import { createDomainService } from './domainServiceFactory'

export const transactionsService = createDomainService(
  COLLECTIONS.TRANSACTIONS,
  validateTransaction,
)
