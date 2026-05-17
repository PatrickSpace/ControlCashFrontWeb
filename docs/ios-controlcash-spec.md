# ControlCash iOS: modelo, reglas y prompt de implementación

Este documento resume las reglas actuales del frontend web para replicar en una app iOS con SwiftUI y Firebase. La app iOS debe conectarse directamente a Firebase Auth + Firestore y reservar Cloud Functions solo para automatizaciones como lectura de correos bancarios e IA.

## Objetivo iOS

Implementar en Xcode estas funcionalidades:

- Home
- Información de tarjetas de crédito
- Vista de transacciones

La app puede empezar con pantallas de ejemplo, pero debe reemplazarlas por pantallas conectadas a Firebase.

## Arquitectura recomendada

Usar Firestore directo desde iOS:

```text
SwiftUI iOS
  -> Firebase Auth
  -> Firestore SDK
  -> users/{uid}/{collection}
```

No crear un backend con Functions para leer Home, tarjetas o transacciones. Eso duplicaría costo y complejidad. Functions queda para:

- Webhooks externos.
- Lectura de emails bancarios.
- Clasificación con IA.
- Procesos automáticos.

## Estructura Firestore

Todos los datos del usuario viven debajo de:

```text
users/{uid}/accounts
users/{uid}/cards
users/{uid}/categories
users/{uid}/transactions
users/{uid}/budgets
```

Cada documento tiene `id` como document id. En creación y edición, la web guarda también `createdAt` y `updatedAt` con server timestamp.

## Modelos

### Account

```swift
struct Account: Identifiable, Codable {
    var id: String
    var name: String
    var type: AccountType
    var classification: AccountClassification
    var cardId: String?
    var isActive: Bool
}
```

Tipos permitidos:

```swift
enum AccountType: String, Codable {
    case cash
    case bank
    case savings
    case credit
    case investments
}
```

Clasificaciones permitidas:

```swift
enum AccountClassification: String, Codable {
    case cash
    case nonLiquidAsset = "non_liquid_asset"
}
```

Regla de compatibilidad:

- Si `classification` no existe, usar:
  - `non_liquid_asset` cuando `type == investments`
  - `cash` para las demás.
- Si `type == credit`, `cardId` es obligatorio.
- Si `type != credit`, `cardId` debe tratarse como `nil`.

Labels:

- `cash`: Efectivo
- `bank`: Banco
- `savings`: Ahorros
- `credit`: Crédito
- `investments`: Inversiones
- `classification.cash`: Efectivo / líquida
- `classification.non_liquid_asset`: Activo no líquido

### Card

```swift
struct Card: Identifiable, Codable {
    var id: String
    var name: String
    var bank: String
    var creditLimit: Double
    var billingDay: Int
    var paymentDueDay: Int
    var isActive: Bool
}
```

Reglas:

- `creditLimit >= 0`
- `billingDay` entre 1 y 31
- `paymentDueDay` entre 1 y 31

### Category

```swift
struct Category: Identifiable, Codable {
    var id: String
    var name: String
    var type: CategoryType
    var isActive: Bool
}
```

```swift
enum CategoryType: String, Codable {
    case income
    case expense
}
```

Si `type` no existe, asumir `expense`.

### Transaction

```swift
struct Transaction: Identifiable, Codable {
    var id: String
    var type: TransactionType
    var amount: Double
    var date: String
    var description: String?
    var categoryId: String?
    var accountId: String?
    var destinationAccountId: String?
    var cardId: String?
    var paymentMethod: PaymentMethod?
}
```

```swift
enum TransactionType: String, Codable {
    case income
    case expense
    case transfer
    case cardPurchase = "card_purchase"
    case cardPayment = "card_payment"
}

enum PaymentMethod: String, Codable {
    case cash
    case debit
    case credit
}
```

Reglas:

- `amount > 0`
- `date` debe ser `YYYY-MM-DD`
- `description` máximo 180 caracteres
- `income` requiere `accountId`
- `expense` con `paymentMethod == credit` requiere `cardId` y no usa `accountId`
- `expense` con `paymentMethod == cash` o `debit` requiere `accountId`
- `transfer` requiere `accountId` y `destinationAccountId`, distintos entre sí
- `card_payment` requiere `cardId` y `accountId`
- `card_purchase` requiere `cardId`

### Budget

```swift
struct Budget: Identifiable, Codable {
    var id: String
    var name: String
    var categoryId: String
    var period: String
    var limitAmount: Double
    var month: Int
    var year: Int
    var isActive: Bool
}
```

Reglas:

- `period == monthly`
- `limitAmount > 0`
- `month` entre 1 y 12
- `year` entre 2000 y 2100
- En la web, una categoría solo puede pertenecer a un presupuesto.

## Funciones financieras

### Fechas

Las fechas de transacciones son strings `YYYY-MM-DD`. Para ordenar:

```swift
transactions.sorted { $0.date > $1.date }
```

Para periodos:

```swift
String(date.prefix(7)) // YYYY-MM
```

### Es gasto

```swift
func isExpenseTransaction(_ transaction: Transaction) -> Bool {
    transaction.type == .expense || transaction.type == .cardPurchase
}
```

### Saldo por cuenta

```swift
func accountBalance(accountId: String, transactions: [Transaction]) -> Double {
    transactions.reduce(0) { balance, transaction in
        let amount = transaction.amount

        switch transaction.type {
        case .income:
            return transaction.accountId == accountId ? balance + amount : balance
        case .expense:
            return transaction.accountId == accountId ? balance - amount : balance
        case .transfer:
            if transaction.accountId == accountId { return balance - amount }
            if transaction.destinationAccountId == accountId { return balance + amount }
            return balance
        case .cardPayment:
            return transaction.accountId == accountId ? balance - amount : balance
        case .cardPurchase:
            return balance
        }
    }
}
```

### Deuda por tarjeta

```swift
func isCreditPurchase(_ transaction: Transaction) -> Bool {
    transaction.type == .cardPurchase ||
    (transaction.type == .expense && transaction.paymentMethod == .credit)
}

func cardDebt(cardId: String, transactions: [Transaction]) -> Double {
    transactions.reduce(0) { debt, transaction in
        guard transaction.cardId == cardId else { return debt }

        if isCreditPurchase(transaction) {
            return debt + transaction.amount
        }

        if transaction.type == .cardPayment {
            return debt - transaction.amount
        }

        return debt
    }
}
```

### Disponible de tarjeta

```swift
available = max(card.creditLimit - max(cardDebt, 0), 0)
usage = card.creditLimit > 0 ? min(cardDebt / card.creditLimit * 100, 100) : 0
```

### Balance total de Home

Home siempre usa todos los periodos. No hay selector de periodo.

Ingresos del balance solo cuentan si entran a cuentas clasificadas como efectivo/liquidas:

```swift
func accountClassification(_ account: Account) -> AccountClassification {
    account.classification
}

func isCashAccount(accountId: String?, accounts: [Account]) -> Bool {
    guard let accountId,
          let account = accounts.first(where: { $0.id == accountId }) else {
        return false
    }

    return accountClassification(account) == .cash
}

monthlyIncome = transactions
    .filter { $0.type == .income && isCashAccount(accountId: $0.accountId, accounts: accounts) }
    .reduce(0) { $0 + $1.amount }

monthlyExpenses = transactions
    .filter(isExpenseTransaction)
    .reduce(0) { $0 + $1.amount }

balanceTotal = monthlyIncome - monthlyExpenses
```

### Patrimonio neto

```swift
accountBalances = accounts.map { accountBalance(account.id, transactions) }

totalAssets = accountBalances
    .filter { account.type != .credit }
    .reduce(0) { total, account in total + max(account.balance, 0) }

totalCardDebt = cards.reduce(0) { total, card in
    total + max(cardDebt(card.id, transactions), 0)
}

negativeAccountBalances = accountBalances.reduce(0) { total, account in
    total + abs(min(account.balance, 0))
}

totalLiabilities = totalCardDebt + negativeAccountBalances
netWorth = totalAssets - totalLiabilities
```

### Presupuestos

Gasto por categoria:

```swift
func categoryExpense(categoryId: String, transactions: [Transaction]) -> Double {
    transactions.reduce(0) { total, transaction in
        guard transaction.categoryId == categoryId,
              isExpenseTransaction(transaction) else {
            return total
        }

        return total + transaction.amount
    }
}
```

En vistas con "todos los periodos", la web multiplica el limite mensual por la cantidad de periodos con transacciones:

```swift
periodCount = max(Set(transactions.compactMap { $0.date.prefix(7) }).count, 1)
effectiveLimit = budget.limitAmount * Double(periodCount)
spent = categoryExpense(categoryId: budget.categoryId, transactions: filteredTransactions)
percent = effectiveLimit > 0 ? min(spent / effectiveLimit * 100, 100) : 0
remaining = effectiveLimit - spent
```

### Recomendacion de tarjeta para gastar

Constantes:

```swift
healthyUtilizationTarget = 80
flexibleUtilizationTarget = 70
```

Por tarjeta activa:

```swift
limit = card.creditLimit
debt = max(cardDebt(card.id, transactions), 0)
available = max(limit - debt, 0)
usage = limit > 0 ? min(debt / limit * 100, 100) : 0
healthyRoom = max(limit * 0.80 - debt, 0)
flexibleRoom = max(limit * 0.70 - debt, 0)
spendRoom = min(available, healthyRoom != 0 ? healthyRoom : flexibleRoom)
daysToBilling = daysUntil(dayOfMonth: card.billingDay)
daysToPayment = daysUntil(dayOfMonth: card.paymentDueDay)
utilizationScore = max(100 - usage, 0)
timingScore = daysToBilling * 2
paymentPenalty = debt > 0 && daysToPayment <= 5 ? 35 : 0
overusePenalty = usage >= 90 ? 45 : usage >= 70 ? 20 : 0
score = spendRoom + utilizationScore + Double(timingScore) - Double(paymentPenalty) - Double(overusePenalty)
```

Ordenar por `score` descendente. La primera es la recomendada.

## Pantallas iOS

### Home

Debe mostrar:

- Puedes gastar con tarjeta.
- Tarjeta recomendada para gastar ahora.
- Patrimonio neto.
- Activos.
- Deudas.
- Balance total.
- Presupuestos.
- Cuentas.
- Categoria principal.
- Recomendaciones o resumenes equivalentes.

Home siempre usa todos los periodos.

### Informacion de tarjetas

Debe mostrar:

- Filtro de periodo con default "Todos los periodos".
- Linea total.
- Deuda actual o del periodo.
- Disponible.
- Mayor saldo o mayor uso.
- Uso total de linea.
- Uso por tarjeta.
- Compras con credito por periodo.
- Proximos pagos.
- Boton "Pagar tarjeta" por tarjeta.

Pago de tarjeta:

El usuario ingresa:

- Cuenta de cargo.
- Fecha.
- Disponible actual real de la tarjeta.

Calculo:

```swift
registeredDebt = max(cardDebt(card.id, allTransactions), 0)
registeredAvailable = max(card.creditLimit - registeredDebt, 0)
targetDebt = max(card.creditLimit - availableAmountInput, 0)
paymentAmount = max(registeredDebt - targetDebt, 0)
```

Si `paymentAmount > 0`, registrar:

```swift
Transaction(
    type: .cardPayment,
    amount: paymentAmount,
    date: yyyyMMdd,
    description: "Pago \(card.name)",
    categoryId: nil,
    accountId: selectedAccountId,
    destinationAccountId: nil,
    cardId: card.id,
    paymentMethod: nil
)
```

### Transacciones

Debe mostrar:

- Lista ordenada por fecha descendente.
- Filtros:
  - cuenta
  - tipo de gasto: efectivo, debito, credito
  - tarjeta
  - categoria
  - busqueda por descripcion
- Columnas o filas:
  - fecha
  - tipo
  - descripcion
  - categoria
  - monto
  - cuenta
  - tarjeta
- Crear/editar transaccion con reglas del modelo.

## Diseno visual

Usar SwiftUI con estilo equivalente:

- Fondo claro/suave.
- Tarjetas de informacion con bordes redondeados de 8 px.
- Iconos SF Symbols equivalentes a los iconos Material.
- Layout compacto y utilitario, no landing page.
- Tipografia clara:
  - titulos de pantalla grandes pero sobrios
  - metricas con numero principal
  - captions pequenos
- Botones con icono y texto.
- Listas escaneables.
- Barras de progreso para uso de tarjetas y presupuestos.
- Colores:
  - primary para neutro/importante
  - green para positivo
  - red para gasto/error
  - orange/yellow para advertencias
- Evitar decoracion innecesaria.
- Priorizar lectura rapida de datos financieros.

## Firebase iOS setup

1. Crear app iOS en Firebase Console.
2. Descargar `GoogleService-Info.plist`.
3. Agregarlo al proyecto Xcode.
4. Instalar Firebase con Swift Package Manager:
   - FirebaseAuth
   - FirebaseFirestore
   - FirebaseFirestoreSwift si esta disponible
5. Inicializar en el app entrypoint:

```swift
import FirebaseCore

@main
struct ControlCashApp: App {
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
```

6. Crear servicios:
   - `AuthService`
   - `FirestoreRepository`
   - `FinanceCalculator`
   - ViewModels por pantalla.

## Prompt para Codex en Xcode

```text
Estoy creando la app iOS nativa de ControlCash en SwiftUI. Ya tengo pantallas de ejemplo pero no tengo conexion con Firebase. Quiero que implementes la app tomando como referencia el modelo financiero de mi frontend web.

Objetivo inicial:
1. Configurar Firebase Auth y Firestore en iOS.
2. Leer datos desde Firestore bajo users/{uid}/{collection}.
3. Implementar Home, Informacion de tarjetas y Transacciones.
4. Replicar las reglas de calculo financiero documentadas aqui.
5. Mantener un diseno SwiftUI limpio, compacto y similar al dashboard web: tarjetas de metricas, listas escaneables, barras de progreso, botones con iconos y colores semanticos.

Firestore:
- users/{uid}/accounts
- users/{uid}/cards
- users/{uid}/categories
- users/{uid}/transactions
- users/{uid}/budgets

Modelos:
- Account: id, name, type, classification, cardId, isActive
- Card: id, name, bank, creditLimit, billingDay, paymentDueDay, isActive
- Category: id, name, type, isActive
- Transaction: id, type, amount, date, description, categoryId, accountId, destinationAccountId, cardId, paymentMethod
- Budget: id, name, categoryId, period, limitAmount, month, year, isActive

Enums:
- AccountType: cash, bank, savings, credit, investments
- AccountClassification: cash, non_liquid_asset
- CategoryType: income, expense
- TransactionType: income, expense, transfer, card_purchase, card_payment
- PaymentMethod: cash, debit, credit

Reglas principales:
- Los datos estan por usuario autenticado en users/{uid}.
- Home siempre usa todos los periodos.
- Balance total = ingresos hacia cuentas clasificadas como cash - gastos.
- Gasto = transaction.type expense o card_purchase.
- Patrimonio neto = activos - deudas.
- Activos = saldos positivos de cuentas que no sean type credit.
- Deudas = deuda de tarjetas + saldos negativos de cuentas.
- Deuda de tarjeta = consumos de credito - pagos de tarjeta.
- Consumo de credito = type card_purchase o type expense con paymentMethod credit.
- Pago de tarjeta = type card_payment con cardId y accountId.
- Disponible tarjeta = creditLimit - deuda.
- Transacciones se ordenan por date descendente.
- Categorias faltantes se muestran como "Sin categoria".
- Cuentas existentes sin classification usan investments -> non_liquid_asset y el resto -> cash.

Pantallas:

Home:
- Mostrar patrimonio neto, activos, deudas, balance total.
- Mostrar recomendacion de tarjeta para gastar.
- Mostrar disponible total de tarjetas y uso actual.
- Mostrar presupuestos y categorias principales.

Informacion de tarjetas:
- Default del filtro: Todos los periodos.
- Mostrar linea total, deuda, disponible, mayor saldo/uso.
- Mostrar uso por tarjeta con barras de progreso.
- Mostrar proximos pagos.
- Agregar boton Pagar tarjeta por tarjeta.
- Modal Pagar tarjeta: cuenta de cargo, fecha, disponible actual real.
- Calcular pago a registrar:
  paymentAmount = max(registeredDebt - max(card.creditLimit - availableInput, 0), 0)
- Registrar como card_payment.

Transacciones:
- Lista con filtros por cuenta, tipo de gasto, tarjeta, categoria y descripcion.
- Crear transacciones respetando reglas.
- Para gasto con credito mostrar tarjeta; para efectivo/debito mostrar cuenta.

Implementacion:
- Crear models Codable.
- Crear repositorio Firestore generico por coleccion.
- Crear FinanceCalculator con funciones puras y tests.
- Crear ViewModels separados: HomeViewModel, CardsInsightsViewModel, TransactionsViewModel.
- Usar listeners en tiempo real si es razonable; si no, fetch inicial.
- No usar Cloud Functions para leer datos normales.
- No poner claves privadas en la app.

Entrega:
- Codigo SwiftUI funcional.
- Conexion Firebase lista.
- Pantallas conectadas a datos reales.
- FinanceCalculator cubierto con pruebas unitarias basicas.
```

## Lista de tareas para la app iOS

1. Agregar Firebase al proyecto Xcode.
2. Configurar `GoogleService-Info.plist`.
3. Crear `ControlCashApp` con `FirebaseApp.configure()`.
4. Crear modelos Swift.
5. Crear enums Swift con raw values iguales a Firestore.
6. Crear `AuthService`.
7. Crear `FirestoreRepository`.
8. Crear listeners para accounts, cards, categories, transactions, budgets.
9. Crear `FinanceCalculator`.
10. Agregar tests de `FinanceCalculator`.
11. Crear `HomeViewModel`.
12. Crear `CardsInsightsViewModel`.
13. Crear `TransactionsViewModel`.
14. Diseñar componentes reutilizables:
    - metric card
    - progress row
    - transaction row
    - filter toolbar
    - empty state
15. Reemplazar pantalla Home de ejemplo.
16. Reemplazar pantalla Informacion de tarjetas de ejemplo.
17. Reemplazar pantalla Transacciones de ejemplo.
18. Implementar modal Pagar tarjeta.
19. Implementar formulario de transaccion.
20. Validar lectura/escritura con Firestore real.
