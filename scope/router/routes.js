import Login from '@scope/views/auth/Login'
import SecretVerify from '@scope/views/auth/SecretVerify'
import BindSecret from '@scope/views/auth/BindSecret'
import SetSecretQuestion from '@scope/views/auth/SetSecretQuestion'
import ResetSecretQuestion from '@scope/views/auth/ResetSecretQuestion'
import Guide from '@scope/views/guide'
import GuideCreate from '@scope/views/guide/create'
import AuthLayout from '@/layouts/Auth'
import Layout from '@/layouts/RouterView'

const routes = [
  { name: 'Home', path: '/', redirect: '/dashboard' },
  {
    name: 'Guide',
    path: '/guide',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Guide',
        component: Guide,
      },
      {
        path: 'create',
        name: 'GuideCreate',
        component: GuideCreate,
      },
    ],
  },
  {
    name: 'Auth',
    path: '/auth',
    component: AuthLayout,
    redirect: '/auth/login',
    children: [
      {
        name: 'Login',
        path: 'login',
        component: Login,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'SecretVerify',
        path: 'secretverify',
        component: SecretVerify,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'BindSecret',
        path: 'bindsecret',
        component: BindSecret,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'SetSecretQuestion',
        path: 'setsecretquestion',
        component: SetSecretQuestion,
        meta: { layout: 'full-screen' },
      },
      {
        name: 'ResetSecretQuestion',
        path: 'resetsecretquestion',
        component: ResetSecretQuestion,
        meta: { layout: 'full-screen' },
      },
    ],
  },
]

export default routes
