import { sizestr } from '@/utils/utils'

export const usageConfig = {
  'usage_active,vm_cpu': {
    formatter: val => `${parseInt(val)}%`,
  },
  'read_bps,vm_diskio': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'write_bps,vm_diskio': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'bps_recv,vm_netio': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'bps_sent,vm_netio': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'usage_active,cpu': {
    formatter: val => `${parseInt(val)}%`,
  },
  'used_percent,mem': {
    formatter: val => `${parseInt(val)}%`,
  },
  'bps_recv,net': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
  'bps_sent,net': {
    formatter: val => `${sizestr(val, 'B', 1024)}bps`,
  },
}
