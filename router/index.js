import Explorer from '@Monitor/views/explorer'
import Layout from '@/layouts/RouterView'

export default {
  meta: {
    label: '监控报警',
  },
  submenus: [
    {
      path: '/explorer',
      meta: {
        label: 'Metrics Explorer',
      },
      component: Layout,
      children: [
        {
          name: 'Explorer',
          path: '',
          component: Explorer,
        },
      ],
    },
  ],
}
