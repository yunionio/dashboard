<template>
  <div class="wrap shadow-lg bg-white rounded">
    <a-card>
      <div class="wrap-inner">
        <h5>管理员已开启登录保护，请按照以下步骤开启虚拟MFA</h5>
        <div class="setup-wrap-top">
          <div class="setup-tip">
            <div>
              <i class="tip-icon fa fa-hand-o-right" />
              <span class="tip-text">第1步 获取OneLogin Protect</span>
            </div>
            <div class="qr-wrap">
              <div>
                <div class="qr-code-bg-wrap" :style="{ backgroundImage: `url(${oneloginprotectAppQr})` }" />
              </div>
            </div>
            <div class="qr-tip">扫相应二维码获取应用，或打开应用商店搜索OneLogin Protect下载应用</div>
          </div>
          <div class="setup-tip">
            <div>
              <i class="tip-icon fa fa-hand-o-right" />
              <span class="tip-text">第2步 获取安全码</span>
            </div>
            <div class="qr-wrap">
              <template v-if="secret">
                <div>
                  <img :src="secretImg" />
                </div>
              </template>
            </div>
            <div class="qr-tip">打开OneLogin Protect App，扫描二维码，获取安全码</div>
          </div>
        </div>
        <div class="setup-wrap-bottom">
          <div class="setup-tip">
            <i class="tip-icon fa fa-hand-o-right" />
            <span class="tip-text">第3步 输入安全码</span>
          </div>
          <div class="code-wrap">
            <security-code ref="security-code" v-model="securityCode" :error="error" @completed="onValid" @clear="onClear" blurOnComplete />
          </div>
          <div class="status-tip">
            <div v-if="error" class="error">安全码错误，请重新输入</div>
            <div v-if="loading" class="loading"><i class="fa fa-refresh fa-spin" />正在验证</div>
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
      oneloginprotectAppQr: require('./assets/onelogin-protect-qrcode.png'),
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
      this.$router.push('/auth/login')
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
        this.$router.replace('/')
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
      margin-right: 10px;
    }
    > img {
      width: 150px;
    }
    .qr-code-bg-wrap {
      width: 150px;
      height: 150px;
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
