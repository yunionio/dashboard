import AuthLayout from '@/layouts/Auth'
import Login from '@/sections/Auth/Login'
import LoginChooser from '@/sections/Auth/Login/components/LoginChooser'
import LoginChallenge from '@/sections/Auth/Login/components/LoginChallenge'
import AdminRegister from '@/sections/Auth/AdminRegister'
import SecretVerify from '@/sections/Auth/SecretVerify'
import BindSecret from '@/sections/Auth/BindSecret'
import SetSecretQuestion from '@/sections/Auth/SetSecretQuestion'
import ResetSecretQuestion from '@/sections/Auth/ResetSecretQuestion'

const routes = [
  { name: 'Home', path: '/', redirect: '/dashboard' },
  {
    path: '/auth',
    component: AuthLayout,
    meta: { layout: 'full-screen' },
    redirect: '/auth/login',
    children: [
      {
        path: 'login',
        component: Login,
        children: [
          {
            name: 'Auth',
            path: '',
            component: LoginChallenge,
            meta: { layout: 'full-screen', auth: false, authPage: true, transitionName: 'slide' },
          },
          {
            name: 'LoginChooser',
            path: 'chooser',
            component: LoginChooser,
            meta: { layout: 'full-screen', auth: false, authPage: true, transitionName: 'slide' },
          },
          {
            name: 'LoginChooserDefault',
            path: 'default',
            component: LoginChooser,
            meta: { layout: 'full-screen', auth: false, authPage: true, transitionName: 'slide' },
          },
        ],
      },
      {
        name: 'AdminRegister',
        path: 'adminregister',
        component: AdminRegister,
        meta: { layout: 'full-screen', auth: false, authPage: true },
      },
      {
        name: 'SecretVerify',
        path: 'secretverify',
        component: SecretVerify,
        meta: { layout: 'full-screen', auth: false, authPage: true },
      },
      {
        name: 'BindSecret',
        path: 'bindsecret',
        component: BindSecret,
        meta: { layout: 'full-screen', auth: false, authPage: true },
      },
      {
        name: 'SetSecretQuestion',
        path: 'setsecretquestion',
        component: SetSecretQuestion,
        meta: { layout: 'full-screen', auth: false, authPage: true },
      },
      {
        name: 'ResetSecretQuestion',
        path: 'resetsecretquestion',
        component: ResetSecretQuestion,
        meta: { layout: 'full-screen', auth: false, authPage: true },
      },
    ],
  },
]

export default routes
