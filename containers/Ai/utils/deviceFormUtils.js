/**
 * GPU device rows ↔ API devices[] conversion for llm_sku forms.
 * API: devices: [{ model, sharing_mode, dev_type, vendor?, memory_mb? }] — one entry per card claim.
 * Form: [{ model, count, sharing_mode, vendor?, memory_mb? }] — model with quantity and sharing mode.
 */

export const DEFAULT_SHARING_MODE = 'HAMI'
export const DEFAULT_DEV_TYPE = 'GPU'

/** LLM-oriented sharing modes (subset of compute isolated-device modes). */
export const LLM_SHARING_MODE_VALUES = ['HAMI', 'UNLIMITED', 'MPS', 'EXCLUSIVE']

/** Desktop SKU: no HAMI/MPS; only exclusive or unlimited share. */
export const DESKTOP_SHARING_MODE_VALUES = ['UNLIMITED', 'EXCLUSIVE']
export const DESKTOP_DEFAULT_SHARING_MODE = 'UNLIMITED'

const LEGACY_DEV_TYPE_TO_SHARING = {
  NVIDIA_GPU: 'EXCLUSIVE',
  NVIDIA_MPS: 'MPS',
  NVIDIA_GPU_SHARE: 'UNLIMITED',
  NVIDIA_HAMI: 'HAMI',
  HYGON_DCU: 'EXCLUSIVE',
  HYGON_DCU_HAMI: 'HAMI',
  ASCEND_NPU: 'EXCLUSIVE',
  ASCEND_NPU_HAMI: 'HAMI',
}

const LEGACY_DEV_TYPE_TO_VENDOR = {
  NVIDIA_GPU: 'NVIDIA',
  NVIDIA_MPS: 'NVIDIA',
  NVIDIA_GPU_SHARE: 'NVIDIA',
  NVIDIA_HAMI: 'NVIDIA',
  HYGON_DCU: 'HYGON',
  HYGON_DCU_HAMI: 'HYGON',
  ASCEND_NPU: 'ASCEND',
  ASCEND_NPU_HAMI: 'ASCEND',
}

/** Legacy container device types that normalize to NPU (not GPU). */
const LEGACY_NPU_DEV_TYPES = {
  ASCEND_NPU: true,
  ASCEND_NPU_HAMI: true,
}

/** PCI vendor id prefix → canonical vendor name (align with compute ID_VENDOR_MAP). */
const PCI_VENDOR_ID_TO_NAME = {
  '10de': 'NVIDIA',
  1002: 'AMD',
  '1d94': 'HYGON',
  '1ec6': 'VASTAITECH',
  '19e5': 'ASCEND',
}

function isPodPciModelItem (item) {
  return !item?.hypervisor || item.hypervisor === 'pod'
}

/** Normalize capability.pci_model_types (array or keyed object) to an array. */
export function normalizePciModelTypes (raw) {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') return Object.values(raw)
  return []
}

/** Pod-scoped entries from capability for LLM GPU forms. */
export function getPodPciModelTypes (capability) {
  return normalizePciModelTypes(capability?.pci_model_types).filter(isPodPciModelItem)
}

function resolvePciModelSharingMode (item) {
  const direct = String(item?.sharing_mode || '').trim()
  if (direct) return direct
  return LEGACY_DEV_TYPE_TO_SHARING[item?.dev_type] || undefined
}

function matchesSharingMode (item, mode) {
  const itemMode = resolvePciModelSharingMode(item)
  if (!itemMode) return false
  return itemMode === mode
}

function collectVendors (pciModelTypes, { model, sharingMode, matchSharingMode = true } = {}) {
  const vendors = new Set()
  const modelName = model ? String(model).trim() : ''
  const mode = sharingMode ? resolveSharingMode(sharingMode) : undefined
  pciModelTypes.forEach((item) => {
    if (!isPodPciModelItem(item)) return
    if (modelName && item?.model !== modelName) return
    if (matchSharingMode && mode && resolvePciModelSharingMode(item) !== mode) return
    const vendor = resolvePciModelVendor(item)
    if (vendor) vendors.add(vendor)
  })
  return Array.from(vendors).sort()
}

/** All GPU vendors on pod hypervisor (independent of sharing mode). */
export function listPodVendors (pciModelTypes = []) {
  return collectVendors(pciModelTypes)
}

/** Resolve vendor from pci_model_types entry (vendor, vendor_device_id, or pci_id prefix). */
export function resolvePciModelVendor (item) {
  const direct = String(item?.vendor || '').trim()
  if (direct) return direct
  const vendorDeviceId = String(item?.vendor_device_id || item?.pci_id || '').trim()
  if (!vendorDeviceId) return undefined
  const prefix = vendorDeviceId.split(':')[0]?.toLowerCase()
  return PCI_VENDOR_ID_TO_NAME[prefix] || undefined
}

/** Whether the vendor selector should show for a device row. */
export function shouldShowVendorSelect (pciModelTypes = [], _sharingMode) {
  return listPodVendors(pciModelTypes).length > 0
}

/** Whether any pod GPU models exist for the sharing mode. */
export function hasPodGpuModelsForSharingMode (pciModelTypes = [], sharingMode) {
  const mode = resolveSharingMode(sharingMode)
  return pciModelTypes.some((item) => {
    if (!isPodPciModelItem(item)) return false
    if (!item?.model) return false
    return matchesSharingMode(item, mode)
  })
}

/**
 * Map legacy NVIDIA_* / HYGON_* / ASCEND_* device types onto GPU|NPU + sharing_mode + vendor
 * (align with backend normalizeLLMSkuDevice).
 */
export function normalizeLegacyDevice (device = {}) {
  const out = { ...device }
  const originalDevType = out.dev_type
  const legacyMode = LEGACY_DEV_TYPE_TO_SHARING[originalDevType]
  if (legacyMode) {
    out.dev_type = LEGACY_NPU_DEV_TYPES[originalDevType] ? 'NPU' : DEFAULT_DEV_TYPE
    if (!out.sharing_mode) {
      out.sharing_mode = legacyMode
    }
    if (!out.vendor) {
      out.vendor = LEGACY_DEV_TYPE_TO_VENDOR[originalDevType]
    }
  }
  if (!out.dev_type) {
    out.dev_type = String(out.vendor || '').toUpperCase() === 'ASCEND' ? 'NPU' : DEFAULT_DEV_TYPE
  }
  if (!out.sharing_mode) {
    out.sharing_mode = DEFAULT_SHARING_MODE
  }
  return out
}

/** Canonicalize a raw / legacy pci_model_types.dev_type for API submit. */
function canonicalizeDevType (devType, vendor) {
  const raw = String(devType || '').trim()
  if (LEGACY_NPU_DEV_TYPES[raw]) return 'NPU'
  if (LEGACY_DEV_TYPE_TO_SHARING[raw]) return DEFAULT_DEV_TYPE
  if (raw === 'NPU' || raw === 'GPU') return raw
  if (!raw && String(vendor || '').toUpperCase() === 'ASCEND') return 'NPU'
  return raw || DEFAULT_DEV_TYPE
}

/** Resolve dev_type for a model from pci_model_types capability list. */
export function resolveDevTypeForModel (model, pciModelTypes = [], { sharingMode, vendor } = {}) {
  const name = String(model || '').trim()
  if (!name) return DEFAULT_DEV_TYPE
  const mode = sharingMode ? resolveSharingMode(sharingMode) : undefined
  const vendorFilter = normalizeVendor(vendor)
  let matched
  for (let i = 0; i < pciModelTypes.length; i++) {
    const item = pciModelTypes[i]
    if (!isPodPciModelItem(item)) continue
    if (item?.model !== name) continue
    if (mode && resolvePciModelSharingMode(item) !== mode) continue
    const itemVendor = resolvePciModelVendor(item)
    if (vendorFilter && itemVendor && itemVendor !== vendorFilter) continue
    matched = item
    break
  }
  if (!matched) {
    return canonicalizeDevType('', vendorFilter)
  }
  return canonicalizeDevType(matched.dev_type, vendorFilter || resolvePciModelVendor(matched))
}

export function resolveSharingMode (value) {
  const mode = String(value || '').trim()
  return mode || DEFAULT_SHARING_MODE
}

function normalizeMemoryMb (value) {
  const n = parseInt(value, 10)
  return n > 0 ? n : undefined
}

function normalizeVendor (value) {
  const vendor = String(value || '').trim()
  return vendor || undefined
}

function deviceRowKey (model, sharingMode, memoryMb, vendor) {
  const memKey = memoryMb > 0 ? String(memoryMb) : ''
  const vendorKey = normalizeVendor(vendor) || ''
  return `${model}\0${resolveSharingMode(sharingMode)}\0${vendorKey}\0${memKey}`
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
    const vendor = normalizeVendor(d.vendor)
    const key = deviceRowKey(model, sharingMode, memoryMb, vendor)
    if (!counts.has(key)) {
      order.push(key)
      counts.set(key, {
        model,
        sharing_mode: sharingMode,
        count: 0,
        ...(vendor ? { vendor } : {}),
        ...(memoryMb ? { memory_mb: memoryMb } : {}),
      })
    }
    counts.get(key).count += 1
  })
  return order.map(key => ({ ...counts.get(key) }))
}

/** Build GPU model select options scoped to sharing mode (and optional vendor). */
export function buildModelSelectEntries (pciModelTypes = [], { sharingMode, vendor } = {}) {
  const mode = resolveSharingMode(sharingMode)
  const vendorFilter = normalizeVendor(vendor)
  const modelCounts = new Map()
  pciModelTypes.forEach((item) => {
    if (!isPodPciModelItem(item)) return
    if (!item?.model) return
    if (resolvePciModelSharingMode(item) !== mode) return
    const itemVendor = resolvePciModelVendor(item)
    if (vendorFilter && itemVendor && itemVendor !== vendorFilter) return
    modelCounts.set(item.model, (modelCounts.get(item.model) || 0) + 1)
  })
  const entries = []
  pciModelTypes.forEach((item) => {
    if (!isPodPciModelItem(item)) return
    if (!item?.model) return
    if (resolvePciModelSharingMode(item) !== mode) return
    const itemVendor = resolvePciModelVendor(item)
    if (vendorFilter && itemVendor && itemVendor !== vendorFilter) return
    const dup = modelCounts.get(item.model) > 1
    const key = itemVendor ? `${item.model}\0${itemVendor}` : item.model
    if (entries.some(e => e.key === key)) return
    entries.push({
      key,
      label: dup && itemVendor ? `${item.model} (${itemVendor})` : item.model,
      model: item.model,
      vendor: itemVendor || undefined,
    })
  })
  return entries
}

/** Unique GPU vendors for pod hypervisor matching the given sharing mode. */
export function listVendorsForSharingMode (pciModelTypes = [], sharingMode, { model } = {}) {
  const mode = resolveSharingMode(sharingMode)
  return collectVendors(pciModelTypes, { model, sharingMode: mode, matchSharingMode: true })
}

/** Whether a device row still needs an explicit vendor before submit. */
export function deviceRowNeedsVendor (row, pciModelTypes = []) {
  const model = String(row?.model || '').trim()
  if (!model) return false
  if (normalizeVendor(row?.vendor)) return false
  const mode = resolveSharingMode(row?.sharing_mode)
  const vendors = listVendorsForSharingMode(pciModelTypes, mode, { model })
  return vendors.length > 1
}

export function expandRowsToDevices (rows, pciModelTypes = []) {
  if (!Array.isArray(rows)) return []
  const out = []
  rows.forEach((row) => {
    const model = String(row?.model || '').trim()
    const count = Math.max(1, parseInt(row?.count, 10) || 1)
    if (!model) return
    const sharingMode = resolveSharingMode(row.sharing_mode)
    const memoryMb = sharingMode === 'HAMI' ? normalizeMemoryMb(row.memory_mb) : undefined
    let vendor = normalizeVendor(row.vendor)
    if (!vendor && pciModelTypes.length) {
      vendor = resolveVendorForModel(model, pciModelTypes, { sharingMode })
    }
    const devType = resolveDevTypeForModel(model, pciModelTypes, { sharingMode, vendor })
    for (let i = 0; i < count; i++) {
      const device = {
        model,
        sharing_mode: sharingMode,
        dev_type: devType,
      }
      if (vendor) {
        device.vendor = vendor
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
    const prefix = r.vendor ? `${r.vendor} ` : ''
    return `${prefix}${r.model} ×${r.count} (${r.sharing_mode}${mem})`
  }).join(', ')
}

export function isValidDeviceRows (rows, { allowEmpty = false, requireHamiMemoryMb = false, pciModelTypes = [], requireVendor = false } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) return allowEmpty
  const withModel = rows.filter(row => String(row?.model || '').trim())
  if (withModel.length === 0) return allowEmpty
  if (!withModel.every(row => Number(row.count) >= 1)) return false
  if (requireVendor || pciModelTypes.length) {
    const needVendorCheck = requireVendor || pciModelTypes.length > 0
    if (needVendorCheck && withModel.some(row => deviceRowNeedsVendor(row, pciModelTypes))) {
      return false
    }
  }
  if (requireHamiMemoryMb) {
    return withModel.every((row) => {
      if (resolveSharingMode(row.sharing_mode) !== 'HAMI') return true
      return normalizeMemoryMb(row.memory_mb) > 0
    })
  }
  return true
}

export function deviceRowsHaveContent (rows) {
  return Array.isArray(rows) && rows.some(row => String(row?.model || '').trim())
}

export function createEmptyDeviceRow (sharingMode = DEFAULT_SHARING_MODE) {
  const mode = String(sharingMode || '').trim() || DEFAULT_SHARING_MODE
  return { model: undefined, count: 1, sharing_mode: mode }
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
    const vendor = normalizeVendor(row?.vendor)
    if (vendor) {
      next.vendor = vendor
    }
    const memoryMb = sharingMode === 'HAMI' ? normalizeMemoryMb(row?.memory_mb) : undefined
    if (memoryMb) {
      next.memory_mb = memoryMb
    }
    return next
  })
}

/** Resolve vendor for a model from pci_model_types capability list. */
export function resolveVendorForModel (model, pciModelTypes = [], { sharingMode } = {}) {
  const name = String(model || '').trim()
  if (!name) return undefined
  const mode = sharingMode ? resolveSharingMode(sharingMode) : undefined
  const vendors = listVendorsForSharingMode(pciModelTypes, mode || DEFAULT_SHARING_MODE, { model: name })
  if (vendors.length === 1) return vendors[0]
  return undefined
}

/** Build API device entries from simple model keys (llm create override). */
export function devicesFromModelKeys (models, pciModelTypes = [], { sharingMode = DEFAULT_SHARING_MODE } = {}) {
  if (!Array.isArray(models)) return []
  return models.map((model) => {
    const vendor = resolveVendorForModel(model, pciModelTypes, { sharingMode })
    const device = {
      model,
      sharing_mode: sharingMode,
      dev_type: resolveDevTypeForModel(model, pciModelTypes, { sharingMode, vendor }),
    }
    if (vendor) {
      device.vendor = vendor
    }
    return device
  })
}
