<template>
  <div class="wrap shadow-lg bg-white rounded">
    <a-card>
      <div class="wrap-inner">
        <h5>{{$t('common_83')}}</h5>
        <div class="setup-wrap-top">
          <div class="setup-tip">
            <div>
              <i class="tip-icon fa fa-hand-o-right" />
              <span class="tip-text">{{$t('common_84')}}</span>
            </div>
            <div class="qr-wrap d-flex">
              <div class="d-flex flex-column align-items-center">
                <div class="qr-code-bg-wrap" :style="{ backgroundImage: `url(${oneloginprotectAppQrIOS})` }" />
                <div class="mt-1"><a-icon type="apple" theme="filled" style="font-size: 20px" /></div>
              </div>
              <div class="d-flex flex-column align-items-center">
                <div class="qr-code-bg-wrap" :style="{ backgroundImage: `url(${oneloginprotectAppQrAndroid})` }" />
                <div class="mt-1"><a-icon type="android" theme="filled" style="font-size: 20px" /></div>
              </div>
            </div>
            <div class="qr-tip">{{$t('common_85')}}</div>
          </div>
          <div class="setup-tip">
            <div>
              <i class="tip-icon fa fa-hand-o-right" />
              <span class="tip-text">{{$t('common_86')}}</span>
            </div>
            <div class="qr-wrap">
              <template v-if="secret">
                <div>
                  <img :src="secretImg" />
                </div>
              </template>
            </div>
            <div class="qr-tip">{{$t('common_87')}}</div>
          </div>
        </div>
        <div class="setup-wrap-bottom">
          <div class="setup-tip">
            <i class="tip-icon fa fa-hand-o-right" />
            <span class="tip-text">{{$t('common_88')}}</span>
          </div>
          <div class="code-wrap">
            <security-code ref="security-code" v-model="securityCode" :error="error" @completed="onValid" @clear="onClear" blurOnComplete />
          </div>
          <div class="status-tip">
            <div v-if="error" class="error">{{$t('common_89')}}</div>
            <div v-if="loading" class="loading"><i class="fa fa-refresh fa-spin" />{{$t('common_90')}}</div>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'BindSecret',
  data () {
    return {
      oneloginprotectAppQrIOS: require('./assets/onelogin-protect-qrcode-ios.png'),
      oneloginprotectAppQrAndroid: require('./assets/onelogin-protect-qrcode-android.png'),
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
    secret () {
      return _.get(this.historyUsers, `${this.$store.getters['auth/currentHistoryUserKey']}.secret`)
    },
    secretImg () {
      return `data:image/png;base64,${_.get(this.historyUsers, `${this.$store.getters['auth/currentHistoryUserKey']}.secret`)}`
    },
  },
  watch: {
    securityCode (val) {
      if (val.length < 6) {
        this.error = false
      }
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
      !this.auth.auth.totp_init && this.$store.dispatch('auth/initcredential')
    }
  },
  mounted () {
    this.$refs['security-code'].focusInput(1)
  },
  methods: {
    async onValid () {
      this.loading = true
      try {
        await this.$store.dispatch('auth/validPasscode', {
          passcode: this.securityCode,
        })
        this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          action: 'unset',
          key: this.$store.getters['auth/currentHistoryUserKey'],
          path: 'secret',
        })
        this.loading = false
        if (this.$route.query.rf) {
          document.location.href = this.$route.query.rf
        } else {
          this.$router.replace('/')
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
.wrap {
  width: 710px;
  position: relative;
}
.wrap-inner {
  padding: 0 70px;
}
.setup-wrap-top {
  display: flex;
  border-bottom: 1px solid #EDF1F7;
  .setup-tip {
    flex: 1;
    padding: 20px 0;
    &:first-child {
      border-right: 1px solid #EDF1F7;
      padding-right: 20px;
    }
    &:last-child {
      padding-left: 30px;
    }
  }
}
.setup-tip {
  .tip-icon {
    color: #4da1ff;
  }
  .tip-text {
    font-size: 14px;
  }
}

.qr-wrap {
  margin: 15px 0;
  display: flex;
  height: 150px;
  > div {
    height: 100%;
    &:first-child {
      margin-right: 30px;
    }
    > img {
      width: 150px;
    }
    .qr-code-bg-wrap {
      width: 90px;
      height: 90px;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      > div {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, .9);
        color: #666;
        font-size: 12px;
        cursor: pointer;
      }
    }
    > p {
      color: #666;
      font-size: 12px;
      text-align: center;
      margin: 0;
      padding: 0;
    }
  }
}

.qr-tip {
  color: #A6AEBC;
  font-size: 12px;
}

.setup-wrap-bottom {
  margin-top: 15px;
}

.code-wrap {
  margin-top: 15px;
}

.status-tip {
  font-size: 12px;
  margin-top: 15px;
  text-align: center;
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
