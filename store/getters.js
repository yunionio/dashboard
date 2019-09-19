export default {
  auth: state => state.auth,
  userInfo: state => state.auth.info,
  windows: state => state.window.windows,
  common: state => state.common,
  $scope: (state, getters) => getters['auth/$scope'],
}
