/**
 * SKU backend_parameters（CLI 字符串数组）与表单 key/value 行互转。
 * 序列化规则对齐 onecloud parseBackendParameterArg。
 */

function normalizeArgKey (key) {
  return String(key || '').trim().replace(/^--+/, '')
}

/** [{ key, value }] → ["--k=v", "--flag", ...] */
export function customizedArgsToBackendParameters (args) {
  if (!Array.isArray(args) || args.length === 0) return []
  const out = []
  const seen = new Set()
  args.forEach((row) => {
    if (!row) return
    const key = normalizeArgKey(row.key)
    if (!key || seen.has(key)) return
    seen.add(key)
    const value = row.value != null ? String(row.value).trim() : ''
    if (value === '') {
      out.push(`--${key}`)
    } else {
      out.push(`--${key}=${value}`)
    }
  })
  return out
}

/** CLI 字符串 → [{ key, value }] */
export function backendParametersToCustomizedArgs (items) {
  if (!Array.isArray(items) || items.length === 0) return []
  const out = []
  const indexByKey = {}
  items.forEach((raw) => {
    const s = String(raw || '').trim()
    if (!s) return
    let key = s
    let value = ''
    if (s.startsWith('--')) {
      key = s.slice(2)
    }
    const eqIdx = key.indexOf('=')
    if (eqIdx >= 0) {
      value = key.slice(eqIdx + 1)
      key = key.slice(0, eqIdx)
    } else {
      const fields = key.split(/\s+/)
      if (fields.length > 1) {
        key = fields[0]
        value = fields.slice(1).join(' ')
      }
    }
    key = normalizeArgKey(key)
    if (!key) return
    const row = { key, value }
    if (indexByKey[key] != null) {
      out[indexByKey[key]] = row
    } else {
      indexByKey[key] = out.length
      out.push(row)
    }
  })
  return out
}

/** 表单行（含 argKey/argValue 或 key/value）→ backend_parameters */
export function rowsToBackendParameters (rows, keyField = 'argKey', valueField = 'argValue') {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const args = rows.map((row) => ({
    key: row?.[keyField] != null ? String(row[keyField]).trim() : (row?.key != null ? String(row.key).trim() : ''),
    value: row?.[valueField] != null ? String(row[valueField]).trim() : (row?.value != null ? String(row.value).trim() : ''),
  })).filter((row) => row.key !== '' || row.value !== '')
  return customizedArgsToBackendParameters(args.filter((row) => row.key !== ''))
}

/** 从 form values + row keys 组装 backend_parameters */
export function formValuesToBackendParameters (rows, keyMap, valueMap) {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const args = rows.map((item) => ({
    key: keyMap?.[item.key] != null ? String(keyMap[item.key]).trim() : '',
    value: valueMap?.[item.key] != null ? String(valueMap[item.key]).trim() : '',
  })).filter((row) => row.key !== '' || row.value !== '')
  return customizedArgsToBackendParameters(args.filter((row) => row.key !== ''))
}

/**
 * 加载 SKU：优先 backend_parameters，否则从 llm_spec.*.customized_args 回填（兼容旧数据）。
 */
export function resolveSkuBackendParameters (data, llmType) {
  const type = String(llmType || data?.llm_type || '').toLowerCase()
  const fromRoot = data?.backend_parameters
  if (Array.isArray(fromRoot) && fromRoot.length > 0) {
    return backendParametersToCustomizedArgs(fromRoot)
  }
  const typeSpec = data?.llm_spec?.[type]
  if (typeSpec && Array.isArray(typeSpec.customized_args) && typeSpec.customized_args.length > 0) {
    return typeSpec.customized_args.map((row) => ({
      key: row?.key != null ? String(row.key) : '',
      value: row?.value != null ? String(row.value) : '',
    }))
  }
  return []
}

/** 目录 spec.backend_parameters 规范化（原样保留 CLI 字符串，去空） */
export function normalizeCatalogBackendParameters (spec) {
  const params = spec?.backend_parameters
  if (!Array.isArray(params) || params.length === 0) return []
  const out = []
  const seen = new Set()
  params.forEach((raw) => {
    const s = String(raw || '').trim()
    if (!s || seen.has(s)) return
    seen.add(s)
    out.push(s)
  })
  return out
}

/** 合并两组 backend_parameters（后者同 key 覆盖前者） */
export function mergeBackendParameters (base, overrides) {
  const merged = backendParametersToCustomizedArgs(base)
  const extra = backendParametersToCustomizedArgs(overrides)
  const indexByKey = {}
  merged.forEach((row, i) => {
    indexByKey[row.key] = i
  })
  extra.forEach((row) => {
    if (indexByKey[row.key] != null) {
      merged[indexByKey[row.key]] = row
    } else {
      indexByKey[row.key] = merged.length
      merged.push(row)
    }
  })
  return customizedArgsToBackendParameters(merged)
}
