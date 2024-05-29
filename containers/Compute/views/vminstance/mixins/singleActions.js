import { mapGetters } from 'vuex'
// import { Base64 } from 'js-base64'
// import qs from 'qs'
import protocolCheck from 'custom-protocol-detection'
import { typeClouds } from '@/utils/common/hypervisor'
import Actions from '../constants/actions'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'auth', 'common']),
    enableMFA () {
      return this.userInfo.enable_mfa && this.auth.auth.system_totp_on
    },
    enableWaterMark () {
      const { globalConfig = {} } = this.common
      const { enable_watermark = true } = globalConfig
      return enable_watermark
    },
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
    this.singleActions = Actions.getSingleActions.call(this)
  },
  destroyed () {
    this.webconsoleManager = null
  },
  methods: {
    openWebConsole (obj, data, protocol) {
      this.$openWebConsole(data)
    },
    open (obj, url) {
      if (obj.hypervisor === typeClouds.hypervisorMap.esxi.key) {
        protocolCheck(url, () => {
          this.createDialog('VmrcDownload', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        }, () => {
          window.location.href = url
        })
      } else {
        window.open(url)
      }
    },
  },
}
