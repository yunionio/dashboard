import CommonalertsIndex from '@Monitor/views/commonalert'
import commonalertsCreate from '@Monitor/views/commonalert/create'
import commonalertsUpdate from '@Monitor/views/commonalert/update'
import AlertresourceIndex from '@Monitor/views/alertresource'
import Explorer from '@Monitor/views/explorer'
import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'

export default {
  meta: {
    label: i18n.t('monitor.text_1'),
    t: 'dictionary.monitor_commonalert',
    hiddenInRootMenu: true,
  },
  submenus: [
    {
      path: '/explorer',
      meta: {
        label: 'Metrics Explorer',
        t: 'dictionary.explorer',
        permission: 'unifiedmonitors_get',
        hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'vmware']),
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
        label: i18n.t('monitor.text_2'),
        t: 'dictionary.commonalert',
        permission: 'commonalerts_list',
        hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'vmware']),
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
    {
      path: '/alertresource',
      meta: {
        label: i18n.t('monitor.text_17'),
        t: 'dictionary.alertresource',
        permission: 'alertresources_list',
        hidden: () => !store.getters.isAdminMode && process.env.VUE_APP_IS_PRIVATE,
      },
      component: Layout,
      children: [
        {
          name: 'alertresourceIndex',
          path: '',
          component: AlertresourceIndex,
        },
      ],
    },
  ],
}
