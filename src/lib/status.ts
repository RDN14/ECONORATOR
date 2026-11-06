import type { Tone } from '../components/ui'
import type { FeedStatus } from '../data/types'

export const STATUS_TONE: Record<FeedStatus, Tone> = {
  pending_upload: 'warning',
  queued: 'warning',
  processing: 'warning',
  done: 'success',
  failed: 'danger',
}
