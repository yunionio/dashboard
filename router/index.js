import CommonalertsIndex from '@Monitor/views/commonalert'
import commonalertsCreate from '@Monitor/views/commonalert/create'
import commonalertsUpdate from '@Monitor/views/commonalert/update'
import Explorer from '@Monitor/views/explorer'
import Layout from '@/layouts/RouterView'

export default {
  meta: {
    label: '监控报警',
    t: 'dictionary.monitor_commonalert',
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
    {
      path: '/commonalerts',
      meta: {
        label: '报警策略',
        t: 'dictionary.commonalert',
        permission: 'commonalerts_list',
      },
      component: Layout,
      children: [
        {
          name: 'CommonalertsIndex',
          path: '',
          component: CommonalertsIndex,
        },
        {
          name: 'CommonalertCreate',
          path: 'create',
          component: commonalertsCreate,
        },
        {
          name: 'CommonalertUpdate',
          path: ':id/update',
          component: commonalertsUpdate,
        },
      ],
    },
  ],
}
