/**
 * LLM 套餐类型配置：类型选项 + 各类型表单字段配置（接口化）
 * 新增/修改类型只需改此配置，create.vue 渲染与提交逻辑复用
 */

// 供下拉使用的类型列表（name 为 i18n key）
export const LLM_TYPE_OPTIONS = [
  { id: 'desktop', name: 'aice.llm_type.desktop' },
  { id: 'openclaw', name: 'aice.llm_type.openclaw' },
  { id: 'hermes-agent', name: 'aice.llm_type.hermes_agent' },
  { id: 'dify', name: 'aice.llm_type.dify' },
  { id: 'ollama', name: 'aice.llm_type.ollama' },
  { id: 'vllm', name: 'aice.llm_type.vllm' },
  { id: 'comfyui', name: 'aice.llm_type.comfyui' },
  { id: 'sglang', name: 'aice.llm_type.sglang' },
]

/**
 * 按 llm_type 返回请求参数（用于 llm_images、llm_instant_models 等列表接口）
 * @param {string} llmType
 * @returns {{ llm_type: string }}
 */
export function getParamsForType (llmType) {
  return { llm_type: llmType || 'ollama' }
}

/**
 * 各 llm_type 在 SKU 模板创建时的默认端口映射，用户可在表单中删除或新增。
 */
export const LLM_TYPE_DEFAULT_PORT_MAPPINGS = {
  ollama: [{ protocol: 'tcp', container_port: 11434 }],
  vllm: [{ protocol: 'tcp', container_port: 8000 }],
  sglang: [{ protocol: 'tcp', container_port: 8000 }],
  comfyui: [{ protocol: 'tcp', container_port: 8188 }],
  dify: [{ protocol: 'tcp', container_port: 80 }],
  openclaw: [{ protocol: 'tcp', container_port: 3001 }],
  'hermes-agent': [{ protocol: 'tcp', container_port: 3001 }],
  desktop: [{ protocol: 'tcp', container_port: 3001 }],
}

/**
 * 返回某 llm_type 的默认端口映射的浅拷贝（避免共享引用被表单内部修改）。
 */
export function getDefaultPortMappingsForType (llmType) {
  const list = LLM_TYPE_DEFAULT_PORT_MAPPINGS[llmType]
  if (!Array.isArray(list)) return []
  return list.map(item => ({ ...item }))
}

/**
 * 社区镜像导入时自动创建 SKU 用的默认资源规格。
 * 字段单位与后端 LLMSkuCreateInput 一致：memory MB，volume size_mb，bandwidth Mbps。
 * dify 单镜像导入无法构造完整 dify spec；bundle 导入由 yaml sku 块提供规格。
 * 取自 onecloud-operator pkg/apis/onecloud/v1alpha1/defaults.go 的 DefaultLLMSku。
 */
export const LLM_TYPE_DEFAULT_SKU_SPEC = {
  ollama: { cpu: 4, memory: 4096, volume_size_mb: 40960, bandwidth: 1000 },
  vllm: { cpu: 8, memory: 16384, volume_size_mb: 40960, bandwidth: 1000 },
  sglang: { cpu: 8, memory: 16384, volume_size_mb: 40960, bandwidth: 1000 },
  openclaw: { cpu: 4, memory: 4096, volume_size_mb: 40960, bandwidth: 1000 },
  'hermes-agent': { cpu: 4, memory: 4096, volume_size_mb: 40960, bandwidth: 1000 },
  desktop: { cpu: 4, memory: 4096, volume_size_mb: 40960, bandwidth: 1000 },
  comfyui: { cpu: 8, memory: 16384, volume_size_mb: 40960, bandwidth: 1000 },
}

/**
 * 返回某 llm_type 的默认 SKU 资源规格；返回 null 表示该类型不支持自动建 SKU（如 dify）。
 */
export function getDefaultSkuSpecForType (llmType) {
  const spec = LLM_TYPE_DEFAULT_SKU_SPEC[llmType]
  return spec ? { ...spec } : null
}

/**
 * 单字段配置项
 * @typedef {Object} FormFieldConfig
 * @property {string} fieldKey - 表单字段名，对应提交给后端的 key
 * @property {string} label - 表单项 label 的 i18n key
 * @property {'base-select'|'input-number'|'input'} component - 控件类型
 * @property {Object} [props] - 传给控件的属性（min/max/step/resource/paramsKey/optionsKey/selectProps 等）
 * @property {Array} [rules] - 校验规则
 */

/**
 * 各类型对应的表单字段列表（仅类型相关字段，不含 project/name/llm_type 及通用字段 cpu/memory/volume_size/bandwidth）
 * ollama 为当前已有类型专属字段；其余类型先空数组，后续按产品补充
 */
export const LLM_TYPE_FORM_CONFIG = {
  ollama: [
    {
      fieldKey: 'mounted_models',
      label: 'aice.model',
      component: 'base-select',
      props: {
        resource: 'llm_instant_models',
        remote: true,
        paramsKey: 'mountedModelParams',
        placeholderKey: 'aice.model',
        selectProps: { mode: 'multiple' },
      },
      rules: [{ required: true, messageKey: 'common.tips.select', messageArgKey: 'aice.model' }],
    },
    {
      fieldKey: 'device',
      label: 'aice.devices',
      component: 'base-select',
      props: { optionsKey: 'specList', placeholderKey: 'aice.devices', selectProps: { mode: 'multiple' } },
      rules: [{ required: true, messageKey: 'common.tips.select', messageArgKey: 'aice.devices' }],
    },
  ],
  comfyui: [
    {
      fieldKey: 'device',
      label: 'aice.devices',
      component: 'base-select',
      props: { optionsKey: 'specList', placeholderKey: 'aice.devices', selectProps: { mode: 'multiple' } },
      rules: [{ required: true, messageKey: 'common.tips.select', messageArgKey: 'aice.devices' }],
    },
  ],
  dify: [],
  vllm: [
    {
      fieldKey: 'mounted_models',
      label: 'aice.model',
      component: 'base-select',
      props: {
        resource: 'llm_instant_models',
        remote: true,
        paramsKey: 'mountedModelParams',
        placeholderKey: 'aice.model',
        selectProps: { mode: 'multiple' },
      },
      rules: [{ required: true, messageKey: 'common.tips.select', messageArgKey: 'aice.model' }],
    },
    {
      fieldKey: 'preferred_model',
      label: 'aice.preferred_model',
      component: 'input',
      props: { placeholderKey: 'aice.preferred_model' },
    },
    {
      fieldKey: 'device',
      label: 'aice.devices',
      component: 'base-select',
      props: { optionsKey: 'specList', placeholderKey: 'aice.devices', selectProps: { mode: 'multiple' } },
      rules: [{ required: true, messageKey: 'common.tips.select', messageArgKey: 'aice.devices' }],
    },
  ],
  sglang: [
    {
      fieldKey: 'mounted_models',
      label: 'aice.model',
      component: 'base-select',
      props: {
        resource: 'llm_instant_models',
        remote: true,
        paramsKey: 'mountedModelParams',
        placeholderKey: 'aice.model',
        selectProps: { mode: 'multiple' },
      },
      rules: [{ required: true, messageKey: 'common.tips.select', messageArgKey: 'aice.model' }],
    },
    {
      fieldKey: 'preferred_model',
      label: 'aice.preferred_model',
      component: 'input',
      props: { placeholderKey: 'aice.preferred_model' },
    },
    {
      fieldKey: 'device',
      label: 'aice.devices',
      component: 'base-select',
      props: { optionsKey: 'specList', placeholderKey: 'aice.devices', selectProps: { mode: 'multiple' } },
      rules: [{ required: true, messageKey: 'common.tips.select', messageArgKey: 'aice.devices' }],
    },
  ],
  openclaw: [
    // OpenClaw 的 credential 已改为 providers/channels 级别分别配置（见 create/Form.vue）
  ],
  desktop: [
    {
      fieldKey: 'device',
      label: 'aice.devices',
      component: 'base-select',
      props: { optionsKey: 'specList', placeholderKey: 'aice.devices', selectProps: { mode: 'multiple' } },
    },
  ],
  'hermes-agent': [],
}
