import i18n from '@/locales'

export const RESTART_POLICY_OPTS = {
  deployment: [
    { key: 'Always', label: 'Always' },
  ],
  job: [
    { key: 'Never', label: 'Never' },
    { key: 'OnFailure', label: 'OnFailure' },
  ],
  cronjob: [
    { key: 'Never', label: 'Never' },
    { key: 'OnFailure', label: 'OnFailure' },
  ],
  statefulset: [
    { key: 'Always', label: 'Always' },
  ],
}

export const SECRET_DEFAULT_TYPE = 'kubernetes.io/dockerconfigjson'

export const NODE_MONITOR_MAP = {
  aliyun: [
    {
      name: 'cpu',
      label: i18n.t('k8s.text_415'),
      seleteItem: 'cpu_used_percent',
      fromItem: 'k8s_node',
      unit: '%',
      transfer: 1,
      metric: 'k8s_node.cpu_used_percent',
    },
    {
      name: 'mem',
      label: i18n.t('k8s.text_416'),
      seleteItem: 'mem_used_percent',
      fromItem: 'k8s_node',
      unit: '%',
      transfer: 1,
      metric: 'k8s_node.mem_used_percent',
    },
  ],
}

export const POD_MONITOR_MAP = {
  aliyun: [
    {
      name: 'cpu',
      label: i18n.t('k8s.text_415'),
      seleteItem: 'cpu_used_percent',
      fromItem: 'k8s_pod',
      unit: '%',
      transfer: 1,
      metric: 'k8s_pod.cpu_used_percent',
    },
    {
      name: 'mem',
      label: i18n.t('k8s.text_416'),
      seleteItem: 'mem_used_percent',
      fromItem: 'k8s_pod',
      unit: '%',
      transfer: 1,
      metric: 'k8s_pod.mem_used_percent',
    },
  ],
}
