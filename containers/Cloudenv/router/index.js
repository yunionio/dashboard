// import ServerPriceComparatorCreate from '@Cloudenv/views/server-price-comparator/create'
// import PriceComparatorList from '@Cloudenv/views/server-price-comparator'
// import Policydefinition from '@Cloudenv/views/policydefinition'

import Layout from '@/layouts/RouterView'
import { hasSetupKey } from '@/utils/auth'
import store from '@/store'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const ProjectMapping = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/projectmapping')
const Cloudgroup = () => import(/* webpackChunkName: "cloudenv" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudgroup')
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cloudaccount')) {
                return true
              }
              if (!hasSetupKey(['onecloud', 'public', 'private', 'storage', 'k8s'])) {
                return !hasSetupKey(['bill'])
              } else {
                return !hasSetupKey(['public', 'private', 'vmware', 'storage'])
              }
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
          path: '/cloudgroup',
          meta: {
            label: i18n.t('cloudenv.text_491'),
            permission: 'cloudgroup_list',
            t: 'cloudenv.text_491',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cloudgroup')) {
                return true
              }
              if (store.getters.isProjectMode) return true
              if (!hasSetupKey(['onecloud', 'public', 'private', 'storage', 'k8s'])) {
                return true
              } else {
                return !hasSetupKey(['aliyun', 'huawei', 'qcloud', 'aws', 'azure', 'google', 'hcso', 'hcs', 'ksyun'])
              }
            },
          },
          component: Layout,
          children: [
            {
              name: 'Cloudgroup',
              path: '',
              component: Cloudgroup,
            },
          ],
        },
        {
          path: '/proxysetting',
          meta: {
            label: i18n.t('cloudenv.text_14'),
            permission: 'proxysettings_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.proxysetting')) {
                return true
              }
              if (!hasSetupKey(['onecloud', 'public', 'private', 'storage', 'k8s'])) {
                return !hasSetupKey(['bill'])
              } else {
                return !hasSetupKey(['public', 'private', 'vmware', 'storage'])
              }
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.projectmapping')) {
                return true
              }
              if (!hasSetupKey(['onecloud', 'public', 'private', 'storage', 'k8s'])) {
                return !hasSetupKey(['bill'])
              } else {
                return !hasSetupKey(['public', 'jdcloud', 'ecloud'])
              }
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
    // {
    //   meta: {
    //     label: i18n.t('cloudenv.price_comparison'),
    //     hidden: () => {
    //       return !hasSetupKey(['onestack', 'private', 'public', 'vmware'])
    //     },
    //   },
    //   submenus: [
    //     {
    //       path: '/servercomparator',
    //       meta: {
    //         label: i18n.t('compute.text_91'),
    //       },
    //       component: Layout,
    //       children: [
    //         {
    //           name: 'ServerPriceComparatorCreate',
    //           path: '',
    //           component: ServerPriceComparatorCreate,
    //         },
    //       ],
    //     },
    //     {
    //       path: '/pricecomparator',
    //       meta: {
    //         label: i18n.t('cloudenv.price_list'),
    //       },
    //       component: Layout,
    //       children: [
    //         {
    //           name: 'PriceComparatorList',
    //           path: '',
    //           component: PriceComparatorList,
    //         },
    //       ],
    //     },
    //   ],
    // },
    /* {
      meta: {
        label: i18n.t('cloudenv.text_499'),
        hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'vmware']),
      },
      submenus: [
        {
          path: '/strategyallocation',
          meta: {
            label: i18n.t('cloudenv.text_500'),
            permission: 'scopedpolicies_list',
          },
          component: Layout,
          children: [
            {
              name: 'Strategyallocation',
              path: '',
              component: Strategyallocation,
            },
          ],
        },
        {
          path: '/strategydefinition',
          meta: {
            label: i18n.t('cloudenv.text_501'),
            permission: 'scopedpolicies_list',
          },
          component: Layout,
          children: [
            {
              name: 'Strategydefinition',
              path: '',
              component: Strategydefinition,
            },
            {
              name: 'StrategydefinitionCreate',
              path: 'create',
              component: StrategydefinitionCreate,
            },
          ],
        },
      ],
    }, */
    /* {
      meta: {
        label: i18n.t('cloudenv.text_21'),
        hidden: true,
      },
      submenus: [
        {
          path: '/policydefinition',
          meta: {
            label: i18n.t('cloudenv.text_21'),
            permission: 'policydefinitions_list',
            hidden: () => !hasSetupKey(['onestack', 'openstack', 'dstack', 'zstack', 'vmware']),
          },
          component: Layout,
          children: [
            {
              name: 'Policydefinition',
              path: '',
              component: Policydefinition,
            },
          ],
        },
      ],
    }, */
  ],
}
