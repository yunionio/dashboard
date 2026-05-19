import Layout from '@/layouts/RouterView'
import { featureMenuHiddenCheck } from '@/utils/auth'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const VmRelase = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/vm-release')
const VmReleaseUpdate = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/vm-release/update')
const K8sRelease = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/k8s-release')
const K8sReleaseUpdate = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/k8s-release/update')
const Chart = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/chart')
const K8sChartCreate = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/chart/create')
const Repo = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Helm/views/repo')
const Scheduledtask = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Cloudenv/views/scheduledtask')
const ScheduledtaskCreate = () => import(/* webpackChunkName: "helm" */ /* webpackPrefetch: true */ '@Cloudenv/views/scheduledtask/create')

export default {
  index: 70,
  meta: {
    label: i18n.t('helm.text_1'),
    icon: 'menu-helm',
  },
  menus: [
    {
      meta: {
        label: i18n.t('helm.text_7'),
      },
      submenus: [
        {
          path: '/scheduledtask',
          meta: {
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.scheduledtask')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
            label: i18n.t('helm.text_8'),
            permission: 'scheduledtasks_list',
          },
          component: Layout,
          children: [
            {
              name: 'Scheduledtasks',
              path: '',
              component: Scheduledtask,
            },
            {
              name: 'ScheduledtaskCreate',
              path: 'create',
              component: ScheduledtaskCreate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('helm.text_2'),
      },
      submenus: [
        {
          path: '/vm-release',
          component: Layout,
          meta: {
            label: i18n.t('helm.text_3'),
            permission: 'k8s_releases_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.vm_release')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          children: [
            {
              name: 'VmRelaseIndex',
              path: '',
              component: VmRelase,
            },
            {
              name: 'VmReleaseUpdate',
              path: 'update/:name',
              component: VmReleaseUpdate,
            },
          ],
        },
        {
          path: '/k8s-release',
          component: Layout,
          meta: {
            label: i18n.t('helm.text_4'),
            permission: 'k8s_releases_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_release')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          children: [
            {
              name: 'K8sRelaseIndex',
              path: '',
              component: K8sRelease,
            },
            {
              name: 'K8sReleaseUpdate',
              path: 'update/:id',
              component: K8sReleaseUpdate,
            },
          ],
        },
        {
          path: '/k8s-chart',
          meta: {
            label: i18n.t('helm.text_5'),
            permission: 'k8s_charts_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_chart')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sChartList',
              path: '',
              component: Chart,
            },
            {
              name: 'K8sChartCreate',
              path: 'create',
              component: K8sChartCreate,
            },
          ],
        },
        {
          path: '/k8s-repo',
          meta: {
            label: i18n.t('helm.text_6'),
            permission: 'k8s_repos_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_repo')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'K8sRepoList',
              path: '',
              component: Repo,
            },
          ],
        },
      ],
    },
  ],
}
