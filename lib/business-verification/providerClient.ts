export interface VerificationProviderResult {
  verified: boolean
  status: 'clear' | 'pending' | 'issues'
  referenceId?: string
  provider?: string
  raw?: unknown
}

interface ProviderCallOptions {
  endpoint: string | undefined
  payload: Record<string, unknown>
  defaultProvider: string
}

const REQUEST_TIMEOUT_MS = 10_000

export async function callVerificationProvider(
  options: ProviderCallOptions
): Promise<VerificationProviderResult> {
  const { endpoint, payload, defaultProvider } = options
  if (!endpoint) {
    throw new Error('Verification provider is not configured')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (process.env.BUSINESS_VERIFICATION_API_KEY) {
      headers.Authorization = `Bearer ${process.env.BUSINESS_VERIFICATION_API_KEY}`
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    })

    const raw = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(`Provider request failed (${response.status})`)
    }

    const verified = Boolean((raw as { verified?: boolean }).verified)
    const status =
      (raw as { status?: VerificationProviderResult['status'] }).status ??
      (verified ? 'clear' : 'pending')

    return {
      verified,
      status,
      referenceId: (raw as { referenceId?: string }).referenceId,
      provider:
        (raw as { provider?: string }).provider ??
        (raw as { vendor?: string }).vendor ??
        defaultProvider,
      raw,
    }
  } finally {
    clearTimeout(timeout)
  }
}
