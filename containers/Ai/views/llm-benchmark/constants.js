export const BENCHMARK_RUNNING_STATES = ['pending', 'queued', 'running']

export const BENCHMARK_TERMINAL_STATES = ['completed', 'stopped', 'error']

export const BENCHMARK_DEFAULTS = {
  profile: 'constant',
  request_format: '/v1/chat/completions',
  dataset_name: 'synthetic_text',
  request_rate: 1,
  total_requests: 100,
  max_duration_seconds: 600,
  max_errors: 10,
  dataset_input_tokens: 1024,
  dataset_output_tokens: 128,
}

export function isBenchmarkRunning (state) {
  return BENCHMARK_RUNNING_STATES.includes(state)
}

export function isBenchmarkableDeployment (row = {}) {
  return (row.ready_replicas || 0) > 0 || (row.running_instances || 0) > 0
}
