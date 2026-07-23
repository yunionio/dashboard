/**
 * GPU device rows ↔ API devices[] conversion for llm_sku forms.
 * API: devices: [{ model, sharing_mode, dev_type, memory_mb? }] — one entry per card claim.
 * Form: [{ model, count, sharing_mode, memory_mb? }] — model with quantity and sharing mode.
 */

export const DEFAULT_SHARING_MODE = 'HAMI'
export const DEFAULT_DEV_TYPE = 'GPU'

/** LLM-oriented sharing modes (subset of compute isolated-device modes). */
export const LLM_SHARING_MODE_VALUES = ['HAMI', 'UNLIMITED', 'MPS', 'EXCLUSIVE']

const LEGACY_DEV_TYPE_TO_SHARING = {
  NVIDIA_GPU: 'EXCLUSIVE',
  NVIDIA_MPS: 'MPS',
  NVIDIA_GPU_SHARE: 'UNLIMITED',
  NVIDIA_HAMI: 'HAMI',
}

/**
 * Map legacy NVIDIA_* device types onto GPU + sharing_mode (align with backend).
 */
export function normalizeLegacyDevice (device = {}) {
  const out = { ...device }
  const legacyMode = LEGACY_DEV_TYPE_TO_SHARING[out.dev_type]
  if (legacyMode) {
    out.dev_type = DEFAULT_DEV_TYPE
    if (!out.sharing_mode) {
      out.sharing_mode = legacyMode
    }
  }
  if (!out.dev_type) {
    out.dev_type = DEFAULT_DEV_TYPE
  }
  if (!out.sharing_mode) {
    out.sharing_mode = DEFAULT_SHARING_MODE
  }
  return out
}

export function resolveSharingMode (value) {
  const mode = String(value || '').trim()
  return mode || DEFAULT_SHARING_MODE
}

function normalizeMemoryMb (value) {
  const n = parseInt(value, 10)
  return n > 0 ? n : undefined
}

function deviceRowKey (model, sharingMode, memoryMb) {
  const memKey = memoryMb > 0 ? String(memoryMb) : ''
  return `${model}\0${resolveSharingMode(sharingMode)}\0${memKey}`
}

export function aggregateDevicesToRows (devices) {
  if (!Array.isArray(devices) || devices.length === 0) return []
  const counts = new Map()
  const order = []
  devices.forEach((raw) => {
    const d = normalizeLegacyDevice(raw)
    const model = d?.model
    if (!model) return
    const sharingMode = resolveSharingMode(d.sharing_mode)
    const memoryMb = sharingMode === 'HAMI' ? normalizeMemoryMb(d.memory_mb) : undefined
    const key = deviceRowKey(model, sharingMode, memoryMb)
    if (!counts.has(key)) {
      order.push(key)
      counts.set(key, {
        model,
        sharing_mode: sharingMode,
        count: 0,
        ...(memoryMb ? { memory_mb: memoryMb } : {}),
      })
    }
    counts.get(key).count += 1
  })
  return order.map(key => ({ ...counts.get(key) }))
}

export function expandRowsToDevices (rows) {
  if (!Array.isArray(rows)) return []
  const out = []
  rows.forEach((row) => {
    const model = String(row?.model || '').trim()
    const count = Math.max(1, parseInt(row?.count, 10) || 1)
    if (!model) return
    const sharingMode = resolveSharingMode(row.sharing_mode)
    const memoryMb = sharingMode === 'HAMI' ? normalizeMemoryMb(row.memory_mb) : undefined
    for (let i = 0; i < count; i++) {
      const device = {
        model,
        sharing_mode: sharingMode,
        dev_type: DEFAULT_DEV_TYPE,
      }
      if (memoryMb) {
        device.memory_mb = memoryMb
      }
      out.push(device)
    }
  })
  return out
}

export function formatDevicesDisplay (devices, { fallbackMemoryMb } = {}) {
  const rows = aggregateDevicesToRows(devices)
  if (!rows.length) return '-'
  const fallback = normalizeMemoryMb(fallbackMemoryMb)
  return rows.map((r) => {
    const memMb = r.memory_mb > 0 ? r.memory_mb : fallback
    const mem = memMb > 0 ? ` ${memMb}MB` : ''
    return `${r.model} ×${r.count} (${r.sharing_mode}${mem})`
  }).join(', ')
}

export function isValidDeviceRows (rows, { allowEmpty = false } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) return allowEmpty
  const withModel = rows.filter(row => String(row?.model || '').trim())
  if (withModel.length === 0) return allowEmpty
  return withModel.every(row => Number(row.count) >= 1)
}

export function deviceRowsHaveContent (rows) {
  return Array.isArray(rows) && rows.some(row => String(row?.model || '').trim())
}

export function createEmptyDeviceRow () {
  return { model: undefined, count: 1, sharing_mode: DEFAULT_SHARING_MODE }
}

export function normalizeDeviceRows (rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [createEmptyDeviceRow()]
  }
  return rows.map((row) => {
    const sharingMode = resolveSharingMode(row?.sharing_mode)
    const next = {
      model: row?.model,
      count: Math.max(1, parseInt(row?.count, 10) || 1),
      sharing_mode: sharingMode,
    }
    const memoryMb = sharingMode === 'HAMI' ? normalizeMemoryMb(row?.memory_mb) : undefined
    if (memoryMb) {
      next.memory_mb = memoryMb
    }
    return next
  })
}
