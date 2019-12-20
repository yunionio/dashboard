
import Layout from '@Compute/components/Layout'
import Dashboard from '@Dashboard/views/dashboard'
import DashboardEdit from '@Dashboard/views/edit'
import Cookies from 'js-cookie'

export default {
  index: 1,
  meta: {
    label: '控制面板',
    icon: 'menu-dashboard',
  },
  menu: {
    path: '/dashboard',
    meta: {},
    component: Layout,
    children: [
      {
        name: 'Dashboard',
        path: '',
        meta: {
          v1: Cookies.get('__oc_dashboard_version__') === 'v1',
        },
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
