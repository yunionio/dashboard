
import Layout from '@Compute/components/Layout'
import Dashboard from '@Dashboard/views/dashboard'
import DashboardEdit from '@Dashboard/views/edit'

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
