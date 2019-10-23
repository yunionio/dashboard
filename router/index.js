import Layout from '@Compute/components/Layout'
import Redis from '@DB/views/redis'
import RedisCreate from '@DB/views/redis/create'

export default {
  index: 6,
  meta: {
    label: '数据库',
    icon: 'menu-db',
  },
  menus: [
    {
      meta: {
        label: 'Redis',
      },
      submenus: [
        {
          path: '/redis',
          meta: {
            label: 'Redis',
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
  ],
}
