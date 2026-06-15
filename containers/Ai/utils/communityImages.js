import { getDefaultPortMappingsForType, getDefaultSkuSpecForType } from '@Ai/views/llm-sku/constants/llmTypeConfig'

export const BUNDLE_IMPORT_KIND = 'bundle'

export const LLM_TYPE_ICONS = {
  openclaw: require('@/assets/images/llm-images/openclaw.svg'),
  'hermes-agent': require('@/assets/images/llm-images/hermes-agent.svg'),
  ollama: require('@/assets/images/llm-images/ollama.svg'),
  vllm: require('@/assets/images/llm-images/vllm.svg'),
  dify: require('@/assets/images/llm-images/dify.svg'),
  comfyui: require('@/assets/images/llm-images/comfyui.svg'),
  desktop: require('@/assets/images/llm-images/linuxserver.png'),
}

const DEFAULT_ICON = require('@/assets/images/llm-images/default.svg')

export function getTypeIcon (llmType) {
  return LLM_TYPE_ICONS[llmType] || DEFAULT_ICON
}

export function parseImageField (imageStr) {
  const idx = imageStr.lastIndexOf(':')
  if (idx > 0) {
    return { image_name: imageStr.substring(0, idx), image_label: imageStr.substring(idx + 1) }
  }
  return { image_name: imageStr, image_label: 'latest' }
}

export function isBundleItem (record) {
  return record?.import_kind === BUNDLE_IMPORT_KIND
}

/** 社区镜像导入创建 SKU 前是否需选择 GPU（如 ComfyUI） */
export function communityImportNeedsGpuSelection (record) {
  return record?.llm_type === 'comfyui'
}

/** 导入时 generate_name：桌面镜像以 app_name 开头，其它类型仍为 llm_type-image_label */
export function buildImportGenerateName (record) {
  const label = record.image_label || 'latest'
  if (record.llm_type === 'desktop' && record.app_name) {
    return `${record.app_name}-${label}`
  }
  return `${record.llm_type}-${label}`
}

export function getCommunityImageKey (record) {
  if (!record) return ''
  if (isBundleItem(record)) {
    return `bundle:${record.name}`
  }
  return `${record.llm_type}:${record.image_name}:${record.image_label}`
}

export function isCommunityImageImported (record, existingImages = {}) {
  return !!existingImages[getCommunityImageKey(record)]
}

export function isDesktopCommunityItem (record) {
  return record?.llm_type === 'desktop'
}

export function getCommunityItemDisplayTitle (record) {
  if (!record) return ''
  if (isDesktopCommunityItem(record)) {
    if (record.app_name) return record.app_name
    if (record.desktop?.ui_title) return record.desktop.ui_title
  }
  if (record.llm_type) {
    return record.llm_type
  }
  if (record.image_name && record.image_label) {
    return `${record.image_name}:${record.image_label}`
  }
  return record.image || ''
}

export function formatCommunityDisplayTitle (record, llmTypeLabel) {
  if (!record) return ''
  if (isDesktopCommunityItem(record)) {
    return getCommunityItemDisplayTitle(record)
  }
  if (record.llm_type && typeof llmTypeLabel === 'function') {
    return llmTypeLabel(record.llm_type)
  }
  return getCommunityItemDisplayTitle(record)
}

export function getCommunityItemSubtitle (record) {
  if (!record) return ''
  if (isDesktopCommunityItem(record)) {
    if (record.desktop?.ui_title && record.app_name) {
      return record.desktop.ui_title
    }
    if (record.image_label) return record.image_label
    return ''
  }
  if (isBundleItem(record)) {
    if (record.name) return record.name
    const count = record.images?.length || 0
    return count > 0 ? `${count} images` : ''
  }
  if (record.image_label) return record.image_label
  return record.image || ''
}

export function getCommunityItemImageLine (record) {
  if (!record) return ''
  if (isBundleItem(record)) {
    const count = record.images?.length || 0
    return count > 0 ? `${count}` : ''
  }
  return record.image || ''
}

function parseBundleImage (img) {
  if (!img?.image) return null
  const { image_name, image_label } = parseImageField(img.image)
  return {
    role: img.role,
    generate_name: img.generate_name,
    image: img.image,
    image_name,
    image_label,
  }
}

/**
 * 解析 llm_images_catalog API 单条记录为前端卡片项（单镜像或 bundle）。
 * @returns {object|null}
 */
export function parseCommunityCatalogItem (item, index) {
  if (!item?.llm_type) return null

  const base = {
    id: item.id || item.name || String(index + 1),
    llm_type: item.llm_type,
    description: item.description || '-',
    icon: getTypeIcon(item.llm_type),
    import_kind: item.import_kind || 'single',
    sku: item.sku || null,
  }

  if (item.import_kind === BUNDLE_IMPORT_KIND) {
    if (!item.name || !Array.isArray(item.images) || item.images.length === 0) return null
    const images = item.images.map(parseBundleImage).filter(Boolean)
    if (!images.length) return null
    return {
      ...base,
      name: item.name,
      images,
    }
  }

  if (!item.image) return null
  const { image_name, image_label } = parseImageField(item.image)
  return {
    ...base,
    image: item.image,
    image_name,
    image_label,
    app_name: item.app_name || '',
    desktop: item.desktop || null,
  }
}

function resolveSkuSpec (record) {
  if (record.sku && typeof record.sku === 'object') {
    const { cpu, memory, volume_size_mb, bandwidth } = record.sku
    if (cpu != null && memory != null && volume_size_mb != null && bandwidth != null) {
      return { cpu, memory, volume_size_mb, bandwidth }
    }
  }
  return getDefaultSkuSpecForType(record.llm_type)
}

function normalizePortMappings (portMappings) {
  if (!Array.isArray(portMappings)) return []
  return portMappings
    .map(item => ({
      protocol: String(item?.protocol || 'tcp').toLowerCase(),
      container_port: parseInt(item?.container_port, 10),
    }))
    .filter(item => item.protocol && Number.isFinite(item.container_port) && item.container_port > 0)
}

function resolvePortMappings (record) {
  const fromSku = normalizePortMappings(record.sku?.port_mappings)
  if (fromSku.length) return fromSku
  return normalizePortMappings(getDefaultPortMappingsForType(record.llm_type))
}

function resolveSkuGenerateName (record) {
  if (record.sku?.generate_name) return record.sku.generate_name
  return buildImportGenerateName(record)
}

function applySkuDevices (data, devices) {
  if (!Array.isArray(devices) || !devices.length) return
  data.devices = devices.map(model => ({ model }))
}

function buildCommunitySkuCreateData (record, imageId, { devices } = {}) {
  const spec = resolveSkuSpec(record)
  if (!spec) return null
  const llmType = record.llm_type
  const data = {
    generate_name: resolveSkuGenerateName(record),
    llm_type: llmType,
    cpu: spec.cpu,
    memory: spec.memory,
    bandwidth: spec.bandwidth,
    volumes: [{ size_mb: spec.volume_size_mb }],
    disk_size: spec.volume_size_mb,
  }
  if (imageId) {
    data.llm_image_id = imageId
  }
  const portMappings = resolvePortMappings(record)
  if (portMappings.length) {
    data.port_mappings = portMappings
  }
  applySkuDevices(data, devices)
  return data
}

/** catalog 条目导入时将使用的 llm_sku 名称，用于与后端同名 SKU 比对 */
export function getCommunitySkuName (record) {
  return resolveSkuGenerateName(record)
}

function buildImageLookupKey (llmType, imageName, imageLabel) {
  return `${llmType}:${imageName}:${imageLabel}`
}

/** llm_images_catalog API 返回 llm_images_catalogs，非标准 data 字段 */
function parseCatalogListResponse (res) {
  const body = res?.data || {}
  let items = body.llm_images_catalogs ?? body.data ?? []
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items)
    } catch (e) {
      items = []
    }
  }
  return Array.isArray(items) ? items : []
}

const catalogListInflight = new WeakMap()

async function listCommunityCatalog (catalogManager) {
  const inflight = catalogListInflight.get(catalogManager)
  if (inflight) return inflight
  const promise = catalogManager.list({ params: { limit: 0 } })
    .finally(() => {
      catalogListInflight.delete(catalogManager)
    })
  catalogListInflight.set(catalogManager, promise)
  return promise
}

/**
 * @param {string[]} allowedTypes
 * @param {object} catalogManager - Vue $Manager instance for llm_images_catalogs
 * @returns {Promise<object[]>}
 */
export async function fetchCommunityImageItems (allowedTypes = [], catalogManager) {
  if (!catalogManager) return []
  const res = await listCommunityCatalog(catalogManager)
  const items = parseCatalogListResponse(res)
  if (!items.length) return []
  const allowed = new Set(allowedTypes)
  const result = []
  items.forEach((item, index) => {
    const parsed = parseCommunityCatalogItem(item, index)
    if (parsed && allowed.has(parsed.llm_type)) {
      result.push(parsed)
    }
  })
  return result
}

function markCommunityItemsImportedBySku (existing, communityItems, existingSkuNames) {
  if (!Array.isArray(communityItems)) return
  communityItems.forEach(item => {
    const skuName = resolveSkuGenerateName(item)
    if (skuName && existingSkuNames.has(skuName)) {
      existing[getCommunityImageKey(item)] = true
    }
  })
}

async function listSkusForCommunityImport (skusManager, { scope, typeFilter, llmTypes } = {}) {
  if (!skusManager) return []
  try {
    const filter = []
    if (typeFilter) {
      filter.push(typeFilter)
    } else if (Array.isArray(llmTypes) && llmTypes.length) {
      filter.push(`llm_type.in(${llmTypes.join(',')})`)
    }
    const params = { limit: 2048 }
    if (filter.length) params.filter = filter
    if (scope) params.scope = scope
    const res = await skusManager.list({ params })
    return res.data?.data || []
  } catch (e) {
    return []
  }
}

/**
 * 通过后端是否存在同名 llm_sku 判断 catalog 条目是否已导入。
 * @param {string[]} llmTypes
 * @param {object} skusManager - Vue $Manager instance for llm_skus
 * @param {object[]} [communityItems] - 已解析的 catalog 条目
 * @param {{ scope?: string, typeFilter?: string }} [listParams]
 * @returns {Promise<Record<string, boolean>>}
 */
export async function fetchExistingCommunityImageKeys (llmTypes, skusManager, communityItems = [], listParams = {}) {
  const existing = {}
  if (!skusManager || !llmTypes?.length) return existing

  const skus = await listSkusForCommunityImport(skusManager, {
    scope: listParams.scope,
    typeFilter: listParams.typeFilter,
    llmTypes,
  })
  const existingSkuNames = new Set()
  skus.forEach(sku => {
    if (sku.name) existingSkuNames.add(sku.name)
  })

  markCommunityItemsImportedBySku(existing, communityItems, existingSkuNames)
  return existing
}

async function listResourcesByLlmType (manager, llmType) {
  if (!manager) return []
  try {
    const res = await manager.list({
      params: {
        limit: 2048,
        filter: [`llm_type.equals('${llmType}')`],
      },
    })
    return res.data?.data || []
  } catch (e) {
    return []
  }
}

async function buildExistingImageIdMap (llmType, imagesManager) {
  const map = {}
  const images = await listResourcesByLlmType(imagesManager, llmType)
  images.forEach(img => {
    map[buildImageLookupKey(img.llm_type, img.image_name, img.image_label)] = img.id
  })
  return map
}

async function findOrCreateBundleImage (imgSpec, llmType, imagesManager, existingIdMap) {
  const key = buildImageLookupKey(llmType, imgSpec.image_name, imgSpec.image_label)
  if (existingIdMap[key]) return existingIdMap[key]

  const createData = {
    generate_name: imgSpec.generate_name,
    llm_type: llmType,
    image_name: imgSpec.image_name,
    image_label: imgSpec.image_label,
  }
  const imgRes = await imagesManager.create({ data: createData })
  const imageId = imgRes?.data?.id || ''
  if (imageId) {
    existingIdMap[key] = imageId
  }
  return imageId
}

async function findOrCreateCommunityImage (record, imagesManager, existingIdMap) {
  const key = buildImageLookupKey(record.llm_type, record.image_name, record.image_label)
  if (existingIdMap[key]) return existingIdMap[key]

  const createData = {
    generate_name: buildImportGenerateName(record),
    llm_type: record.llm_type,
    image_name: record.image_name,
    image_label: record.image_label,
  }
  if (record.desktop && typeof record.desktop === 'object') {
    createData.desktop_config = record.desktop
  }
  if (record.app_name) {
    createData.app_name = record.app_name
  }
  const imgRes = await imagesManager.create({ data: createData })
  const imageId = imgRes?.data?.id || ''
  if (imageId) {
    existingIdMap[key] = imageId
  }
  return imageId
}

/**
 * 按 yaml bundle 定义创建 9 个 dify 镜像及含 llm_spec.dify 的 SKU。
 * @returns {{ imageIds: Record<string, string>, skuCreated: boolean, skuError: Error|null }}
 */
export async function createDifyBundleAndSku (record, { imagesManager, skusManager, devices } = {}) {
  const llmType = record.llm_type
  const existingIdMap = await buildExistingImageIdMap(llmType, imagesManager)
  const imageIds = {}

  for (const imgSpec of record.images || []) {
    const imageId = await findOrCreateBundleImage(imgSpec, llmType, imagesManager, existingIdMap)
    if (!imageId) {
      throw new Error(`failed to create image: ${imgSpec.image}`)
    }
    imageIds[imgSpec.role] = imageId
  }

  let skuCreated = false
  let skuError = null
  const spec = resolveSkuSpec(record)
  if (spec && skusManager) {
    const data = buildCommunitySkuCreateData(record, '', { devices })
    if (data) {
      data.llm_spec = {
        dify: { ...imageIds },
      }
      delete data.llm_image_id
      try {
        await skusManager.create({ data })
        skuCreated = true
      } catch (e) {
        skuError = e
      }
    }
  }

  return { imageIds, skuCreated, skuError }
}

/**
 * 创建 llm_image 及默认 llm_sku（若类型支持）。
 * @returns {{ imageId: string, skuCreated: boolean, skuError: Error|null, imageIds?: Record<string, string> }}
 */
export async function createCommunityImageAndSku (record, { imagesManager, skusManager, devices } = {}) {
  if (isBundleItem(record)) {
    return createDifyBundleAndSku(record, { imagesManager, skusManager, devices })
  }

  const existingIdMap = await buildExistingImageIdMap(record.llm_type, imagesManager)
  const imageId = await findOrCreateCommunityImage(record, imagesManager, existingIdMap)
  let skuCreated = false
  let skuError = null
  const spec = resolveSkuSpec(record)
  if (imageId && spec && skusManager) {
    const data = buildCommunitySkuCreateData(record, imageId, { devices })
    if (data) {
      try {
        await skusManager.create({ data })
        skuCreated = true
      } catch (e) {
        skuError = e
      }
    }
  }

  return { imageId, skuCreated, skuError }
}
