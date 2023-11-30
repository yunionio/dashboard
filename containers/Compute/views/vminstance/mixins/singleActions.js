import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import qs from 'qs'
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
      let connectParams = qs.parse(data.connect_params)
      if (!connectParams.access_token) {
        connectParams = {
          data: data.connect_params,
        }
      } else {
        connectParams = {
          data: Base64.encode(data.connect_params),
        }
      }
      const query = {
        ...connectParams,
        session: data.session,
        hypervisor: obj.hypervisor,
        os_type: obj.os_type,
        ips: obj.ips,
        instanceName: obj.name,
      }
      if (protocol) {
        query.protocol = protocol
      }
      if (this.enableWaterMark) {
        query.waterMark = `${this.userInfo.name}${this.userInfo.displayname ? `（${this.userInfo.displayname}）` : ''}<br />${obj.name}`
      }
      const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
      // const href = `${this.$store.getters.auth.regions.api_server}/web-console/?${qs.stringify(query)}`
      window.open(href)
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
