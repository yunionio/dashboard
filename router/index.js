import Layout from '@Compute/components/Layout'
import Cloudaccount from '@Cloudenv/views/cloudaccount'
import CloudaccountCreate from '@Cloudenv/views/cloudaccount/create'
import CloudaccountUpdateBill from '@Cloudenv/views/cloudaccount/create/BillFileIndex'
import Cloudregion from '@Cloudenv/views/cloudregion'
import Zone from '@Cloudenv/views/zone'
import Schedtag from '@Cloudenv/views/schedtag'
import Schedpolicy from '@Cloudenv/views/schedpolicy'
import Dynamicschedtag from '@Cloudenv/views/dynamicschedtag'
import Tag from '@Cloudenv/views/tag'

export default {
  index: 7,
  meta: {
    label: '多云管理',
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
            permission: 'areas_list',
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
            permission: 'zones_list',
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
            {
              name: 'CloudaccountUpdateBill',
              path: 'updatebill',
              component: CloudaccountUpdateBill,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: '调度',
      },
      submenus: [
        {
          path: '/schedtag',
          meta: {
            label: '调度标签',
            permission: 'schedtags_list',
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
            label: '调度策略',
            permission: 'schedpolicies_list',
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
            label: '动态调度标签',
            permission: 'dynamicschedtags_list',
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
        label: '标签',
      },
      submenus: [
        {
          path: '/tag',
          meta: {
            label: '标签',
          },
          component: Layout,
          children: [
            {
              name: 'Tag',
              path: '',
              component: Tag,
            },
          ],
        },
      ],
    },
  ],
}
