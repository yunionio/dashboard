<template>
  <div class="wrap shadow-lg bg-white rounded">
    <a-card>
      <div class="wrap-inner">
        <h5 class="page-title">{{$t('common_83')}}</h5>
        <div class="setup-grid">
          <section class="step-col">
            <header class="step-hd step-hd-with-sub">
              <span class="step-no">1</span>
              <div class="step-hd-main">
                <span class="step-text">{{$t('common_84')}}</span>
                <div class="step-sub">
                  {{ $t('common.wechat_miniprogram_prefix') }}
                  <span class="brand-em">{{ $t('common.brand_ycloud') }}</span>
                  {{ $t('common.wechat_miniprogram_suffix') }}
                </div>
              </div>
            </header>
            <div class="feature-client">
              <div
                class="feature-qr"
                :style="{ backgroundImage: `url(${miniprogramQr})` }" />
            </div>
            <div class="alt-list">
              <div class="alt-item">
                <div class="alt-name">{{ $t('common.mobile_end') }}</div>
                <div class="alt-desc">
                  {{ $t('common.nington_get_tip_prefix') }}
                  <span class="brand-em">Microsoft Authenticator</span>、
                  <span class="brand-em">{{ $t('common.brand_nington') }}</span>、
                  <span class="brand-em">DKEY Token</span>
                  {{ $t('common.nington_get_tip_suffix') }}
                </div>
              </div>
              <div class="alt-item">
                <div class="alt-name">{{ $t('common.chrome_browser') }}</div>
                <div class="alt-desc">
                  {{ $t('common.mfa.qr_code_chrome_1_prefix') }}
                  <span class="brand-em">Authenticator</span>
                  {{ $t('common.mfa.qr_code_chrome_1_suffix') }}
                  <help-link href="https://chrome.google.com/webstore/detail/authenticator/bhghoamapcdpbohphigoooaddinpkbai?hl=zh-CN">
                    {{ $t('common.mfa.qr_code_chrome_2') }}
                  </help-link>
                </div>
              </div>
            </div>
          </section>
          <section class="step-col step-col-scan">
            <header class="step-hd">
              <span class="step-no">2</span>
              <span class="step-text">{{$t('common_86')}}</span>
            </header>
            <div class="scan-body">
              <div class="secret-qr-wrap">
                <img v-if="secretImg" :src="secretImg" alt="MFA QR Code" />
              </div>
              <p class="scan-tip">{{$t('common_87')}}</p>
            </div>
          </section>
        </div>
        <section class="setup-bottom">
          <header class="step-hd">
            <span class="step-no">3</span>
            <span class="step-text">{{$t('common_88')}}</span>
          </header>
          <div class="code-wrap">
            <security-code ref="security-code" v-model="securityCode" :error="error" @completed="onValid" @clear="onClear" blurOnComplete />
          </div>
          <div class="status-tip">
            <div v-if="error" class="error">{{$t('common_89')}}</div>
            <div v-if="loading" class="loading"><i class="fa fa-refresh fa-spin" />{{$t('common_90')}}</div>
          </div>
        </section>
      </div>
    </a-card>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getKeyIgnoreCase } from '@/utils/utils'

export default {
  name: 'BindSecret',
  data () {
    return {
      miniprogramQr: require('./assets/ycloud-miniprogram-qrcode.png'),
      // 本地缓存二维码，避免 historyUsers key 变化或 unset 后页面立刻空白
      secretQrcode: '',
      securityCode: '',
      error: false,
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['auth', 'userInfo']),
    ...mapState('auth', {
      historyUsers: state => state.historyUsers,
    }),
    secretImg () {
      return this.secretQrcode ? `data:image/png;base64,${this.secretQrcode}` : ''
    },
  },
  watch: {
    securityCode (val) {
      if (val.length < 6) {
        this.error = false
      }
    },
    historyUsers: {
      deep: true,
      handler () {
        const secret = this.getHistorySecret()
        // 只同步有值的 secret，避免 unset 后把本地展示清掉
        if (secret) {
          this.secretQrcode = secret
        }
      },
    },
  },
  created () {
    if (!this.$store.getters['auth/currentHistoryUserKey']) {
      this.$router.replace({
        path: '/auth/login',
        query: {
          rf: this.$route.query.rf,
        },
      })
    } else {
      this.initSecret()
    }
  },
  mounted () {
    this.$refs['security-code'].focusInput(1)
  },
  methods: {
    getHistorySecret () {
      const key = this.$store.getters['auth/currentHistoryUserKey']
      if (!key) return ''
      const user = getKeyIgnoreCase(this.historyUsers || {}, key)
      return (user && user.secret) || ''
    },
    async initSecret () {
      const existing = this.getHistorySecret()
      if (existing) {
        this.secretQrcode = existing
        return
      }
      if (!this.auth.auth.totp_init) {
        try {
          const data = await this.$store.dispatch('auth/initcredential')
          this.secretQrcode = data.qrcode || this.getHistorySecret()
        } catch (error) {
          throw error
        }
      }
    },
    async onValid () {
      this.loading = true
      try {
        await this.$store.dispatch('auth/validPasscode', {
          passcode: this.securityCode,
        })
        // 与 SecretVerify 一致：先刷新 token，再清理本地 secret
        await this.$store.commit('auth/UPDATE_AUTH')
        this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          action: 'unset',
          key: this.$store.getters['auth/currentHistoryUserKey'],
          path: 'secret',
        })
        this.loading = false
        if (this.$route.query.rf) {
          document.location.href = this.$route.query.rf
        } else {
          await this.$router.replace('/')
        }
      } catch (error) {
        this.error = true
        this.loading = false
      }
    },
    onClear () {
      this.error = false
      this.$refs['security-code'].focusInput(1)
    },
  },
}
</script>

<style lang="less" scoped>
@import "~@/styles/less/theme";

.wrap {
  width: 710px;
  position: relative;
  -webkit-font-smoothing: antialiased;
}
.wrap-inner {
  padding: 4px 70px 12px;
}
.page-title {
  margin: 0 0 30px;
  font-size: 18px;
  font-weight: 600;
  color: @heading-color;
  line-height: 1.3;
  text-wrap: balance;
}
.setup-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 0 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #edf1f7;
}
.step-col {
  min-width: 0;
  &.step-col-scan {
    padding-left: 24px;
    border-left: 1px solid #edf1f7;
    .step-hd {
      margin-bottom: 14px;
    }
  }
}
.step-hd {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  &.step-hd-with-sub {
    align-items: flex-start;
    .step-no {
      margin-top: 1px;
    }
  }
}
.step-no {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: @primary-color;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.step-hd-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.step-text {
  font-size: 14px;
  font-weight: 600;
  color: @heading-color;
  line-height: 1.4;
}
.step-sub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 400;
  color: @text-color;
  line-height: 1.4;
}
.brand-em {
  margin: 0 4px;
  color: @heading-color;
  font-weight: 500;
}
.feature-client {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0 2px;
}
.feature-qr {
  width: 120px;
  height: 120px;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  border-radius: 50%;
}
.alt-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alt-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.alt-name {
  font-size: 12px;
  font-weight: 500;
  color: @heading-color;
  line-height: 1.5;
}
.alt-desc {
  font-size: 12px;
  color: @text-color-secondary;
  line-height: 1.55;
  text-wrap: pretty;
}
.scan-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 6px;
}
.secret-qr-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 152px;
    height: 152px;
    display: block;
  }
}
.scan-tip {
  margin: 14px 0 0;
  max-width: 260px;
  font-size: 12px;
  color: @text-color-secondary;
  line-height: 1.6;
  text-wrap: pretty;
}
.setup-bottom {
  margin-top: 22px;
  padding-bottom: 4px;
}
.code-wrap {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}
.status-tip {
  font-size: 12px;
  margin-top: 14px;
  text-align: center;
  min-height: 18px;
  .error {
    color: #DD2727;
  }
  .loading {
    i {
      margin-right: 5px;
    }
  }
}
</style>
