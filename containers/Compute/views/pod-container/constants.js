import { metricItems } from '@Compute/views/node-alert/constants'
import i18n from '@/locales'

// 容器监控数据
export const CONTAINER_MONITOR = [
  {
    name: 'container_cpu',
    label: i18n.t('compute.text_523'),
    seleteItem: 'usage_rate',
    fromItem: 'container_cpu',
    unit: '%',
    transfer: 1,
    metric: metricItems['container_cpu.usage_rate'].key,
  },
  {
    name: 'container_mem',
    label: i18n.t('compute.text_518'),
    seleteItem: 'usage_rate',
    fromItem: 'container_mem',
    unit: '%',
    transfer: 1,
    metric: metricItems['container_mem.usage_rate'].key,
  },
  {
    name: 'container_mem',
    label: i18n.t('compute.container.monitor.pod_mem_used'),
    seleteItem: 'working_set_bytes',
    fromItem: 'container_mem',
    unit: 'B',
    transfer: 1024,
    metric: metricItems['container_mem.working_set_bytes'].key,
  },
]
