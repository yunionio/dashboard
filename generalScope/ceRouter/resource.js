// import AnsibleTemplate from '@Compute/views/ansible-template'
// import AnsibleTemplateCreate from '@Compute/views/ansible-template/create'
// import AnsiblePlaybook from '@Compute/views/ansible-playbook'

import store from '@/store'
import Layout from '@/layouts/RouterView'
import i18n from '@/locales'

import { hasSetupKey, isBaremetalProduct } from '@/utils/auth'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'
// 主机
const ScalingGroup = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/scaling-group')
const ScalingGroupCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/scaling-group/create')
const Schedtag = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Cloudenv/views/schedtag')
const Schedpolicy = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Cloudenv/views/schedpolicy')
const Dynamicschedtag = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Cloudenv/views/dynamicschedtag')
const TapService = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/tap-service')
const TapServiceCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/tap-service/create')
const HostImage = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/host-image')
const VMInstanceCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/vminstance/create/index')
const VMInstanceAdjustConfig = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/vminstance/adjustConfig')
// const Network = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/network')
// const NetworkCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/network/Create')
// const EditAttributes = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/network/EditAttributes')
// const Eip = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/eip')
// const EipCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/eip/create')
const Host = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/host')
const Physicalmachine = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/physicalmachine')
const PhysicalmachineAdd = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/physicalmachine/add')
const ServerRecovery = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/server-recovery')
const DiskRecovery = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/disk-recovery')
const ImageRecovery = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/image-recovery')
const InstanceGroup = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/instance-group')
const SKU = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/sku')
const Keypair = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/keypair')
const Disk = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/disk')
const DiskBackup = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/disk-backup')
const GPU = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/gpu')
const Secgroup = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/secgroup')
const SecgroupCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/secgroup/Create')
const Servertemplate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/servertemplate')
const ServertemplateCreateServer = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/servertemplate/CreateServer')
const DiskSnapshot = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/snapshot')
const InstanceSnapshot = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/snapshot-instance')
const SnapshotPolicy = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/snapshotpolicy')
const ImageImport = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/image/image-import/index')
const ImageImportCe = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/image/image-import-ce/index')
const InstanceBackup = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/instance-backup')
const DiskCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/disk/create/index')
const VMInstance = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/vminstance')
const Baremetal = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/baremetal')
const BaremetalCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/baremetal/create/index')
const Image = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/image')
const VMContainerInstance = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/vminstance-container')
const VMContainerInstanceCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/vminstance-container/create/index')
const VMContainerInstanceAdjustConfig = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/vminstance-container/adjustConfig')

// 容器
const K8sRbacrolebindingCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacrolebinding/create')
const K8sRbacclusterroleCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacclusterrole/create')
const K8sRbacclusterrolebinding = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacclusterrolebinding')
const K8sRbacclusterrolebindingCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacclusterrolebinding/create')
const Federatednamespace = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatednamespace')
const Federatedclusterrole = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedclusterrole')
const FederatedclusterroleCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedclusterrole/create')
const Federatedrolebinding = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedrolebinding')
const FederatedrolebindingCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedrolebinding/create')
const Federatedclusterrolebinding = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedclusterrolebinding')
const FederatedclusterrolebindingCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedclusterrolebinding/create')
const Federatedrole = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedrole')
const Kubeclusters = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cluster')
const KubeclustersCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cluster/create')
const KubeclustersImport = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cluster/import')
const Deployment = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/deployment')
const K8sDeploymentCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/deployment/create')
const Daemonset = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/daemonset')
const K8sDaemonsetCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/daemonset/create')
const K8SNode = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/nodes')
const K8sStorageclasses = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/storage-class')
const K8sStorageclassesCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/storage-class/create')
const K8sNamespace = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/namespace')
const K8sNamespaceCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/namespace/create')
const K8sRbacrole = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacrole')
const K8sRbacrolebinding = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacrolebinding')
const K8sRbacroleCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacrole/create')
const K8sRbacclusterrole = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/rbacclusterrole')
const K8sServiceAccount = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/service-account')
const K8sKubeComponent = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/kube-component')
const K8sKubeComponentCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/kube-component/create')
const K8sKubeComponentUpdate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/kube-component/update')
const Statefulset = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/statefulset')
const K8sStatefulsetCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/statefulset/create')
const Pod = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/pod')
const Job = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/job')
const K8sJobCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/job/create')
const CronJob = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cronjob')
const K8sCronJobCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/cronjob/create')
const Persistentvolumeclaim = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/persistentvolumeclaim')
const K8sPersistentvolumeclaimCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/persistentvolumeclaim/create')
const Service = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/service')
const K8sServiceCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/service/create')
const Ingress = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/ingress')
const K8sIngressCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/ingress/create')
const Configmap = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/configmap')
const K8sConfigmapCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/configmap/create')
const Secret = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/secret')
const K8sSecretCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/secret/create')
const FederatednamespaceCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatednamespace/create')
const FederatedroleCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/federatedrole/create')
const K8sRepos = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@K8S/views/repos')

// 网络
const AgentList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/agent')
const AgentForm = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/agent/form')
const Cloudregion = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudregion')
const Zone = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Cloudenv/views/zone')
const CdnList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/cdn')
const CdnCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/cdn/create')
const VpcPeerConnectCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc-peer-connect/create')
const Ipv6Gateway = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ipv6-gateway')
const DnsZone = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/dns-zone')
const DnsZoneCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/dns-zone/create')
const EipCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/eip/create')
const Wire = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/wire')
const Network = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/network')
const NetworkCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/network/Create')
const EditAttributes = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/network/EditAttributes')
const BatchEditAttributes = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/network/BatchEditAttributes')
const Eip = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/eip')
const Waf = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/waf')
const GlobalVpc = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/global-vpc')
const GlobalVpcCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/global-vpc/create')
const RouteTableList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/route-table')
const NatList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/nats')
const NatCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/nats/create/index')
const VPC = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc')
const VpcNetwork = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc-network')
const VpcPeerConnect = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc-peer-connect')
const VPCCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc/create')
const LbList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/lb')
const LBCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/lb/create/index')
const LbListenerCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/loadbalancerlistener/create')
const LbaclsList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/lbacls')
const LbcertsList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/lbcerts')
const LoadbalancerclusterList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/loadbalancercluster')
const LBClusterUpdate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/loadbalancercluster/update')
const SshProxyList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ssh-proxy')
const SshProxyCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ssh-proxy/form')
const SshAgentList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ssh-agent')
const WebApp = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/webapp')

// 存储
const BackupStorage = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/backup-storage')
const Tablestore = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/tablestore')
const AccessGroup = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/access-group')
const FileSystem = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/file-system')
const Bucket = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/bucket')
const BlockStorage = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/blockstorage')
const BucketCreate = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/bucket/create')
const BucketSetStaticWebsit = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/bucket/components/SetStaticWebsit')
const FileSystemCreate = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/file-system/create/index')

// 数据库
const Redis = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/redis')
const RedisCreate = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/redis/create')
const RDS = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/rds')
const RDSCreate = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/rds/create')
const MongoDB = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/mongodb')

// 中间件
const Kafka = () => import(/* webpackChunkName: "middleware" */ /* webpackPrefetch: true */ '@Middleware/views/kafka')
const Elasticsearch = () => import(/* webpackChunkName: "middleware" */ /* webpackPrefetch: true */ '@Middleware/views/elasticsearch')

// 多云管理
const ProjectMapping = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/projectmapping')
const Cloudgroup = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudgroup')
const Cloudaccount = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudaccount')
const CloudaccountCreate = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudaccount/create')
const CloudaccountUpdateBill = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudaccount/create/BillFileIndex')
const Proxysetting = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/proxysetting')

export default {
  index: 20,
  meta: {
    label: i18n.t('common.resource_manage'),
    icon: 'resource-manage',
  },
  menus: [
    // 主机
    {
      meta: {
        label: i18n.t('compute.text_90'),
      },
      submenus: [
        {
          path: '/vminstance',
          meta: {
            label: i18n.t('compute.text_91'),
            permission: 'servers_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.vminstance')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'VMInstance',
              path: '',
              component: VMInstance,
            },
            {
              name: 'VMInstanceCreate',
              path: 'create',
              component: VMInstanceCreate,
            },
            {
              name: 'VMInstanceAdjustConfig',
              path: 'adjust-config',
              component: VMInstanceAdjustConfig,
            },
          ],
        },
        {
          path: '/vminstance-container',
          meta: {
            label: i18n.t('compute.vminstance-container'),
            permission: 'servers_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.vminstance_container')) {
                return true
              }
              return !hasSetupKey(['pod'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'VMContainerInstance',
              path: '',
              component: VMContainerInstance,
            },
            {
              name: 'VMContainerInstanceCreate',
              path: 'create',
              component: VMContainerInstanceCreate,
            },
            {
              name: 'VMContainerInstanceAdjustConfig',
              path: 'container-adjust-config',
              component: VMContainerInstanceAdjustConfig,
            },
          ],
        },
        {
          path: '/baremetal',
          meta: {
            label: i18n.t('compute.text_92'),
            permission: 'servers_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.baremetal')) {
                return true
              }
              return !hasSetupKey(['baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Baremetal',
              path: '',
              component: Baremetal,
            },
            {
              name: 'BaremetalCreate',
              path: 'create',
              component: BaremetalCreate,
            },
          ],
        },
        {
          path: '/instancegroup',
          meta: {
            label: i18n.t('compute.text_93'),
            permission: 'instancegroups_list',
            t: 'dictionary.instancegroup',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.instancegroup')) {
                return true
              }
              return !hasSetupKey(['onestack'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'InstanceGroup',
              path: '',
              meta: {},
              component: InstanceGroup,
            },
          ],
        },
        {
          path: '/servertemplate',
          meta: {
            label: i18n.t('compute.text_94'),
            permission: 'servertemplates_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.servertemplate')) {
                return true
              }
              return !hasSetupKey(['onestack', 'azure'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Servertemplate',
              path: '',
              meta: {},
              component: Servertemplate,
            },
            {
              name: 'ServertemplateCreate',
              path: 'create',
              meta: {},
              component: VMInstanceCreate,
            },
            {
              name: 'ServertemplateCreateServer',
              path: 'create-server',
              meta: {},
              component: ServertemplateCreateServer,
            },
          ],
        },
        {
          path: '/scalinggroup',
          meta: {
            label: i18n.t('compute.text_95'),
            permission: 'scalinggroups_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.scalinggroup')) {
                return true
              }
              return !hasSetupKey(['onestack', 'azure'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'ScalingGroup',
              path: '',
              meta: {},
              component: ScalingGroup,
            },
            {
              name: 'ScalingGroupCreate',
              path: 'create',
              meta: {},
              component: ScalingGroupCreate,
            },
          ],
        },
        {
          path: '/keypair',
          meta: {
            label: i18n.t('compute.text_108'),
            permission: 'keypairs_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.keypair')) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private', 'baremetal', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Keypair',
              path: '',
              meta: {},
              component: Keypair,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('compute.text_110'),
      },
      submenus: [
        {
          path: '/host',
          meta: {
            label: i18n.t('compute.text_111'),
            permission: 'hosts_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.host')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware'])
            },
            // hidden: () => {
            //   const hasBMAgent = hasServices('bmagent')
            //   const hasHostAgent = hasServices('hostagent')
            //   if (!hasBMAgent && !hasHostAgent) {
            //     return true
            //   }
            //   return false
            // },
          },
          component: Layout,
          children: [
            {
              name: 'Host',
              path: '',
              component: Host,
            },
          ],
        },
        {
          path: '/physicalmachine',
          meta: {
            label: i18n.t('compute.text_112'),
            permission: 'hosts_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.physicalmachine')) {
                return true
              }
              return !hasSetupKey(['baremetal'])
            },
            // hidden: () => {
            //   const hasBMAgent = hasServices('bmagent')
            //   if (!hasBMAgent) {
            //     return true
            //   }
            //   return false
            // },
          },
          component: Layout,
          children: [
            {
              name: 'Physicalmachine',
              path: '',
              component: Physicalmachine,
            },
            {
              name: 'PhysicalmachineAdd',
              path: 'add',
              component: PhysicalmachineAdd,
            },
          ],
        },
        {
          path: '/gpu',
          meta: {
            label: i18n.t('compute.text_113'),
            permission: 'isolated_devices_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.gpu')) {
                return true
              }
              if (!(store.getters.isAdminMode || store.getters.isDomainMode)) {
                return true
              }
              return !hasSetupKey(['onestack'])
            },
            // hidden: () => {
            //   const hasBMAgent = hasServices('bmagent')
            //   const hasHostAgent = hasServices('hostagent')
            //   if (!hasBMAgent && !hasHostAgent) {
            //     return true
            //   }
            //   return false
            // },
          },
          component: Layout,
          children: [
            {
              name: 'GPU',
              path: '',
              component: GPU,
            },
          ],
        },
        {
          path: '/disk',
          meta: {
            label: i18n.t('compute.text_100'),
            permission: 'disks_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.disk')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public', 'baremetal', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Disk',
              path: '',
              component: Disk,
            },
            {
              name: 'DiskCreate',
              path: 'create',
              component: DiskCreate,
            },
          ],
        },
        {
          path: '/sku',
          meta: {
            label: i18n.t('compute.text_109'),
            permission: 'serverskus_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.sku')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'vmware', 'public'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Sku',
              path: '',
              meta: {},
              component: SKU,
            },
          ],
        },
        {
          path: '/image',
          meta: {
            label: i18n.t('compute.text_97'),
            permission: 'images_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.image')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public', 'baremetal', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Image',
              path: '',
              component: Image,
            },
            {
              name: 'ImageImport',
              path: 'import',
              component: ImageImport,
            },
            {
              name: 'ImageImportCe',
              path: 'market',
              component: ImageImportCe,
            },
          ],
        },
        {
          path: '/host_image',
          meta: {
            label: i18n.t('compute.text_98'),
            permission: 'guestimages_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.host_image')) {
                return true
              }
              return !hasSetupKey(['onestack'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'HostImage',
              path: '',
              component: HostImage,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('common.snapshot_backup'),
      },
      submenus: [
        {
          path: '/disk-snapshot',
          meta: {
            label: i18n.t('compute.text_101'),
            t: 'compute.text_101',
            permission: 'snapshots_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.disk_snapshot')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'DiskSnapshot',
              path: '',
              component: DiskSnapshot,
            },
          ],
        },
        {
          path: '/instance-snapshot',
          meta: {
            label: i18n.t('compute.text_102'),
            t: 'compute.text_102',
            permission: 'instance_snapshots_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.instance_snapshot')) {
                return true
              }
              return !hasSetupKey(['onestack', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'InstanceSnapshot',
              path: '',
              component: InstanceSnapshot,
            },
          ],
        },
        {
          path: '/snapshotpolicy',
          meta: {
            label: i18n.t('compute.text_103'),
            t: 'compute.text_103',
            permission: 'snapshotpolicy_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.snapshotpolicy')) {
                return true
              }
              return !hasSetupKey(['onestack', 'aliyun', 'qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'SnapshotPolicy',
              path: '',
              component: SnapshotPolicy,
            },
          ],
        },
        {
          path: '/disk-backup',
          meta: {
            label: i18n.t('compute.disk_backup'),
            permission: 'diskbackups_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.disk_backup')) {
                return true
              }
              return !hasSetupKey(['onestack'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'DiskBackup',
              path: '',
              component: DiskBackup,
            },
          ],
        },
        {
          path: '/instance-backup',
          meta: {
            label: i18n.t('compute.instance_backup'),
            permission: 'instancebackups_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.instance_backup')) {
                return true
              }
              return !hasSetupKey(['onestack'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'InstanceBackup',
              path: '',
              component: InstanceBackup,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('cloudenv.text_17'),
      },
      submenus: [
        {
          path: '/schedtag',
          meta: {
            label: i18n.t('dictionary.schedtag'),
            permission: 'schedtags_list',
            t: 'dictionary.schedtag',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.schedtag')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware', 'public', 'private', 'baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Schedtag',
              path: '',
              component: Schedtag,
            },
          ],
        },
        {
          path: '/schedpolicy',
          meta: {
            label: i18n.t('cloudenv.text_19'),
            permission: 'schedpolicies_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.schedpolicy')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware', 'public', 'private', 'baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Schedpolicy',
              path: '',
              component: Schedpolicy,
            },
          ],
        },
        {
          path: '/dynamicschedtag',
          meta: {
            label: i18n.t('cloudenv.text_20'),
            permission: 'dynamicschedtags_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.dynamicschedtag')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware', 'public', 'private', 'baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Dynamicschedtag',
              path: '',
              component: Dynamicschedtag,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('compute.text_114'),
        permission: 'recyclebins_list',
      },
      submenus: [
        {
          path: '/serverrecovery',
          meta: {
            label: i18n.t('compute.text_1038'),
            permission: 'servers_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.serverrecovery')) {
                return true
              }
              if (!store.state.common.computeV2GlobalConfig.enable_pending_delete) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private', 'vmware', 'baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'ServerRecovery',
              path: '',
              component: ServerRecovery,
            },
          ],
        },
        {
          path: '/diskrecovery',
          meta: {
            label: i18n.t('compute.text_479'),
            permission: 'disks_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.diskrecovery')) {
                return true
              }
              if (!store.state.common.computeV2GlobalConfig.enable_pending_delete) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private', 'vmware', 'baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'DiskRecovery',
              path: '',
              component: DiskRecovery,
              hidden: () => !hasSetupKey(['onestack', 'public', 'private', 'vmware']),
            },
          ],
        },
        {
          path: '/imagerecovery',
          meta: {
            label: i18n.t('compute.text_693'),
            permission: 'images_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.imagerecovery')) {
                return true
              }
              if (!store.state.common.imageGlobalConfig.enable_pending_delete) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private', 'vmware', 'baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'ImageRecovery',
              path: '',
              component: ImageRecovery,
            },
          ],
        },
      ],
    },
    // 容器
    {
      meta: {
        label: i18n.t('k8s.text_2'),
        labelAlias: i18n.t('k8s.text_3'),
      },
      submenus: [
        {
          path: '/k8s-deployment',
          meta: {
            label: i18n.t('k8s.text_4'),
            permission: 'k8s_deployments_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_deployment')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sDeploymentList',
              path: '',
              component: Deployment,
            },
            {
              name: 'K8sDeploymentCreate',
              path: 'create',
              component: K8sDeploymentCreate,
            },
          ],
        },
        {
          path: '/k8s-statefulset',
          meta: {
            label: i18n.t('k8s.text_5'),
            permission: 'k8s_statefulsets_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_statefulset')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sStatefulsetList',
              path: '',
              component: Statefulset,
            },
            {
              name: 'K8sStatefulsetCreate',
              path: 'create',
              component: K8sStatefulsetCreate,
            },
          ],
        },
        {
          path: '/k8s-daemonset',
          meta: {
            label: i18n.t('k8s.text_6'),
            permission: 'k8s_daemonsets_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_daemonset')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sDaemonsetList',
              path: '',
              component: Daemonset,
            },
            {
              name: 'K8sDaemonsetCreate',
              path: 'create',
              component: K8sDaemonsetCreate,
            },
          ],
        },
        {
          path: '/k8s-job',
          meta: {
            label: i18n.t('k8s.text_7'),
            permission: 'k8s_jobs_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_job')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sJobList',
              path: '',
              component: Job,
            },
            {
              name: 'K8sJobCreate',
              path: 'create',
              component: K8sJobCreate,
            },
          ],
        },
        {
          path: '/k8s-cronjob',
          meta: {
            label: i18n.t('k8s.text_8'),
            permission: 'k8s_cronjobs_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_cronjob')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sCronJobList',
              path: '',
              component: CronJob,
            },
            {
              name: 'K8sCronJobCreate',
              path: 'create',
              component: K8sCronJobCreate,
            },
          ],
        },
        {
          path: '/k8s-pod',
          meta: {
            label: i18n.t('k8s.text_9'),
            permission: 'k8s_pods_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_pod')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sPodList',
              path: '',
              component: Pod,
            },
          ],
        },
        {
          path: '/k8s-persistentvolumeclaim',
          meta: {
            label: i18n.t('k8s.text_10'),
            permission: 'k8s_persistentvolumeclaims_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_persistentvolumeclaim')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sPersistentvolumeclaimList',
              path: '',
              component: Persistentvolumeclaim,
            },
            {
              name: 'K8sPersistentvolumeclaimCreate',
              path: 'create',
              component: K8sPersistentvolumeclaimCreate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.repo'),
      },
      submenus: [
        {
          path: '/k8s-repos',
          meta: {
            label: i18n.t('k8s.text_158'),
            permission: 'k8s_container_registries_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_service')) {
                return true
              }
              if (!store.getters.isAdminMode) return true
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sRepos',
              path: '',
              component: K8sRepos,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.text_11'),
        labelAlias: i18n.t('k8s.text_12'),
      },
      submenus: [
        {
          path: '/k8s-service',
          meta: {
            label: i18n.t('k8s.text_13'),
            permission: 'k8s_services_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_service')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sServiceList',
              path: '',
              component: Service,
            },
            {
              name: 'K8sServiceCreate',
              path: 'create',
              component: K8sServiceCreate,
            },
          ],
        },
        {
          path: '/k8s-ingress',
          meta: {
            label: i18n.t('k8s.text_14'),
            permission: 'k8s_ingresses_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_ingress')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sIngressList',
              path: '',
              component: Ingress,
            },
            {
              name: 'K8sIngressCreate',
              path: 'create',
              component: K8sIngressCreate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.text_15'),
        labelAlias: i18n.t('k8s.text_16'),
      },
      submenus: [
        {
          path: '/k8s-configmap',
          meta: {
            label: i18n.t('k8s.text_17'),
            permission: 'k8s_configmaps_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_configmap')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sConfigmapList',
              path: '',
              component: Configmap,
            },
            {
              name: 'K8sConfigmapCreate',
              path: 'create',
              component: K8sConfigmapCreate,
            },
          ],
        },
        {
          path: '/k8s-secret',
          meta: {
            label: i18n.t('k8s.text_18'),
            permission: 'k8s_secrets_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_secret')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sSecretList',
              path: '',
              component: Secret,
            },
            {
              name: 'K8sSecretCreate',
              path: 'create',
              component: K8sSecretCreate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.text_19'),
        labelAlias: i18n.t('k8s.text_20'),
        hidden: () => store.getters.isProjectMode,
      },
      submenus: [
        {
          path: '/k8s-cluster',
          meta: {
            label: i18n.t('k8s.text_19'),
            permission: 'k8s_kubeclusters_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_cluster')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'Kubeclusters',
              path: '',
              component: Kubeclusters,
            },
            {
              name: 'KubeclustersImport',
              path: 'import',
              component: KubeclustersImport,
            },
            {
              name: 'KubeclustersCreate',
              path: 'create',
              component: KubeclustersCreate,
            },
          ],
        },
        {
          path: '/k8s-node',
          meta: {
            label: i18n.t('k8s.text_21'),
            permission: 'k8s_k8sNode_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_node')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8SNode',
              path: '',
              component: K8SNode,
            },
          ],
        },
        {
          path: '/k8s-storageclass',
          meta: {
            label: i18n.t('k8s.text_22'),
            permission: 'k8s_storageclasses_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_storageclass')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sStorageclasses',
              path: '',
              component: K8sStorageclasses,
            },
            {
              name: 'K8sStorageclassesCreate',
              path: 'create',
              component: K8sStorageclassesCreate,
            },
          ],
        },
        {
          path: '/k8s-namespace',
          meta: {
            label: i18n.t('k8s.text_23'),
            permission: 'k8s_namespace_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_namespace')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sNamespace',
              path: '',
              component: K8sNamespace,
            },
            {
              name: 'K8sNamespaceCreate',
              path: 'create',
              component: K8sNamespaceCreate,
            },
          ],
        },
        {
          path: '/k8s-rbacrole',
          meta: {
            label: i18n.t('k8s.text_24'),
            permission: 'k8s_rbacroles_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_rbacrole')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sRbacrole',
              path: '',
              component: K8sRbacrole,
            },
            {
              name: 'K8sRbacroleCreate',
              path: 'create',
              component: K8sRbacroleCreate,
            },
          ],
        },
        {
          path: '/k8s-rbacclusterrole',
          meta: {
            label: i18n.t('k8s.text_371'),
            permission: 'k8s_rbacclusterroles_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_rbacclusterrole')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sRbacclusterrole',
              path: '',
              component: K8sRbacclusterrole,
            },
            {
              name: 'K8sRbacclusterroleCreate',
              path: 'create',
              component: K8sRbacclusterroleCreate,
            },
          ],
        },
        {
          path: '/k8s-rbacrolebinding',
          meta: {
            label: i18n.t('k8s.text_25'),
            permission: 'k8s_rbacrolebindings_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_rbacrolebinding')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sRbacrolebinding',
              path: '',
              component: K8sRbacrolebinding,
            },
            {
              name: 'K8sRbacrolebindingCreate',
              path: 'create',
              component: K8sRbacrolebindingCreate,
            },
          ],
        },
        {
          path: '/k8s-rbacclusterrolebinding',
          meta: {
            label: i18n.t('k8s.text_372'),
            permission: 'k8s_rbacclusterrolebindings_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_rbacclusterrolebinding')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sRbacclusterrolebind',
              path: '',
              component: K8sRbacclusterrolebinding,
            },
            {
              name: 'K8sRbacclusterrolebindingCreate',
              path: 'create',
              component: K8sRbacclusterrolebindingCreate,
            },
          ],
        },
        {
          path: '/k8s-serviceaccount',
          meta: {
            label: i18n.t('k8s.text_26'),
            permission: 'k8s_serviceaccounts_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_serviceaccount')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sServiceAccount',
              path: '',
              component: K8sServiceAccount,
            },
          ],
        },
        {
          path: '/k8s-kubecomponent',
          meta: {
            label: i18n.t('k8s.text_27'),
            permission: 'k8s_kubeclusters_list', // 服务组件权限和 集群list 权限一致
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_kubecomponent')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sKubeComponent',
              path: '',
              component: K8sKubeComponent,
            },
            {
              name: 'K8sKubeComponentCreate',
              path: 'create',
              component: K8sKubeComponentCreate,
            },
            {
              name: 'K8sKubeComponentUpdate',
              path: 'update',
              component: K8sKubeComponentUpdate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('k8s.text_364'),
        hidden: () => store.getters.isProjectMode,
      },
      submenus: [
        {
          path: '/k8s-federatednamespace',
          meta: {
            label: i18n.t('k8s.text_365'),
            permission: 'k8s_federatednamespaces_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatednamespace')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'Federatednamespace',
              path: '',
              component: Federatednamespace,
            },
            {
              name: 'FederatednamespaceCreate',
              path: 'create',
              component: FederatednamespaceCreate,
            },
          ],
        },
        {
          path: '/k8s-federatedrole',
          meta: {
            label: i18n.t('k8s.text_370'),
            permission: 'k8s_federatedroles_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatedrole')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'federatedrole',
              path: '',
              component: Federatedrole,
            },
            {
              name: 'FederatedroleCreate',
              path: 'create',
              component: FederatedroleCreate,
            },
          ],
        },
        {
          path: '/k8s-federatedclusterrole',
          meta: {
            label: i18n.t('k8s.text_373'),
            permission: 'k8s_federatedclusterroles_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatedclusterrole')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'Federatedclusterrole',
              path: '',
              component: Federatedclusterrole,
            },
            {
              name: 'FederatedclusterroleCreate',
              path: 'create',
              component: FederatedclusterroleCreate,
            },
          ],
        },
        {
          path: '/k8s-federatedrolebinding',
          meta: {
            label: i18n.t('k8s.text_374'),
            permission: 'k8s_federatedrolebindings_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatedrolebinding')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'Federatedrolebinding',
              path: '',
              component: Federatedrolebinding,
            },
            {
              name: 'FederatedrolebindingCreate',
              path: 'create',
              component: FederatedrolebindingCreate,
            },
          ],
        },
        {
          path: '/k8s-federatedclusterrolebinding',
          meta: {
            label: i18n.t('k8s.text_375'),
            permission: 'k8s_federatedclusterrolebindings_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_federatedclusterrolebinding')) {
                return true
              }
              return !hasSetupKey('k8s')
            },
          },
          component: Layout,
          children: [
            {
              name: 'Federatedclusterrolebinding',
              path: '',
              component: Federatedclusterrolebinding,
            },
            {
              name: 'FederatedclusterrolebindingCreate',
              path: 'create',
              component: FederatedclusterrolebindingCreate,
            },
          ],
        },
      ],
    },
    // 网络
    {
      meta: {
        label: i18n.t('cloudenv.text_9'),
      },
      submenus: [
        {
          path: '/cloudregion',
          meta: {
            label: i18n.t('cloudenv.text_10'),
            permission: 'areas_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cloudregion')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'vmware', 'baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Cloudregion',
              path: '',
              component: Cloudregion,
            },
          ],
        },
        {
          path: '/zone',
          meta: {
            label: i18n.t('cloudenv.text_11'),
            permission: 'zones_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.zone')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'vmware', 'baremetal'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Zone',
              path: '',
              component: Zone,
            },
          ],
        },
      ],
    },
    /**
     * 基础网络
     */
    {
      meta: {
        label: i18n.t('network.text_711'),
      },
      submenus: [
        {
          path: '/vpc-network',
          meta: {
            permission: 'inter_vpc_networks_list',
            label: i18n.t('dictionary.vpc_network'),
            t: 'dictionary.vpc_network',
            hidden: () => {
              if (store.getters.isProjectMode || isScopedPolicyMenuHidden('sub_hidden_menus.vpc_network')) return true
              return !hasSetupKey(['aliyun', 'qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'VpcNetwork',
              path: '',
              component: VpcNetwork,
            },
          ],
        },
        {
          path: '/vpc-peerconnect',
          meta: {
            label: i18n.t('dictionary.vpc_peer_connect'),
            permission: 'vpc_peering_connections_list',
            t: 'dictionary.vpc_peer_connect',
            hidden: () => {
              if (store.getters.isProjectMode || isScopedPolicyMenuHidden('sub_hidden_menus.vpc_peerconnect')) return true
              return !hasSetupKey(['qcloud', 'huawei', 'aws', 'hcs'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'VpcPeerConnect',
              path: '',
              component: VpcPeerConnect,
            },
            {
              name: 'VpcPeerConnectCreate',
              path: 'create',
              component: VpcPeerConnectCreate,
            },
          ],
        },
        {
          path: '/globalvpc',
          meta: {
            label: i18n.t('dictionary.globalvpc'),
            permission: 'network_globalvpcs_list',
            t: 'dictionary.globalvpc',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.globalvpc')) {
                return true
              }
              return !hasSetupKey('google')
            },
          },
          component: Layout,
          children: [
            {
              name: 'GlobalVPC',
              path: '',
              component: GlobalVpc,
            },
            {
              name: 'GlobalVpcCreate',
              path: 'create',
              component: GlobalVpcCreate,
            },
          ],
        },
        {
          path: '/vpc',
          meta: {
            label: i18n.t('dictionary.vpc'),
            permission: 'vpcs_list',
            t: 'dictionary.vpc',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.vpc')) {
                return true
              }
              return isBaremetalProduct() || !hasSetupKey(['openstack', 'onestack', 'zstack', 'dstack', 'public', 'baremetal', 'apsara', 'hcso', 'hcs', 'bingocloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'VPC',
              path: '',
              component: VPC,
            },
            {
              name: 'VPCCreate',
              path: 'create',
              component: VPCCreate,
            },
          ],
        },
        {
          path: '/routetable',
          meta: {
            label: i18n.t('dictionary.route_table'),
            permission: 'route_tables_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.routetable')) {
                return true
              }
              if (store.getters.isProjectMode) return true
              return !hasSetupKey(['aliyun', 'qcloud', 'huawei', 'aws', 'hcs'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'RouteTable',
              path: '',
              component: RouteTableList,
            },
          ],
        },
        {
          path: '/wire',
          meta: {
            label: i18n.t('dictionary.wire'),
            permission: 'wires_list',
            t: 'dictionary.wire',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.wire')) {
                return true
              }
              return !hasSetupKey(['onestack', 'vmware', 'zstack', 'dstack', 'nutanix', 'baremetal'])
            },
            // hidden: () => !hasServices(['esxiagent', 'hostagent', 'bmagent']) && !hasBrands('ZStack'),
          },
          component: Layout,
          children: [
            {
              name: 'WireList',
              path: '',
              component: Wire,
            },
          ],
        },
        // {
        //   path: '/flexnetwork',
        //   meta: {
        //     label: '弹性网卡',
        //     permission: 'networkcard_list',
        //   },
        //   component: Layout,
        //   children: [
        //     {
        //       name: 'NetworkcardList',
        //       path: '',
        //       component: FlexNetwork,
        //     },
        //   ],
        // },
        {
          path: '/network',
          meta: {
            label: i18n.t('dictionary.network'),
            permission: 'networks_list',
            t: 'dictionary.network',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.network')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public', 'baremetal', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'NetworkList',
              path: '',
              component: Network,
            },
            {
              name: 'NetworkCreate',
              path: 'create',
              component: NetworkCreate,
            },
            {
              name: 'NetworkUpdate',
              path: 'edit',
              component: EditAttributes,
            },
            {
              name: 'NetworkBatchUpdate',
              path: 'batch-edit',
              component: BatchEditAttributes,
            },
          ],
        },
        // {
        //   path: '/reservedip',
        //   meta: {
        //     label: '预留IP',
        //     permission: 'reservedips_list',
        //   },
        //   component: Layout,
        //   children: [
        //     {
        //       name: 'ReservedIP',
        //       path: '',
        //       component: ReservedIpList,
        //     },
        //   ],
        // },
      ],
    },
    /**
     * 网络服务
     */
    {
      meta: {
        label: i18n.t('network.text_712'),
      },
      submenus: [
        {
          path: '/eip',
          meta: {
            label: i18n.t('dictionary.eip'),
            permission: 'eips_list',
            t: 'dictionary.eip',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.eip')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'EipList',
              path: '',
              component: Eip,
            },
            {
              name: 'EipCreate',
              path: 'create',
              component: EipCreate,
            },
          ],
        },
        {
          path: '/nat',
          meta: {
            label: i18n.t('dictionary.nat'),
            permission: 'natgateways_list',
            t: 'dictionary.nat',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.nat')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei', 'hcso', 'hcs'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Nat',
              path: '',
              component: NatList,
            },
            {
              name: 'NatCreate',
              path: 'create',
              component: NatCreate,
            },
          ],
        },
        // {
        //   path: '/dns',
        //   meta: {
        //     label: i18n.t('dictionary.dns'),
        //     permission: 'dnsrecords_list',
        //     t: 'dictionary.dns',
        //     // hidden: () => true,
        //   },
        //   component: Layout,
        //   children: [
        //     {
        //       name: 'DNS',
        //       path: '',
        //       component: DNS,
        //     },
        //   ],
        // },
        {
          path: '/dns-zone',
          meta: {
            label: i18n.t('dictionary.dns_zone'),
            permission: 'dns_zones_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.dns_zone')) {
                return true
              }
              return store.getters.isProjectMode || !hasSetupKey(['aws', 'qcloud', 'aliyun'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'DnsZone',
              path: '',
              component: DnsZone,
            },
            {
              name: 'DnsZoneCreate',
              path: 'create',
              component: DnsZoneCreate,
            },
          ],
        },
        {
          path: '/ipv6-gateway',
          meta: {
            label: i18n.t('dictionary.ipv6_gateway'),
            permission: 'ipv6_gateways_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ipv6_gateway')) {
                return true
              }
              return !hasSetupKey(['apsara', 'aliyun'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'IPv6Gateway',
              path: '',
              component: Ipv6Gateway,
            },
          ],
        },
        {
          path: '/tap-service',
          meta: {
            label: i18n.t('dictionary.tap_service'),
            permission: 'tapservices_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.tap_service')) {
                return true
              }
              return !(hasSetupKey(['onestack']) && store.getters.isAdminMode)
            },
          },
          component: Layout,
          children: [
            {
              name: 'TapService',
              path: '',
              component: TapService,
            },
            {
              name: 'TapServiceCreate',
              path: 'create',
              component: TapServiceCreate,
            },
          ],
        },
      ],
    },
    /**
     * 网络安全
     */
    {
      meta: {
        label: i18n.t('network.text_756'),
      },
      submenus: [
        {
          path: '/waf',
          meta: {
            label: i18n.t('dictionary.waf_instance'),
            permission: 'waf_instances_list',
            t: 'dictionary.waf_instance',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.waf')) return true
              if (!(store.getters.isDomainMode || store.getters.isAdminMode)) return true
              return !hasSetupKey(['aws', 'azure', 'aliyun', 'qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'WafList',
              path: '',
              component: Waf,
            },
          ],
        },
        {
          path: '/webapp',
          meta: {
            label: i18n.t('compute.webapp'),
            permission: 'webapps_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.webapp')) {
                return true
              }
              return !hasSetupKey(['azure'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'WebApp',
              path: '',
              component: WebApp,
            },
          ],
        },
        {
          path: '/secgroup',
          meta: {
            label: i18n.t('compute.text_105'),
            permission: 'secgroups_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.secgroup')) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Secgroup',
              path: '',
              component: Secgroup,
            },
            {
              name: 'SecgroupCreate',
              path: 'create',
              component: SecgroupCreate,
            },
          ],
        },
      ],
    },
    /**
     * SSH代理
     */
    {
      meta: {
        label: i18n.t('network.ssh-proxy.title'),
        hidden: () => (store.getters.isProjectMode || !hasSetupKey(['private', 'vmware', 'public'])),
      },
      submenus: [
        {
          path: '/ssh-proxy',
          meta: {
            label: i18n.t('network.ssh-proxy.endpoints'),
            permission: 'sshproxy_node_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ssh_proxy')) {
                return true
              }
              return !hasSetupKey(['private', 'vmware', 'public'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'SshProxyList',
              path: '',
              component: SshProxyList,
            },
            {
              name: 'SshProxyCreate',
              path: 'create',
              component: SshProxyCreate,
            },
          ],
        },
        {
          path: '/ssh-agent',
          meta: {
            label: i18n.t('network.ssh-proxy.proxyservice'),
            permission: 'sshproxy_service_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ssh_agent')) {
                return true
              }
              return store.getters.isDomainMode || !hasSetupKey(['private', 'vmware', 'public'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'SshAgentList',
              path: '',
              component: SshAgentList,
            },
          ],
        },
      ],
    },
    /**
     * 负载均衡
     */
    {
      meta: {
        label: i18n.t('network.text_713'),
        labelAlias: '网络负载均衡',
        // hidden: () => !hasServices('lbagent') && !hasHypervisors(['aliyun', 'qcloud', 'huawei', 'aws']),
      },
      submenus: [
        {
          path: '/lb',
          meta: {
            label: i18n.t('network.text_714'),
            permission: 'lb_loadbalancers_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.lb')) {
                return true
              }
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'apsara', 'hcso', 'hcs', 'azure', 'google'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'LBList',
              path: '',
              component: LbList,
            },
            {
              name: 'LBCreate',
              path: 'create',
              component: LBCreate,
            },
            {
              name: 'LBSDetailListenerCreate',
              path: ':id/listener-create',
              component: LbListenerCreate,
            },
            {
              name: 'LBSDetailListenerUpdate',
              path: ':id/listener-update',
              component: LbListenerCreate,
            },
          ],
        },
        {
          path: '/lbacl',
          meta: {
            label: i18n.t('network.text_715'),
            permission: 'lb_loadbalanceracls_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.lbacl')) {
                return true
              }
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'hcso', 'hcs', 'azure', 'google'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'LbaclList',
              path: '',
              component: LbaclsList,
            },
          ],
        },
        {
          path: '/lbcert',
          meta: {
            label: i18n.t('network.text_716'),
            permission: 'lb_loadbalancercertificates_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.lbcert')) {
                return true
              }
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'apsara', 'hcso', 'hcs', 'azure', 'google'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'LbcertList',
              path: '',
              component: LbcertsList,
            },
          ],
        },
      ],
    },
    /**
     * 负载均衡集群
     */
    {
      meta: {
        label: i18n.t('network.text_17'),
        labelAlias: i18n.t('network.text_18'),
      },
      submenus: [
        {
          path: '/cluster',
          meta: {
            label: i18n.t('network.text_19'),
            permission: 'lb_loadbalancerclusters_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cluster')) {
                return true
              }
              return !hasSetupKey(['lb', 'k8s'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'LoadbalancerclusterList',
              path: '',
              component: LoadbalancerclusterList,
            },
            {
              name: 'LBClusterUpdate',
              path: 'update',
              component: LBClusterUpdate,
            },
          ],
        },
        {
          path: '/lbagent',
          meta: {
            label: i18n.t('network.text_20'),
            permission: 'lb_loadbalanceragents_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.lbagent')) {
                return true
              }
              return !hasSetupKey(['lb', 'k8s'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'AgentList',
              path: '',
              component: AgentList,
            },
            {
              name: 'AgentForm',
              path: 'form',
              component: AgentForm,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('dictionary.cdn'),
      },
      submenus: [
        {
          path: '/cdn',
          meta: {
            label: i18n.t('dictionary.cdn_domain'),
            permission: 'cdn_domains_list',
            t: 'dictionary.cdn_domain',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cdn')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'CdnList',
              path: '',
              component: CdnList,
            },
            {
              name: 'CdnCreate',
              path: 'create',
              component: CdnCreate,
            },
          ],
        },
      ],
    },
    // 存储
    {
      meta: {
        label: i18n.t('dictionary.storage'),
        t: 'dictionary.storage',
      },
      submenus: [
        {
          path: '/blockstorage',
          meta: {
            label: i18n.t('dictionary.blockstorage'),
            permission: 'storages_list',
            t: 'dictionary.blockstorage',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.blockstorage')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware', 'nutanix', 'bingocloud', 'proxmox'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'BlockStorage',
              path: '',
              component: BlockStorage,
            },
          ],
        },
        {
          path: '/bucket',
          meta: {
            label: i18n.t('storage.text_18'),
            permission: 'buckets_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.bucket')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'aws', 'azure', 'huawei', 'qcloud', 'google', 'storage', 'hcso', 'hcs', 'apsara'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Bucket',
              path: '',
              component: Bucket,
            },
            {
              name: 'BucketCreate',
              path: 'create',
              component: BucketCreate,
            },
            {
              name: 'BucketSetStaticWebsit',
              path: 'setstaticwebsit',
              component: BucketSetStaticWebsit,
            },
          ],
        },
        {
          path: '/table-storage',
          meta: {
            label: i18n.t('dictionary.tablestore'),
            permission: 'tablestores_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.table_storage')) {
                return true
              }
              if (store.getters.isProjectMode) return true
              return !hasSetupKey(['apsara', 'aliyun'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'TableStorage',
              path: '',
              component: Tablestore,
            },
          ],
        },
        {
          path: '/nas',
          meta: {
            label: i18n.t('dictionary.filesystem'),
            permission: 'file_systems_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.nas')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei', 'hcs', 'cephfs'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'FileSystem',
              path: '',
              component: FileSystem,
            },
            {
              name: 'FileSystemCreate',
              path: 'create',
              component: FileSystemCreate,
            },
          ],
        },
        {
          path: '/access-group',
          meta: {
            label: i18n.t('dictionary.access_group'),
            permission: 'access_groups_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.access_group')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei', 'hcs', 'cephfs'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'AccessGroup',
              path: '',
              component: AccessGroup,
            },
          ],
        },
        {
          path: '/backup-storage',
          meta: {
            label: i18n.t('dictionary.backup_storage'),
            permission: 'backupstorages_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.backup_storage')) {
                return true
              }
              if (store.getters.isProjectMode) return true
              return !hasSetupKey(['onestack'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'BackupStorage',
              path: '',
              component: BackupStorage,
            },
          ],
        },
      ],
    },
    // 数据库
    {
      meta: {
        label: i18n.t('db.text_28'),
        t: 'db.text_28',
      },
      submenus: [
        {
          path: '/rds',
          component: Layout,
          meta: {
            label: i18n.t('dictionary.dbinstance'),
            permission: 'rds_dbinstances_list',
            t: 'dictionary.dbinstance',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.rds')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei', 'google', 'aws', 'qcloud', 'apsara', 'azure', 'hcso', 'hcs'])
            },
          },
          children: [
            {
              name: 'RDSIndex',
              path: '',
              component: RDS,
            },
            {
              name: 'RDSCreate',
              path: 'create',
              meta: {
                label: '新建实例',
              },
              component: RDSCreate,
            },
          ],
        },
        {
          path: '/redis',
          meta: {
            label: i18n.t('dictionary.elasticcache'),
            permission: 'redis_elasticcaches_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.redis')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei', 'qcloud', 'aws', 'azure', 'apsara', 'hcs'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Redis',
              path: '',
              component: Redis,
            },
            {
              name: 'RedisCreate',
              path: 'create',
              component: RedisCreate,
            },
          ],
        },
        {
          path: '/mongodb',
          meta: {
            label: i18n.t('dictionary.mongodb'),
            permission: 'mongodbs_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.mongodb')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'MongoDB',
              path: '',
              component: MongoDB,
            },
          ],
        },
      ],
    },
    /**
     * 消息队列
     */
    {
      meta: {
        label: i18n.t('dictionary.message_queue'),
        t: 'dictionary.message_queue',
      },
      submenus: [
        {
          path: '/kafka',
          meta: {
            label: i18n.t('middleware.kafka'),
            permission: 'kafkas_list',
            t: 'middleware.kafka',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.kafka')) {
                return true
              }
              return !hasSetupKey(['qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Kafka',
              path: '',
              component: Kafka,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('dictionary.data_analysis'),
        t: 'dictionary.data_analysis',
      },
      submenus: [
        {
          path: '/elasticsearch',
          meta: {
            label: i18n.t('middleware.elasticsearch'),
            permission: 'elastic_searchs_list',
            t: 'middleware.elasticsearch',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.elasticsearch')) {
                return true
              }
              return !hasSetupKey(['qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Elasticsearch',
              path: '',
              component: Elasticsearch,
            },
          ],
        },
      ],
    },
    // 多云管理
    {
      meta: {
        label: i18n.t('cloudenv.text_12'),
      },
      submenus: [
        {
          path: '/cloudaccount',
          meta: {
            label: i18n.t('cloudenv.text_12'),
            permission: 'cloudaccounts_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cloudaccount')) {
                return true
              }
              if (!hasSetupKey(['onecloud', 'public', 'private', 'storage', 'k8s'])) {
                return !hasSetupKey(['bill'])
              } else {
                return !hasSetupKey(['public', 'private', 'vmware', 'storage'])
              }
            },
          },
          component: Layout,
          children: [
            {
              name: 'Cloudaccount',
              path: '',
              component: Cloudaccount,
            },
            {
              name: 'CloudaccountCreate',
              path: 'create',
              component: CloudaccountCreate,
            },
            {
              name: 'CloudaccountUpdateBill',
              path: 'updatebill',
              component: CloudaccountUpdateBill,
            },
          ],
        },
        {
          path: '/cloudgroup',
          meta: {
            label: i18n.t('cloudenv.text_491'),
            permission: 'cloudgroup_list',
            t: 'cloudenv.text_491',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cloudgroup')) {
                return true
              }
              if (store.getters.isProjectMode) return true
              if (!hasSetupKey(['onecloud', 'public', 'private', 'storage', 'k8s'])) {
                return true
              } else {
                return !hasSetupKey(['aliyun', 'huawei', 'qcloud', 'aws', 'azure', 'google', 'hcso', 'hcs'])
              }
            },
          },
          component: Layout,
          children: [
            {
              name: 'Cloudgroup',
              path: '',
              component: Cloudgroup,
            },
          ],
        },
        {
          path: '/proxysetting',
          meta: {
            label: i18n.t('cloudenv.text_14'),
            permission: 'proxysettings_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.proxysetting')) {
                return true
              }
              if (!hasSetupKey(['onecloud', 'public', 'private', 'storage', 'k8s'])) {
                return !hasSetupKey(['bill'])
              } else {
                return !hasSetupKey(['public', 'private', 'vmware', 'storage'])
              }
            },
          },
          component: Layout,
          children: [
            {
              name: 'Proxysetting',
              path: '',
              component: Proxysetting,
            },
          ],
        },
        {
          path: '/projectmapping',
          meta: {
            label: i18n.t('cloudenv.text_580'),
            permission: 'proxysettings_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.projectmapping')) {
                return true
              }
              if (!hasSetupKey(['onecloud', 'public', 'private', 'storage', 'k8s'])) {
                return !hasSetupKey(['bill'])
              } else {
                return !hasSetupKey(['public', 'jdcloud', 'ecloud'])
              }
            },
          },
          component: Layout,
          children: [
            {
              name: 'ProjectMapping',
              path: '',
              component: ProjectMapping,
            },
          ],
        },
      ],
    },
  ],
}
