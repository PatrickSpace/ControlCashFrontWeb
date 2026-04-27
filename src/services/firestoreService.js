import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'

import { auth, db } from '../firebase'

const USERS_COLLECTION = 'users'

function requireUserId(userId) {
  const resolvedUserId = userId || auth.currentUser?.uid

  if (!resolvedUserId) {
    throw new Error('Debes iniciar sesion para acceder a tus datos.')
  }

  return resolvedUserId
}

function removeUndefinedValues(data) {
  return Object.entries(data).reduce((cleanData, [key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value
    }

    return cleanData
  }, {})
}

function getUserCollectionRef(collectionName, userId) {
  return collection(db, USERS_COLLECTION, requireUserId(userId), collectionName)
}

function getUserDocumentRef(collectionName, documentId, userId) {
  return doc(db, USERS_COLLECTION, requireUserId(userId), collectionName, documentId)
}

function mapDocument(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }
}

export async function createUserDocument(collectionName, data, options = {}) {
  const collectionRef = getUserCollectionRef(collectionName, options.userId)
  const cleanData = removeUndefinedValues(data)
  const documentRef = await addDoc(collectionRef, {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return documentRef.id
}

export async function updateUserDocument(collectionName, documentId, data, options = {}) {
  const documentRef = getUserDocumentRef(collectionName, documentId, options.userId)
  const cleanData = removeUndefinedValues(data)

  if (Object.keys(cleanData).length === 0) {
    throw new Error('No hay cambios para guardar.')
  }

  await updateDoc(documentRef, {
    ...cleanData,
    updatedAt: serverTimestamp(),
  })

  return documentId
}

export async function deleteUserDocument(collectionName, documentId, options = {}) {
  const documentRef = getUserDocumentRef(collectionName, documentId, options.userId)

  await deleteDoc(documentRef)

  return documentId
}

export async function getUserDocument(collectionName, documentId, options = {}) {
  const documentRef = getUserDocumentRef(collectionName, documentId, options.userId)
  const documentSnapshot = await getDoc(documentRef)

  return documentSnapshot.exists() ? mapDocument(documentSnapshot) : null
}

export async function listUserDocuments(collectionName, options = {}) {
  const collectionRef = getUserCollectionRef(collectionName, options.userId)
  const querySnapshot = await getDocs(collectionRef)

  return querySnapshot.docs.map(mapDocument)
}

export function subscribeUserDocuments(collectionName, onData, onError, options = {}) {
  const collectionRef = getUserCollectionRef(collectionName, options.userId)

  return onSnapshot(
    collectionRef,
    (querySnapshot) => {
      onData(querySnapshot.docs.map(mapDocument))
    },
    onError,
  )
}
