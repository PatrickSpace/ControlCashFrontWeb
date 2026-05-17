<template>
  <CrudPage
    empty-icon="mdi-swap-horizontal"
    :empty-text="emptyTransactionsText"
    :fields="fields"
    :format-row="formatRow"
    :headers="headers"
    icon="mdi-swap-horizontal"
    :items="filteredTransactions"
    :prepare-payload="prepareTransactionPayload"
    singular-title="transacción"
    :store="transactionsStore"
    subtitle="Fuente única para balances, crédito usado, presupuestos e insights."
    title="Transacciones"
  >
    <template #filters>
      <v-row align="center" dense>
        <v-col cols="12" md="6" lg="3">
          <v-select
            v-model="selectedAccountId"
            class="controlcash-field"
            clearable
            density="comfortable"
            hide-details
            :items="accountFilterItems"
            item-title="title"
            item-value="value"
            label="Filtrar por cuenta"
            prepend-inner-icon="mdi-wallet-outline"
          >
            <template #no-data>
              <v-list-item>
                <v-list-item-title class="text-body-medium controlcash-select-no-data">
                  No existen cuentas disponibles
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-select
            v-model="selectedExpenseType"
            class="controlcash-field"
            clearable
            density="comfortable"
            hide-details
            :items="expenseTypeFilterItems"
            item-title="title"
            item-value="value"
            label="Filtrar por tipo de gasto"
            prepend-inner-icon="mdi-cash-multiple"
          />
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-select
            v-model="selectedCardId"
            class="controlcash-field"
            clearable
            density="comfortable"
            hide-details
            :items="cardItems"
            item-title="title"
            item-value="value"
            label="Filtrar por tarjeta"
            prepend-inner-icon="mdi-credit-card-search-outline"
          >
            <template #no-data>
              <v-list-item>
                <v-list-item-title class="text-body-medium controlcash-select-no-data">
                  No existen tarjetas activas disponibles
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-select
            v-model="selectedCategoryId"
            class="controlcash-field"
            clearable
            density="comfortable"
            hide-details
            :items="categoryFilterItems"
            item-title="title"
            item-value="value"
            label="Filtrar por categoría"
            prepend-inner-icon="mdi-shape-outline"
          >
            <template #no-data>
              <v-list-item>
                <v-list-item-title class="text-body-medium controlcash-select-no-data">
                  No existen categorías disponibles
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-text-field
            v-model="descriptionSearch"
            class="controlcash-field"
            clearable
            density="comfortable"
            hide-details
            label="Buscar descripción"
            prepend-inner-icon="mdi-text-search"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-btn
            block
            color="primary"
            prepend-icon="mdi-file-upload-outline"
            variant="tonal"
            @click="openImportDialog"
          >
            Importar JSON
          </v-btn>
        </v-col>

        <v-col cols="12" md="6" lg="3">
          <v-btn
            block
            color="error"
            prepend-icon="mdi-delete-alert-outline"
            variant="tonal"
            @click="openDeleteByCardDialog"
          >
            Borrar por tarjeta
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </CrudPage>

  <v-dialog v-model="importDialog" max-width="620" :persistent="importingTransactions">
    <v-card class="controlcash-panel controlcash-dialog-panel" elevation="0">
      <v-card-title class="controlcash-card-title px-4 px-md-6 py-5">
        Importar transacciones
      </v-card-title>

      <v-card-text class="pa-4 pa-md-6">
        <v-form v-model="importFormValid" @submit.prevent="handleImportSubmit">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="importMode"
                class="controlcash-field"
                density="comfortable"
                :items="importModeItems"
                item-title="title"
                item-value="value"
                label="Tipo de importación"
                prepend-inner-icon="mdi-file-cog-outline"
                :rules="[formRules.required]"
              />
            </v-col>

            <v-col v-if="shouldShowImportAccount" cols="12" md="6">
              <v-select
                v-model="importAccountId"
                class="controlcash-field"
                clearable
                density="comfortable"
                :items="accountItems"
                item-title="title"
                item-value="value"
                :label="importMode === 'card_payment' ? 'Cuenta de cargo' : 'Cuenta para importar'"
                prepend-inner-icon="mdi-wallet-plus-outline"
                :rules="[formRules.required]"
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title class="text-body-medium controlcash-select-no-data">
                      No existen cuentas activas disponibles
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col v-if="importMode === 'transactions'" cols="12" md="6">
              <v-select
                v-model="importPaymentMethod"
                class="controlcash-field"
                density="comfortable"
                :items="expenseTypeFilterItems"
                item-title="title"
                item-value="value"
                label="Método para importar"
                prepend-inner-icon="mdi-credit-card-check-outline"
                :rules="[formRules.required]"
              />
            </v-col>

            <v-col v-if="shouldShowImportCard" :cols="12" :md="importMode === 'card_payment' ? 6 : 12">
              <v-select
                v-model="importCardId"
                class="controlcash-field"
                clearable
                density="comfortable"
                :items="cardItems"
                item-title="title"
                item-value="value"
                label="Tarjeta para importar"
                prepend-inner-icon="mdi-credit-card-outline"
                :rules="[formRules.required]"
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title class="text-body-medium controlcash-select-no-data">
                      No existen tarjetas activas disponibles
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12">
              <v-file-input
                v-model="importFile"
                accept="application/json,.json"
                class="controlcash-field"
                clearable
                density="comfortable"
                label="Archivo JSON"
                :loading="importingTransactions"
                prepend-icon=""
                prepend-inner-icon="mdi-file-upload-outline"
                :rules="[formRules.required]"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-4 px-md-6 pb-4 pb-md-6">
        <v-spacer />
        <v-btn :disabled="importingTransactions" variant="text" @click="closeImportDialog">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!canImportTransactions || importingTransactions"
          :loading="importingTransactions"
          variant="tonal"
          @click="handleImportSubmit"
        >
          Importar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteByCardDialog" max-width="560" :persistent="deletingCardTransactions">
    <v-card class="controlcash-panel controlcash-dialog-panel" elevation="0">
      <v-card-title class="controlcash-card-title px-4 px-md-6 py-5">
        Borrar transacciones de tarjeta
      </v-card-title>

      <v-card-text class="pa-4 pa-md-6">
        <v-form v-model="deleteByCardFormValid" @submit.prevent="deleteCardTransactions">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="deleteCardId"
                class="controlcash-field"
                clearable
                density="comfortable"
                :items="cardItems"
                item-title="title"
                item-value="value"
                label="Tarjeta"
                prepend-inner-icon="mdi-credit-card-remove-outline"
                :rules="[formRules.required]"
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title class="text-body-medium controlcash-select-no-data">
                      No existen tarjetas activas disponibles
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="deleteMonth"
                class="controlcash-field"
                density="comfortable"
                label="Mes"
                prepend-inner-icon="mdi-calendar-month-outline"
                :rules="[formRules.required]"
                type="month"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-alert color="warning" density="comfortable" variant="tonal">
                Se eliminarán {{ deleteTransactionsCount }} transacciones de {{ deleteCardLabel }}
                en {{ deleteMonthLabel }}. Esta acción no se puede deshacer.
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-4 px-md-6 pb-4 pb-md-6">
        <v-spacer />
        <v-btn :disabled="deletingCardTransactions" variant="text" @click="closeDeleteByCardDialog">
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          :disabled="!canDeleteCardTransactions || deletingCardTransactions"
          :loading="deletingCardTransactions"
          variant="tonal"
          @click="deleteCardTransactions"
        >
          Borrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import CrudPage from '../../components/crud/CrudPage.vue'
import { useAccountsStore } from '../../stores/accounts'
import { useCardsStore } from '../../stores/cards'
import { useCategoriesStore } from '../../stores/categories'
import { useNotificationStore } from '../../stores/notifications'
import { useTransactionsStore } from '../../stores/transactions'
import { formRules } from '../../utils/formRules'

const accountsStore = useAccountsStore()
const cardsStore = useCardsStore()
const categoriesStore = useCategoriesStore()
const notificationStore = useNotificationStore()
const transactionsStore = useTransactionsStore()
const selectedAccountId = ref(null)
const selectedExpenseType = ref(null)
const selectedCardId = ref(null)
const selectedCategoryId = ref(null)
const descriptionSearch = ref('')
const importDialog = ref(false)
const importFormValid = ref(false)
const importMode = ref('transactions')
const importFile = ref(null)
const importAccountId = ref(null)
const importPaymentMethod = ref('debit')
const importCardId = ref(null)
const importingTransactions = ref(false)
const deleteByCardDialog = ref(false)
const deleteByCardFormValid = ref(false)
const deleteCardId = ref(null)
const deleteMonth = ref(new Date().toISOString().slice(0, 7))
const deletingCardTransactions = ref(false)

const headers = [
  { title: 'Fecha', key: 'date' },
  { title: 'Tipo', key: 'typeLabel' },
  { title: 'Descripción', key: 'description' },
  { title: 'Categoría', key: 'categoryLabel' },
  { title: 'Monto', key: 'amountLabel' },
  { title: 'Cuenta', key: 'accountLabel' },
  { title: 'Tarjeta', key: 'cardLabel' },
]

const accountItems = computed(() =>
  accountsStore.activeAccounts.map((account) => ({
    title: account.name,
    value: account.id,
  })),
)

const accountFilterItems = computed(() =>
  accountsStore.items.map((account) => ({
    title: account.name,
    value: account.id,
  })),
)

const cardItems = computed(() =>
  cardsStore.activeCards.map((card) => ({
    title: `${card.name} - ${card.bank}`,
    value: card.id,
  })),
)

const categoryFilterItems = computed(() =>
  categoriesStore.items.map((category) => ({
    title: `${category.name} - ${getCategoryTypeLabel(category)}`,
    value: category.id,
  })),
)

const expenseTypeFilterItems = [
  { title: 'Efectivo', value: 'cash' },
  { title: 'Débito', value: 'debit' },
  { title: 'Crédito', value: 'credit' },
]

const importModeItems = [
  { title: 'Gastos e ingresos', value: 'transactions' },
  { title: 'Pago de tarjeta', value: 'card_payment' },
]

const fields = computed(() => [
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    defaultValue: 'expense',
    items: [
      { title: 'Ingreso', value: 'income' },
      { title: 'Gasto', value: 'expense' },
      { title: 'Transferencia', value: 'transfer' },
      { title: 'Pago de tarjeta', value: 'card_payment' },
    ],
    rules: [formRules.required],
    md: 6,
  },
  {
    key: 'date',
    label: 'Fecha',
    type: 'date',
    defaultValue: () => new Date().toISOString().slice(0, 10),
    rules: [formRules.required, formRules.date],
    md: 6,
  },
  {
    key: 'amount',
    label: 'Monto',
    type: 'number',
    prefix: 'S/.',
    rules: [formRules.required, formRules.positive],
    md: 6,
  },
  {
    key: 'paymentMethod',
    label: 'Método de pago',
    type: 'select',
    defaultValue: 'debit',
    showWhen: (form) => form.type === 'expense',
    items: [
      { title: 'Efectivo', value: 'cash' },
      { title: 'Débito', value: 'debit' },
      { title: 'Crédito', value: 'credit' },
    ],
    md: 6,
  },
  {
    key: 'description',
    label: 'Descripción',
  },
  {
    key: 'categoryId',
    label: 'Categoría',
    type: 'select',
    items: (form) => getCategoryItems(form.type),
    noDataText: 'No existen categorías activas para este tipo de transacción.',
    showWhen: (form) => ['income', 'expense'].includes(form.type),
    md: 6,
  },
  {
    key: 'accountId',
    label: (form) => {
      if (form.type === 'transfer') {
        return 'Cuenta origen'
      }

      if (form.type === 'expense') {
        return 'Cuenta a cargo'
      }

      return 'Cuenta'
    },
    type: 'select',
    items: accountItems.value,
    showWhen: (form) =>
      form.type === 'income' ||
      form.type === 'transfer' ||
      form.type === 'card_payment' ||
      (form.type === 'expense' && ['cash', 'debit'].includes(form.paymentMethod)),
    md: 6,
  },
  {
    key: 'destinationAccountId',
    label: 'Cuenta destino',
    type: 'select',
    items: accountItems.value,
    showWhen: (form) => form.type === 'transfer',
    md: 6,
  },
  {
    key: 'cardId',
    label: 'Tarjeta de crédito',
    type: 'select',
    items: cardItems.value,
    showWhen: (form) =>
      form.type === 'card_payment' || (form.type === 'expense' && form.paymentMethod === 'credit'),
    md: 6,
  },
])

const transactionTypeLabels = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  card_purchase: 'Compra tarjeta',
  card_payment: 'Pago tarjeta',
}

const emptyTransactionsText = computed(() =>
  selectedAccountId.value || selectedExpenseType.value || selectedCardId.value || selectedCategoryId.value
    || descriptionSearch.value
    ? 'No hay transacciones para los filtros seleccionados.'
    : 'Registra tu primer movimiento financiero.',
)

const filteredTransactions = computed(() => {
  const normalizedDescriptionSearch = normalizeLookupText(descriptionSearch.value)

  return transactionsStore.transactionsByDate.filter((transaction) => {
    const matchesAccount =
      !selectedAccountId.value ||
      transaction.accountId === selectedAccountId.value ||
      transaction.destinationAccountId === selectedAccountId.value
    const matchesExpenseType =
      !selectedExpenseType.value ||
      (transaction.type === 'expense' && transaction.paymentMethod === selectedExpenseType.value)
    const matchesCard = !selectedCardId.value || transaction.cardId === selectedCardId.value
    const matchesCategory = !selectedCategoryId.value || transaction.categoryId === selectedCategoryId.value
    const matchesDescription =
      !normalizedDescriptionSearch ||
      normalizeLookupText(transaction.description).includes(normalizedDescriptionSearch)

    return matchesAccount && matchesExpenseType && matchesCard && matchesCategory && matchesDescription
  })
})

const canImportTransactions = computed(
  () =>
    Boolean(importFile.value) &&
    Boolean(importMode.value) &&
    (!shouldShowImportAccount.value || Boolean(importAccountId.value)) &&
    (importMode.value === 'card_payment'
      ? Boolean(importCardId.value)
      : Boolean(importPaymentMethod.value) &&
        (importPaymentMethod.value !== 'credit' || Boolean(importCardId.value))),
)

const shouldShowImportCard = computed(
  () => importMode.value === 'card_payment' || importPaymentMethod.value === 'credit',
)

const shouldShowImportAccount = computed(
  () => importMode.value === 'card_payment' || importPaymentMethod.value !== 'credit',
)

const deleteCandidates = computed(() =>
  transactionsStore.items.filter(
    (transaction) =>
      transaction.cardId === deleteCardId.value &&
      typeof transaction.date === 'string' &&
      transaction.date.startsWith(`${deleteMonth.value}-`),
  ),
)

const deleteTransactionsCount = computed(() => deleteCandidates.value.length)
const canDeleteCardTransactions = computed(
  () =>
    Boolean(deleteCardId.value) &&
    /^\d{4}-\d{2}$/.test(String(deleteMonth.value || '')) &&
    deleteTransactionsCount.value > 0,
)
const deleteCardLabel = computed(
  () => cardItems.value.find((card) => card.value === deleteCardId.value)?.title || 'la tarjeta seleccionada',
)
const deleteMonthLabel = computed(() => deleteMonth.value || 'el mes seleccionado')

onMounted(() => {
  accountsStore.subscribeRealtime()
  cardsStore.subscribeRealtime()
  categoriesStore.subscribeRealtime()
})

onBeforeUnmount(() => {
  accountsStore.stopRealtime()
  cardsStore.stopRealtime()
  categoriesStore.stopRealtime()
})

function findName(items, id, fallback = '-') {
  return items.find((item) => item.id === id)?.name || fallback
}

function getCategoryType(category) {
  return category.type || 'expense'
}

function getCategoryTypeLabel(category) {
  return getCategoryType(category) === 'income' ? 'Ingreso' : 'Gasto'
}

function getCategoryItems(transactionType) {
  if (!['income', 'expense'].includes(transactionType)) {
    return []
  }

  return categoriesStore.activeCategories
    .filter((category) => getCategoryType(category) === transactionType)
    .map((category) => ({
      title: category.name,
      value: category.id,
    }))
}

function getCompatibleCategoryId(transactionType, categoryId) {
  if (!['income', 'expense'].includes(transactionType) || !categoryId) {
    return null
  }

  const category = categoriesStore.items.find((item) => item.id === categoryId)

  return category && getCategoryType(category) === transactionType ? categoryId : null
}

function formatMoney(value) {
  return `S/. ${Number(value || 0).toFixed(2)}`
}

function formatRow(transaction) {
  return {
    ...transaction,
    typeLabel: transactionTypeLabels[transaction.type] || transaction.type,
    amountLabel: formatMoney(transaction.amount),
    categoryLabel: findName(categoriesStore.items, transaction.categoryId),
    accountLabel: findName(accountsStore.items, transaction.accountId),
    cardLabel: findName(cardsStore.items, transaction.cardId),
  }
}

function prepareTransactionPayload(payload) {
  const nextPayload = {
    ...payload,
    paymentMethod: payload.type === 'expense' ? payload.paymentMethod || 'debit' : null,
    categoryId: getCompatibleCategoryId(payload.type, payload.categoryId),
    accountId: shouldUseAccount(payload) ? payload.accountId : null,
    destinationAccountId: payload.type === 'transfer' ? payload.destinationAccountId : null,
    cardId: shouldUseCard(payload) ? payload.cardId : null,
  }

  return nextPayload
}

function shouldUseAccount(transaction) {
  return (
    transaction.type === 'income' ||
    transaction.type === 'transfer' ||
    transaction.type === 'card_payment' ||
    (transaction.type === 'expense' && ['cash', 'debit'].includes(transaction.paymentMethod))
  )
}

function shouldUseCard(transaction) {
  return (
    transaction.type === 'card_payment' ||
    (transaction.type === 'expense' && transaction.paymentMethod === 'credit')
  )
}

function openImportDialog() {
  resetImportForm()
  importDialog.value = true
}

function closeImportDialog() {
  importDialog.value = false
  resetImportForm()
}

function resetImportForm() {
  importMode.value = 'transactions'
  importFile.value = null
  importAccountId.value = null
  importPaymentMethod.value = 'debit'
  importCardId.value = null
  importFormValid.value = false
}

function openDeleteByCardDialog() {
  resetDeleteByCardForm()
  deleteByCardDialog.value = true
}

function closeDeleteByCardDialog() {
  deleteByCardDialog.value = false
  resetDeleteByCardForm()
}

function resetDeleteByCardForm() {
  deleteCardId.value = null
  deleteMonth.value = new Date().toISOString().slice(0, 7)
  deleteByCardFormValid.value = false
}

async function deleteCardTransactions() {
  if (!canDeleteCardTransactions.value || deletingCardTransactions.value) {
    if (!deleteTransactionsCount.value) {
      notificationStore.show('No hay transacciones para borrar en esa tarjeta y mes.', 'warning')
    }

    return
  }

  deletingCardTransactions.value = true

  try {
    const transactionsToDelete = [...deleteCandidates.value]

    for (const transaction of transactionsToDelete) {
      await transactionsStore.removeItem(transaction.id)
    }

    notificationStore.success(`Se borraron ${transactionsToDelete.length} transacciones.`)
    deleteByCardDialog.value = false
    resetDeleteByCardForm()
  } catch {
    notificationStore.error(transactionsStore.error || 'No se pudieron borrar las transacciones.')
  } finally {
    deletingCardTransactions.value = false
  }
}

async function handleImportSubmit() {
  const file = Array.isArray(importFile.value) ? importFile.value[0] : importFile.value

  if (!file || importingTransactions.value) {
    return
  }

  if (!canImportTransactions.value) {
    notificationStore.error('Completa el formulario de importación antes de cargar el archivo.')
    return
  }

  importingTransactions.value = true

  try {
    const transactions = parseTransactionsJson(await file.text())
    const result = await importTransactions(transactions)

    if (result.failed === 0) {
      notificationStore.success(`Se importaron ${result.imported} transacciones.`)
    } else if (result.imported > 0) {
      notificationStore.show(
        `Se importaron ${result.imported} transacciones. ${result.failed} no se pudieron importar: ${result.errors.join(' ')}`,
        'warning',
      )
    } else {
      notificationStore.error(`No se importaron transacciones: ${result.errors.join(' ')}`)
    }

    importDialog.value = false
  } catch (error) {
    notificationStore.error(error?.message || 'No se pudo importar el archivo.')
  } finally {
    if (!importDialog.value) {
      resetImportForm()
    }
    importingTransactions.value = false
  }
}

function parseTransactionsJson(content) {
  let parsedContent

  try {
    parsedContent = JSON.parse(content)
  } catch {
    throw new Error('El archivo no contiene un JSON válido.')
  }

  const transactions = Array.isArray(parsedContent) ? parsedContent : parsedContent?.transactions

  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new Error('El JSON debe ser un arreglo de transacciones o tener la propiedad transactions.')
  }

  return transactions
}

async function importTransactions(transactions) {
  const result = {
    imported: 0,
    failed: 0,
    errors: [],
  }

  for (const [index, transaction] of transactions.entries()) {
    try {
      await transactionsStore.createItem(prepareImportedTransaction(transaction))
      result.imported += 1
    } catch (error) {
      result.failed += 1
      result.errors.push(`Fila ${index + 1}: ${error?.message || 'registro inválido'}.`)
    }
  }

  return result
}

function prepareImportedTransaction(transaction) {
  if (!transaction || typeof transaction !== 'object' || Array.isArray(transaction)) {
    throw new Error('La transacción debe ser un objeto.')
  }

  if (importMode.value === 'card_payment') {
    return prepareImportedCardPayment(transaction)
  }

  if (!['income', 'expense'].includes(transaction.type)) {
    throw new Error('Solo se pueden importar ingresos o gastos.')
  }

  const categoryId = transaction.categoryId || findCategoryId(transaction)

  if (!categoryId) {
    throw new Error('La categoría es obligatoria o no existe para este tipo de transacción.')
  }

  return prepareTransactionPayload({
    ...transaction,
    paymentMethod: transaction.type === 'expense' ? importPaymentMethod.value : null,
    accountId: shouldUseImportedAccount(transaction) ? importAccountId.value : null,
    destinationAccountId: null,
    cardId: importPaymentMethod.value === 'credit' && transaction.type === 'expense' ? importCardId.value : null,
    categoryId,
  })
}

function shouldUseImportedAccount(transaction) {
  return (
    importMode.value === 'card_payment' ||
    transaction.type === 'income' ||
    (transaction.type === 'expense' && importPaymentMethod.value !== 'credit')
  )
}

function prepareImportedCardPayment(transaction) {
  return prepareTransactionPayload({
    ...transaction,
    type: 'card_payment',
    paymentMethod: null,
    categoryId: null,
    accountId: importAccountId.value,
    destinationAccountId: null,
    cardId: importCardId.value,
  })
}

function findCategoryId(transaction) {
  const categoryName = transaction.categoryName || transaction.category

  if (!categoryName) {
    return undefined
  }

  const normalizedName = normalizeLookupText(categoryName)

  return categoriesStore.items.find(
    (category) =>
      normalizeLookupText(category.name) === normalizedName &&
      getCategoryType(category) === transaction.type,
  )?.id
}

function normalizeLookupText(value) {
  return String(value || '').trim().toLowerCase()
}
</script>
