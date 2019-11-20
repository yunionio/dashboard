import Layout from '@Compute/components/Layout'
import Redis from '@DB/views/redis'
import RedisCreate from '@DB/views/redis/create'
import RDS from '@DB/views/rds'
import RDSCreate from '@DB/views/rds/create'
import RDSBackup from '@DB/views/rds/backup'

export default {
  index: 6,
  meta: {
    label: '数据库',
    icon: 'menu-db',
  },
  menus: [
    {
      meta: {
        label: 'redis',
      },
      submenus: [
        {
          path: '/redis',
          meta: {
            label: '实例列表',
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
    {
      meta: {
        label: 'RDS',
      },
      submenus: [
        {
          path: '/rds',
          meta: {
            label: '实例列表',
          },
          component: Layout,
          children: [
            {
              name: 'RDS',
              path: '',
              component: RDS,
            },
            {
              name: 'RDSCreate',
              path: 'create',
              component: RDSCreate,
            },
            {
              name: 'RDSBackup',
              path: 'backup',
              component: RDSBackup,
            },
          ],
        },
      ],
    },
  ],
}
