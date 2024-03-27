// import AnsibleTemplate from '@Compute/views/ansible-template'
// import AnsibleTemplateCreate from '@Compute/views/ansible-template/create'
// import AnsiblePlaybook from '@Compute/views/ansible-playbook'

import store from '@/store'
import Layout from '@/layouts/RouterView'
import i18n from '@/locales'

import { hasSetupKey } from '@/utils/auth'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

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
const Network = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/network')
const NetworkCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/network/Create')
const EditAttributes = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/network/EditAttributes')
const Eip = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/eip')
const EipCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Network/views/eip/create')
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
const InstanceBackup = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/instance-backup')
const DiskCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/disk/create/index')
const VMInstance = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/vminstance')
const Baremetal = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/baremetal')
const WebApp = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/webapp')
const BaremetalCreate = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/baremetal/create/index')
const Image = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/image')

export default {
  index: 20,
  meta: {
    label: i18n.t('compute.text_90'),
    icon: 'menu-compute',
  },
  menus: [
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
      ],
    },
    {
      meta: {
        label: i18n.t('compute.text_96'),
      },
      submenus: [
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
        label: i18n.t('compute.text_99'),
      },
      submenus: [
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
      ],
    },
    {
      meta: {
        label: i18n.t('common.backup'),
      },
      submenus: [
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
        label: i18n.t('compute.text_104'),
      },
      submenus: [
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
        {
          path: '/network2',
          meta: {
            label: i18n.t('compute.text_106'),
            permission: 'networks_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.network2')) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private', 'baremetal', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Network2',
              path: '',
              component: Network,
            },
            {
              name: 'NetworkCreate2',
              path: 'create',
              component: NetworkCreate,
            },
            {
              name: 'NetworkUpdate2',
              path: 'edit',
              component: EditAttributes,
            },
          ],
        },
        {
          path: '/eip2',
          meta: {
            label: i18n.t('compute.text_107'),
            permission: 'eips_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.eip2')) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Eip2',
              path: '',
              component: Eip,
            },
            {
              name: 'EipCreate2',
              path: 'create',
              component: EipCreate,
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
    {
      meta: {
        label: i18n.t('compute.text_108'),
      },
      submenus: [
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
        label: i18n.t('compute.text_109'),
      },
      submenus: [
        {
          path: '/sku',
          meta: {
            label: i18n.t('compute.text_109'),
            permission: 'serverskus_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.sku')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'baremetal', 'vmware', 'public'])
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
      ],
    },
    // {
    //   meta: {
    //     label: '运维工具',
    //   },
    //   submenus: [
    //     {
    //       path: '/ansibletemplate',
    //       meta: {
    //         label: '模板',
    //         permission: 'ansible_devtool_templates_list',
    //       },
    //       component: Layout,
    //       children: [
    //         {
    //           name: 'AnsibleTemplate',
    //           path: '',
    //           component: AnsibleTemplate,
    //         },
    //         {
    //           name: 'AnsibleTemplateCreate',
    //           path: 'create',
    //           component: AnsibleTemplateCreate,
    //         },
    //       ],
    //     },
    //     {
    //       path: '/ansibleplaybook',
    //       meta: {
    //         label: '任务',
    //         permission: 'ansible_ansibleplaybooks_list',
    //       },
    //       component: Layout,
    //       children: [
    //         {
    //           name: 'AnsiblePlaybook',
    //           path: '',
    //           component: AnsiblePlaybook,
    //         },
    //       ],
    //     },
    //   ],
    // },
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
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware', 'public', 'private'])
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
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware', 'public', 'private'])
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
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware', 'public', 'private'])
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
            label: i18n.t('compute.text_91'),
            permission: 'servers_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.serverrecovery')) {
                return true
              }
              if (!store.state.common.computeV2GlobalConfig.enable_pending_delete) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private', 'vmware'])
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
            label: i18n.t('compute.text_100'),
            permission: 'disks_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.diskrecovery')) {
                return true
              }
              if (!store.state.common.computeV2GlobalConfig.enable_pending_delete) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private', 'vmware'])
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
            label: i18n.t('compute.text_96'),
            permission: 'images_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.imagerecovery')) {
                return true
              }
              return !hasSetupKey(['onestack', 'public', 'private', 'vmware'])
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
  ],
}
