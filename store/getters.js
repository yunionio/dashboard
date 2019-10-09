export default {
  auth: state => state.auth,
  userInfo: state => state.auth.info,
  windows: state => state.window.windows,
  common: state => state.common,
  dialogs: state => state.dialog.dialogs,
  scope: (state, getters) => getters['auth/scope'],
  isAdminMode: (state, getters) => getters['auth/isAdminMode'],
  isDomainMode: (state, getters) => getters['auth/isDomainMode'],
  l3PermissionEnable: (state, getters) => getters['auth/l3PermissionEnable'],
}
