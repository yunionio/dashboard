import i18n from '@/locales'

export const PARALLEL_MODES = {
  PP: 'pp',
  DP: 'dp',
}

export const PARALLEL_SHAPES = {
  SINGLE: 'single',
  MP_ONLY: 'mp_only',
  DP_ONLY: 'dp_only',
  NESTED: 'nested',
}

/**
 * Returns the parallel-mode options for the create/update select.
 * SGLang does not support DP, so the DP option is disabled and annotated.
 */
export function getParallelModeOptions (llmType) {
  const isSglang = llmType === 'sglang'
  return [
    {
      value: PARALLEL_MODES.PP,
      label: i18n.t('aice.llm_deployment.parallel_mode.pp'),
      hint: i18n.t('aice.llm_deployment.parallel_mode.pp_hint'),
    },
    {
      value: PARALLEL_MODES.DP,
      label: i18n.t('aice.llm_deployment.parallel_mode.dp'),
      hint: i18n.t('aice.llm_deployment.parallel_mode.dp_hint'),
      disabled: isSglang,
      disabledReason: isSglang ? i18n.t('aice.llm_deployment.parallel_mode.sglang_no_dp') : '',
    },
  ]
}

export function getParallelModeLabel (mode) {
  if (!mode || mode === PARALLEL_MODES.PP) {
    return i18n.t('aice.llm_deployment.parallel_mode.pp')
  }
  if (mode === PARALLEL_MODES.DP) {
    return i18n.t('aice.llm_deployment.parallel_mode.dp')
  }
  return mode
}

export function getParallelModeShortLabel (mode) {
  if (!mode || mode === PARALLEL_MODES.PP) return 'PP'
  if (mode === PARALLEL_MODES.DP) return 'DP'
  return mode.toUpperCase()
}

export function getShapeLabel (shape) {
  const key = `aice.llm_deployment.shape.${shape || 'single'}`
  return i18n.te(key) ? i18n.t(key) : shape
}

export function isDistributedShape (shape) {
  return shape === PARALLEL_SHAPES.MP_ONLY ||
    shape === PARALLEL_SHAPES.DP_ONLY ||
    shape === PARALLEL_SHAPES.NESTED
}

/**
 * Builds a short topology summary from a schedulable-check response:
 * "2 nodes × 4 GPUs · PP · TP=4 / PP=2 / DP=1"
 */
export function formatTopologySummary (check) {
  if (!check) return ''
  const nnodes = check.distributed_nnodes || 0
  const gpus = check.gpus_per_node || 0
  const tp = check.tensor_parallel_size || 0
  const pp = check.pipeline_parallel_size || 0
  const dp = check.data_parallel_size || 0
  const mode = check.parallel_mode || PARALLEL_MODES.PP

  let summary = ''
  if (nnodes > 1) {
    summary = i18n.t('aice.llm_deployment.topology.nodes_gpus', [nnodes, gpus])
  } else {
    summary = i18n.t('aice.llm_deployment.topology.single_host', [gpus || tp * pp || 0])
  }
  const layout = []
  if (tp > 0) layout.push(`TP=${tp}`)
  if (pp > 0) layout.push(`PP=${pp}`)
  if (dp > 0) layout.push(`DP=${dp}`)
  if (layout.length) {
    summary += ` · ${getParallelModeShortLabel(mode)} · ${layout.join(' / ')}`
  }
  return summary
}

/**
 * Formats the schedulable-check reason into a user-friendly sentence.
 */
export function formatTopologyReason (check) {
  if (!check) return ''
  if (check.reason) return check.reason
  if (check.schedulable) {
    return formatTopologySummary(check)
  }
  return i18n.t('aice.llm_deployment.create.schedulable_check.failed')
}
