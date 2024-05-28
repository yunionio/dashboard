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
  methods: {},
}
