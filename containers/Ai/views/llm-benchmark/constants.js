export const BENCHMARK_RUNNING_STATES = ['pending', 'queued', 'running']

export const BENCHMARK_TERMINAL_STATES = ['completed', 'stopped', 'error']

export const BENCHMARK_DEFAULTS = {
  profile: 'constant',
  request_format: '/v1/chat/completions',
  dataset_name: 'synthetic_text',
  request_rate: 1,
  warmup_requests: 2,
  total_requests: 10,
  max_duration_seconds: 600,
  max_errors: 10,
  dataset_input_tokens: 1024,
  dataset_output_tokens: 128,
  slo_avg_ttft_ms: undefined,
  slo_avg_tpot_ms: undefined,
  slo_avg_latency_ms: undefined,
}

export const BENCHMARK_PROFILE_OPTIONS = ['constant', 'peak', 'slo']

export function isBenchmarkRunning (state) {
  return BENCHMARK_RUNNING_STATES.includes(state)
}

export function isBenchmarkableDeployment (row = {}) {
  return (row.ready_replicas || 0) > 0 || (row.running_instances || 0) > 0
}
