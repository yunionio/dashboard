<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.action || $t('common.remote_control')}}</div>
    <div slot="body">
      <div class="wrap-inner">
        <h5 class="auth-base-title text-center">{{ $t('auth.secret.verify.title') }}</h5>
        <div class="verify-tip">{{ $t('auth.secret.reset.prefix1') }}</div>
        <div class="code-wrap d-flex justify-content-center">
          <security-code ref="security-code" v-model="securityCode" :error="error" @completed="onValid" @clear="onClear" blurOnComplete />
        </div>
        <div class="status-tip">
          <div v-if="error" class="error">{{ $t('auth.secret.validate') }}</div>
          <div v-if="loading" class="loading"><a-icon type="sync" spin />{{ $t('auth.secret.loading') }}</div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SecretVertifyDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      securityCode: '',
      error: false,
      loading: false,
    }
  },
  computed: {
  },
  watch: {
    securityCode (val) {
      if (val.length < 6) {
        this.error = false
      }
    },
  },
  mounted () {
    setTimeout(() => {
      this.$refs['security-code'].focusInput(1)
    }, 100)
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
        this.params.success && this.params.success()
        this.cancelDialog()
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
