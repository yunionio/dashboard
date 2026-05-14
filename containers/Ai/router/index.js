import Layout from '@/layouts/RouterView'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'
import { featureMenuHiddenCheck } from '@/utils/auth'

const Llm = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm')
const AppLlm = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/app-llm')
const AppLlmSku = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/app-llm-sku')
const LlmSku = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku')
const LlmSkuCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku/create/index')
const LlmInstantmodel = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-instantmodel')
const LlmModelSets = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-model-sets')
const LlmImage = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-image')
const LlmInstantmodelImportCommunity = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-instantmodel/import-community')
const LlmImageImportCommunity = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-image/import-community')
const LlmCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm/create')
const LlmDeployment = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-deployment')
const LlmDeploymentCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-deployment/create')
export default {
  index: 61,
  meta: {
    label: i18n.t('aice.ai'),
    icon: 'menu-ai',
  },
  menus: [
    // 人工智能-应用
    {
      meta: {
        label: i18n.t('common.application'),
      },
      submenus: [
        {
          path: '/app-llm',
          meta: {
            label: i18n.t('aice.app_llm'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.app_llm')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AppLlmList',
              path: '',
              component: AppLlm,
            },
            {
              name: 'LlmCreate',
              path: 'create',
              component: LlmCreate,
            },
          ],
        },
        {
          path: '/app-llm-sku',
          meta: {
            label: i18n.t('aice.app_llm_sku'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.app_llm_sku')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AppLlmSkuList',
              path: '',
              component: AppLlmSku,
            },
            {
              name: 'LlmSkuCreate',
              path: 'create',
              component: LlmSkuCreate,
            },
          ],
        },
      ],
    },
    // 人工智能-推理
    {
      meta: {
        label: i18n.t('common.inference'),
      },
      submenus: [
        {
          path: '/llm-deployment',
          meta: {
            label: i18n.t('aice.llm_deployment'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_deployment')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmDeploymentList',
              path: '',
              component: LlmDeployment,
            },
            {
              name: 'LlmDeploymentCreate',
              path: 'create',
              component: LlmDeploymentCreate,
            },
          ],
        },
        {
          path: '/llm',
          meta: {
            label: i18n.t('aice.llm'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmList',
              path: '',
              component: Llm,
            },
            {
              name: 'LlmCreate',
              path: 'create',
              component: LlmCreate,
            },
          ],
        },
        {
          path: '/llm-sku',
          meta: {
            label: i18n.t('aice.llm_sku'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_sku')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmSkuList',
              path: '',
              component: LlmSku,
            },
            {
              name: 'LlmSkuCreate',
              path: 'create',
              component: LlmSkuCreate,
            },
          ],
        },
      ],
    },
    // 人工智能-模型库
    {
      meta: {
        label: i18n.t('aice.app_llm_instantapp'),
      },
      submenus: [
        {
          path: '/llm-model-sets',
          meta: {
            label: i18n.t('aice.llm_catalog'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_catalog')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmModelSetList',
              path: '',
              component: LlmModelSets,
            },
          ],
        },
        {
          path: '/llm-instantmodel',
          meta: {
            label: i18n.t('aice.llm_instantmodel.menu'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_instantmodel')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmInstantmodelList',
              path: '',
              component: LlmInstantmodel,
            },
            {
              name: 'LlmInstantmodelImportCommunity',
              path: 'import-community',
              component: LlmInstantmodelImportCommunity,
            },
          ],
        },
      ],
    },
    // 人工智能-镜像
    {
      meta: {
        label: i18n.t('common.image'),
      },
      submenus: [
        {
          path: '/llm-image',
          meta: {
            label: i18n.t('aice.llm_image'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.llm_image')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'LlmImageList',
              path: '',
              component: LlmImage,
            },
            {
              name: 'LlmImageImportCommunity',
              path: 'import-community',
              component: LlmImageImportCommunity,
            },
          ],
        },
      ],
    },
  ],
}
