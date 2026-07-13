import { download } from '@/utils/utils'

const ARTIFACT_CONFIG = {
  log: {
    path: 'artifacts/log',
    filename: 'guidellm.log',
    mime: 'text/plain',
    responseType: 'text',
  },
  json: {
    path: 'artifacts/json',
    filename: 'benchmarks.json',
    mime: 'application/json',
    responseType: 'blob',
  },
  csv: {
    path: 'artifacts/csv',
    filename: 'benchmarks.csv',
    mime: 'text/csv',
    responseType: 'blob',
  },
}

export async function fetchBenchmarkLog (vm, id) {
  const res = await vm.$http.get(`/v1/llm_benchmarks/${id}/artifacts/log`, {
    responseType: 'text',
  })
  return res.body || res.data || ''
}

export async function downloadBenchmarkArtifact (vm, id, type) {
  const cfg = ARTIFACT_CONFIG[type]
  if (!cfg) return
  const res = await vm.$http.get(`/v1/llm_benchmarks/${id}/${cfg.path}`, {
    responseType: cfg.responseType,
  })
  const data = res.body != null ? res.body : res.data
  if (cfg.responseType === 'text') {
    download(data, cfg.filename, cfg.mime)
    return
  }
  download(data, cfg.filename, cfg.mime)
}
