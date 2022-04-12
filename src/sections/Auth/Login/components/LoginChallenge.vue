<template>
  <div>
    <div v-if="showUsernameInput && loginDomain" class="login-domain-title d-flex justify-content-center align-items-center">
      <div class="selected-user-wrap d-flex justify-content-center flex-wrap p-1 align-items-center">
        <div class="selected-user-name">{{ $t('auth.current.domain') }}: {{ loginDomain }}</div>
        <div class="ml-2 d-flex">
          <a-popover v-model="showSetDomainPopover" :title="$t('auth.set.current.domain')" trigger="click">
            <a-tooltip :title="$t('auth.click.set.current.domain')">
              <a-button icon="form" type="link" />
            </a-tooltip>
            <edit-form slot="content" :width="450" :formRules="domainInputRules" :defaultValue="loginDomain" :label="$t('common.login_domain')" @submit="submitLoginDomain" @cancel="showSetDomainPopover = false" />
          </a-popover>
        </div>
      </div>
    </div>
    <template v-if="!showUsernameInput">
      <div class="selected-user-wrap text-center mb-4">
        <div class="selected-user-content" @click="$router.replace({ path: '/auth/login/chooser', query: { rf: $route.query.rf } })">
          <div class="mr-2 name-icon">{{ firstNameWord }}</div>
          <div class="selected-user-name">{{ displayUserName }}</div>
          <div class="ml-2 d-flex align-items-center">
            <svg aria-hidden="true" fill="currentColor" focusable="false" width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><polygon points="12,16.41 5.29,9.71 6.71,8.29 12,13.59 17.29,8.29 18.71,9.71" /></svg>
          </div>
        </div>
      </div>
    </template>
    <a-form-model
      ref="form"
      :model="fd"
      :rules="rules"
      @submit.prevent.stop="handleLogin">
      <!-- 用户名 -->
      <template v-if="showUsernameInput">
        <a-form-model-item prop="username">
          <a-input v-model="fd.username" :placeholder="placeholderOpts.username" :autocomplete="isForgetLoginUser?'off':'on'">
            <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, .25)" />
          </a-input>
        </a-form-model-item>
      </template>
      <!-- 密码 -->
      <a-form-model-item v-if="isForgetLoginUser" prop="password">
        <a-input type="text" style="display: none" />
        <a-input :type="inputType" v-model="fd.password" :placeholder="placeholderOpts.password" autocomplete="new-password" :readonly="passwordReadonly" @focus="inputFocus" @blur="inputBlur">
          <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item v-else prop="password">
        <a-input-password v-model="fd.password" :placeholder="placeholderOpts.password">
          <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
        </a-input-password>
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
      <template v-if="showCaptchaInput">
        <a-form-model-item prop="captcha" class="captcha-form-item">
          <a-input v-model="fd.captcha" :placeholder="placeholderOpts.captcha">
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
      <!-- 确定按钮 -->
      <a-form-model-item class="mb-0">
        <a-button type="primary" html-type="submit" :loading="submiting" block>{{ $t('auth.login.submit') }}</a-button>
      </a-form-model-item>
      <!-- 额外操作 -->
      <a-form-model-item class="mb-0">
        <div class="d-flex justify-content-between login-link">
          <div class="flex-shrink-1 flex-grow-1 text-left">
            <template v-if="hasLoggedUsers">
              <a class="week-link-button" @click="$router.replace({ path: '/auth/login/chooser', query: { rf: $route.query.rf, domain: $route.query.domain } })">{{ $t('auth.chooser') }}</a>
            </template>
          </div>
          <div class="flex-shrink-1 flex-grow-1 text-right">
            <template v-if="showDomainChooser && showUsernameInput && !loginDomain">
              <a-popover v-model="showSetDomainPopover" :title="$t('auth.set.current.domain')" trigger="click">
                <a class="week-link-button">{{ $t('common.switch_login_domain') }}</a>
                <edit-form slot="content" :width="450" :formRules="domainInputRules" :defaultValue="loginDomain" :label="$t('common.login_domain')" @submit="submitLoginDomain" @cancel="showSetDomainPopover = false" />
              </a-popover>
            </template>
          </div>
        </div>
      </a-form-model-item>
      <a-form-model-item class="mb-0">
        <div class="d-flex justify-content-between login-link">
          <div class="flex-shrink-1 flex-grow-1 text-left">
            <slot name="actions-left" />
          </div>
          <div class="flex-shrink-1 flex-grow-1 text-right">
            <slot name="actions-right" />
          </div>
        </div>
      </a-form-model-item>
    </a-form-model>
    <!-- 第三方登录 -->
    <div class="flex-shrink-0 flex-grow-0">
      <template v-if="showUsernameInput && idps.length > 0">
        <div class="fast-login-wrap">
          <div class="fast-login-title d-flex justify-content-center align-items-center"><span class="mr-2" />{{ $t('auth.login.fast.login.title') }}<span class="ml-2" /></div>
          <div class="d-flex justify-content-center flex-wrap p-1">
            <div class="fast-login-items" :key="idx" v-for="(item, idx) of idps">
              <a class="fast-login-item d-flex align-items-center justify-content-center ml-2 mr-2" @click="handleClickIdp(item)">
                <a-tooltip placement="top" :title="$t(`idpTmplTitles.${item.template || item.driver}`)">
                  <template slot="title">
                    <span>{{ item.tooltip }}</span>
                  </template>
                  <img :src="getIcon(item)" />
                </a-tooltip>
              </a>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import * as R from 'ramda'
import { mapState } from 'vuex'
import { aesEncrypt } from '@/utils/crypto'
import { setLoginDomain, getLoginDomain } from '@/utils/common/cookie'
// import { removeQueryKeys } from '@/utils/utils'
import EditForm from '@/components/Edit/Form'
import { setSsoIdpIdInCookie, removeSsoIdpIdInCookie } from '@/utils/auth'
export default {
  name: 'LoginChallenge',
  components: {
    EditForm,
  },
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
        username: this.$t('auth.username.placeholder'),
        password: this.$t('auth.password.placeholder'),
        captcha: this.$t('auth.captcha.placeholder'),
        domain: this.$t('auth.domain.placeholder'),
        region: this.$t('auth.region.placeholder'),
        ...this.placeholder,
      },
      fd: {
        username: this.$route.query.username || '',
        password: '',
        captcha: '',
        domain: undefined,
        region: undefined,
      },
      rules: R.mergeDeepWith(R.concat, {
        username: [
          { required: true, message: this.$t('auth.username.validate') },
        ],
        password: [
          { required: true, message: this.$t('auth.password.validate') },
        ],
        captcha: [
          { required: true, min: 4, max: 4, message: this.$t('auth.captcha.validate'), trigger: 'change' },
          { validator: this.validateCaptcha, trigger: 'submit' },
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
    idps () {
      return this.regions.idps || []
    },
    showRegionSelect () {
      return this.regions.regions.length > 1
    },
    showCaptchaInput () {
      return this.regions.captcha === true
    },
    showDomainChooser () {
      return !this.regions.return_full_domains
    },
    firstNameWord () {
      const word = (this.$route.query.displayname || this.$route.query.username || '').split('')[0]
      return word && word.toUpperCase()
    },
    hasLoggedUsers () {
      const data = Object.entries(this.loggedUsers)
      return data.length > 0 && !this.isForgetLoginUser
    },
    displayUserName () {
      const user = this.fd.username
      const domain = this.fd.domain ? this.fd.domain : this.loginDomain
      if (user === domain) {
        return user
      } else {
        return `${user} - ${domain}`
      }
    },
  },
  watch: {
    showCaptchaInput: {
      handler (val) {
        if (val === true) {
          this.fetchCaptcha()
        }
      },
      immediate: true,
    },
  },
  created () {
    if (this.$route.query.domain) {
      this.loginDomain = this.$route.query.domain
    } else if (getLoginDomain()) {
      this.loginDomain = getLoginDomain()
    }
    if (this.$route.query.fd_domain) {
      this.fd.domain = this.$route.query.fd_domain
    }
  },
  methods: {
    // 获取验证码图片
    async fetchCaptcha () {
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
      } catch (error) {
        throw error
      } finally {
        this.captchaLoading = false
      }
    },
    // 校验验证码
    async validateCaptcha (rule, value, callback) {
      try {
        const response = await this.$http.post('/v1/auth/captcha', { captcha: value })
        if (response.data.vali) {
          return callback()
        }
        return callback(this.$t('auth.captcha.validate.fial'))
      } catch (error) {
        callback(this.$t('auth.captcha.validate.fial'))
        this.fetchCaptcha()
        throw error
      }
    },
    // 点击登录事件
    async handleLogin () {
      this.submiting = true
      try {
        await this.$refs.form.validate()
        // ------------ 拼接请求所需数据 start ------------
        const data = {}
        // 检查parent是否要处理表单数据
        const fd = this.formDataMapper ? this.formDataMapper({ ...this.fd }) : { ...this.fd }
        data.username = fd.username
        data.password = aesEncrypt(fd.password)
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
        await this.$store.commit('auth/SET_LOGIN_FORM_DATA', data)
        await this.$store.dispatch('auth/login', data)
        await this.$emit('after-login')
        await this.$store.dispatch('auth/onAfterLogin')
        // ---- save login domain ---- //
        if (this.loginDomain && this.showDomainChooser) {
          setLoginDomain(this.loginDomain)
        }
        removeSsoIdpIdInCookie()
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
    getIcon (idp) {
      const { template, driver } = idp
      const key = (template || driver).toLocaleLowerCase()
      return require(`../../../../assets/images/idp-icons/round/${key}.png`)
    },
    handleClickIdp (idpItem) {
      if (this.loginDomain && this.showDomainChooser) {
        setLoginDomain(this.loginDomain)
      }
      const { origin, search } = window.location
      const { id } = idpItem
      setSsoIdpIdInCookie(id)
      window.location.href = `${origin}/api/v1/auth/sso/redirect/${id}${search || ''}`
    },
    submitLoginDomain (value) {
      this.showSetDomainPopover = false
      this.changeDomain(value.input)
    },
    changeDomain (domain) {
      var params = { rf: this.$route.query.rf }
      if (domain) {
        params.domain = domain
      }
      this.loginDomain = domain
      this.$store.dispatch('auth/getRegions', params)
      this.$router.replace({ path: '/auth/login', query: params })
    },
    inputFocus (item) {
      this.passwordReadonly = false
      this.inputType = 'password'
    },
    inputBlur (item) {
      this.passwordReadonly = true
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
