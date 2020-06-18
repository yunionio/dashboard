import BlockStorage from '@Storage/views/blockstorage'
import Bucket from '@Storage/views/bucket'
import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'

export default {
  index: 5,
  meta: {
    label: '存储',
    icon: 'menu-storage',
  },
  menus: [
    /**
     * 块存储
     */
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
            hidden: () => !hasSetupKey(['onestack', 'private', 'vmware']),
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
    /**
     * 存储桶
     */
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
            hidden: () => !hasSetupKey(['aliyun', 'aws', 'azure', 'huawei', 'qcloud', 'google', 'storage']),
          },
          component: Layout,
          children: [
            {
              name: 'Bucket',
              path: '',
              component: Bucket,
            },
          ],
        },
      ],
    },
  ],
}
