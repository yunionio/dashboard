/**
 * GPU device rows ↔ API devices[] conversion for llm_sku forms.
 * API: devices: [{ model }] — one entry per physical GPU card.
 * Form: [{ model, count }] — model with quantity.
 */

export function aggregateDevicesToRows (devices) {
  if (!Array.isArray(devices) || devices.length === 0) return []
  const counts = new Map()
  const order = []
  devices.forEach((d) => {
    const model = d?.model
    if (!model) return
    if (!counts.has(model)) {
      order.push(model)
      counts.set(model, 0)
    }
    counts.set(model, counts.get(model) + 1)
  })
  return order.map(model => ({ model, count: counts.get(model) }))
}

export function expandRowsToDevices (rows) {
  if (!Array.isArray(rows)) return []
  const out = []
  rows.forEach((row) => {
    const model = String(row?.model || '').trim()
    const count = Math.max(1, parseInt(row?.count, 10) || 1)
    if (!model) return
    for (let i = 0; i < count; i++) {
      out.push({ model })
    }
  })
  return out
}

export function formatDevicesDisplay (devices) {
  const rows = aggregateDevicesToRows(devices)
  if (!rows.length) return '-'
  return rows.map(r => `${r.model} ×${r.count}`).join(', ')
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
  return { model: undefined, count: 1 }
}

export function normalizeDeviceRows (rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [createEmptyDeviceRow()]
  }
  return rows.map(row => ({
    model: row?.model,
    count: Math.max(1, parseInt(row?.count, 10) || 1),
  }))
}
