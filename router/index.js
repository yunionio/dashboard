import Layout from '@Compute/components/Layout'
import VMInstance from '@Compute/views/vminstance'
import Baremetal from '@Compute/views/baremetal'
import BaremetalCreate from '@Compute/views/baremetal/create/index'
import Image from '@Compute/views/image'
import VMInstanceCreate from '@Compute/views/vminstance/create/index'
import Network from '@Compute/views/network'
import NetworkCreate from '@Compute/views/network/Create'
import EditAttributes from '@Compute/views/network/EditAttributes'
import Host from '@Compute/views/host'
import Physicalmachine from '@Compute/views/physicalmachine'
import ServerRecovery from '@Compute/views/server-recovery'
import DiskRecovery from '@Compute/views/disk-recovery'
import ImageRecovery from '@Compute/views/image-recovery'
import InstanceGroup from '@Compute/views/instance-group'
import SKU from '@Compute/views/sku'
import Keypair from '@Compute/views/keypair'
import Disk from '@Compute/views/disk'
import GPU from '@Compute/views/gpu'
import Secgroup from '@Compute/views/secgroup'
import FlexNetwork from '@Compute/views/flex-network'

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
          ],
        },
        {
          path: '/baremetal',
          meta: {
            label: '裸金属',
            permission: 'servers_list',
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
            label: '镜像',
            permission: 'images_list',
          },
          component: Layout,
          children: [
            {
              name: 'Image',
              path: '',
              component: Image,
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
          path: '/flexnetwork',
          meta: {
            label: '弹性网卡',
            permission: 'networkcard_list',
          },
          component: Layout,
          children: [
            {
              name: 'NetworkcardList',
              path: '',
              component: FlexNetwork,
            },
          ],
        },
        {
          path: '/network',
          meta: {
            label: 'IP子网',
            permission: 'networks_list',
          },
          component: Layout,
          children: [
            {
              name: 'Network',
              path: '',
              component: Network,
            },
            {
              name: 'NetworkCreate',
              path: 'create',
              component: NetworkCreate,
            },
            {
              name: 'EditAttributes',
              path: 'edit',
              component: EditAttributes,
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
          },
          component: Layout,
          children: [
            {
              name: 'Physicalmachine',
              path: '',
              component: Physicalmachine,
            },
          ],
        },
        {
          path: '/gpu',
          meta: {
            label: '透传设备',
            permission: 'isolated_devices_list',
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
    {
      meta: {
        label: '回收站',
      },
      submenus: [
        {
          path: '/serverrecovery',
          meta: {
            label: '主机',
            permission: 'servers_list',
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
            permission: 'disks_list',
          },
          component: Layout,
          children: [
            {
              name: 'DiskRecovery',
              path: '',
              component: DiskRecovery,
            },
          ],
        },
        {
          path: '/imagerecovery',
          meta: {
            label: '镜像',
            permission: 'images_list',
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
