import { COLLECTIONS } from '../utils/financeModel'
import { validateCategory } from '../utils/financeValidators'
import { createDomainService } from './domainServiceFactory'

export const categoriesService = createDomainService(COLLECTIONS.CATEGORIES, validateCategory)
