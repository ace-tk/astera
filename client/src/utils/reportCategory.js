import { FileText, Target, Star, Mic, ShieldCheck } from 'lucide-react'

/**
 * Maps each Report Type / Category to a small icon + accent color — used
 * consistently everywhere a category appears (demo cards, request cards,
 * report cards, admin tables/details) so the same tier always reads the same
 * way at a glance.
 */
export const CATEGORY_ICON = {
  Essential: { icon: FileText, color: 'sky' },
  Scope: { icon: Target, color: 'purple' },
  Premium: { icon: Star, color: 'golden' },
  'Speaker Analysis': { icon: Mic, color: 'coral' },
  Compliance: { icon: ShieldCheck, color: 'emerald' },
}

export const categoryIcon = (category) => CATEGORY_ICON[category] || null
