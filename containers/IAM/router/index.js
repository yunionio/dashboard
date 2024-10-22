import Layout from '@/layouts/RouterView'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'
import { hasServices, setupKeys } from '@/utils/auth'
import store from '@/store'

const IDP = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/idp')
const IDPEdit = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/idp/edit')
const Domain = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/domains')
const DomainCreate = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/domains/create')
const Projects = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/projects')
const SecurityAlerts = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/security-alerts')
const ProjectCreate = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/projects/create')
const Group = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/group')
const User = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/user')
const UserCreate = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/user/create')
const Role = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/role')
const Policy = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/policy')
const PolicyCreate = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/policy/Create')
const PolicyUpdate = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/policy/Update')
const Notification = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/notification')
const NotifyTopic = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/notify-topic')
const Robots = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/robots')
const NotifyConfigs = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/notifyconfig')
const NotifyConfigCreate = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/notifyconfig/create')
const Contact = () => import(/* webpackChunkName: "iam" */ /* webpackPrefetch: true */ '@IAM/views/contact')

function menuPath (path) {
  return '/iam' + path
}

export default {
  index: 91,
  meta: {
    label: i18n.t('scope.text_959'),
    icon: 'menu-iam',
  },
  menus: [
    {
      meta: {
        label: i18n.t('common_21'),
      },
      submenus: [
        {
          path: '/idp',
          meta: {
            label: i18n.t('system.text_4'),
            permission: 'idps_list',
            t: 'dictionary.identity_provider',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.idp')) {
                return true
              }
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['auth'] }, true)
            },
          },
          component: Layout,
          children: [
            {
              name: 'IdpIndex',
              path: '',
              component: IDP,
              meta: {
                key: '/idp',
                keepAlive: true,
                keepAliveViews: ['IdpUpdate'],
              },
            },
            {
              name: 'IdpCreate',
              path: 'create',
              meta: {},
              component: IDPEdit,
            },
            {
              name: 'IdpUpdate',
              path: 'update/:id',
              meta: {},
              component: IDPEdit,
            },
          ],
        },
        {
          path: '/domain',
          meta: {
            label: i18n.t('system.text_5'),
            permission: 'domains_list',
            t: 'dictionary.domain',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.domain')) {
                return true
              }
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['auth'] }, true)
            },
          },
          component: Layout,
          children: [
            {
              name: 'Domain',
              path: '',
              component: Domain,
            },
            {
              name: 'DomainCreate',
              path: 'create',
              component: DomainCreate,
            },
          ],
        },
        {
          path: '/project',
          meta: {
            label: i18n.t('system.text_9'),
            permission: 'projects_list',
            t: 'dictionary.project',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.project')) {
                return true
              }
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['auth'] }, true)
            },
          },
          component: Layout,
          children: [
            {
              name: 'Projects',
              path: '',
              component: Projects,
            },
            {
              name: 'ProjectCreate',
              path: 'create',
              component: ProjectCreate,
            },
          ],
        },
        {
          path: '/group',
          meta: {
            label: i18n.t('system.text_7'),
            permission: 'groups_list',
            t: 'dictionary.group',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.group')) {
                return true
              }
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['auth'] }, true)
            },
          },
          component: Layout,
          children: [
            {
              name: 'GroupList',
              path: '',
              component: Group,
            },
          ],
        },
        {
          path: '/systemuser',
          meta: {
            label: i18n.t('system.text_6'),
            permission: 'users_list',
            t: 'dictionary.user',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.systemuser')) {
                return true
              }
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['auth'] }, true)
            },
          },
          component: Layout,
          children: [
            {
              name: 'User',
              path: '',
              meta: {},
              component: User,
            },
            {
              name: 'UserCreate',
              path: 'create',
              meta: {},
              component: UserCreate,
            },
          ],
        },
        {
          path: '/role',
          meta: {
            label: i18n.t('system.text_10'),
            permission: 'roles_list',
            t: 'dictionary.role',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.role')) {
                return true
              }
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['auth'] }, true)
            },
          },
          component: Layout,
          children: [
            {
              name: 'RoleList',
              path: '',
              component: Role,
            },
          ],
        },
        {
          path: '/policy',
          meta: {
            label: i18n.t('system.text_11'),
            permission: 'policies_list',
            t: 'dictionary.policy',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.policy')) {
                return true
              }
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['auth'] }, true)
            },
          },
          component: Layout,
          children: [
            {
              name: 'PolicyIndex',
              path: '',
              component: Policy,
              meta: {
                key: '/policy',
                keepAlive: true,
                keepAliveViews: ['PolicyUpdate'],
              },
            },
            {
              name: 'PolicyCreate',
              path: 'create',
              component: PolicyCreate,
            },
            {
              name: 'PolicyUpdate',
              path: 'update',
              component: PolicyUpdate,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: i18n.t('scope.text_961'),
      },
      submenus: [
        {
          path: menuPath('/securityalerts'),
          meta: {
            label: i18n.t('scope.text_961'),
            permission: 'notifications_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.iam_securityalerts')) {
                return true
              }
              return !setupKeys.hasVersionedSetupKey({ '3.0': ['auth'] }, true)
            },
          },
          component: Layout,
          children: [
            {
              name: 'SecurityAlerts',
              path: '',
              component: SecurityAlerts,
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.notification')) {
                return true
              }
              return !hasServices('notify')
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.notify_topic')) {
                return true
              }
              if (!(store.getters.isAdminMode || store.getters.isDomainMode)) {
                return true
              }
              return !hasServices('notify')
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.notifyconfig')) {
                return true
              }
              if (!(store.getters.isAdminMode || store.getters.isDomainMode)) {
                return true
              }
              return !hasServices('notify')
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.contact')) {
                return true
              }
              return !store.getters.isAdminMode && !store.getters.isDomainMode
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.robot')) {
                return true
              }
              return false
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
