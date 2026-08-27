import { isFirebaseEnabled } from './firebase/config'
import { firestoreRepository } from './firebase/firestoreRepository'
import { localRepository } from './local/localRepository'

export const dataRepository = isFirebaseEnabled ? firestoreRepository : localRepository
export { isFirebaseEnabled }
