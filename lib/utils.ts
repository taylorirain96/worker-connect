import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Droplet,
  Zap,
  Hammer,
  Wind,
  Home,
  Trees,
  Paintbrush,
  Layers,
  Sparkles,
  Package,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const JOB_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: '🔧', description: 'Pipes, fixtures, water systems', color: 'bg-blue-100 text-blue-700' },
  { id: 'electrical', label: 'Electrical', icon: '⚡', description: 'Wiring, panels, lighting', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'carpentry', label: 'Carpentry', icon: '🪚', description: 'Woodwork, furniture, framing', color: 'bg-orange-100 text-orange-700' },
  { id: 'hvac', label: 'HVAC', icon: '❄️', description: 'Heating, cooling, ventilation', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'roofing', label: 'Roofing', icon: '🏠', description: 'Repair, replacement, gutters', color: 'bg-red-100 text-red-700' },
  { id: 'landscaping', label: 'Landscaping', icon: '🌿', description: 'Lawn care, gardens, trees', color: 'bg-green-100 text-green-700' },
  { id: 'painting', label: 'Painting', icon: '🎨', description: 'Interior, exterior, finishing', color: 'bg-purple-100 text-purple-700' },
  { id: 'flooring', label: 'Flooring', icon: '🪵', description: 'Hardwood, tile, carpet', color: 'bg-amber-100 text-amber-700' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹', description: 'Deep clean, regular maintenance', color: 'bg-teal-100 text-teal-700' },
  { id: 'moving', label: 'Moving', icon: '📦', description: 'Packing, loading, transport', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'general', label: 'General', icon: '🛠️', description: 'Handyman, misc repairs', color: 'bg-gray-100 text-gray-700' },
] as const

export type CategoryId = (typeof JOB_CATEGORIES)[number]['id']

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  plumbing: Droplet,
  electrical: Zap,
  carpentry: Hammer,
  hvac: Wind,
  roofing: Home,
  landscaping: Trees,
  painting: Paintbrush,
  flooring: Layers,
  cleaning: Sparkles,
  moving: Package,
  general: Wrench,
}

export const CATEGORY_GRADIENTS: Record<CategoryId, string> = {
  plumbing: 'from-blue-500 to-cyan-500',
  electrical: 'from-yellow-400 to-orange-500',
  carpentry: 'from-amber-500 to-orange-500',
  hvac: 'from-cyan-500 to-blue-500',
  roofing: 'from-red-500 to-orange-500',
  landscaping: 'from-green-500 to-emerald-500',
  painting: 'from-purple-500 to-pink-500',
  flooring: 'from-amber-600 to-yellow-500',
  cleaning: 'from-teal-500 to-cyan-500',
  moving: 'from-indigo-500 to-purple-500',
  general: 'from-slate-500 to-gray-500',
}

export const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Low Priority', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium Priority', color: 'bg-blue-100 text-blue-600' },
  high: { label: 'High Priority', color: 'bg-orange-100 text-orange-600' },
  emergency: { label: 'Emergency', color: 'bg-red-100 text-red-600' },
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-green-100 text-green-600' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-600' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-600' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-600' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-600' },
}
