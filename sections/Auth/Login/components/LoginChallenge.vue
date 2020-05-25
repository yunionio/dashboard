<template>
  <div>
    <a-form-model
      ref="form"
      :model="fd"
      :rules="rules"
      @submit.prevent.stop="handleLogin">
      <!-- 用户名 -->
      <a-form-model-item prop="username" v-if="showUsernameInput">
        <a-input class="material-input" v-model="fd.username" :placeholder="placeholderOpts.username">
          <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item>
      <!-- 密码 -->
      <a-form-model-item prop="password">
        <a-input-password class="material-input" v-model="fd.password" :placeholder="placeholderOpts.password">
          <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
        </a-input-password>
      </a-form-model-item>
      <!-- 域 -->
      <template v-if="showDomainSelect">
        <a-form-model-item prop="domain">
          <a-select class="material-input" v-model="fd.domain" :placeholder="placeholderOpts.domain">
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
          <a-select class="material-input" v-model="fd.region" :placeholder="placeholderOpts.region">
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
          <a-input class="material-input" v-model="fd.captcha" :placeholder="placeholderOpts.captcha">
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
      <a-form-model-item>
        <a-button type="primary" html-type="submit" :loading="submiting" block>{{ $t('auth.login.submit') }}</a-button>
      </a-form-model-item>
      <!-- 额外操作 -->
      <a-form-model-item>
        <div class="d-flex">
          <div class="flex-shrink-1 flex-grow-1 text-left" style="margin-left: -15px;">
            <template v-if="showChooserBtn">
              <a-button type="link" @click="$router.replace('/auth/login/chooser')" class="week-link-button">{{ $t('auth.chooser') }}</a-button>
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
import { mapState } from 'vuex'
import { Base64 } from 'js-base64'

export default {
  name: 'LoginChallenge',
  props: {
    placeholder: Object,
    formDataMapper: Function,
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
      rules: {
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
      },
      showDomainSelect: false,
      captchaLoading: false,
      captchaImg: '',
      submiting: false,
      showUsernameInput: !this.$route.query.username,
      showChooserBtn: false,
    }
  },
  computed: {
    ...mapState('auth', {
      historyUsers: state => state.historyUsers,
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
    // showChooserBtn 没使用compute。主要希望只触发一次
    this.showChooserBtn = Object.keys(this.historyUsers).length > 0
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
        let fd = this.formDataMapper ? this.formDataMapper({ ...this.fd }) : { ...this.fd }
        data.username = fd.username
        data.password = Base64.encode(fd.password)
        if (fd.captcha) data.captcha = fd.captcha
        if (fd.region) {
          data.region = fd.region
          this.$store.commit('SET_REGION', data.region)
        }
        if (fd.domain) data.domain = fd.domain
        // ------------ 拼接请求所需数据 end ------------
        const response = await this.$store.dispatch('auth/login', data)
        await this.$store.dispatch('auth/getInfo')
        await this.$emit('after-login')
        await this.$store.dispatch('auth/onAfterLogin', response)
      } catch (error) {
        // 409 则显示 domain 选择框 并 刷新验证码
        if (error.response && error.response.status === 409) {
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

<style lang="scss" scoped>
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
</style>
