import { z } from 'zod'
import type { Country } from '@/types'
import {
  buildLocationLabel,
  isValidRegion,
  normalizeLocalizedMobile,
} from '@/lib/locationOptions'

export const localizedProfileFields = {
  country: z.enum(['NZ', 'AU']),
  phone: z.string().trim().min(1, 'Mobile number is required'),
  region: z.string().trim().min(1, 'Please select your region or state'),
  city: z.string().trim().min(2, 'Please enter your city or suburb'),
}

export const localizedProfileSchema = z
  .object(localizedProfileFields)
  .superRefine((data, ctx) => {
    if (!isValidRegion(data.country, data.region)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['region'],
        message: data.country === 'AU' ? 'Please select a valid state or territory' : 'Please select a valid region',
      })
    }

    if (!normalizeLocalizedMobile(data.phone, data.country)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: data.country === 'AU'
          ? 'Enter a valid Australian mobile number starting with +61 or 04'
          : 'Enter a valid New Zealand mobile number starting with +64 or 02',
      })
    }
  })

export type LocalizedProfileInput = z.infer<typeof localizedProfileSchema>

export function toLocalizedProfileMetadata(data: LocalizedProfileInput) {
  const phone = normalizeLocalizedMobile(data.phone, data.country)
  if (!phone) {
    throw new Error('Invalid localized mobile number')
  }

  return {
    country: data.country as Country,
    phone,
    region: data.region.trim(),
    city: data.city.trim(),
    location: buildLocationLabel(data.city, data.region),
  }
}
