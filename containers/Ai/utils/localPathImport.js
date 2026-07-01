/** vLLM / SGLang 容器内模型根目录，与后端 LLM_VLLM_MODELS_PATH / LLM_SGLANG_MODELS_PATH 一致 */
export const CONTAINER_MODELS_BASE = '/data/models/huggingface'

export function getContainerModelsMountPath (llmType) {
  if (llmType === 'vllm' || llmType === 'sglang') {
    return CONTAINER_MODELS_BASE
  }
  return CONTAINER_MODELS_BASE
}

export function getLocalPathBasename (hostPath) {
  const p = String(hostPath || '').trim().replace(/\/+$/, '')
  const idx = p.lastIndexOf('/')
  return idx >= 0 ? p.slice(idx + 1) : p
}

/**
 * 根据宿主机模型目录构造 host_paths（挂载到容器标准模型路径）。
 * @param {string} hostPath 宿主机上的模型目录绝对路径
 * @param {string} llmType vllm | sglang
 */
export function buildLocalPathHostPaths (hostPath, llmType) {
  const path = String(hostPath || '').trim()
  if (!path) return []
  const base = getContainerModelsMountPath(llmType)
  const name = getLocalPathBasename(path)
  const mountPath = name ? `${base}/${name}` : base
  return [{
    type: 'directory',
    path,
    auto_create: false,
    containers: {
      0: {
        mount_path: mountPath,
        read_only: true,
        propagation: 'rslave',
      },
    },
  }]
}

export function getLocalPathPreferredModel (hostPath) {
  return getLocalPathBasename(hostPath)
}

export function backendLabelToLlmType (backend) {
  const k = String(backend || '').toLowerCase().replace(/\s+/g, '')
  if (k === 'sglang') return 'sglang'
  return 'vllm'
}

export function normalizePreferHosts (value) {
  if (!value) return []
  const arr = Array.isArray(value) ? value : [value]
  return arr.map(v => String(v ?? '').trim()).filter(Boolean)
}

export function describeLocalPathMount (hostPath, llmType) {
  const paths = buildLocalPathHostPaths(hostPath, llmType)
  const hp = paths[0]
  if (!hp) return ''
  const mount = hp.containers?.[0]?.mount_path || ''
  return { hostPath: hp.path, mountPath: mount }
}
