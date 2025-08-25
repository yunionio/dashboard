<template>
  <a-popover v-model="visible" trigger="click" placement="left">
    <template slot="content">
      <div v-if="mfaShow" class="wrap-inner">
        <h5 class="auth-base-title text-center">{{ $t('auth.secret.verify.title') }}</h5>
        <div class="verify-tip">{{ $t('auth.secret.reset.prefix1') }}</div>
        <div class="code-wrap d-flex justify-content-center">
          <security-code ref="security-code" is-small v-model="securityCode" :error="error" @completed="onValid" @clear="onClear" blurOnComplete />
        </div>
        <div class="status-tip">
          <div v-if="error" class="error">{{ $t('auth.secret.validate') }}</div>
          <div v-if="mfaLoading" class="loading"><a-icon type="sync" spin />{{ $t('auth.secret.loading') }}</div>
        </div>
      </div>
      <a-icon type="sync" spin v-else-if="infoShow && loading" />
      <div v-else-if="infoShow && !loading" class="info-wrapper">
        <div>
          <span class="label inline-block">{{$t('compute.text_1017')}}：</span>
          <span class="inline-block"><list-body-cell-wrap copy alwaysShowCopyBtn field="vnc_type" :row="form" /></span>
        </div>
        <div class="mt-2">
          <span class="label inline-block">{{$t('compute.text_386')}}：</span>
          <span class="inline-block"><list-body-cell-wrap copy alwaysShowCopyBtn field="ip" :row="form" /></span>
        </div>
        <div class="mt-2">
          <span class="label inline-block">{{$t('compute.text_349')}}：</span>
          <span class="inline-block"><list-body-cell-wrap copy alwaysShowCopyBtn field="port" :row="form" /></span>
        </div>
        <div class="mt-2">
          <span class="label inline-block">{{$t('compute.text_340')}}：</span>
          <span class="inline-block"><list-body-cell-wrap copy alwaysShowCopyBtn field="password" :row="form" /></span>
        </div>
      </div>
    </template>
    <div>
      <div class="info-btn d-flex justify-content-center pl-2 pr-2" @click.stop="handleWrapClick">
        <span @click.stop="handleButtonClick" style="font-size: 12px">{{buttonText}}</span>
        <span class="ml-2" @click.stop="handleKeyClick">
          <icon size="12" class="keypair-icon" type="keypairs" fill="#555" />
        </span>
      </div>
    </div>
  </a-popover>
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VncInfoFetcher',
  mixins: [WindowsMixin],
  props: {
    onManager: Function,
    row: Object,
    buttonText: String,
    buttonProps: Object,
  },
  data () {
    return {
      securityCode: '',
      error: false,
      visible: false,
      mfaShow: false,
      infoShow: false,
      loading: false,
      form: {
        vnc_type: '',
        ip: '',
        port: '',
        password: '',
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'auth']),
    enableMFA () {
      return this.userInfo.enable_mfa && this.auth.auth.system_totp_on
    },
  },
  watch: {
    securityCode (val) {
      if (val.length < 6) {
        this.error = false
      }
    },
  },
  methods: {
    handleWrapClick (e) {
      this.$nextTick(() => {
        if (this.visible) return
        this.buttonProps.onClick(e)
      })
    },
    handleButtonClick (e) {
      this.$nextTick(() => {
        if (this.visible) return
        this.buttonProps.onClick(e)
      })
    },
    handleKeyClick () {
      if (this.visible) return
      if (this.enableMFA) {
        this.mfaShow = true
        this.visible = true
      } else {
        this.visible = true
        this.fetchInfo()
      }
    },
    async fetchInfo () {
      this.loading = true
      this.infoShow = true
      this.mfaShow = false
      this.securityCode = ''
      try {
        const { data = {} } = await new this.$Manager('servers', 'v2').getSpecific({
          id: this.row.id,
          spec: 'vnc',
        })
        this.form.vnc_type = data.protocol || '-'
        this.form.ip = data.host || '-'
        this.form.port = data.port || '-'
        this.form.password = data.password || '-'
        this.loading = false
      } catch (err) {
        this.loading = false
        throw err
      }
    },

    async onValid () {
      this.mfaLoading = true
      try {
        await this.$store.dispatch('auth/validPasscode', {
          passcode: this.securityCode,
        })
        this.mfaLoading = false
        await this.$store.commit('auth/UPDATE_AUTH')
        this.fetchInfo()
      } catch (error) {
        this.error = true
        this.mfaLoading = false
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
@import '~@/styles/less/theme';
.info-btn:hover{
  color: @primary-color;
}
.info-wrapper {
  font-size: 14px;
}
.label {
  width: 100px;
}
.inline-block {
  display: inline-block;
}

.wrap {
  width: 810px;
  position: relative;
}
.wrap-inner {
  padding: 10px 20px 0 20px;
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
  margin-bottom: 20px;
  .reset-secret-btn {
    margin-left: 10px;
  }
}
</style>
