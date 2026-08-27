import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, isFirebaseEnabled } from '../services/firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(isFirebaseEnabled ? null : { uid: 'development', email: 'modo@local' })
  const [loading, setLoading] = useState(isFirebaseEnabled)

  useEffect(() => {
    if (!auth) return undefined
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isDemo: !isFirebaseEnabled,
      signIn: async (email, password) => {
        if (!auth) {
          setUser({ uid: 'development', email: email || 'modo@local' })
          return
        }
        await signInWithEmailAndPassword(auth, email, password)
      },
      signOut: async () => {
        if (auth) await firebaseSignOut(auth)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
