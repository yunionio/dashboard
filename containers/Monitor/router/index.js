import Layout from '@/layouts/RouterView'
import { featureMenuHiddenCheck, hasServices } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const Overview = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/overview')
const CommonalertsIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert')
const commonalertsCreate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert/create')
const commonalertsUpdate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert/update')
const commonalertsClone = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/commonalert/clone')
// const MonitorresourcesIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/monitorresource')
const AlertresourceIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertresource')
const AlertrecordIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertrecord')
const Explorer = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/explorer')
const Dashboard = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/dashboard')
const MonitorDashboardChartCreate = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/dashboard/create')
const AlertRecordShieldsIndex = () => import(/* webpackChunkName: "monitor" */ /* webpackPrefetch: true */ '@Monitor/views/alertrecordshields')

const Notification = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/notification')
const NotifyTopic = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/notify-topic')
const Robots = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/robots')
const NotifyConfigs = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/notifyconfig')
const NotifyConfigCreate = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/notifyconfig/create')
const Contact = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/contact')

export default {
  index: 65,
  meta: {
    label: i18n.t('monitor.text_0'),
    icon: 'menu-monitor',
  },
  menus: [
    {
      path: '/monitoroverview',
      meta: {
        label: i18n.t('monitor.text_18'),
        permission: 'commonalerts_list',
        hidden: (userInfo, menu) => {
          if (isScopedPolicyMenuHidden('sub_hidden_menus.monitoroverview')) {
            return true
          }
          return featureMenuHiddenCheck(menu)
        },
      },
      component: Overview,
    },
    {
      meta: {
        label: i18n.t('monitor.monitor_metric'),
        t: 'dictionary.monitor_metrics',
      },
      submenus: [
        {
          name: 'Query',
          meta: {
            label: i18n.t('monitor.dashboard.title'),
            permission: 'unifiedmonitors_get',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.monitor_dashboard')) {
                return true
              }

              return featureMenuHiddenCheck(menu)
            },
          },
          path: '/monitor-dashboard',
          component: Layout,
          children: [
            {
              name: 'MonitorDashboard',
              path: '',
              component: Dashboard,
            },
            {
              name: 'MonitorDashboardChartCreate',
              path: 'create',
              component: MonitorDashboardChartCreate,
            },
            {
              name: 'MonitorDashboardChartUpdate',
              path: ':id/update',
              component: MonitorDashboardChartCreate,
            },
          ],
        },
        {
          name: 'Query',
          meta: {
            label: i18n.t('monitor.text_119'),
            permission: 'unifiedmonitors_get',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.explorer')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          path: '/explorer',
          component: Explorer,
        },
      ],
    },
    {
      meta: {
        label: i18n.t('monitor.text_1'),
        t: 'dictionary.monitor_commonalert',
      },
      submenus: [
        {
          path: '/commonalerts',
          meta: {
            label: i18n.t('monitor.text_2'),
            t: 'dictionary.commonalert',
            permission: 'commonalerts_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.commonalerts')) {
                return true
              }

              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'CommonalertsIndex',
              path: '',
              component: CommonalertsIndex,
              meta: {
                key: '/commonalerts',
                keepAlive: true,
                keepAliveViews: ['CommonalertUpdate'],
              },
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
            {
              name: 'CommonalertClone',
              path: ':id/clone',
              component: commonalertsClone,
            },
          ],
        },
        {
          path: '/alertresource',
          meta: {
            label: i18n.t('monitor.text_17'),
            // t: 'dictionary.alertresource',
            permission: 'alertresources_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.alertresource')) {
                return true
              }
              if (!store.getters.isAdminMode) return true
              return featureMenuHiddenCheck(menu)
            },
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
        {
          path: '/alertrecord',
          meta: {
            label: i18n.t('dictionary.alertrecord'),
            permission: 'alertrecords_list,monitorresourcealerts_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.alertrecord')) {
                return true
              }

              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AlertrecordIndex',
              path: '',
              component: AlertrecordIndex,
            },
          ],
        },
        {
          path: '/monitorresourcealerts',
          meta: {
            label: i18n.t('monitor.text_2'),
            t: 'dictionary.monitorresourcealerts',
            permission: 'alertrecordshields_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.commonalerts')) {
                return true
              }

              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AlertRecordShieldsIndex',
              path: '',
              component: AlertRecordShieldsIndex,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('system.text_564'),
      },
      submenus: [
        {
          path: '/notification',
          meta: {
            label: i18n.t('system.text_16'),
            permission: 'notifications_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.notification')) {
                return true
              }
              return !hasServices('notify') || featureMenuHiddenCheck(menu)
            },
            t: 'dictionary.webconsole',
          },
          component: Layout,
          children: [
            {
              name: 'Notification',
              path: '',
              component: Notification,
            },
          ],
        },
        {
          path: '/notify-topic',
          meta: {
            label: i18n.t('dictionary.notify-topic'),
            permission: 'topics_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.notify_topic')) {
                return true
              }
              if (!(store.getters.isAdminMode || store.getters.isDomainMode)) {
                return true
              }
              return !hasServices('notify') || featureMenuHiddenCheck(menu)
            },
            t: 'dictionary.notify-topic',
          },
          component: Layout,
          children: [
            {
              name: 'NotifyTopic',
              path: '',
              component: NotifyTopic,
            },
          ],
        },
        {
          path: '/notifyconfig',
          meta: {
            label: i18n.t('system.text_19'),
            permission: 'notifyconfigs_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.notifyconfig')) {
                return true
              }
              if (!(store.getters.isAdminMode || store.getters.isDomainMode)) {
                return true
              }
              return !hasServices('notify') || featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'NotifyConfig',
              path: '',
              component: NotifyConfigs,
            },
            {
              name: 'NotifyConfigCreate',
              path: 'create',
              component: NotifyConfigCreate,
            },
          ],
        },
        {
          path: '/contact',
          meta: {
            label: i18n.t('common_27'),
            permission: 'contacts_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.contact')) {
                return true
              }
              if (!store.getters.isAdminMode && !store.getters.isDomainMode) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'Contact',
              path: '',
              component: Contact,
            },
          ],
        },
        {
          path: '/robot',
          meta: {
            label: i18n.t('system.robot_manage'),
            permission: 'robots_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.robot')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'Robots',
              path: '',
              component: Robots,
            },
          ],
        },
      ],
    },
  ],
}
