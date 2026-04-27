import { COLLECTIONS } from '../utils/financeModel'
import { validateAccount } from '../utils/financeValidators'
import { createDomainService } from './domainServiceFactory'

export const accountsService = createDomainService(COLLECTIONS.ACCOUNTS, validateAccount)
