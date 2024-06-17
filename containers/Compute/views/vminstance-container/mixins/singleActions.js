import { mapGetters } from 'vuex'
// import { Base64 } from 'js-base64'
// import qs from 'qs'
import Actions from '../constants/actions'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'auth', 'common']),
    enableMFA () {
      return this.userInfo.enable_mfa && this.auth.auth.system_totp_on
    },
  },
  created () {
    this.singleActions = Actions.getSingleActions.call(this)
  },
  methods: {
    openWebConsole (data) {
      this.$openWebConsole(data)
    },
    async fetchConnectUrl (containerId) {
      const { data } = await new this.$Manager('webconsole', 'v1').objectRpc({
        methodname: 'DoContainerExec',
        params: {
          container_id: containerId,
        },
      })
      return Promise.resolve(data)
    },
  },
}
