import Layout from '@/layouts/RouterView'
import { featureMenuHiddenCheck } from '@/utils/auth'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const ProjectMapping = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/projectmapping')
const Cloudaccount = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudaccount')
const CloudaccountCreate = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudaccount/create')
const CloudaccountUpdateBill = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudaccount/create/BillFileIndex')
const Proxysetting = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/proxysetting')

export default {
  index: 90,
  meta: {
    label: i18n.t('cloudenv.text_8'),
    icon: 'menu-multicloud',
  },
  menus: [
    {
      meta: {
        label: i18n.t('cloudenv.text_12'),
      },
      submenus: [
        {
          path: '/cloudaccount',
          meta: {
            label: i18n.t('cloudenv.text_12'),
            permission: 'cloudaccounts_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cloudaccount')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'CloudaccountIndex',
              path: '',
              component: Cloudaccount,
              meta: {
                key: '/cloudaccount',
                keepAlive: true,
                keepAliveViews: ['CloudaccountUpdateBill'],
              },
            },
            {
              name: 'CloudaccountCreate',
              path: 'create',
              component: CloudaccountCreate,
            },
            {
              name: 'CloudaccountUpdateBill',
              path: 'updatebill',
              component: CloudaccountUpdateBill,
            },
          ],
        },
        {
          path: '/proxysetting',
          meta: {
            label: i18n.t('cloudenv.text_14'),
            permission: 'proxysettings_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.proxysetting')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'Proxysetting',
              path: '',
              component: Proxysetting,
            },
          ],
        },
        {
          path: '/projectmapping',
          meta: {
            label: i18n.t('cloudenv.text_580'),
            permission: 'proxysettings_list',
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.projectmapping')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'ProjectMapping',
              path: '',
              component: ProjectMapping,
            },
          ],
        },
      ],
    },
  ],
}
