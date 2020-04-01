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

export const hyperOpts = [
  { label: 'OneCloud', value: 'kvm' },
  { label: 'VMware', value: 'esxi' },
  { label: 'OpenStack', value: 'openstack' },
]
