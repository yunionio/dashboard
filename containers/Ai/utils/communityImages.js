import { getDefaultPortMappingsForType, getDefaultSkuSpecForType } from '@Ai/views/llm-sku/constants/llmTypeConfig'
import { expandRowsToDevices } from '@Ai/utils/deviceFormUtils'

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
  const llm_type = normalizeCatalogLlmType(item)
  if (!llm_type) return null

  const image = resolveCatalogItemImage(item)
  const base = {
    id: item.id || item.name || String(index + 1),
    llm_type,
    description: item.description || '-',
    icon: getTypeIcon(llm_type),
    import_kind: item.import_kind || item.importKind || 'single',
    sku: item.sku || null,
  }

  const importKind = base.import_kind
  if (importKind === BUNDLE_IMPORT_KIND) {
    const images = item.images || item.Images
    if (!item.name || !Array.isArray(images) || images.length === 0) return null
    const parsedImages = images.map(parseBundleImage).filter(Boolean)
    if (!parsedImages.length) return null
    return {
      ...base,
      name: item.name,
      images: parsedImages,
    }
  }

  if (!image) return null
  const { image_name, image_label } = parseImageField(image)
  return {
    ...base,
    image,
    image_name,
    image_label,
    app_name: item.app_name || item.appName || '',
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
  if (devices[0] && typeof devices[0] === 'object' && devices[0] != null && 'model' in devices[0]) {
    const expanded = expandRowsToDevices(devices)
    if (expanded.length) data.devices = expanded
    return
  }
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

export const CATALOG_IMAGE_VALUE_PREFIX = 'catalog:'

export function isCatalogImageValue (value) {
  return typeof value === 'string' && value.startsWith(CATALOG_IMAGE_VALUE_PREFIX)
}

export function toCatalogImageValue (catalogItemId) {
  return `${CATALOG_IMAGE_VALUE_PREFIX}${catalogItemId || ''}`
}

export function parseCatalogImageValue (value) {
  if (!isCatalogImageValue(value)) return ''
  return value.slice(CATALOG_IMAGE_VALUE_PREFIX.length)
}

export function buildImageLookupKey (llmType, imageName, imageLabel) {
  return `${llmType}:${imageName}:${imageLabel}`
}

function normalizeCatalogLlmType (item) {
  const raw = item?.llm_type ?? item?.llmType ?? ''
  return String(raw).trim()
}

function resolveCatalogItemImage (item) {
  if (item?.image) return item.image
  const llmType = normalizeCatalogLlmType(item)
  const id = item?.id
  if (!llmType || !id) return ''
  const prefix = `${llmType}:`
  if (!id.startsWith(prefix)) return ''
  return id.slice(prefix.length)
}

/** llm_images_catalog API 返回 llm_images_catalogs 或标准 data 字段 */
function parseCatalogListResponse (res) {
  const raw = res?.data
  if (Array.isArray(raw)) return raw
  const body = raw && typeof raw === 'object' ? raw : {}
  let items = body.llm_images_catalogs ?? body.data ?? []
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items)
    } catch (e) {
      items = []
    }
  }
  if (!Array.isArray(items) && items && typeof items === 'object' && Array.isArray(items.data)) {
    items = items.data
  }
  return Array.isArray(items) ? items : []
}

const catalogListInflight = new Map()

function catalogListCacheKey (catalogManager, params) {
  const resource = catalogManager?.resource || 'llm_images_catalogs'
  return `${resource}:${JSON.stringify(params || {})}`
}

async function listCommunityCatalog (catalogManager, params = { limit: 0 }) {
  const cacheKey = catalogListCacheKey(catalogManager, params)
  const inflight = catalogListInflight.get(cacheKey)
  if (inflight) return inflight
  const promise = catalogManager.list({ params })
    .finally(() => {
      catalogListInflight.delete(cacheKey)
    })
  catalogListInflight.set(cacheKey, promise)
  return promise
}

function matchesAllowedLlmTypes (llmType, allowedTypes) {
  if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) return true
  const normalized = String(llmType || '').toLowerCase()
  return allowedTypes.some(type => String(type || '').toLowerCase() === normalized)
}

/**
 * @param {string[]} allowedTypes
 * @param {object} catalogManager - Vue $Manager instance for llm_images_catalogs
 * @returns {Promise<object[]>}
 */
export async function fetchCommunityImageItems (allowedTypes = [], catalogManager) {
  if (!catalogManager) return []
  const params = { limit: 0 }
  if (allowedTypes.length === 1 && allowedTypes[0]) {
    params.llm_type = allowedTypes[0]
  }
  const res = await listCommunityCatalog(catalogManager, params)
  let items = parseCatalogListResponse(res)
  if (!items.length && params.llm_type) {
    const fallbackRes = await listCommunityCatalog(catalogManager, { limit: 0 })
    items = parseCatalogListResponse(fallbackRes)
  }
  if (!items.length) return []
  const result = []
  items.forEach((item, index) => {
    const parsed = parseCommunityCatalogItem(item, index)
    if (parsed && matchesAllowedLlmTypes(parsed.llm_type, allowedTypes)) {
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

async function listResourcesByLlmType (manager, llmType, scope) {
  return listAllLlmImagesByType(manager, llmType, scope)
}

async function buildExistingImageIdMap (llmType, imagesManager) {
  const images = await listResourcesByLlmType(imagesManager, llmType)
  const map = { __images: images }
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

async function findOrCreateCommunityImage (record, imagesManager, existingIdMap, localImages = []) {
  const localImageMap = buildLocalImageMapByRegistryRef(localImages)
  const existingByRegistry = resolveLocalImageIdForCatalogItem(record, localImageMap)
  if (existingByRegistry) return existingByRegistry

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
  const imageId = await findOrCreateCommunityImage(record, imagesManager, existingIdMap, existingIdMap.__images)
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

/** 分页拉取 scope 内全部 llm_images（不按 llm_type 过滤，用于镜像地址匹配） */
async function listAllLlmImagesInScope (imagesManager, scope, { pageSize = 100 } = {}) {
  if (!imagesManager) return []
  const all = []
  let offset = 0
  let total = null
  try {
    for (;;) {
      const params = {
        limit: pageSize,
        offset,
        details: true,
        $t: 1,
      }
      if (scope) params.scope = scope
      const res = await imagesManager.list({ params })
      const batch = res.data?.data || []
      if (total == null) {
        total = typeof res.data?.total === 'number' ? res.data.total : batch.length
      }
      all.push(...batch)
      if (!batch.length || all.length >= total) break
      offset += batch.length
    }
    return all
  } catch (e) {
    return all
  }
}

/** 分页拉取全部 llm_images（与 LlmImageSelect / getParamsForType 参数一致） */
async function listAllLlmImagesByType (imagesManager, llmType, scope, { pageSize = 100 } = {}) {
  if (!imagesManager || !llmType) return []
  const all = []
  let offset = 0
  let total = null
  try {
    for (;;) {
      const params = {
        limit: pageSize,
        offset,
        llm_type: llmType,
        details: true,
        $t: 1,
      }
      if (scope) params.scope = scope
      const res = await imagesManager.list({ params })
      const batch = res.data?.data || []
      if (total == null) {
        total = typeof res.data?.total === 'number' ? res.data.total : batch.length
      }
      all.push(...batch)
      if (!batch.length || all.length >= total) break
      offset += batch.length
    }
    return all
  } catch (e) {
    return all
  }
}

/** 列出本地已有 llm_images（按 llm_type，分页拉全量） */
export async function listLocalLlmImages (imagesManager, llmType, scope, options) {
  return listAllLlmImagesByType(imagesManager, llmType, scope, options)
}

/** 列出 scope 内全部本地镜像（仅用于按 registry 地址判断是否已导入） */
export async function listLocalLlmImagesForRegistryMatch (imagesManager, scope, options) {
  return listAllLlmImagesInScope(imagesManager, scope, options)
}

/** 规范化镜像地址，用于本地与 catalog 条目比对 */
export function normalizeRegistryImageRef (ref) {
  if (!ref || typeof ref !== 'string') return ''
  return ref.trim().toLowerCase()
}

function buildRegistryImageRef (imageName, imageLabel) {
  if (!imageName) return ''
  return `${imageName}:${imageLabel || 'latest'}`
}

/** 收集单条记录可能的 registry 地址变体（catalog / 本地镜像通用） */
export function collectImageRegistryRefVariants (record) {
  const variants = new Set()
  const add = (raw) => {
    const ref = normalizeRegistryImageRef(raw)
    if (ref) variants.add(ref)
  }
  if (!record) return variants
  if (record.image) add(record.image)
  const imageName = record.image_name
  const imageLabel = record.image_label
  if (imageName) {
    if (imageLabel) {
      add(buildRegistryImageRef(imageName, imageLabel))
    } else if (String(imageName).includes(':')) {
      add(imageName)
    } else {
      add(buildRegistryImageRef(imageName, 'latest'))
    }
  }
  const llmType = record.llm_type || record.llmType
  if (llmType && record.id) {
    const prefix = `${llmType}:`
    const id = String(record.id)
    if (id.startsWith(prefix)) {
      add(id.slice(prefix.length))
    }
  }
  return variants
}

/** 本地 llm_image 的 registry 地址（主地址） */
export function getLocalImageRegistryRef (localImage) {
  const variants = collectImageRegistryRefVariants(localImage)
  return variants.size ? [...variants][0] : ''
}

/** catalog 条目的 registry 地址（主地址） */
export function getCatalogItemRegistryRef (catalogItem) {
  const variants = collectImageRegistryRefVariants(catalogItem)
  return variants.size ? [...variants][0] : ''
}

/**
 * 本地镜像 lookup：registry 地址 -> llm_image 记录。
 */
export function buildLocalImageMapByRegistryRef (localImages) {
  const map = {}
  ;(localImages || []).forEach(img => {
    collectImageRegistryRefVariants(img).forEach(ref => {
      if (ref && !map[ref]) map[ref] = img
    })
  })
  return map
}

/**
 * @deprecated 使用 buildLocalImageMapByRegistryRef
 */
export function buildLocalImageMapByCommunityKey (localImages) {
  return buildLocalImageMapByRegistryRef(localImages)
}

/** 社区 catalog 条目是否已在本地存在（按镜像地址匹配） */
export function isCatalogItemImportedLocally (catalogItem, localImageMapByRegistry) {
  if (!catalogItem || !localImageMapByRegistry) return false
  for (const ref of collectImageRegistryRefVariants(catalogItem)) {
    if (localImageMapByRegistry[ref]) return true
  }
  return false
}

/** 社区 catalog 条目对应的本地 llm_image id，未导入则返回空字符串 */
export function resolveLocalImageIdForCatalogItem (catalogItem, localImageMapByRegistry) {
  if (!catalogItem || !localImageMapByRegistry) return ''
  for (const ref of collectImageRegistryRefVariants(catalogItem)) {
    const local = localImageMapByRegistry[ref]
    if (local?.id) return local.id
  }
  return ''
}

/**
 * 构建镜像下拉分组：本地全部 + 社区全部（含已导入条目，不再从社区组剔除）。
 * @param {object[]} [options.registryImages] scope 内全部本地镜像，用于按地址判断已导入
 */
export function buildCatalogImageGroups (catalogItems, localImages, options = {}) {
  const registryImages = options.registryImages?.length ? options.registryImages : localImages
  const localImageMap = buildLocalImageMapByRegistryRef(registryImages)
  const communityItems = (catalogItems || []).filter(item => !isBundleItem(item) && item.image)
  return {
    localImages: localImages || [],
    communityItems,
    localImageMap,
  }
}

/**
 * @deprecated 使用 buildCatalogImageGroups；保留兼容旧逻辑（社区组过滤已导入）。
 */
export function splitCatalogAndLocalImages (catalogItems, localImages) {
  const localKeys = new Set(
    (localImages || []).map(img => buildImageLookupKey(img.llm_type, img.image_name, img.image_label)),
  )
  const onlineItems = (catalogItems || []).filter(item => {
    if (isBundleItem(item) || !item.image) return false
    return !localKeys.has(getCommunityImageKey(item))
  })
  return { localImages: localImages || [], onlineItems }
}

/** 导入模型表单：从 yaml catalog 条目推导默认字段（不创建资源；镜像由用户自行选择） */
export function getCatalogImportFormDefaults (catalogItem) {
  const spec = catalogItem ? resolveSkuSpec(catalogItem) : null
  const ports = catalogItem ? resolvePortMappings(catalogItem) : []
  return {
    cpu: spec?.cpu ?? 4,
    memory: spec?.memory ? Math.max(1, Math.round(spec.memory / 1024)) : 8,
    volume_size: spec?.volume_size_mb ? Math.max(1, Math.round(spec.volume_size_mb / 1024)) : 10,
    bandwidth: spec?.bandwidth ?? 1000,
    portMappings: ports,
  }
}

/** 提交导入时：确保 catalog 镜像已在 Region 创建，返回 llm_image id */
export async function ensureCommunityImage (record, imagesManager, scope) {
  if (!record || !imagesManager) return ''
  const registryImages = scope
    ? await listLocalLlmImagesForRegistryMatch(imagesManager, scope)
    : await listResourcesByLlmType(imagesManager, record.llm_type)
  const localImageMap = buildLocalImageMapByRegistryRef(registryImages)
  const existingId = resolveLocalImageIdForCatalogItem(record, localImageMap)
  if (existingId) return existingId
  const existingIdMap = await buildExistingImageIdMap(record.llm_type, imagesManager)
  return findOrCreateCommunityImage(record, imagesManager, existingIdMap, existingIdMap.__images)
}

/** 解析 catalog 条目 value 并 ensure 镜像（供导入表单提交） */
export async function resolveCatalogImageValue (value, catalogItemsById, imagesManager, localImageMap, scope) {
  if (!isCatalogImageValue(value)) return value
  const catalogId = parseCatalogImageValue(value)
  const record = catalogItemsById?.[catalogId]
  if (!record) {
    throw new Error(`catalog image not found: ${catalogId}`)
  }
  const localId = resolveLocalImageIdForCatalogItem(record, localImageMap)
  if (localId) return localId
  return ensureCommunityImage(record, imagesManager, scope)
}
