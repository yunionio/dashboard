/**
 * 详情页按 llm_type 展示 llm_spec 的共享逻辑
 * 供 LLM 实例详情、LLM 套餐详情复用，避免重复代码
 */

import { OPENCLAW_CHANNEL_SECTIONS } from '../openclawChannelConfig'
import { OPENCLAW_PROVIDER_OPTIONS } from '../openclawProviderConfig'

const CHANNEL_KEY_TO_LABEL = {}
OPENCLAW_CHANNEL_SECTIONS.forEach(s => {
  CHANNEL_KEY_TO_LABEL[s.sectionKey] = s.sectionLabelKey
})

/** provider 短名（create 里 providerShortName）→ providerLabelKey，与渠道同样用 i18n 显示供应商名称 */
const PROVIDER_SHORT_TO_LABEL = {}
OPENCLAW_PROVIDER_OPTIONS.forEach(labelKey => {
  const parts = String(labelKey || '').split('.')
  const short = parts[parts.length - 1]
  if (short) PROVIDER_SHORT_TO_LABEL[short] = labelKey
})

/** 与 Detail/style.scss 中 .detail-item-value 间距一致，但不使用该 class：slot 外层已由 Detail 包一层 .detail-item-value，内层再套会重复 margin-left */
const INNER_DETAIL_VALUE_STYLE = { marginLeft: '140px', wordBreak: 'break-all', color: '#1a2736' }
const INNER_DETAIL_BLOCK_STYLE = { position: 'relative', minHeight: '24px' }

/** 通用 llm_spec JSON 展示（与宿主机已生效配置 code-mirror 用法一致） */
const LLM_SPEC_JSON_CM_OPTIONS = {
  tabSize: 2,
  styleActiveLine: true,
  lineNumbers: true,
  line: true,
  mode: 'application/json',
  theme: 'material',
  readOnly: true,
}

/**
 * 取供应商展示名（与沟通渠道一致：先显示 provider 名称，再在同一行显示密钥名称）
 * 提交时 providers[].name 为 providerShortName(providerKey)，如 moonshot → 映射到 aice.openclaw.provider.moonshot 再 $t
 */
function getProviderDisplayName (p, vm) {
  if (typeof p === 'string') return p
  if (!p) return '-'
  if (p.name && typeof p.name === 'string') {
    const name = p.name
    if (vm.$te(name)) return vm.$t(name)
    const labelKey = PROVIDER_SHORT_TO_LABEL[name]
    if (labelKey && vm.$te(labelKey)) return vm.$t(labelKey)
    return name
  }
  // 无 name 时尝试用 credential 或 id 占位，避免显示 export_keys 串
  if (p.credential_id) return p.credential_id
  if (p.credential && p.credential.id) return p.credential.id
  return '-'
}

/** 取渠道显示名 */
function getChannelDisplayName (item, vm) {
  const key = typeof item === 'string' ? item : (item && (item.name || item.sectionKey || item.type || item.key)) || ''
  return key ? (vm.$te(CHANNEL_KEY_TO_LABEL[key]) ? vm.$t(CHANNEL_KEY_TO_LABEL[key]) : key) : '-'
}

/** 渲染指向容器密钥详情页的链接 */
function renderCredentialLink (credId, displayText, vm, h) {
  if (!credId) return h('span', { class: 'text-secondary' }, displayText || '-')
  const name = (vm.credentialNamesMap && vm.credentialNamesMap[credId]) || displayText || credId
  return h('side-page-trigger', {
    props: {
      permission: 'credentials_get',
      name: 'ContainerSecretSidePage',
      id: String(credId),
      vm,
      options: { resource: 'credentials', apiVersion: 'v1' },
    },
  }, [name])
}

/** 从 openclaw spec 中收集所有容器密钥 id */
function collectCredentialIds (spec) {
  const ids = new Set()
  if (spec.providers && Array.isArray(spec.providers)) {
    spec.providers.forEach(p => {
      const id = p && (p.credential_id || (p.credential && p.credential.id))
      if (id) ids.add(id)
    })
  }
  if (spec.channels && Array.isArray(spec.channels)) {
    spec.channels.forEach(item => {
      const id = item && item.credential && item.credential.id
      if (id) ids.add(id)
    })
  }
  return Array.from(ids)
}

/**
 * 拉取 llm_spec.openclaw 中涉及的容器密钥名称，并写入 vm.credentialNamesMap（需在 Detail 的 data 中初始化 credentialNamesMap: {}）
 * 若 vm.skuLlmSpecOpenclaw 存在（实例详情无 AI 供应商时从套餐拉取），会一并收集其 credential id 并拉取名称
 * @param {Object} vm - 详情页 Vue 实例，需有 vm.data、vm.$set，且 data 中有 credentialNamesMap
 */
export async function fetchLlmSpecCredentialNames (vm) {
  if (!vm || !vm.data) return
  const instanceSpec = vm.data.llm_spec && vm.data.llm_spec.openclaw != null ? vm.data.llm_spec.openclaw : (vm.data.llm_spec || null)
  let ids = instanceSpec ? collectCredentialIds(instanceSpec) : []
  if (vm.skuLlmSpecOpenclaw) {
    const skuIds = collectCredentialIds(vm.skuLlmSpecOpenclaw)
    ids = [...new Set([...ids, ...skuIds])]
  }
  if (ids.length === 0) return
  const map = { ...(vm.credentialNamesMap || {}) }
  const manager = new vm.$Manager('credentials', 'v1')
  await Promise.all(ids.map(async (id) => {
    if (map[id]) return
    try {
      const { data } = await manager.get({ id })
      if (data && data.name) map[id] = data.name
    } catch (e) {
      // 忽略单条失败，保留未拉到的用 id 展示
    }
  }))
  vm.$set(vm, 'credentialNamesMap', map)
}

/**
 * 渲染 openclaw llm_spec 的可读内容
 * @param {Object} spec - llm_spec 对象，可能含 providers / channels / workspace_templates
 * @param {Object} vm - Vue 实例，用于 vm.$t
 * @param {Function} h - createElement
 */
function renderOpenclawSpec (spec, vm, h) {
  const nodes = []
  if (spec.providers && Array.isArray(spec.providers) && spec.providers.length > 0) {
    const sectionLabel = vm.$te('aice.openclaw.section.ai_providers_detail')
      ? vm.$t('aice.openclaw.section.ai_providers_detail')
      : vm.$t('aice.openclaw.section.ai_providers_env')
    const rows = spec.providers.map(p => {
      const providerName = getProviderDisplayName(p, vm)
      const credId = p && (p.credential_id || (p.credential && p.credential.id))
      const credDisplay = (vm.credentialNamesMap && credId && vm.credentialNamesMap[credId]) || (p && p.credential && p.credential.name) || credId || '-'
      return h('div', { class: 'd-flex align-items-center flex-wrap mb-1' }, [
        h('span', { class: 'text-secondary mr-1' }, providerName + '：'),
        renderCredentialLink(credId, credDisplay, vm, h),
      ])
    })
    nodes.push(h('div', { class: 'mb-2', style: INNER_DETAIL_BLOCK_STYLE }, [
      h('div', { class: 'detail-item-title text-secondary mb-1' }, sectionLabel),
      h('div', { style: INNER_DETAIL_VALUE_STYLE }, rows),
    ]))
  }
  if (spec.channels && Array.isArray(spec.channels) && spec.channels.length > 0) {
    const sectionLabel = vm.$t('aice.openclaw.section.chat_channels')
    const rows = spec.channels.map(item => {
      const channelName = getChannelDisplayName(item, vm)
      const credId = item && item.credential && item.credential.id
      const credDisplay = (vm.credentialNamesMap && credId && vm.credentialNamesMap[credId]) || (item && item.credential && item.credential.name) || credId || '-'
      return h('div', { class: 'd-flex align-items-center flex-wrap mb-1' }, [
        h('span', { class: 'text-secondary mr-1' }, channelName + '：'),
        renderCredentialLink(credId, credDisplay, vm, h),
      ])
    })
    nodes.push(h('div', { class: 'mb-2', style: INNER_DETAIL_BLOCK_STYLE }, [
      h('div', { class: 'detail-item-title text-secondary mb-1' }, sectionLabel),
      h('div', { style: INNER_DETAIL_VALUE_STYLE }, rows),
    ]))
  }
  if (spec.workspace_templates && typeof spec.workspace_templates === 'object' && Object.keys(spec.workspace_templates).length > 0) {
    const label = vm.$t('aice.openclaw.workspace_templates')
    const keys = Object.keys(spec.workspace_templates)
    nodes.push(h('div', { class: 'mb-2', style: INNER_DETAIL_BLOCK_STYLE }, [
      h('div', { class: 'detail-item-title text-secondary mb-1' }, label),
      h('div', { style: INNER_DETAIL_VALUE_STYLE }, keys.join('、')),
    ]))
  }
  if (nodes.length === 0) {
    return h('div', { class: 'text-secondary' }, '-')
  }
  return h('div', { class: 'llm-spec-openclaw' }, nodes)
}

/** Dify 镜像字段：与创建表单 / 接口返回的 dify_* 一致 */
const DIFY_SPEC_IMAGE_FIELDS = [
  { keys: ['dify_api_image_id'], labelKey: 'aice.dify_api_image' },
  { keys: ['dify_plugin_image_id'], labelKey: 'aice.dify_plugin_image' },
  { keys: ['dify_sandbox_image_id'], labelKey: 'aice.dify_sandbox_image' },
  { keys: ['dify_ssrf_image_id'], labelKey: 'aice.dify_ssr_image' },
  { keys: ['dify_weaviate_image_id'], labelKey: 'aice.dify_weaviate_image' },
  { keys: ['dify_web_image_id'], labelKey: 'aice.dify_web_image' },
  { keys: ['nginx_image_id'], labelKey: 'aice.nginx_image' },
  { keys: ['postgres_image_id'], labelKey: 'aice.postgres_image' },
  { keys: ['redis_image_id'], labelKey: 'aice.redis_image' },
]

function pickDifyField (dify, keys) {
  if (!dify || typeof dify !== 'object') return null
  for (let i = 0; i < keys.length; i++) {
    const v = dify[keys[i]]
    if (v != null && v !== '') return String(v)
  }
  return null
}

function collectDifyImageIds (dify) {
  if (!dify || typeof dify !== 'object') return []
  const ids = new Set()
  DIFY_SPEC_IMAGE_FIELDS.forEach(({ keys }) => {
    const id = pickDifyField(dify, keys)
    if (id) ids.add(id)
  })
  return Array.from(ids)
}

/**
 * 根据 llm_spec.dify 中的镜像 id 请求 llm_images，反填名称到 vm.difyImageNamesMap（需在 vm 上初始化 difyImageNamesMap: {}）
 */
export async function fetchLlmSpecDifyImages (vm) {
  if (!vm || !vm.data) return
  const type = (vm.data.llm_type || '').toLowerCase()
  if (type !== 'dify') {
    if (vm.difyImageNamesMap && Object.keys(vm.difyImageNamesMap).length > 0) {
      vm.$set(vm, 'difyImageNamesMap', {})
    }
    return
  }
  const spec = vm.data.llm_spec
  const dify = spec && (spec.dify != null ? spec.dify : spec)
  const ids = collectDifyImageIds(dify)
  if (ids.length === 0) {
    vm.$set(vm, 'difyImageNamesMap', {})
    return
  }
  const map = { ...(vm.difyImageNamesMap || {}) }
  const manager = new vm.$Manager('llm_images')
  await Promise.all(ids.map(async (id) => {
    if (map[id]) return
    try {
      const { data } = await manager.get({ id })
      if (data) {
        map[id] = data.name || data.displayname || id
      }
    } catch (e) {
      // 单条失败仍用 id 展示
    }
  }))
  vm.$set(vm, 'difyImageNamesMap', map)
}

function renderDifyImageRow (label, imageId, vm, h) {
  const display = imageId && vm.difyImageNamesMap && vm.difyImageNamesMap[imageId]
    ? vm.difyImageNamesMap[imageId]
    : imageId
  return h('div', {
    class: 'd-flex align-items-center flex-wrap mb-2',
    style: { lineHeight: '1.65' },
  }, [
    h('span', { class: 'text-secondary mr-2', style: { flex: '0 0 200px' } }, label),
    imageId
      ? h('side-page-trigger', {
        props: {
          permission: 'llm_images_get',
          name: 'LlmImageSidePage',
          id: String(imageId),
          vm,
        },
      }, [display || imageId])
      : h('span', { class: 'text-secondary' }, '-'),
  ])
}

function renderDifySpec (dify, vm, h) {
  if (!dify || typeof dify !== 'object') {
    return h('div', { class: 'text-secondary' }, '-')
  }
  const rows = DIFY_SPEC_IMAGE_FIELDS.map(({ keys, labelKey }) => {
    const label = vm.$te(labelKey) ? vm.$t(labelKey) : keys[0]
    const id = pickDifyField(dify, keys)
    return renderDifyImageRow(label, id, vm, h)
  })
  return h('div', { class: 'llm-spec-dify' }, rows)
}

/**
 * 仅渲染套餐的 AI 供应商列表（用于实例详情下「对应套餐的 LLM 规格配置」独立 section）
 * @param {Object} vm - 详情页 Vue 实例，需有 vm.skuLlmSpecOpenclaw.providers、vm.credentialNamesMap
 * @param {Function} h - createElement
 */
function renderSkuProvidersBlock (vm, h) {
  const providers = vm.skuLlmSpecOpenclaw && vm.skuLlmSpecOpenclaw.providers
  if (!providers || !Array.isArray(providers) || providers.length === 0) {
    return h('div', { class: 'text-secondary' }, '-')
  }
  const sectionLabel = vm.$te('aice.openclaw.section.ai_providers_detail')
    ? vm.$t('aice.openclaw.section.ai_providers_detail')
    : vm.$t('aice.openclaw.section.ai_providers_env')
  const rows = providers.map(p => {
    const providerName = getProviderDisplayName(p, vm)
    const credId = p && (p.credential_id || (p.credential && p.credential.id))
    const credDisplay = (vm.credentialNamesMap && credId && vm.credentialNamesMap[credId]) || (p && p.credential && p.credential.name) || credId || '-'
    return h('div', { class: 'd-flex align-items-center flex-wrap mb-1' }, [
      h('span', { class: 'text-secondary mr-1' }, providerName + '：'),
      renderCredentialLink(credId, credDisplay, vm, h),
    ])
  })
  return h('div', { class: 'llm-spec-openclaw' }, [
    h('div', { class: 'mb-2', style: INNER_DETAIL_BLOCK_STYLE }, [
      h('div', { class: 'detail-item-title text-secondary mb-1' }, sectionLabel),
      h('div', { style: INNER_DETAIL_VALUE_STYLE }, rows),
    ]),
  ])
}

/**
 * 按 llm_type 渲染 llm_spec 内容（供 Detail 的 slot 调用）
 * @param {Object} row - 详情 data，含 llm_type、llm_spec
 * @param {Object} vm - Vue 实例
 * @param {Function} h - createElement
 */
function renderLlmSpecContent (row, vm, h) {
  const spec = row.llm_spec
  if (!spec || (typeof spec === 'object' && Object.keys(spec).length === 0)) {
    return h('div', { class: 'text-secondary' }, '-')
  }
  const type = (row.llm_type || '').toLowerCase()
  if (type === 'openclaw') {
    const openclawData = spec.openclaw != null ? spec.openclaw : spec
    return renderOpenclawSpec(openclawData, vm, h)
  }
  if (type === 'dify') {
    const difyData = spec.dify != null ? spec.dify : spec
    return renderDifySpec(difyData, vm, h)
  }
  // ollama / vllm / comfyui 等：通用 JSON 展示
  try {
    const text = typeof spec === 'string' ? spec : JSON.stringify(spec, null, 2)
    return h('div', {
      class: 'mb-0 w-100',
      style: {
        maxHeight: '320px',
        overflow: 'auto',
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        backgroundColor: 'transparent',
      },
    }, [
      h('code-mirror', {
        props: {
          value: text,
          options: LLM_SPEC_JSON_CM_OPTIONS,
        },
      }),
    ])
  } catch (e) {
    return h('div', { class: 'text-secondary' }, '-')
  }
}

/**
 * 获取用于 Detail extraInfo 的 llm_spec 区块（无 llm_spec 时返回空数组）
 * @param {Object} vm - 详情页 Vue 实例，需有 vm.data、vm.$t
 * @returns {Array<{ title: string, items: Array }>}
 */
export function getLlmSpecSections (vm) {
  if (!vm || !vm.data) return []
  if (vm.data.llm_spec == null || (typeof vm.data.llm_spec === 'object' && !Array.isArray(vm.data.llm_spec) && Object.keys(vm.data.llm_spec).length === 0)) {
    return []
  }
  const title = vm.$te('aice.llm_spec_config') ? vm.$t('aice.llm_spec_config') : 'LLM规格配置'
  const sections = [
    {
      title,
      items: [
        {
          field: 'llm_spec',
          slots: {
            default: (scope, h) => renderLlmSpecContent(scope.row || vm.data, vm, h),
          },
        },
      ],
    },
  ]
  if (vm.skuLlmSpecOpenclaw && vm.skuLlmSpecOpenclaw.providers && vm.skuLlmSpecOpenclaw.providers.length > 0) {
    const skuTitle = vm.$te('aice.openclaw.sku_llm_spec_config') ? vm.$t('aice.openclaw.sku_llm_spec_config') : '对应套餐的 LLM 规格配置'
    sections.push({
      title: skuTitle,
      items: [
        {
          field: 'sku_llm_spec',
          slots: {
            default: (scope, h) => renderSkuProvidersBlock(vm, h),
          },
        },
      ],
    })
  }
  return sections
}
