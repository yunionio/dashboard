// import RDSBackup from '@DB/views/rds-backup'
import Layout from '@/layouts/RouterView'
import { featureMenuHiddenCheck } from '@/utils/auth'
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
        composeGroup: 'middleware-db',
        composeGroupLabel: i18n.t('db.text_28'),
        composeOrder: 10,
      },
      submenus: [
        {
          path: '/rds',
          component: Layout,
          meta: {
            label: i18n.t('dictionary.dbinstance'),
            composeOrder: 10,
            permission: 'rds_dbinstances_list',
            t: 'dictionary.dbinstance',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.rds')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
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
      ],
    },
    /**
     * redis
     */
    {
      meta: {
        label: 'Redis',
        composeGroup: 'middleware-db',
        composeOrder: 20,
      },
      submenus: [
        {
          path: '/redis',
          meta: {
            label: i18n.t('dictionary.elasticcache'),
            composeOrder: 20,
            permission: 'redis_elasticcaches_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.redis')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
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
        composeGroup: 'middleware-db',
        composeOrder: 30,
      },
      submenus: [
        {
          path: '/mongodb',
          meta: {
            label: i18n.t('dictionary.mongodb'),
            composeOrder: 30,
            permission: 'mongodbs_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.mongodb')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
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
