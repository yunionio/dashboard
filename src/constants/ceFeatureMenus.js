/** CE 侧 feature 菜单登记（仅 ceMenus）。EE 增量见 generalScope/constants/featureMenus.js */
export const FEATURE_MENUS = {
  onestack: {
    ceMenus: ['vminstance', 'instancegroup', 'servertemplate', 'scalinggroup', 'image', 'host_image', 'disk', 'disk-snapshot', 'instance-snapshot', 'snapshotpolicy', 'disk-backup', 'instance-backup', 'keypair', 'sku', 'host', 'gpu', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'imagerecovery', 'zone', 'vpc', 'wire', 'network', 'secgroup', 'ipset', 'eip', 'dns-zone', 'tap-service', 'blockstorage', 'backup-storage'],
  },
  pod: {
    ceMenus: ['vminstance-container', 'app-package', 'image-repos', 'container_image', 'disk', 'disk-backup', 'instance-backup', 'host', 'gpu', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'zone', 'vpc', 'wire', 'network', 'secgroup', 'eip', 'dns-zone', 'blockstorage', 'backup-storage', 'credentials-container-image', 'credentials-container-secret', 'app-desktop', 'app-desktop-sku', 'app-desktop-image'],
  },
  ai: {
    ceMenus: ['cloudregion', 'app-llm', 'app-llm-sku', 'app-llm-image', 'agent-llm-image', 'llm', 'llm-sku', 'llm-instantmodel', 'llm-image', 'llm-deployment', 'llm-benchmark', 'ai-virtual-key', 'ai-routing', 'ai-provider', 'ai-proxy-node', 'ai-proxy-usage'],
  },
  baremetal: {
    ceMenus: ['baremetal', 'image', 'disk', 'keypair', 'physicalmachine', 'gpu', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'imagerecovery', 'cloudregion', 'zone', 'wire', 'network'],
  },
  lb: {
    ceMenus: ['zone', 'vpc', 'routetable', 'wire', 'network', 'secgroup', 'eip', 'lb', 'lbacl', 'lbcert', 'cluster', 'lbagent'],
  },
  aliyun: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'snapshotpolicy', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc-network', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'nat', 'dns-zone', 'waf', 'lb', 'lbacl', 'lbcert', 'cdn', 'ssl-certificate', 'bucket', 'table-storage', 'nas', 'access-group', 'rds', 'redis', 'mongodb', 'kafka', 'elasticsearch', 'navbar-clouduser', 'navbar-nopswlogin'],
  },
  aws: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc-peerconnect', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'nat', 'dns-zone', 'waf', 'lb', 'lbcert', 'cdn', 'bucket', 'rds', 'redis', 'navbar-clouduser', 'navbar-nopswlogin'],
  },
  azure: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'waf', 'lb', 'bucket', 'rds', 'redis'],
  },
  ctyun: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'network', 'vpc', 'secgroup', 'eip'],
  },
  google: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'snapshotpolicy', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'globalvpc', 'vpc', 'network', 'secgroup', 'eip', 'lb', 'lbcert', 'bucket', 'rds'],
  },
  huawei: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc-peerconnect', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'nat', 'lb', 'lbacl', 'lbcert', 'cdn', 'ssl-certificate', 'bucket', 'nas', 'rds', 'redis'],
  },
  qcloud: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'snapshotpolicy', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc-network', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'nat', 'dns-zone', 'waf', 'lb', 'cdn', 'ssl-certificate', 'bucket', 'rds', 'redis', 'mongodb', 'kafka', 'elasticsearch'],
  },
  ucloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip'],
  },
  rockbase: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip'],
  },
  ecloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip'],
  },
  jdcloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'eip', 'secgroup', 'rds'],
  },
  cloudflare: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'lb', 'lbcert', 'health-check'],
  },
  baidu: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'bucket'],
  },
  ksyun: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'bucket', 'rds'],
  },
  qingcloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping'],
  },
  chinaunion: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping'],
  },
  volcengine: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'bucket'],
  },
  oraclecloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip'],
  },
  oceanbase: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'rds'],
  },
  vmware: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'instance-snapshot', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'wire', 'network', 'blockstorage'],
  },
  openstack: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'lb', 'lbcal', 'blockstorage'],
  },
  zstack: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'wire', 'network', 'secgroup', 'eip', 'blockstorage'],
  },
  apsara: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'ipv6-gateway', 'lb', 'lbcert', 'bucket', 'table-storage', 'rds', 'redis'],
  },
  cloudpods: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'vminstance-container', 'baremetal', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'host', 'gpu', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'wire', 'network', 'secgroup', 'eip', 'blockstorage'],
  },
  hcso: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'lb', 'lbcert', 'bucket', 'rds', 'redis'],
  },
  hcsop: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'wire', 'blockstorage'],
  },
  hcs: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'bucket', 'rds', 'redis'],
  },
  nutanix: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'blockstorage'],
  },
  bingocloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'blockstorage'],
  },
  incloudsphere: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'wire', 'network', 'secgroup', 'blockstorage'],
  },
  remotefile: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'wire', 'network', 'secgroup', 'blockstorage'],
  },
  proxmox: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'wire', 'network', 'blockstorage'],
  },
  h3c: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'blockstorage'],
  },
  zettakit: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'host', 'gpu', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'blockstorage'],
  },
  uis: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'network', 'blockstorage'],
  },
  cas: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'network', 'blockstorage'],
  },
  sangfor: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'blockstorage'],
  },
  cnware: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'host', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'wire', 'network', 'secgroup', 'blockstorage'],
  },
  s3: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'bucket'],
  },
  ceph: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'bucket'],
  },
  cephfs: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'nas'],
  },
  xsky: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'bucket'],
  },
  k8s: {
    ceMenus: ['k8s-deployment', 'k8s-statefulset', 'k8s-daemonset', 'k8s-job', 'k8s-cronjob', 'k8s-pod', 'k8s-persistentvolumeclaim', 'k8s-service', 'k8s-ingress', 'k8s-configmap', 'k8s-secret', 'k8s-cluster', 'k8s-node', 'k8s-storageclass', 'k8s-namespace', 'k8s-rbacrole', 'k8s-rbacclusterrole', 'k8s-rbacrolebinding', 'k8s-rbacclusterrolebinding', 'k8s-serviceaccount', 'k8s-kubecomponent'],
  },
  'k8s-volcano': {
    ceMenus: ['k8s-vcjob', 'k8s-vcqueue', 'k8s-vchypernode', 'k8s-priorityclass'],
  },
  monitor: {
    ceMenus: ['monitoroverview', 'monitor-dashboard', 'explorer', 'commonalerts', 'alertresource', 'alertrecord', 'monitorresourcealerts', 'notification', 'notify-topic', 'notifyconfig', 'contact', 'robot', 'scheduledtask', 'navbar-alert', 'navbar-notification'],
  },
  appstore: {
    ceMenus: ['vm-release', 'k8s-release', 'k8s-chart', 'k8s-repo'],
  },
  auth: {
    ceMenus: ['idp', 'domain', 'project', 'group', 'systemuser', 'role', 'policy', 'iam/securityalerts', 'navbar-cloudshell', 'navbar-language', 'navbar-change-password', 'credentials-aksk'],
  },
}

export default FEATURE_MENUS
