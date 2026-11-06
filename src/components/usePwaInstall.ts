import { useEffect, useState } from 'react'
import { isAndroid, isStandalone } from '../lib/platform'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

/**
 * unsupported = bukan Android (tidak ada UI pasang)
 * installed   = sudah dibuka dari layar utama
 * prompt      = Chrome Android siap menampilkan dialog pasang
 * manual      = Android, tetapi dialog belum tersedia (mis. belum HTTPS) -> tampilkan petunjuk menu
 */
export type InstallState = 'unsupported' | 'installed' | 'prompt' | 'manual'

/** Pemasangan PWA hanya ditawarkan di Android. Prompt pemasangan sendiri hanya muncul di HTTPS. */
export function usePwaInstall(): { state: InstallState; install: () => Promise<void> } {
  const [android] = useState(() => isAndroid())
  const [evt, setEvt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => isStandalone())

  useEffect(() => {
    if (!android) return
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvt(e as InstallPromptEvent)
    }
    const onInstalled = () => {
      setEvt(null)
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [android])

  const state: InstallState = !android ? 'unsupported' : installed ? 'installed' : evt ? 'prompt' : 'manual'
  return {
    state,
    install: async () => {
      if (!evt) return
      await evt.prompt()
      setEvt(null)
    },
  }
}
