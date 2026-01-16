<template>
  <div>
    <a-form-model
      ref="form"
      :model="fd"
      :rules="rules"
      @submit.prevent.stop="handleLogin">
      <a-alert type="error" v-if="!isMobileChannelEnabled" :message="$t('auth.mobile.channel_not_ready')" banner />
      <!-- 用户名 -->
      <a-form-model-item prop="mobile">
        <a-input :disabled="!isMobileChannelEnabled" v-model="fd.mobile" :placeholder="placeholderOpts.mobile" :autocomplete="isForgetLoginUser?'off':'on'">
          <a-icon slot="prefix" type="mobile" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item>
      <!-- 域 -->
      <template v-if="showDomainSelect && regions.domains">
        <a-form-model-item prop="domain">
          <a-select v-model="fd.domain" :placeholder="placeholderOpts.domain">
            <a-select-option
              v-for="item in regions.domains"
              :key="item"
              :value="item">{{ item }}</a-select-option>
          </a-select>
        </a-form-model-item>
      </template>
      <!-- 区域 -->
      <template v-if="showRegionSelect">
        <a-form-model-item prop="region">
          <a-select v-model="fd.region" :placeholder="placeholderOpts.region">
            <a-select-option
              v-for="item in regions.regions"
              :key="item"
              :value="item">{{ item }}</a-select-option>
          </a-select>
        </a-form-model-item>
      </template>
      <!-- 验证码 -->
      <template>
        <a-form-model-item prop="captcha" class="captcha-form-item">
          <a-input v-model="fd.captcha" :placeholder="placeholderOpts.captcha" :disabled="captchaValid">
            <a-icon slot="prefix" type="safety-certificate" style="color: rgba(0, 0, 0, .25)" />
            <template #suffix>
              <div class="captcha-suffix d-flex align-items-center justify-content-end">
                <a-icon v-show="captchaLoading" slot="suffix" type="loading" style="color: rgba(0, 0, 0, .25)" />
                <img v-show="!captchaLoading && captchaImg" slot="suffix" :src="captchaImg" @click="fetchCaptcha" />
              </div>
            </template>
          </a-input>
        </a-form-model-item>
      </template>
      <!-- 手机验证码 -->
      <template>
        <a-form-model-item prop="verify" class="captcha-form-item">
          <a-input v-model="fd.verify" :placeholder="placeholderOpts.verify">
            <a-icon slot="prefix" type="file-text" style="color: rgba(0, 0, 0, .25)" />
            <template #suffix>
              <div class="captcha-suffix d-flex align-items-center justify-content-end">
                <a-button :disabled="!enableSendSmsCode" @click="getWebSmsCode" style="width: 100%" type="link">
                  {{ enableSendSmsCode && startCountDown ? $t('scope.text_325', [sendSmsCount]) : $t('scope.text_326') }}
                </a-button>
              </div>
            </template>
          </a-input>
        </a-form-model-item>
      </template>
      <!-- 确定按钮 -->
      <a-form-model-item class="mb-0">
        <a-button :disabled="!allowSubmit" type="primary" html-type="submit" :loading="submiting" block>{{ $t('auth.login.submit') }}</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
import * as R from 'ramda'
import { mapState } from 'vuex'
import { getLoginModeInStorage } from '@/utils/auth'
import CaptchaMixin from '@/mixins/captcha'

const maxSendSmsCount = 300

export default {
  name: 'LoginMobile',
  mixins: [CaptchaMixin],
  props: {
    placeholder: Object,
    formDataMapper: Function,
    formRules: {
      type: Object,
      default: () => ({}),
    },
    hiddenDomainSelect: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      placeholderOpts: {
        mobile: this.$t('auth.mobile.placeholder'),
        verify: this.$t('auth.verify.placeholder'),
        captcha: this.$t('auth.captcha.placeholder'),
        domain: this.$t('auth.domain.placeholder'),
        region: this.$t('auth.region.placeholder'),
        ...this.placeholder,
      },
      fd: {
        mobile: this.$route.query.mobile || '',
        verify: '',
        captcha: '',
        domain: undefined,
        region: undefined,
      },
      rules: R.mergeDeepWith(R.concat, {
        mobile: [
          { required: true, message: this.$t('auth.mobile.validate'), trigger: 'blur' },
          { validator: this.checkPhone, trigger: 'blur' },
        ],
        verify: [
          { required: true, message: this.$t('auth.verify.validate') },
        ],
        captcha: [
          { required: true, min: 4, max: 4, message: this.$t('auth.captcha.validate'), trigger: ['blur', 'change'] },
          {
            validator: this.validateCaptcha, trigger: ['blur', 'change'],
          },
        ],
        domain: [
          { required: true, message: this.$t('auth.domain.validate') },
        ],
        region: [
          { required: true, message: this.$t('auth.region.validate') },
        ],
      }, this.formRules),
      showDomainSelect: false,
      captchaLoading: false,
      captchaImg: '',
      submiting: false,
      showUsernameInput: !this.$route.query.username,
      showSetDomainPopover: false,
      loginDomain: '',
      domainInputRules: [
        { required: false, message: `${this.$t('common.placeholder')} ${this.$t('common.login_domain')}` },
      ],
      passwordReadonly: true,
      inputType: 'text',
      mobileValid: false,
      captchaValid: false,
      startCountDown: false,
      sendSmsCount: maxSendSmsCount,
      timer: null,
      uid: '',
    }
  },
  computed: {
    ...mapState('auth', {
      regions: state => state.regions,
      loggedUsers: state => state.loggedUsers,
    }),
    isForgetLoginUser () {
      return this.regions.is_forget_login_user
    },
    showRegionSelect () {
      return this.regions.regions.length > 1
    },
    showDomainChooser () {
      return !this.regions.return_full_domains
    },
    enableSendSmsCode () {
      return this.mobileValid && this.captchaValid
    },
    allowSubmit () {
      return this.uid && this.uid.length > 0 && this.fd.verify && this.fd.verify.length === 6
    },
    isMobileChannelEnabled () {
      return this.regions.mobile_channel_enabled
    },
    sendSmsCountDownSeconds () {
      return this.regions.mobile_code_expire_minutes * 60
    },
  },
  watch: {
    startCountDown (val) {
      if (val) {
        this.clearTimer()
        this.timer = setInterval(() => {
          if (this.sendSmsCount > 0) {
            this.sendSmsCount--
          } else {
            this.startCountDown = false
            this.sendSmsCount = this.sendSmsCountDownSeconds
            this.clearTimer()
          }
        }, 1000)
      }
    },
  },
  created () {
    if (this.$route.query.domain) {
      this.loginDomain = this.$route.query.domain
    }
    if (this.$route.query.fd_domain) {
      this.fd.domain = this.$route.query.fd_domain
    }
    this.fetchCaptcha()
  },
  mounted () {
    this.initMobile()
  },
  destroyed () {
    this.clearTimer()
  },
  methods: {
    clearTimer () {
      clearInterval(this.timer)
      this.timer = null
    },
    // 获取验证码图片
    async fetchCaptcha () {
      this.captchaValid = false
      this.captchaLoading = true
      try {
        const response = await this.$http('/v1/auth/captcha', {
          responseType: 'arraybuffer',
          params: {
            epochstr: +new Date(),
          },
        })
        this.captchaImg = `data:;base64,${Buffer.from(response.data, 'binary').toString('base64')}`
        this.fd.captcha = ''
        this.initCaptchaTimer && this.initCaptchaTimer()
      } catch (error) {
        throw error
      } finally {
        this.captchaLoading = false
      }
    },
    // 校验验证码
    async validateCaptcha (rule, value, callback) {
      setTimeout(() => {
        const fd = this.formDataMapper ? this.formDataMapper({ ...this.fd }) : { ...this.fd }
        if (fd.captcha.length !== 4) {
          this.captchaValid = false
        }
      }, 200)
      if (typeof value === 'string' && value.length !== 4) {
        this.captchaValid = false
        return callback(this.$t('auth.captcha.validate.fial'))
      }
      if (this.captchaValid) {
        console.log('no need to verify captcha')
        return true
      }
      try {
        const response = await this.$http.post('/v1/auth/captcha', { captcha: value })
        if (response.data.vali) {
          console.log('captach is valid')
          this.captchaValid = true
          return callback()
        }
        console.log('captcha is invalid')
        this.captchaValid = false
        return callback(this.$t('auth.captcha.validate.fial'))
      } catch (error) {
        callback(this.$t('auth.captcha.validate.fial'))
        this.fetchCaptcha()
        throw error
      }
    },
    checkPhone (rule, value, callback) {
      this.$validate('phone')
      const reg = /^1[0-9-]{10}$/
      if (reg.test(value)) {
        console.log('mobile ' + value + ' is valid')
        this.mobileValid = true
        return callback()
      } else {
        console.log('mobile ' + value + ' is invalid')
        this.mobileValid = false
        return callback(this.$t('validator.phone'))
      }
    },
    async getWebSmsCode () {
      if (this.startCountDown) return
      try {
        const data = {}
        const fd = this.formDataMapper ? this.formDataMapper({ ...this.fd }) : { ...this.fd }
        data.mobile = fd.mobile
        data.captcha = fd.captcha
        const response = await this.$http.post('/v1/auth/trigger-verify', data)
        this.uid = response.data.uid
        this.startCountDown = true
        this.sendSmsCount = this.sendSmsCountDownSeconds
      } catch (error) {
        console.log(error)
      }
    },
    // 点击登录事件
    async handleLogin () {
      try {
        await this.$refs.form.validate()
        // ------------ 拼接请求所需数据 start ------------
        const data = {}
        // 检查parent是否要处理表单数据
        const fd = this.formDataMapper ? this.formDataMapper({ ...this.fd }) : { ...this.fd }
        data.uid = this.uid
        data.verify_code = fd.verify
        data.contact_type = 'mobile'
        data.mobile = fd.mobile
        if (fd.captcha) data.captcha = fd.captcha
        if (fd.region) {
          data.region = fd.region
          this.$store.commit('SET_REGION', data.region)
        }
        if (fd.domain) data.domain = fd.domain
        if (!data.domain && this.loginDomain) {
          data.domain = this.loginDomain
        }
        // ------------ 拼接请求所需数据 end ------------
        this.submiting = true
        await this.$store.commit('auth/SET_LOGIN_FORM_DATA', data)
        await this.$store.dispatch('auth/login', data)
        await this.$emit('after-login')
        await this.$store.dispatch('auth/onAfterLogin')
      } catch (error) {
        // 登录失败，如果domain已存在则清除domain，主要是应对历史账号存储的domain被更改的情况。（异常情况）
        if (this.fd.domain) {
          this.fd.domain = ''
        }
        // 409 则显示 domain 选择框 并 刷新验证码
        if (error.response && error.response.status === 409 && !this.hiddenDomainSelect) {
          this.showDomainSelect = true
        }
        this.showUsernameInput = true
        this.fetchCaptcha()
        this.submiting = false
        throw error
      }
    },
    inputFocus (item) {
      this.passwordReadonly = false
      this.inputType = 'password'
    },
    inputBlur (item) {
      this.passwordReadonly = true
    },
    initMobile () {
      const { mode, content } = getLoginModeInStorage() || {}
      if (mode === 'mobile') {
        this.fd.mobile = content
        this.$refs.form.validateField('mobile')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.captcha-suffix {
  height: 28px;
  width: 98px;
  > img {
    width: 100%;
  }
}
.captcha-form-item {
  ::v-deep {
    .ant-input-affix-wrapper .ant-input-suffix {
      padding-right: 0px !important;
    }
  }
}
.selected-user-wrap {
  height: 32px;
}
.selected-user-content {
  align-items: center;
  border: 1px solid #d9d9d9;
  color: #3c4043;
  cursor: pointer;
  display: inline-flex;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: .25px;
  max-width: 100%;
  border-radius: 16px;
  padding: 5px 7px 5px 5px;
  .selected-user-name {
    direction: ltr;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &:hover {
    background: rgba(60,64,67,0.039);
  }
}
.name-icon {
  color: #fff;
  height: 22px;
  width: 22px;
  text-align: center;
  line-height: 22px;
  border-radius: 50%;
  background-color: #1890ff;
  font-size: 12px;
}
.login-domain-title {
  color: #999;
  > div {
    width: 100%;
    height: 1px;
    margin-bottom: 50px;
  }
}
.login-link {
  line-height: 23px;
}
</style>
