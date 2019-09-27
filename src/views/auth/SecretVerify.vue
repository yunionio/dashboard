<template>
  <div class="wrap">
    <a-card>
      <div class="wrap-inner">
        <h5 class="auth-base-title text-center">登录保护已开启，请输入6位安全码</h5>
        <div class="verify-tip">请在手机打开Google Authenticator APP，获取MFA安全码。无法获取，请<a class="reset-secret-btn" @click="resetSecret">重置密钥</a></div>
        <div class="code-wrap d-flex justify-content-center">
          <security-code ref="security-code" v-model="securityCode" :error="error" @completed="onValid" @clear="onClear" blurOnComplete />
        </div>
        <div class="status-tip">
          <div v-if="error" class="error">安全码错误，请重新输入</div>
          <div v-if="loading" class="loading"><a-icon type="sync" spin />正在验证</div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'SecretVerify',
  data () {
    return {
      securityCode: '',
      error: false,
      loading: false,
    }
  },
  watch: {
    securityCode (val) {
      if (val.length < 6) {
        this.error = false
      }
    },
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
        await this.$store.dispatch('auth/getInfo')
        this.loading = false
        this.$router.push('/')
      } catch (error) {
        this.error = true
        this.loading = false
      }
    },
    onClear () {
      this.error = false
      this.$refs['security-code'].focusInput(1)
    },
    resetSecret () {
      this.$router.push({
        name: 'ResetSecretQuestion',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  width: 810px;
  height: 660px;
  position: relative;
}
.wrap-inner {
  padding: 0 70px;
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
.verify-tip {
  color: #A6AEBC;
  font-size: 12px;
  text-align: center;
  margin-bottom: 40px;
  .reset-secret-btn {
    color: #409EFF;
    margin-left: 10px;
  }
}
</style>
