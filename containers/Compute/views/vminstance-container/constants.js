import { metricItems } from '@Compute/views/node-alert/constants'
import i18n from '@/locales'

// 容器主机监控数据
export const CONTAINER_MONITOR = [
  {
    name: 'pod_cpu',
    label: i18n.t('compute.text_523'),
    seleteItem: 'usage_rate',
    fromItem: 'pod_cpu',
    unit: '%',
    transfer: 1,
    metric: metricItems['pod_cpu.usage_rate'].key,
  },
  {
    name: 'pod_mem',
    label: i18n.t('compute.text_518'),
    seleteItem: 'usage_rate',
    fromItem: 'pod_mem',
    unit: '%',
    transfer: 1,
    metric: metricItems['pod_mem.usage_rate'].key,
  },
  {
    name: 'pod_mem',
    label: i18n.t('compute.container.monitor.pod_mem_used'),
    seleteItem: 'working_set_bytes',
    fromItem: 'pod_mem',
    unit: 'B',
    transfer: 1024,
    metric: metricItems['pod_mem.working_set_bytes'].key,
  },
]
