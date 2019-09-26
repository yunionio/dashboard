import Layout from '@Compute/components/Layout'
import CloudaccountList from '@Cloudenv/views/cloudaccount/List'

export default {
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
          },
          component: Layout,
          children: [
            {
              name: 'CloudaccountList',
              path: '',
              component: CloudaccountList,
            },
          ],
        },
      ],
    },
  ],
}
