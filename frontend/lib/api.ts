const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://govmind-ai.onrender.com').replace(/\/$/, '')

export interface PermitResponse {
  id: string
  business_name: string
  owner_name_masked: string | null
  tax_id_masked: string | null
  address_masked: string | null
  permit_type: string
  status: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED' | 'HUMAN_REVIEW'
  ai_decision: string | null
  ai_confidence: number | null
  ai_reason: string | null
  audit_trace: Record<string, unknown> | Record<string, unknown>[] | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  human_override_reason: string | null
}

export interface PermitListItem {
  id: string
  business_name: string
  permit_type: string
  status: string
  ai_decision: string | null
  ai_confidence: number | null
  submitted_at: string
}

export interface HumanReviewRequest {
  decision: 'APPROVED' | 'REJECTED' | 'HUMAN_REVIEW'
  reason: string
  reviewed_by: string
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Fetch with timeout — prevents hanging on Render cold start
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 60000
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. The server may be waking up — please try again in 30 seconds.',
        408
      )
    }
    throw new ApiError(
      'Cannot connect to server. Please check your connection and try again.',
      0
    )
  } finally {
    clearTimeout(timeout)
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.error || `Request failed with status ${res.status}`, res.status)
  }
  return res.json()
}

export async function submitPermit(formData: FormData): Promise<PermitResponse> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/v1/permits/submit`,
    { method: 'POST', body: formData },
    90000 // 90 seconds for AI processing
  )
  return handle<PermitResponse>(res)
}

export async function getPermit(id: string): Promise<PermitResponse> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/permits/${id}`)
  return handle<PermitResponse>(res)
}

export async function getAllPermits(
  status?: string,
  limit = 50,
  offset = 0
): Promise<PermitListItem[]> {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/permits/all?${params}`)
  return handle<PermitListItem[]>(res)
}

export async function reviewPermit(
  id: string,
  body: HumanReviewRequest
): Promise<PermitResponse> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/v1/permits/${id}/review`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  return handle<PermitResponse>(res)
}
