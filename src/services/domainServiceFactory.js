import {
  createUserDocument,
  deleteUserDocument,
  getUserDocument,
  listUserDocuments,
  subscribeUserDocuments,
  updateUserDocument,
} from './firestoreService'

export function createDomainService(collectionName, validator) {
  return {
    create(payload, options) {
      return createUserDocument(collectionName, validator(payload), options)
    },

    update(documentId, payload, options) {
      return updateUserDocument(
        collectionName,
        documentId,
        validator(payload, { partial: true }),
        options,
      )
    },

    remove(documentId, options) {
      return deleteUserDocument(collectionName, documentId, options)
    },

    getById(documentId, options) {
      return getUserDocument(collectionName, documentId, options)
    },

    list(options) {
      return listUserDocuments(collectionName, options)
    },

    subscribe(onData, onError, options) {
      return subscribeUserDocuments(collectionName, onData, onError, options)
    },
  }
}
