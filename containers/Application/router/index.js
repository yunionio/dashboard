import Layout from '@/layouts/RouterView'
import i18n from '@/locales'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'
import { featureMenuHiddenCheck } from '@/utils/auth'

const AppDesktop = () => import(/* webpackChunkName: "application" */ '@Application/views/app-desktop')
const AppDesktopSku = () => import(/* webpackChunkName: "application" */ '@Application/views/app-desktop-sku')
const AppDesktopImage = () => import(/* webpackChunkName: "application" */ '@Application/views/app-desktop-image')
const AppLlmImageRedirect = () => import(/* webpackChunkName: "application" */ '@Application/views/app-llm-image-redirect')
const LlmCreate = () => import(/* webpackChunkName: "application" */ '@Ai/views/llm/create')
const LlmSkuCreate = () => import(/* webpackChunkName: "application" */ '@Ai/views/llm-sku/create/index')
const LlmSkuImportFromCommunity = () => import(/* webpackChunkName: "application" */ '@Ai/views/llm-sku/import-from-community')

export default {
  index: 60.5,
  meta: {
    label: i18n.t('application.product'),
    icon: 'menu-k8s',
  },
  menus: [
    {
      meta: {
        label: i18n.t('application.desktop'),
      },
      submenus: [
        {
          path: '/app-desktop',
          meta: {
            label: i18n.t('aice.desktop_llm'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.app_desktop')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AppDesktopList',
              path: '',
              component: AppDesktop,
            },
            {
              name: 'AppDesktopCreate',
              path: 'create',
              component: LlmCreate,
            },
          ],
        },
        {
          path: '/app-desktop-sku',
          meta: {
            label: i18n.t('aice.desktop_llm_sku'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.app_desktop_sku')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AppDesktopSkuList',
              path: '',
              component: AppDesktopSku,
            },
            {
              name: 'AppDesktopSkuCreate',
              path: 'create',
              component: LlmSkuCreate,
            },
            {
              name: 'AppDesktopSkuImportFromCommunity',
              path: 'import-from-community',
              component: LlmSkuImportFromCommunity,
            },
          ],
        },
        {
          path: '/app-desktop-image',
          meta: {
            label: i18n.t('aice.desktop_llm_image'),
            hidden: (userInfo, menu) => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.app_desktop_image') ||
                isScopedPolicyMenuHidden('sub_hidden_menus.app_llm_image')) {
                return true
              }
              return featureMenuHiddenCheck(menu)
            },
          },
          component: Layout,
          children: [
            {
              name: 'AppDesktopImageList',
              path: '',
              component: AppDesktopImage,
            },
          ],
        },
        // backward-compatible route, hidden from menus
        {
          path: '/app-llm-image',
          meta: {
            label: i18n.t('aice.app_llm_image'),
            hidden: () => true,
          },
          component: Layout,
          children: [
            {
              name: 'AppLlmImageRedirect',
              path: '',
              component: AppLlmImageRedirect,
            },
          ],
        },
      ],
    },
  ],
}
