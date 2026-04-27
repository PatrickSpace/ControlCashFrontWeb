import { COLLECTIONS } from '../utils/financeModel'
import { validateCard } from '../utils/financeValidators'
import { createDomainService } from './domainServiceFactory'

export const cardsService = createDomainService(COLLECTIONS.CARDS, validateCard)
