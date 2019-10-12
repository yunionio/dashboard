import Layout from '@Compute/components/Layout'
import Cloudaccount from '@Cloudenv/views/cloudaccount'
import CloudaccountCreate from '@Cloudenv/views/cloudaccount/create'
import Cloudregion from '@Cloudenv/views/cloudregion'
import Zone from '@Cloudenv/views/zone'

export default {
  index: 7,
  meta: {
    label: '多云环境',
    icon: 'onecloud',
  },
  menus: [
    {
      meta: {
        label: '地域',
      },
      submenus: [
        {
          path: '/cloudregion',
          meta: {
            label: '区域',
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
            label: '可用区',
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
    {
      meta: {
        label: '云账号',
      },
      submenus: [
        {
          path: '/cloudaccount',
          meta: {
            label: '云账号',
            permission: 'cloudaccounts_list',
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
          ],
        },
      ],
    },
  ],
}
