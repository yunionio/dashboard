import Layout from '@Compute/components/Layout'
import VMInstance from '@Compute/views/vminstance'
import Baremetal from '@Compute/views/baremetal'
import BaremetalCreate from '@Compute/views/baremetal/create/index'
import Image from '@Compute/views/image'
import VMInstanceCreate from '@Compute/views/vminstance/create/index'
import Network from '@Compute/views/network'
import NetworkCreate from '@Compute/views/network/Create'
import Host from '@Compute/views/host'
import ServerRecovery from '@Compute/views/server-recovery'

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
              name: 'Network',
              path: '',
              component: Network,
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
              name: 'Host',
              path: '',
              component: Host,
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
      ],
    },
  ],
}
