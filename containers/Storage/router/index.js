import FileSystemCreate from '@Storage/views/file-system/create/index'
import BucketSetStaticWebsit from '@Storage/views/bucket/components/SetStaticWebsit'
import BucketCreate from '@Storage/views/bucket/create'
import BlockStorage from '@Storage/views/blockstorage'
import Bucket from '@Storage/views/bucket'
import FileSystem from '@Storage/views/file-system'
import AccessGroup from '@Storage/views/access-group'
import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

export default {
  index: 50,
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
        label: i18n.t('dictionary.blockstorage'),
        t: 'dictionary.blockstorage',
      },
      submenus: [
        {
          path: '/blockstorage',
          meta: {
            label: i18n.t('dictionary.blockstorage'),
            permission: 'storages_list',
            t: 'dictionary.blockstorage',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.blockstorage')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware'])
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.bucket')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'aws', 'azure', 'huawei', 'qcloud', 'google', 'storage', 'hcso', 'apsara'])
            },
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
    /**
     * 文件存储
     */
    {
      meta: {
        label: i18n.t('storage.nas'),
      },
      submenus: [
        {
          path: '/nas',
          meta: {
            label: i18n.t('dictionary.filesystem'),
            permission: 'file_systems_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.nas')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'FileSystem',
              path: '',
              component: FileSystem,
            },
            {
              name: 'FileSystemCreate',
              path: 'create',
              component: FileSystemCreate,
            },
          ],
        },
        {
          path: '/access-group',
          meta: {
            label: i18n.t('dictionary.access_group'),
            permission: 'access_groups_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.access_group')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'AccessGroup',
              path: '',
              component: AccessGroup,
            },
          ],
        },
      ],
    },
  ],
}
