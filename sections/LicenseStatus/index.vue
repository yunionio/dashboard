<template>
  <a-alert
    v-if="showTips"
    type="warning"
    :closable="closable"
    showIcon
    @close="handleCloseAlert">
    <template v-slot:message>
      <span>{{ tips.message }}</span>
      <template v-if="tips.to">
        <router-link :to="tips.to" class="ml-2">查看详情</router-link>
      </template>
    </template>
  </a-alert>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import Cookies from 'js-cookie'

export default {
  data () {
    return {
      showAlert: true,
    }
  },
  computed: {
    ...mapGetters([
      'isAdminMode',
    ]),
    ...mapState('app', {
      computeStatus: state => state.license.status,
      computeLicense: state => state.license.compute,
      computeServiceNumbers: state => state.license.service_numbers,
    }),
    email () {
      const email = this.$store.state.app.oem.email
      if (!R.isNil(email) && !R.isEmpty(email)) {
        return email
      }
      return null
    },
    sn () {
      let sn = this.computeLicense.sn
      if (R.is(String, sn)) {
        return [sn]
      }
      return sn
    },
    unAuthServiceNumbers () {
      return this.computeServiceNumbers.filter(item => !this.sn.includes(item))
    },
    tips () {
      const now = new Date()
      const days = (this.computeStatus.expire - now.getTime() / 1000) / 24 / 3600
      // 过期
      if (this.computeStatus.expired) {
        return {
          message: `您的授权证书已过期，如您需要升级到其它版本或更新许可证，请将您的服务器识别码和升级需求发送电子邮件至 ${this.email}，我们将尽快与您联系！`,
        }
      }
      // 超过配额
      if (this.computeStatus.prohibited) {
        return {
          message: `您的授权CPU配额已到达上限，如您需要升级到其它版本或更新许可证，请将您的服务器识别码和升级需求发送电子邮件至 ${this.email}，我们将尽快与您联系！`,
          to: 'licenses',
        }
      }
      // 即将过期
      if (this.computeStatus.expire > 0 && days < 30) {
        return {
          message: `您的授权证书即将过期，如您需要升级到其它版本或更新许可证，请将您的服务器识别码和升级需求发送电子邮件至 ${this.email}，我们将尽快与您联系！`,
        }
      }
      // 即将超出配额
      if (this.computeStatus.exceeded) {
        return {
          message: `您的授权CPU配额即将到达上限，如您需要升级到其它版本或更新许可证，请将您的服务器识别码和升级需求发送电子邮件至 ${this.email}，我们将尽快与您联系！`,
          to: 'licenses',
        }
      }
      // 发现未被授权的服务器
      if (this.unAuthServiceNumbers && this.unAuthServiceNumbers.length) {
        return {
          message: `发现未被授权的服务器，您需要及时更新license，否则可能会导致系统服务不可用。请将您的服务器识别码和变更需求发送电子邮件至 ${this.email}，我们将尽快与您联系！`,
          to: 'licenses',
        }
      }
      return null
    },
    showTips () {
      if (!this.tips) return false
      if (!this.isAdminMode) return false
      if (!this.showAlert) return false
      const lastTipTime = Cookies.get('lastTipTime')
      const now = new Date().getTime()
      return lastTipTime ? now - lastTipTime > 3600 * 24 * 1000 : true
    },
    closable () {
      return this.computeStatus.prohibited || this.computeStatus.exceeded
    },
  },
  methods: {
    handleCloseAlert () {
      const now = new Date().getTime()
      // cookie一天有效
      Cookies.set('lastTipTime', now, {
        expires: 1,
      })
      this.showAlert = false
    },
  },
}
</script>
