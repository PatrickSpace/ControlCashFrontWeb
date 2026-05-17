import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import AccountsView from '../views/crud/AccountsView.vue'
import BudgetsView from '../views/crud/BudgetsView.vue'
import CardsView from '../views/crud/CardsView.vue'
import CategoriesView from '../views/crud/CategoriesView.vue'
import TransactionsView from '../views/crud/TransactionsView.vue'
import ActionsView from '../views/ActionsView.vue'
import DashboardView from '../views/DashboardView.vue'
import FunctionsTestView from '../views/FunctionsTestView.vue'
import AccountsInsightsView from '../views/insights/AccountsInsightsView.vue'
import BudgetsInsightsView from '../views/insights/BudgetsInsightsView.vue'
import CategoriesInsightsView from '../views/insights/CategoriesInsightsView.vue'
import CreditCardsInsightsView from '../views/insights/CreditCardsInsightsView.vue'
import TransactionsInsightsView from '../views/insights/TransactionsInsightsView.vue'
import LoginView from '../views/LoginView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: AccountsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/cards',
    name: 'cards',
    component: CardsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/categories',
    name: 'categories',
    component: CategoriesView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/actions',
    name: 'actions',
    component: ActionsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/functions-test',
    name: 'functions-test',
    component: FunctionsTestView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/budgets',
    name: 'budgets',
    component: BudgetsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/insights/accounts',
    name: 'accounts-insights',
    component: AccountsInsightsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/insights/credit-cards',
    name: 'credit-cards-insights',
    component: CreditCardsInsightsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/insights/categories',
    name: 'categories-insights',
    component: CategoriesInsightsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/insights/transactions',
    name: 'transactions-insights',
    component: TransactionsInsightsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/insights/budgets',
    name: 'budgets-insights',
    component: BudgetsInsightsView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.initAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})
