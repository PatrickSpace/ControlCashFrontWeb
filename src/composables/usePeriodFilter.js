import { computed, ref } from 'vue'

export const ALL_PERIODS_VALUE = 'all'

export function usePeriodFilter(options = {}) {
  const { monthsBack = 12, monthsForward = 6 } = options
  const currentDate = new Date()
  const selectedPeriod = ref(ALL_PERIODS_VALUE)

  const periodOptions = computed(() => {
    const items = []

    for (let offset = -monthsBack; offset <= monthsForward; offset += 1) {
      const periodDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)

      items.push({
        title: formatPeriodLabel(periodDate),
        value: formatPeriodValue(periodDate),
      })
    }

    return [
      { title: 'Todos los periodos', value: ALL_PERIODS_VALUE },
      ...items.reverse(),
    ]
  })

  const isAllPeriods = computed(() => selectedPeriod.value === ALL_PERIODS_VALUE)
  const selectedPeriodDate = computed(() => formatPeriodDate(selectedPeriod.value, currentDate))
  const selectedPeriodLabel = computed(() =>
    isAllPeriods.value ? 'todos los periodos' : formatPeriodLabel(selectedPeriodDate.value),
  )
  const selectedPeriodScopeLabel = computed(() =>
    isAllPeriods.value ? 'en todos los periodos' : `en ${selectedPeriodLabel.value}`,
  )

  function showAllPeriods() {
    selectedPeriod.value = ALL_PERIODS_VALUE
  }

  function resetSelectedPeriod() {
    selectedPeriod.value = formatPeriodValue(currentDate)
  }

  function matchesSelectedPeriod(date) {
    if (isAllPeriods.value) {
      return true
    }

    return getPeriodKey(date) === selectedPeriod.value
  }

  function getTrendPeriods(transactions = [], count = 6, maxAllPeriods = 12) {
    if (isAllPeriods.value) {
      const periodKeys = [...new Set(transactions.map((transaction) => getPeriodKey(transaction.date)).filter(Boolean))]
        .sort()
        .slice(-maxAllPeriods)

      return (periodKeys.length ? periodKeys : getRollingPeriodKeys(currentDate, count)).map((key) => ({
        key,
        label: getShortPeriodLabel(formatPeriodDate(key, currentDate)),
      }))
    }

    return getRollingPeriodKeys(selectedPeriodDate.value, count).map((key) => ({
      key,
      label: getShortPeriodLabel(formatPeriodDate(key, currentDate)),
    }))
  }

  return {
    currentDate,
    isAllPeriods,
    matchesSelectedPeriod,
    periodOptions,
    resetSelectedPeriod,
    selectedPeriod,
    selectedPeriodLabel,
    selectedPeriodScopeLabel,
    showAllPeriods,
    getTrendPeriods,
  }
}

export function formatPeriodValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${date.getFullYear()}-${month}`
}

export function formatPeriodDate(periodValue, fallbackDate = new Date()) {
  const [year, month] = String(periodValue || formatPeriodValue(fallbackDate)).split('-').map(Number)

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), 1)
  }

  return new Date(year, month - 1, 1)
}

export function formatPeriodLabel(date) {
  return date.toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  })
}

export function getPeriodKey(date) {
  const key = String(date || '').slice(0, 7)

  return /^\d{4}-\d{2}$/.test(key) ? key : ''
}

function getRollingPeriodKeys(endDate, count) {
  const keys = []

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    keys.push(formatPeriodValue(new Date(endDate.getFullYear(), endDate.getMonth() - offset, 1)))
  }

  return keys
}

function getShortPeriodLabel(date) {
  return date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')
}
