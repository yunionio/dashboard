import i18n from '@/locales'
import { getDocsUrl, isCE } from '@/utils/utils'
import { HYPERVISORS_MAP } from '@/constants'

export const KUBE_PROVIDER = 'onecloud'

export const NODE_ROLE_MAP = {
  controlplane: i18n.t('k8s.role_master'),
  node: i18n.t('k8s.role_node'),
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

export const K8S_HYPERVISORS_MAP = {
  kvm: HYPERVISORS_MAP.kvm,
  aliyun: HYPERVISORS_MAP.aliyun,
  aws: HYPERVISORS_MAP.aws,
}

function getDocsClusterPath (scope) {
  const docsUrl = getDocsUrl(scope)
  if (isCE()) {
    return `${docsUrl}k8s/pre_env/`
  }
  return `${docsUrl}/user/docker/cluster/k8s-cluster/#前提条件`
}

export function getClusterDocs (scope) {
  const path = getDocsClusterPath(scope)
  return {
    kvm: i18n.t('k8s.docs_cluster_onecloud', [path]),
  }
}
