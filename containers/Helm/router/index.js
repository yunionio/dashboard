import VmRelase from '@Helm/views/vm-release'
import VmReleaseUpdate from '@Helm/views/vm-release/update'
import K8sRelease from '@Helm/views/k8s-release'
import K8sReleaseUpdate from '@Helm/views/k8s-release/update'
import Chart from '@Helm/views/chart'
import K8sChartCreate from '@Helm/views/chart/create'
import Repo from '@Helm/views/repo'
import Scheduledtask from '@Cloudenv/views/scheduledtask'
import ScheduledtaskCreate from '@Cloudenv/views/scheduledtask/create'
import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

// let Monitor = { meta: { hidden: true } }
// const modules = require.context('../../../containers', true, /^((?![\\/]node_modules).)*.\/router\/index.js$/)
// const moduleList = modules.keys()
// if ([].includes.call(moduleList, './Monitor/router/index.js')) {
//  Monitor = modules('./Monitor/router/index.js').default
// }

export default {
  index: 70,
  meta: {
    label: i18n.t('helm.text_1'),
    icon: 'menu-helm',
  },
  menus: [
    // Monitor,
    {
      meta: {
        label: i18n.t('helm.text_7'),
      },
      submenus: [
        {
          path: '/scheduledtask',
          meta: {
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.scheduledtask')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public', 'vmware'])
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.vm_release')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'public', 'k8s', 'vmware', 'huaweicloudstack'])
            },
            // invisible: () => true,
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_release')) {
                return true
              }
              return !hasSetupKey(['k8s'])
            },
            // invisible: () => true,
          },
          children: [
            {
              name: 'K8sRelaseIndex',
              path: '',
              component: K8sRelease,
            },
            {
              name: 'K8sReleaseUpdate',
              path: 'update/:name',
              component: K8sReleaseUpdate,
            },
          ],
        },
        {
          path: '/k8s-chart',
          meta: {
            label: i18n.t('helm.text_5'),
            permission: 'k8s_charts_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_chart')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'public', 'k8s', 'vmware', 'huaweicloudstack'])
            },
            // invisible: () => true,
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.k8s_repo')) {
                return true
              }
              return !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'public', 'k8s', 'vmware', 'huaweicloudstack'])
            },
            // invisible: () => true,
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
