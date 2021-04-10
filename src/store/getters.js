export default {
  logo: (state, getters) => getters['app/logo'],
  loginLogo: (state, getters) => getters['app/loginLogo'],
  copyright: (state, getters) => getters['app/copyright'],
  workflow: state => state.app.workflow,
  scope: state => state.auth.scope,
  auth: state => state.auth,
  userInfo: state => state.auth.info,
  capability: state => state.auth.capability,
  permission: state => state.auth.permission,
  scopeResource: state => state.auth.scopeResource,
  windows: state => state.window.windows,
  common: state => state.common,
  dialogs: state => state.dialog.dialogs,
  sidePages: state => state.sidePage.sidePages,
  isAdminMode: (state, getters) => getters['auth/isAdminMode'],
  isDomainMode: (state, getters) => getters['auth/isDomainMode'],
  isProjectMode: (state, getters) => getters['auth/isProjectMode'],
  l3PermissionEnable: (state, getters) => getters['auth/l3PermissionEnable'],
  currentScopeResource: (state, getters) => getters['auth/currentScopeResource'],
  isSidepageOpen: (state, getters) => getters['sidePage/isSidepageOpen'],
  userConfigInfo: (state, getters) => state.userConfig.info,
  profile: (state, getters) => state.profile.data,
  theme: (state, getters) => {
    const profile = state.profile.data
    return (profile.value && profile.value.theme) || state.setting.theme
  },
  themeColor: (state, getters) => {
    const profile = state.profile.data
    return (profile.value && profile.value.themeColor) || state.setting.themeColor
  },
  setting: state => state.setting,
  scopedPolicy: state => state.scopedPolicy,
  globalConfig: state => state.common.globalConfig,
}
