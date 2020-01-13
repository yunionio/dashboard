import Layout from '@Compute/components/Layout'
import BlockStorage from '@Storage/views/blockstorage'
import Bucket from '@Storage/views/bucket'

export default {
  index: 4,
  meta: {
    label: '存储',
    icon: 'menu-storage',
  },
  menus: [
    {
      meta: {
        label: '块存储',
      },
      submenus: [
        {
          path: '/blockstorage',
          meta: {
            label: '块存储',
            permission: 'storages_list',
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
      ],
    },
    {
      meta: {
        label: '对象存储',
      },
      submenus: [
        {
          path: '/bucket',
          meta: {
            label: '存储桶',
            permission: 'buckets_list',
          },
          component: Layout,
          children: [
            {
              name: 'bucket',
              path: '',
              component: Bucket,
            },
          ],
        },
      ],
    },
  ],
}
