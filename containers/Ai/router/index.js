import Layout from '@/layouts/RouterView'
import i18n from '@/locales'

const Llm = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm')
const AppLlm = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/app-llm')
const AppLlmSku = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/app-llm-sku')
const LlmSku = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku')
const LlmSkuCreate = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku/create/index')
const LlmInstantmodel = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-instantmodel')
const LlmImage = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-image')
const LlmInstantmodelImportCommunity = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-instantmodel/import-community')
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
          },
          component: Layout,
          children: [
            {
              name: 'AppLlmList',
              path: '',
              component: AppLlm,
            },
          ],
        },
        {
          path: '/app-llm-sku',
          meta: {
            label: i18n.t('aice.app_llm_sku'),
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
          path: '/llm',
          meta: {
            label: i18n.t('aice.llm'),
          },
          component: Layout,
          children: [
            {
              name: 'LlmList',
              path: '',
              component: Llm,
            },
          ],
        },
        {
          path: '/llm-sku',
          meta: {
            label: i18n.t('aice.llm_sku'),
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
        {
          path: '/llm-instantmodel',
          meta: {
            label: i18n.t('aice.llm_instantapp'),
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
          },
          component: Layout,
          children: [
            {
              name: 'LlmImageList',
              path: '',
              component: LlmImage,
            },
          ],
        },
      ],
    },
  ],
}
