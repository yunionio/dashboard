export const KUBE_PROVIDER = 'onecloud'

export const NODE_ROLE_MAP = {
  controlplane: '控制节点',
  node: '计算节点',
}

export const GUEST_DEFAULT_CONFIG = {
  vcpu_count: 4,
  vmem_size: 4,
  disk: 100,
}

export const _sumNumMachines = (machines, resourceType) => {
  const ret = []
  machines.forEach(item => {
    if (resourceType === 'guest') {
      const guestItem = {
        config: {
          vm: {
            vcpu_count: item.config.vcpu_count,
            vmem_size: item.config.vmem_size * 1024,
            nets: [{
              network: item.config.network,
            }],
            disk: [{
              index: 0,
              size: item.config.disk * 1024,
            }],
          },
        },
        resource_type: item.resource_type,
        role: item.role,
      }
      if (item.num === 1) {
        ret.push(guestItem)
      } else if (item.num > 1) {
        for (let i = 0; i < item.num; i++) {
          ret.push(guestItem)
        }
      }
    } else if (resourceType === 'host') {
      const hostItem = { ...item }
      delete hostItem.num
      if (item.num === 1) {
        ret.push(hostItem)
      } else if (item.num > 1) {
        item.num.forEach(() => ret.push(hostItem))
      }
    }
  })
  return ret
}

export const hyperOpts = [
  { label: 'OneCloud', value: 'kvm' },
  { label: 'VMware', value: 'esxi' },
  { label: 'OpenStack', value: 'openstack' },
]
