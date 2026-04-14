import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const BackupStorage = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/backup-storage')
const Tablestore = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/tablestore')
const AccessGroup = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/access-group')
const FileSystem = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/file-system')
const Bucket = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/bucket')
const BlockStorage = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/blockstorage')
const BucketCreate = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/bucket/create')
const BucketSetStaticWebsit = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/bucket/components/SetStaticWebsit')
const FileSystemCreate = () => import(/* webpackChunkName: "storage" */ /* webpackPrefetch: true */ '@Storage/views/file-system/create/index')

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
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware', 'nutanix', 'bingocloud', 'proxmox'])
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
        label: i18n.t('storage.object_storage'),
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
              return !hasSetupKey(['aliyun', 'aws', 'azure', 'huawei', 'qcloud', 'google', 'storage', 'hcso', 'hcs', 'apsara'])
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
     * 表格存储
     */
    {
      meta: {
        label: i18n.t('dictionary.tablestore'),
      },
      submenus: [
        {
          path: '/table-storage',
          meta: {
            label: i18n.t('dictionary.tablestore'),
            permission: 'tablestores_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.table_storage')) {
                return true
              }
              if (store.getters.isProjectMode) return true
              return !hasSetupKey(['apsara', 'aliyun'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'TableStorage',
              path: '',
              component: Tablestore,
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
              return !hasSetupKey(['aliyun', 'huawei', 'hcs', 'cephfs'])
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
              return !hasSetupKey(['aliyun', 'huawei', 'hcs', 'cephfs'])
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
    /**
     * 备份存储
     */
    {
      meta: {
        label: i18n.t('dictionary.backup_storage'),
      },
      submenus: [
        {
          path: '/backup-storage',
          meta: {
            label: i18n.t('dictionary.backup_storage'),
            permission: 'backupstorages_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.backup_storage')) {
                return true
              }
              if (store.getters.isProjectMode) return true
              return !hasSetupKey(['onestack'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'BackupStorage',
              path: '',
              component: BackupStorage,
            },
          ],
        },
      ],
    },
  ],
}
