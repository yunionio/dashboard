// import RDSBackup from '@DB/views/rds-backup'
import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const Redis = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/redis')
const RedisCreate = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/redis/create')
const RDS = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/rds')
const RDSCreate = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/rds/create')
const MongoDB = () => import(/* webpackChunkName: "db" */ /* webpackPrefetch: true */ '@DB/views/mongodb')

export default {
  index: 58,
  meta: {
    label: i18n.t('db.text_28'),
    icon: 'menu-db',
  },
  menus: [
    /**
     * RDS
     */
    {
      meta: {
        label: 'RDS',
      },
      submenus: [
        {
          path: '/rds',
          component: Layout,
          meta: {
            label: i18n.t('dictionary.dbinstance'),
            permission: 'rds_dbinstances_list',
            t: 'dictionary.dbinstance',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.rds')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei', 'google', 'aws', 'qcloud', 'apsara', 'azure', 'hcso', 'hcs', 'ksyun'])
            },
          },
          children: [
            {
              name: 'RDSIndex',
              path: '',
              component: RDS,
            },
            {
              name: 'RDSCreate',
              path: 'create',
              meta: {
                label: '新建实例',
              },
              component: RDSCreate,
            },
          ],
        },
        /* {
          path: '/rdsbackup',
          component: Layout,
          meta: {
            label: i18n.t('dictionary.dbinstancebackups'),
            permission: 'rds_dbinstancebackups_list',
            hidden: () => false,
          },
          children: [
            {
              name: 'RDSBackupIndex',
              path: '',
              meta: {},
              component: RDSBackup,
            },
          ],
        }, */
      ],
    },
    /**
     * redis
     */
    {
      meta: {
        label: 'Redis',
      },
      submenus: [
        {
          path: '/redis',
          meta: {
            label: i18n.t('dictionary.elasticcache'),
            permission: 'redis_elasticcaches_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.redis')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei', 'qcloud', 'aws', 'azure', 'apsara', 'hcs'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Redis',
              path: '',
              component: Redis,
            },
            {
              name: 'RedisCreate',
              path: 'create',
              component: RedisCreate,
            },
          ],
        },
      ],
    },
    /**
     * MongoDB
     */
    {
      meta: {
        label: 'MongoDB',
      },
      submenus: [
        {
          path: '/mongodb',
          meta: {
            label: i18n.t('dictionary.mongodb'),
            permission: 'mongodbs_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.mongodb')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'MongoDB',
              path: '',
              component: MongoDB,
            },
          ],
        },
      ],
    },
  ],
}
