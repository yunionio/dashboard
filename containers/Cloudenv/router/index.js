import Layout from '@Compute/components/Layout'
import Cloudaccount from '@Cloudenv/views/cloudaccount'
import CloudaccountCreate from '@Cloudenv/views/cloudaccount/create'

export default {
  index: 7,
  meta: {
    label: '多云环境',
    icon: 'onecloud',
  },
  menus: [
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
