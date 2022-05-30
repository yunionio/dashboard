<template>
  <div class="wrap shadow-lg bg-white rounded">
    <a-card>
      <div class="wrap-inner">
        <h5 class="auth-base-title text-center">{{ $t('auth.secret.verify.title') }}</h5>
        <div class="verify-tip">{{ $t('auth.secret.reset.prefix') }}<a class="reset-secret-btn" @click="resetSecret">{{ $t('common.text00112') }}</a></div>
        <div class="code-wrap d-flex justify-content-center">
          <security-code ref="security-code" v-model="securityCode" :error="error" @completed="onValid" @clear="onClear" blurOnComplete />
        </div>
        <div class="status-tip">
          <div v-if="error" class="error">{{ $t('auth.secret.validate') }}</div>
          <div v-if="loading" class="loading"><a-icon type="sync" spin />{{ $t('auth.secret.loading') }}</div>
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
  created () {
    if (!this.$store.getters['auth/currentHistoryUserKey']) {
      this.$router.replace({
        path: '/auth/login',
        query: {
          rf: this.$route.query.rf,
        },
      })
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
        this.loading = false
        await this.$store.commit('auth/UPDATE_AUTH')
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
    resetSecret () {
      this.$router.replace({
        path: '/auth/resetsecretquestion',
        query: {
          rf: this.$route.query.rf,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.wrap {
  width: 810px;
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
    margin-left: 10px;
  }
}
</style>
