import { t } from '../i18n'
import type { FeedRecommendation } from '../data/types'

export function recommendationText(r: FeedRecommendation | null): string {
  if (!r) return t('detail.recommendation.none')
  return t(`recommendation.${r.action}`, { pct: r.percent ?? '' })
}
