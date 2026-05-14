<template>
  <v-container class="controlcash-page-container controlcash-actions-page pa-4 pa-md-8" fluid>
    <v-row align="center" class="mb-4" dense>
      <v-col cols="12" md="7">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-lightning-bolt-outline" size="26" />
          </v-avatar>
          <div class="controlcash-title-block">
            <div class="text-headline-small font-weight-bold">Acciones</div>
            <div class="text-body-medium text-medium-emphasis">
              Busca qué operación quieres registrar y elige una plantilla.
            </div>
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="5">
        <v-text-field
          v-model="search"
          class="controlcash-field"
          clearable
          density="comfortable"
          hide-details
          label="Buscar acción"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-row class="mb-2" dense>
      <v-col cols="12">
        <v-chip-group v-model="selectedGroup" mandatory selected-class="text-primary">
          <v-chip
            v-for="group in actionGroups"
            :key="group.value"
            :value="group.value"
            variant="tonal"
          >
            {{ group.title }}
          </v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col
        v-for="action in filteredActions"
        :key="action.id"
        cols="12"
        lg="4"
        md="6"
      >
        <v-card class="controlcash-panel controlcash-action-card fill-height" elevation="0">
          <v-card-text class="pa-5">
            <div class="d-flex align-start justify-space-between ga-3">
              <v-avatar :color="action.color" rounded="lg" size="46" variant="tonal">
                <v-icon :icon="action.icon" size="26" />
              </v-avatar>
              <v-chip size="small" variant="tonal">{{ action.groupLabel }}</v-chip>
            </div>

            <div class="text-h6 font-weight-bold mt-4">{{ action.title }}</div>
            <div class="text-body-medium text-medium-emphasis mt-2">
              {{ action.description }}
            </div>

            <div class="controlcash-action-tags mt-4">
              <v-chip
                v-for="tag in action.tags"
                :key="tag"
                size="small"
                variant="text"
              >
                {{ tag }}
              </v-chip>
            </div>
          </v-card-text>

          <v-card-actions class="px-5 pb-5">
            <v-btn block color="primary" append-icon="mdi-arrow-right" variant="tonal" @click="openAction(action)">
              Iniciar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="!filteredActions.length"
      class="mt-4"
      color="primary"
      icon="mdi-magnify"
      variant="tonal"
    >
      No encontré acciones para esa búsqueda.
    </v-alert>

    <v-dialog v-model="actionDialog" :fullscreen="mobile" max-width="720" persistent scrollable>
      <v-card class="controlcash-panel controlcash-dialog-panel" elevation="0">
        <v-card-title class="controlcash-card-title px-4 px-md-6 py-5">
          <div class="d-flex align-center ga-3">
            <v-avatar :color="selectedAction?.color || 'primary'" rounded="lg" size="40" variant="tonal">
              <v-icon :icon="selectedAction?.icon || 'mdi-lightning-bolt-outline'" />
            </v-avatar>
            <div>
              <div class="text-title-large">{{ selectedAction?.title }}</div>
              <div class="text-body-small text-medium-emphasis">{{ selectedAction?.description }}</div>
            </div>
          </div>
        </v-card-title>

        <v-card-text class="pa-4 pa-md-6">
          <v-form v-model="formValid" @submit.prevent="saveAction">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.amount"
                  class="controlcash-field"
                  label="Monto"
                  prefix="S/."
                  :rules="[formRules.required, formRules.positive]"
                  type="number"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-date-input
                  v-model="form.date"
                  class="controlcash-field"
                  clearable
                  density="comfortable"
                  label="Fecha"
                  prepend-icon=""
                  prepend-inner-icon="mdi-calendar-month-outline"
                  :rules="[formRules.required, formRules.date]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.description"
                  class="controlcash-field"
                  label="Descripción"
                  prepend-inner-icon="mdi-text-box-outline"
                />
              </v-col>

              <v-col v-if="usesCategory" cols="12" md="6">
                <v-select
                  v-model="form.categoryId"
                  class="controlcash-field"
                  clearable
                  :items="categoryItems"
                  item-title="title"
                  item-value="value"
                  label="Categoría"
                  :return-object="false"
                />
              </v-col>

              <v-col v-if="usesAccount" cols="12" md="6">
                <v-select
                  v-model="form.accountId"
                  class="controlcash-field"
                  :items="accountItems"
                  item-title="title"
                  item-value="value"
                  :label="accountLabel"
                  :return-object="false"
                  :rules="[formRules.required]"
                />
              </v-col>

              <v-col v-if="usesDestinationAccount" cols="12" md="6">
                <v-select
                  v-model="form.destinationAccountId"
                  class="controlcash-field"
                  :items="accountItems"
                  item-title="title"
                  item-value="value"
                  label="Cuenta destino"
                  :return-object="false"
                  :rules="[formRules.required]"
                />
              </v-col>

              <v-col v-if="usesCard" cols="12" md="6">
                <v-select
                  v-model="form.cardId"
                  class="controlcash-field"
                  :items="cardItems"
                  item-title="title"
                  item-value="value"
                  label="Tarjeta de crédito"
                  :return-object="false"
                  :rules="[formRules.required]"
                />
              </v-col>

              <v-col v-if="usesPaymentMethod" cols="12" md="6">
                <v-select
                  v-model="form.paymentMethod"
                  class="controlcash-field"
                  :items="paymentMethodItems"
                  item-title="title"
                  item-value="value"
                  label="Método de pago"
                  :return-object="false"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 px-md-6 pb-4 pb-md-6">
          <v-spacer />
          <v-btn :disabled="saving" variant="text" @click="closeAction">Cancelar</v-btn>
          <v-btn color="primary" :disabled="!formValid || saving" :loading="saving" variant="tonal" @click="saveAction">
            Registrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useDisplay } from 'vuetify'

import { useAccountsStore } from '../stores/accounts'
import { useCardsStore } from '../stores/cards'
import { useCategoriesStore } from '../stores/categories'
import { useNotificationStore } from '../stores/notifications'
import { useTransactionsStore } from '../stores/transactions'
import { formRules } from '../utils/formRules'

const accountsStore = useAccountsStore()
const cardsStore = useCardsStore()
const categoriesStore = useCategoriesStore()
const notificationStore = useNotificationStore()
const transactionsStore = useTransactionsStore()
const { mobile } = useDisplay()
const search = ref('')
const selectedGroup = ref('all')
const actionDialog = ref(false)
const selectedAction = ref(null)
const formValid = ref(false)
const saving = ref(false)
const form = reactive({
  amount: '',
  date: new Date(),
  description: '',
  categoryId: null,
  accountId: null,
  destinationAccountId: null,
  cardId: null,
  paymentMethod: 'debit',
})

const actionGroups = [
  { title: 'Todas', value: 'all' },
  { title: 'Ingresos', value: 'income' },
  { title: 'Gastos', value: 'expense' },
  { title: 'Tarjetas', value: 'cards' },
  { title: 'Cuentas', value: 'accounts' },
]

const actions = [
  {
    id: 'register-income',
    title: 'Registrar ingreso de dinero',
    description: 'Agrega una entrada de dinero a una cuenta, sin asumir origen específico.',
    group: 'income',
    groupLabel: 'Ingreso',
    icon: 'mdi-cash-plus',
    color: 'success',
    transactionType: 'income',
    tags: ['dinero recibido', 'abono', 'entrada'],
  },
  {
    id: 'register-expense',
    title: 'Registrar gasto',
    description: 'Registra una salida de dinero pagada en efectivo o débito.',
    group: 'expense',
    groupLabel: 'Gasto',
    icon: 'mdi-receipt-text-outline',
    color: 'error',
    transactionType: 'expense',
    paymentMethod: 'debit',
    tags: ['compra', 'servicio', 'salida'],
  },
  {
    id: 'register-card-expense',
    title: 'Registrar gasto con tarjeta',
    description: 'Agrega una compra asociada a una tarjeta de crédito.',
    group: 'cards',
    groupLabel: 'Tarjeta',
    icon: 'mdi-credit-card-plus-outline',
    color: 'warning',
    transactionType: 'expense',
    paymentMethod: 'credit',
    tags: ['crédito', 'compra', 'tarjeta'],
  },
  {
    id: 'pay-card',
    title: 'Pagar tarjeta',
    description: 'Registra un pago desde una cuenta hacia una tarjeta de crédito.',
    group: 'cards',
    groupLabel: 'Tarjeta',
    icon: 'mdi-credit-card-check-outline',
    color: 'primary',
    transactionType: 'card_payment',
    tags: ['pago', 'deuda', 'crédito'],
  },
  {
    id: 'transfer-money',
    title: 'Transferir entre cuentas',
    description: 'Mueve dinero desde una cuenta origen hacia una cuenta destino.',
    group: 'accounts',
    groupLabel: 'Cuenta',
    icon: 'mdi-bank-transfer',
    color: 'primary',
    transactionType: 'transfer',
    tags: ['transferencia', 'mover dinero', 'cuentas'],
  },
  {
    id: 'cash-withdrawal',
    title: 'Registrar retiro de efectivo',
    description: 'Registra una salida desde una cuenta para controlar efectivo disponible.',
    group: 'expense',
    groupLabel: 'Gasto',
    icon: 'mdi-cash-minus',
    color: 'error',
    transactionType: 'expense',
    paymentMethod: 'debit',
    tags: ['retiro', 'efectivo', 'cajero'],
  },
  {
    id: 'cash-deposit',
    title: 'Registrar depósito',
    description: 'Agrega dinero que entra a una cuenta por depósito o abono.',
    group: 'income',
    groupLabel: 'Ingreso',
    icon: 'mdi-bank-plus',
    color: 'success',
    transactionType: 'income',
    tags: ['depósito', 'abono', 'cuenta'],
  },
  {
    id: 'refund',
    title: 'Registrar devolución o reembolso',
    description: 'Agrega dinero recuperado por una devolución, ajuste o reembolso.',
    group: 'income',
    groupLabel: 'Ingreso',
    icon: 'mdi-cash-refund',
    color: 'success',
    transactionType: 'income',
    tags: ['reembolso', 'devolución', 'ajuste'],
  },
]

const filteredActions = computed(() => {
  const query = search.value.trim().toLowerCase()

  return actions.filter((action) => {
    const matchesGroup = selectedGroup.value === 'all' || action.group === selectedGroup.value
    const searchableText = [
      action.title,
      action.description,
      action.groupLabel,
      ...action.tags,
    ]
      .join(' ')
      .toLowerCase()
    const matchesQuery = !query || searchableText.includes(query)

    return matchesGroup && matchesQuery
  })
})

const accountItems = computed(() =>
  accountsStore.activeAccounts.map((account) => ({
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

const categoryItems = computed(() =>
  categoriesStore.activeCategories
    .filter((category) => (category.type || 'expense') === selectedActionType.value)
    .map((category) => ({
      title: category.name,
      value: category.id,
    })),
)

const paymentMethodItems = [
  { title: 'Efectivo', value: 'cash' },
  { title: 'Débito', value: 'debit' },
  { title: 'Crédito', value: 'credit' },
]

const selectedActionType = computed(() => selectedAction.value?.transactionType || 'expense')
const usesCategory = computed(() => ['income', 'expense'].includes(selectedActionType.value))
const usesAccount = computed(() =>
  selectedActionType.value === 'income' ||
  selectedActionType.value === 'transfer' ||
  selectedActionType.value === 'card_payment' ||
  (selectedActionType.value === 'expense' && ['cash', 'debit'].includes(form.paymentMethod)),
)
const usesDestinationAccount = computed(() => selectedActionType.value === 'transfer')
const usesCard = computed(() =>
  selectedActionType.value === 'card_payment' ||
  (selectedActionType.value === 'expense' && form.paymentMethod === 'credit'),
)
const usesPaymentMethod = computed(() => selectedActionType.value === 'expense')
const accountLabel = computed(() => {
  if (selectedActionType.value === 'transfer') {
    return 'Cuenta origen'
  }

  if (selectedActionType.value === 'expense') {
    return 'Cuenta a cargo'
  }

  return 'Cuenta'
})

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

function openAction(action) {
  selectedAction.value = action
  resetForm(action)
  actionDialog.value = true
}

function closeAction() {
  if (saving.value) {
    return
  }

  actionDialog.value = false
  selectedAction.value = null
}

function resetForm(action) {
  form.amount = ''
  form.date = new Date()
  form.description = ''
  form.categoryId = null
  form.accountId = null
  form.destinationAccountId = null
  form.cardId = null
  form.paymentMethod = action.paymentMethod || 'debit'
}

async function saveAction() {
  if (!formValid.value || saving.value || !selectedAction.value) {
    return
  }

  saving.value = true

  try {
    const payload = buildTransactionPayload(selectedAction.value, form)
    await transactionsStore.createItem(payload)
    notificationStore.success('Transacción registrada.')
    closeAction()
  } catch (error) {
    notificationStore.error(transactionsStore.error || error?.message || 'No se pudo registrar la acción.')
  } finally {
    saving.value = false
  }
}

function buildTransactionPayload(action, source) {
  const type = action.transactionType

  return {
    type,
    amount: source.amount,
    date: formatDateValue(source.date),
    description: source.description || action.title,
    paymentMethod: type === 'expense' ? source.paymentMethod || 'debit' : null,
    categoryId: ['income', 'expense'].includes(type) ? source.categoryId : null,
    accountId: shouldUseAccount(type, source.paymentMethod) ? source.accountId : null,
    destinationAccountId: type === 'transfer' ? source.destinationAccountId : null,
    cardId: shouldUseCard(type, source.paymentMethod) ? source.cardId : null,
  }
}

function shouldUseAccount(type, paymentMethod) {
  return (
    type === 'income' ||
    type === 'transfer' ||
    type === 'card_payment' ||
    (type === 'expense' && ['cash', 'debit'].includes(paymentMethod))
  )
}

function shouldUseCard(type, paymentMethod) {
  return type === 'card_payment' || (type === 'expense' && paymentMethod === 'credit')
}

function formatDateValue(value) {
  if (!value) {
    return value
  }

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  return value
}
</script>

<style scoped>
.controlcash-actions-page {
  max-width: 1600px;
}

.controlcash-action-card {
  display: flex;
  flex-direction: column;
}

.controlcash-action-card .v-card-text {
  flex: 1 1 auto;
}

.controlcash-action-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (max-width: 600px) {
  .controlcash-action-card .text-h6 {
    line-height: 1.25;
  }
}
</style>
