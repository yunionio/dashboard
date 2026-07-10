import { BENCHMARK_RUNNING_STATES, BENCHMARK_TERMINAL_STATES } from '../constants'

const STATE_CLASS_MAP = {
  completed: 'status-success',
  stopped: 'status-warning',
  error: 'status-danger',
}

export function formatBenchmarkState (vm, state) {
  const key = `aice.llm_benchmark.state.${state}`
  return vm.$te(key) ? vm.$t(key) : state
}

export function getBenchmarkSpecifyStatus (vm, state) {
  const text = formatBenchmarkState(vm, state)
  if (BENCHMARK_RUNNING_STATES.includes(state)) {
    return { class: '', text }
  }
  return {
    class: STATE_CLASS_MAP[state] || 'status-info',
    text,
  }
}

export function renderBenchmarkState (h, vm, state) {
  if (!state) return '-'
  return <status status={state} specifyStatus={getBenchmarkSpecifyStatus(vm, state)} />
}

export { BENCHMARK_RUNNING_STATES, BENCHMARK_TERMINAL_STATES }
