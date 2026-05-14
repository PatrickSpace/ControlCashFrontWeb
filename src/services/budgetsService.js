import { COLLECTIONS } from '../utils/financeModel'
import { FinanceValidationError, validateBudget } from '../utils/financeValidators'
import { createDomainService } from './domainServiceFactory'

const baseBudgetsService = createDomainService(COLLECTIONS.BUDGETS, validateBudget)

async function assertUniqueCategory(categoryId, options, budgetId) {
  if (!categoryId) {
    return
  }

  const budgets = await baseBudgetsService.list(options)
  const categoryHasBudget = budgets.some(
    (budget) => budget.id !== budgetId && budget.categoryId === categoryId,
  )

  if (categoryHasBudget) {
    throw new FinanceValidationError('Esta categoría ya pertenece a otro presupuesto.')
  }
}

export const budgetsService = {
  ...baseBudgetsService,

  async create(payload, options) {
    const budget = validateBudget(payload)

    await assertUniqueCategory(budget.categoryId, options)

    return baseBudgetsService.create(budget, options)
  },

  async update(documentId, payload, options) {
    const budget = validateBudget(payload, { partial: true })

    await assertUniqueCategory(budget.categoryId, options, documentId)

    return baseBudgetsService.update(documentId, budget, options)
  },
}
