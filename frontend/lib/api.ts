const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.error || 'Request failed', res.status)
  }
  return res.json()
}

export async function submitPermit(formData: FormData): Promise<PermitResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/submit`, {
    method: 'POST',
    body: formData,
  })
  return handle<PermitResponse>(res)
}

export async function getPermit(id: string): Promise<PermitResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/${id}`)
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
  const res = await fetch(`${BASE_URL}/api/v1/permits/all?${params}`)
  return handle<PermitListItem[]>(res)
}

export async function reviewPermit(
  id: string,
  body: HumanReviewRequest
): Promise<PermitResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/permits/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handle<PermitResponse>(res)
}
