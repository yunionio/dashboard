import { HYPERVISORS } from '@/constants'

const HOST_ICON_MAP = {}

HYPERVISORS.map(item => {
  HOST_ICON_MAP[item.key] = 'host'
})

export const RES_ICON_MAP = {
  ...HOST_ICON_MAP,
  servers: 'vminstance',
  hypervisor: 'host',
  reservedips: 'ip',
  instancegroups: 'instancegroup',
  loadbalancers: 'lb',
  dbinstances: 'rds',
  baremetal: 'baremetal',
  esxi: 'host',
  networkinterfaces: 'networkinterfaces',
  hosts: 'host',
}

export const STATUS_MAP = {
  vminstance: 'server',
  baremetal: 'host',
}
