import Layout from '@Compute/components/Layout'
import VMInstanceList from '@Compute/views/vminstance/List'
import BaremetalList from '@Compute/views/baremetal/List'
import BaremetalCreate from '@Compute/views/baremetal/create/index'
import ImageList from '@Compute/views/image/List'
import VMInstanceCreate from '@Compute/views/vminstance/create/index'
import NetworkList from '@Compute/views/network/List'
import NetworkCreate from '@Compute/views/network/Create'
import HostList from '@Compute/views/host/List'
import RecoveryServerList from '@Compute/views/recovery/Server'

export default {
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
          },
          component: Layout,
          children: [
            {
              name: 'VMInstanceList',
              path: '',
              component: VMInstanceList,
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
          },
          component: Layout,
          children: [
            {
              name: 'BaremetalList',
              path: '',
              component: BaremetalList,
            },
            {
              name: 'BaremetalCreate',
              path: 'create',
              component: BaremetalCreate,
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
          },
          component: Layout,
          children: [
            {
              name: 'ImageList',
              path: '',
              component: ImageList,
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
          path: '/network',
          meta: {
            label: 'IP子网',
          },
          component: Layout,
          children: [
            {
              name: 'NetworkList',
              path: '',
              component: NetworkList,
            },
            {
              name: 'NetworkCreate',
              path: 'create',
              component: NetworkCreate,
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
          },
          component: Layout,
          children: [
            {
              name: 'HostList',
              path: '',
              component: HostList,
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
          path: '/recoveryserver',
          meta: {
            label: '主机',
          },
          component: Layout,
          children: [
            {
              name: 'RecoveryServerList',
              path: '',
              component: RecoveryServerList,
            },
          ],
        },
      ],
    },
  ],
}
