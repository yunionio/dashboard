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
  gpu: 'gpu',
}

export const STATUS_MAP = {
  vminstance: 'server',
  baremetal: 'host',
}

export const COLORS = ['#f5222d', '#fa541c', '#faad14', '#13c2c2', '#52c41a', '#1890ff', '#2f54eb', '#a100ff', '#0099f0']
