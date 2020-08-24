import VMInstance from '@Compute/views/vminstance'
import Baremetal from '@Compute/views/baremetal'
import BaremetalCreate from '@Compute/views/baremetal/create/index'
import Image from '@Compute/views/image'
import ImageImport from '@Compute/views/image/image-import/index'
import HostImage from '@Compute/views/host-image'
import VMInstanceCreate from '@Compute/views/vminstance/create/index'
import VMInstanceAdjustConfig from '@Compute/views/vminstance/adjustConfig'
import Network from '@Network/views/network'
import NetworkCreate from '@Network/views/network/Create'
import EditAttributes from '@Network/views/network/EditAttributes'
import Eip from '@Network/views/eip'
import Host from '@Compute/views/host'
import Physicalmachine from '@Compute/views/physicalmachine'
import PhysicalmachineAdd from '@Compute/views/physicalmachine/add'
import ServerRecovery from '@Compute/views/server-recovery'
import DiskRecovery from '@Compute/views/disk-recovery'
import ImageRecovery from '@Compute/views/image-recovery'
import InstanceGroup from '@Compute/views/instance-group'
import SKU from '@Compute/views/sku'
import Keypair from '@Compute/views/keypair'
import Disk from '@Compute/views/disk'
import GPU from '@Compute/views/gpu'
import Secgroup from '@Compute/views/secgroup'
import Servertemplate from '@Compute/views/servertemplate'
import ServertemplateCreateServer from '@Compute/views/servertemplate/CreateServer'
import DiskSnapshot from '@Compute/views/snapshot'
import InstanceSnapshot from '@Compute/views/snapshot-instance'
import SnapshotPolicy from '@Compute/views/snapshotpolicy'
// import AnsibleTemplate from '@Compute/views/ansible-template'
// import AnsibleTemplateCreate from '@Compute/views/ansible-template/create'
// import AnsiblePlaybook from '@Compute/views/ansible-playbook'
import ScalingGroup from '@Compute/views/scaling-group'
import ScalingGroupCreate from '@Compute/views/scaling-group/create'
import Layout from '@/layouts/RouterView'
import i18n from '@/locales'

import { hasSetupKey } from '@/utils/auth'

export default {
  index: 2,
  meta: {
    label: '主机',
    icon: 'menu-compute',
  },
  menus: [
    {
      meta: {
        label: '主机',
      },
      submenus: [
        {
          path: '/vminstance',
          meta: {
            label: '虚拟机',
            permission: 'servers_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'vmware']),
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
            label: '裸金属',
            permission: 'servers_list',
            hidden: () => !hasSetupKey(['baremetal']),
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
            label: '主机组',
            permission: 'instancegroups_list',
            t: 'dictionary.instancegroup',
            hidden: () => !hasSetupKey(['onestack']),
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
            label: '主机模板',
            permission: 'servertemplates_list',
            hidden: () => !hasSetupKey(['onestack']),
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
            label: '弹性伸缩组',
            permission: 'scalinggroups_list',
            hidden: () => !hasSetupKey(['onestack', 'azure']),
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
      ],
    },
    {
      meta: {
        label: '镜像',
      },
      submenus: [
        {
          path: '/image',
          meta: {
            label: '系统镜像',
            permission: 'images_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'baremetal', 'vmware']),
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
            label: '主机镜像',
            permission: 'guestimages_list',
            hidden: () => !hasSetupKey(['onestack']),
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
        label: '存储',
      },
      submenus: [
        {
          path: '/disk',
          meta: {
            label: '硬盘',
            permission: 'disks_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'baremetal', 'vmware']),
          },
          component: Layout,
          children: [
            {
              name: 'Disk',
              path: '',
              component: Disk,
            },
          ],
        },
        {
          path: '/disk-snapshot',
          meta: {
            label: '硬盘快照',
            permission: 'snapshots_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public']),
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
            label: '主机快照',
            permission: 'instance_snapshots_list',
            hidden: () => !hasSetupKey(['onestack']),
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
            label: '自动快照策略',
            permission: 'snapshotpolicy_list',
            hidden: () => !hasSetupKey(['onestack', 'aliyun', 'qcloud']),
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
        label: '网络',
      },
      submenus: [
        {
          path: '/secgroup',
          meta: {
            label: '安全组',
            permission: 'secgroups_list',
            hidden: () => !hasSetupKey(['onestack', 'public', 'private']),
          },
          component: Layout,
          children: [
            {
              name: 'Secgroup',
              path: '',
              component: Secgroup,
            },
          ],
        },
        {
          path: '/network2',
          meta: {
            label: 'IP子网',
            permission: 'networks_list',
            hidden: () => !hasSetupKey(['onestack', 'public', 'private', 'baremetal', 'vmware']),
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
            label: '弹性公网IP',
            permission: 'eips_list',
            hidden: () => !hasSetupKey(['onestack', 'public', 'private']),
          },
          component: Layout,
          children: [
            {
              name: 'Eip2',
              path: '',
              component: Eip,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: '密钥',
      },
      submenus: [
        {
          path: '/keypair',
          meta: {
            label: '密钥',
            hidden: () => !hasSetupKey(['onestack', 'public', 'private', 'baremetal', 'vmware']),
            permission: 'keypairs_list',
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
        label: '套餐',
      },
      submenus: [
        {
          path: '/sku',
          meta: {
            label: '套餐',
            permission: 'serverskus_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'baremetal', 'vmware']),
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
        label: '基础资源',
      },
      submenus: [
        {
          path: '/host',
          meta: {
            label: '宿主机',
            permission: 'hosts_list',
            hidden: () => !hasSetupKey(['onestack', 'private', 'vmware']),
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
            label: '物理机',
            permission: 'hosts_list',
            hidden: () => !hasSetupKey(['baremetal']),
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
            label: '透传设备',
            permission: 'isolated_devices_list',
            hidden: () => !hasSetupKey(['onestack']),
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
        label: '回收站',
        permission: 'recyclebins_list',
      },
      submenus: [
        {
          path: '/serverrecovery',
          meta: {
            label: i18n.t('dictionary.serverrecovery'),
            permission: 'servers_list,server_delete',
            hidden: () => !hasSetupKey(['onestack', 'public', 'private', 'vmware']),
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
            label: '硬盘',
            permission: 'disks_list,disks_delete',
            hidden: () => !hasSetupKey(['onestack', 'public', 'private', 'vmware']),
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
            label: '镜像',
            permission: 'images_list,images_delete',
            hidden: () => !hasSetupKey(['onestack', 'public', 'private', 'vmware']),
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
