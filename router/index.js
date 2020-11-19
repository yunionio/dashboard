import BucketSetStaticWebsit from '@Storage/views/bucket/components/SetStaticWebsit'
import BucketCreate from '@Storage/views/bucket/create'
import BlockStorage from '@Storage/views/blockstorage'
import Bucket from '@Storage/views/bucket'
import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'

export default {
  index: 5,
  meta: {
    label: i18n.t('storage.text_16'),
    icon: 'menu-storage',
  },
  menus: [
    /**
     * 块存储
     */
    {
      meta: {
        label: '块存储',
        t: 'dictionary.blockstorage',
      },
      submenus: [
        {
          path: '/blockstorage',
          meta: {
            label: '块存储',
            permission: 'storages_list',
            t: 'dictionary.blockstorage',
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
        label: i18n.t('storage.text_17'),
      },
      submenus: [
        {
          path: '/bucket',
          meta: {
            label: i18n.t('storage.text_18'),
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
            {
              name: 'BucketCreate',
              path: 'create',
              component: BucketCreate,
            },
            {
              name: 'BucketSetStaticWebsit',
              path: 'setstaticwebsit',
              component: BucketSetStaticWebsit,
            },
          ],
        },
      ],
    },
  ],
}
