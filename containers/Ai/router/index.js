import Layout from '@/layouts/RouterView'
import i18n from '@/locales'

const Llm = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm')
const LlmSku = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-sku')
const LlmInstantmodel = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-instantmodel')
const LlmImage = () => import(/* webpackChunkName: "k8s" */ /* webpackPrefetch: true */ '@Ai/views/llm-image')
export default {
  index: 61,
  meta: {
    label: i18n.t('aice.ai'),
    icon: 'menu-ai',
  },
  menus: [
    {
      meta: {
        label: i18n.t('aice.llm'),
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
          ],
        },
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
