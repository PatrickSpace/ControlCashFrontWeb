import { httpsCallable } from 'firebase/functions'

import { functions } from '../firebase'

const importGmailCreditCardTransactionsCallable = httpsCallable(
  functions,
  'importGmailCreditCardTransactions',
)

export async function importGmailCreditCardTransactions(options = {}) {
  const result = await importGmailCreditCardTransactionsCallable({
    maxResults: 10,
    ...options,
  })

  return result.data
}
