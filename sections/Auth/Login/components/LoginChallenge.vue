<template>
  <div>
    <template v-if="!showUsernameInput">
      <div class="selected-user-wrap text-center mb-4">
        <div class="selected-user-content" @click="$router.replace({ path: '/auth/login/chooser', query: { rf: $route.query.rf } })">
          <div class="mr-2 name-icon">{{ firstNameWord }}</div>
          <div class="selected-user-name">{{ fd.username }}</div>
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
          <a-input v-model="fd.username" :placeholder="placeholderOpts.username">
            <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, .25)" />
          </a-input>
        </a-form-model-item>
      </template>
      <!-- 密码 -->
      <a-form-model-item prop="password">
        <a-input-password v-model="fd.password" :placeholder="placeholderOpts.password">
          <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
        </a-input-password>
      </a-form-model-item>
      <!-- 域 -->
      <template v-if="showDomainSelect">
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
        <div class="d-flex">
          <div class="flex-shrink-1 flex-grow-1 text-left" style="margin-left: -15px;">
            <template v-if="hasLoggedUsers && showUsernameInput">
              <a-button type="link" @click="$router.replace({ path: '/auth/login/chooser', query: { rf: $route.query.rf } })" class="week-link-button">{{ $t('auth.chooser') }}</a-button>
            </template>
          </div>
          <div class="flex-shrink-1 flex-grow-1 text-right" style="margin-right: -15px;">
            <slot name="actions" />
          </div>
        </div>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
import * as R from 'ramda'
import { mapState } from 'vuex'
import { Base64 } from 'js-base64'

export default {
  name: 'LoginChallenge',
  props: {
    placeholder: Object,
    formDataMapper: Function,
    formRules: {
      type: Object,
      default: () => ({}),
    },
    hiddenDaminSelect: {
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
        domain: this.$route.query.domain,
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
      hasLoggedUsers: false,
    }
  },
  computed: {
    ...mapState('auth', {
      loggedUsers: state => state.loggedUsers,
    }),
    regions () {
      return this.$store.state.auth.regions
    },
    showRegionSelect () {
      return this.regions.regions.length > 1
    },
    showCaptchaInput () {
      return this.regions.captcha === true
    },
    firstNameWord () {
      const word = (this.$route.query.displayname || this.$route.query.username || '').split('')[0]
      return word && word.toUpperCase()
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
    // hasLoggedUsers 没使用compute。主要希望只触发一次
    this.hasLoggedUsers = Object.keys(this.loggedUsers).length > 0
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
        data.password = Base64.encode(fd.password)
        if (fd.captcha) data.captcha = fd.captcha
        if (fd.region) {
          data.region = fd.region
          this.$store.commit('SET_REGION', data.region)
        }
        if (fd.domain) data.domain = fd.domain
        // ------------ 拼接请求所需数据 end ------------
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
        if (error.response && error.response.status === 409 && !this.hiddenDaminSelect) {
          this.showDomainSelect = true
        }
        this.showUsernameInput = true
        this.fetchCaptcha()
        this.submiting = false
        throw error
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
</style>
