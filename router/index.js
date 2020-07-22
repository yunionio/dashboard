
import Dashboard from '@Dashboard/views/dashboard'
import DashboardEdit from '@Dashboard/views/edit'
import Layout from '@/layouts/RouterView'
// import store from '@/store'
import i18n from '@/locales'

export default {
  index: 1,
  meta: {
    label: i18n.t('dashboard.text_77'),
    icon: 'menu-dashboard',
  },
  menu: {
    path: '/dashboard',
    meta: {
      // hidden: () => {
      //   if (process.env.VUE_APP_PLATFORM === 'operation' && store.getters.isDomainMode) {
      //     return true
      //   }
      //   return false
      // },
    },
    component: Layout,
    children: [
      {
        name: 'Dashboard',
        path: '',
        meta: {},
        component: Dashboard,
      },
      {
        name: 'DashboardEdit',
        path: 'edit',
        meta: {
          layout: 'full-screen',
        },
        component: DashboardEdit,
      },
    ],
  },
}
