import i18n from '@/locales'
export const KUBE_PROVIDER = 'onecloud'

export const NODE_ROLE_MAP = {
  controlplane: i18n.t('k8s.text_144'),
  node: i18n.t('k8s.text_145'),
}

export const GUEST_DEFAULT_CONFIG = {
  vcpu_count: 4,
  vmem_size: 4,
  disk: 100,
}

export const hyperOpts = [
  { label: i18n.t('brand'), value: 'kvm' },
  { label: 'VMware', value: 'esxi' },
  { label: 'OpenStack', value: 'openstack' },
]
