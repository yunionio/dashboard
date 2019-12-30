<template>
  <div class="login-body">
    <div class="login-left" :style="{ height: `${panelHeight}px` }">
      <h2>{{ $store.state.app.companyInfo.name }}</h2>
      <a-carousel autoplay :dots="false">
        <div v-for="(item, idx) of tips" :key="idx">
          <h4>{{ item.title }}</h4>
          <p v-for="(msg, idx) of item.messages" :key="idx">{{ msg }}</p>
        </div>
      </a-carousel>
    </div>
    <div class="login-right" :style="{ height: `${panelHeight}px` }">
      <div class="logo">
        <img :src="loginLogo" />
      </div>
      <div class="login">
        <h4>用户登录</h4>
        <a-form :form="form.fc" @submit="handleSubmit">
          <a-form-item>
            <a-input class="material-input" v-decorator="decorator.username" placeholder="请输入用户名">
              <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, .25)" />
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input class="material-input" v-decorator="decorator.password" type="password" placeholder="请输入密码">
              <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
            </a-input>
          </a-form-item>
           <!--- 如果超过3个 domain，为了后端验证效率，还是在前端选择domain -->
          <a-form-item v-if="form.fi.showDomain">
            <a-select class="material-input" v-decorator="decorator.domain" placeholder="请选择认证域">
              <a-select-option
                v-for="item in form.fi.domains"
                :key="item"
                :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="showRegion">
            <a-select class="material-input" v-decorator="decorator.region" placeholder="请选择区域">
              <a-select-option
                v-for="item in form.fi.regions"
                :key="item"
                :value="item">{{ item }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="form.fi.showCaptcha">
            <a-input class="material-input" v-decorator="decorator.captcha" placeholder="验证码">
              <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
              <template>
                <a-icon v-show="form.fi.captchaLoading" slot="suffix" type="loading" style="color: rgba(0, 0, 0, .25)" />
                <img v-show="!form.fi.captchaLoading" class="captcha-img" slot="suffix" :src="form.fi.captchaImg" @load="captchaLoadHandle" @error="captchaErrorHandle" @click="fetchCaptcha" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" block>登录</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="sso-login" v-if="casServerUrl">
        <div class="sso-login-title d-flex justify-content-center align-items-center"><span class="mr-2" />其他登录<span class="ml-2" /></div>
        <div class="sso-login-items mt-2 mb-2">
          <a class="sso-login-item d-flex align-items-center justify-content-center ml-2 mr-2" :href="casServerUrl">
            <a-tooltip placement="top">
              <template slot="title">
                <span>CAS登录</span>
              </template>
              <img src="./assets/cas.png" />
            </a-tooltip>
          </a>
        </div>
      </div>
    </div>
    <p class="browser-update" v-if="!isChrome">为了获取更好的产品体验，请使用 Chrome 最新版本的浏览器</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Cookies from 'js-cookie'
import { STORE_SECRET_PERFIX_KEY } from './constants'
import storage from '@/utils/storage'
import { isChrome } from '@/utils/utils'

export default {
  name: 'Login',
  data () {
    const captchaValidator = (rule, value, callback) => {
      const msg = '验证码错误'
      if (value.length !== 4) {
        callback(msg)
        return
      }
      this.$http.post('/v1/auth/captcha', { captcha: value }).then((res) => {
        if (res.data.vali) {
          callback()
        } else {
          callback(msg)
        }
      }).catch(() => {
        this.fetchCaptcha()
        callback(msg)
      })
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          captchaLoading: false,
          captchaImg: '',
          regions: [],
          domains: [],
          idps: [],
          showDomain: false,
          showCaptcha: false,
        },
      },
      decorator: {
        username: [
          'username',
          { rules: [{ required: true, message: '请输入用户名' }] },
        ],
        password: [
          'password',
          { rules: [{ required: true, message: '请输入密码' }] },
        ],
        domain: [
          'domain',
        ],
        region: [
          'region',
        ],
        captcha: [
          'captcha',
          {
            validateFirst: true,
            validateTrigger: 'submit',
            rules: [
              { required: true, message: '请输入验证码' },
              { validator: captchaValidator },
            ],
          },
        ],
      },
      tips: [
        { title: '统一', messages: ['统一模版/API/调度/账号体系/监控/控制台/计费计量', '实现物理机/虚拟机/容器/公有云资源全面纳管'] },
        { title: '易用', messages: ['开箱即用，30分钟快速安装部署', '支持在线升级、易于运维管理和使用', '产品化+定制化有机结合'] },
        { title: '安全', messages: ['基于项目的多租户隔离', '统一账户权限管理体系', '统一登陆入口、降低跨云账户安全隐患'] },
        { title: '开放', messages: ['所有功能通过REST API开放，提供多语言SDK', '扩展性好，易于和第三方系统集成', '通过“开源+商业支持服务”的方式，向企业级客户交付更好用的多云管理平台'] },
      ],
    }
  },
  computed: {
    ...mapGetters(['auth', 'userInfo', 'loginLogo']),
    casConfig () {
      const cas = this.form.fi.idps.find(item => item.driver === 'cas')
      return cas && cas.config
    },
    casServerUrl () {
      return this.casConfig && `${this.casConfig.cas.cas_server_url}?service=${this.casConfig.cas.service}`
    },
    showRegion () {
      return this.form.fi.regions.length > 1
    },
    panelHeight () {
      let h = 550
      const a = [true, true, this.form.fi.showDomain, this.showRegion, this.form.fi.showCaptcha, true]
      const l = a.filter(item => item).length
      if (l > 5) h = 650
      return h
    },
    isChrome () {
      return isChrome()
    },
  },
  async created () {
    if (this.$route.query.ticket) {
      this.ssoLogin()
    } else {
      this.loading = true
      try {
        let isRegister = true
        if (this.$appConfig.isPrivate) {
          isRegister = await this.fetchRegisterStatus()
        }
        if (!isRegister) {
          this.$router.push({ name: 'Register' })
        } else {
          this.fetchCaptcha()
          this.fetchRegions()
        }
      } catch (error) {
        this.loading = false
      }
    }
  },
  methods: {
    async fetchRegisterStatus () {
      this.loading = true
      try {
        const { data } = await this.$http.get('/v1/registers/status')
        if (data.status === 'true') return true
        return false
      } catch (error) {
        throw error
      }
    },
    async fetchRegions () {
      this.loading = true
      try {
        const { data: { domains, regions, idps, captcha } } = await this.$http.get('/v1/auth/regions')
        if (regions) this.form.fi.regions = regions
        if (domains) this.form.fi.domains = domains
        if (idps) this.form.fi.idps = idps
        if (captcha) this.form.fi.showCaptcha = true
      } finally {
        this.loading = false
      }
    },
    fetchCaptcha () {
      this.form.fi.captchaLoading = true
      let epochstr = +new Date()
      this.captchaImg = ''
      let url = '/api/v1/auth/captcha?rand=' + epochstr
      this.form.fi.captchaImg = url
    },
    captchaLoadHandle () {
      this.form.fi.captchaLoading = false
    },
    captchaErrorHandle () {
      this.form.fi.captchaLoading = false
    },
    async ssoLogin (ticket) {
      this.loading = true
      try {
        const loginResponse = await this.$store.dispatch('auth/login', {
          cas_ticket: this.$route.query.ticket,
        })
        this.onTotpLogin(loginResponse)
      } catch (error) {
        this.loading = false
      }
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.fc.validateFields(async (err, values) => {
        if (err) return
        this.loading = true
        const data = { ...values }
        const tenant = Cookies.get('tenant')
        const scope = Cookies.get('scope')
        // set region cookie
        const region = values.region || this.form.fi.regions[0]
        if (region) {
          Cookies.set('region', region, { expires: 7 })
        }
        if (tenant) data.username = `${tenant}/${data.username}`
        if (scope) data.scope = scope
        try {
          const loginResponse = await this.$store.dispatch('auth/login', data)
          this.onTotpLogin(loginResponse)
        } catch (error) {
          if (error.response.status === 409) {
            this.form.fi.showDomain = true
          }
          this.loading = false
        }
      })
    },
    async onTotpLogin (res) {
      // 如果 data 不为空，则是 server 返回的首次绑定秘钥的二维码，存入 storage，以免刷新后重新登录丢失的问题
      if (res.data) storage.set(`${STORE_SECRET_PERFIX_KEY}${this.userInfo.name}`, res.data)
      // 如果获取到有效的二维码则进入首次初始化页面
      if (res.data || storage.get(`${STORE_SECRET_PERFIX_KEY}${this.userInfo.name}`)) {
        // 获取密码问题，如果设置过则直接进入绑定秘钥页面，没有跳转至设置密码问题页面
        try {
          const recoveryRes = await this.$store.dispatch('auth/getRecovery')
          this.loading = false
          if (recoveryRes.data) {
            this.$router.push({ name: 'BindSecret' })
          }
        } catch (error) {
          this.loading = false
          if (error.response.status === 404) {
            this.$router.push({ name: 'SetSecretQuestion' })
          }
        }
      } else if (this.auth.auth.totp_on) {
        this.loading = false
        // 如果开启了认证则进入输入秘钥页面
        this.$router.push({ name: 'SecretVerify' })
      } else {
        // 否则直接登录
        if (this.$appConfig.isPrivate) {
          window.location.href = this.$appConfig.v1Perfix
        } else {
          this.$router.push('/')
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables";

.login-body {
  width: 810px;
  height: 660px;
  position: relative;
}
.login-left {
  background-color: #69afe8;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 2 1'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2369afe8'/%3E%3Cstop offset='1' stop-color='%230c90e8'/%3E%3C/linearGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23052ee8' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23052ee8' stop-opacity='1'/%3E%3C/linearGradient%3E%3ClinearGradient id='c' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='2' y2='2'%3E%3Cstop offset='0' stop-color='%23052ee8' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23052ee8' stop-opacity='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='0' y='0' fill='url(%23a)' width='2' height='1'/%3E%3Cg fill-opacity='0.5'%3E%3Cpolygon fill='url(%23b)' points='0 1 0 0 2 0'/%3E%3Cpolygon fill='url(%23c)' points='2 1 2 0 0 0'/%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
  background-size: cover;
  width: 440px;
  height: 550px;
  position: absolute;
  left: 0;
  color: #fff;
  padding: 40px;
  h2 {
    color: #fff;
    margin-bottom: 40px;
  }
  h4 {
    color: #fff;
    margin-bottom: 20px;
  }
  p {
    font-size: 14px;
    color: #fff;
  }
}
.login-right {
  background-color: #fff;
  width: 370px;
  height: 550px;
  right: 0;
  position: absolute;
  .logo {
    text-align: right;
    margin-right: 30px;
    margin-top: 40px;
    img {
      height: 40px;
    }
  }
}
.browser-update {
  position: absolute;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  font-size: 12px;
  white-space: pre;
  letter-spacing: 0;
  line-height: 16px;
  color: $text-color-help;
}
.login {
  margin: 20px 60px 20px;
  h4 {
    font-weight: normal;
    margin-bottom: 40px;
  }
}
.sso-login {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
.sso-login-title {
  font-size: 12px;
  color: #999;
  > span {
    width: 40px;
    height: 1px;
    background-color: $border-color-base;
  }
}
.sso-login-item {
  height: 35px;
  overflow: hidden;
  img {
    height: 100%;
  }
}
.captcha-img {
  height: 28px;
  width: 98px;
}
</style>
