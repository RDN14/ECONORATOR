import { createContext, useContext } from 'react'
import type { State } from './reducer'

export interface Store extends State {
  online: boolean
  setSimulateOffline: (v: boolean) => void
  setLowDoDemo: (v: boolean) => void
  setDraft: (blob: Blob | null) => void
  submitDraft: () => string | null
}

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore harus di dalam StoreProvider')
  return s
}
