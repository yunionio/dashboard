<template>
  <div class="login-body">
    <div class="login-left">
      <h2>OneCloud</h2>
      <a-carousel autoplay :dots="false">
        <div v-for="(item, idx) of tips" :key="idx">
          <h4>{{ item.title }}</h4>
          <p v-for="(msg, idx) of item.messages" :key="idx">{{ msg }}</p>
        </div>
      </a-carousel>
    </div>
    <div class="login-right">
      <div class="logo">
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path d="M498.372923 573.085538c-0.196923 2.363077-0.354462 4.765538-0.472615 7.128616-0.196923 3.032615-0.393846 6.065231-0.669539 9.058461-2.205538 22.409846-15.753846 34.934154-38.203077 35.249231a4428.8 4428.8 0 0 1-97.28 0c-23.394462-0.236308-39.030154-14.926769-38.912-36.470154 0.118154-21.661538 15.281231-35.249231 39.620923-35.406769l18.628923-0.039385 44.11077 0.039385 3.150769-11.579077c28.238769-105.117538 93.144615-167.187692 198.380308-189.794461l20.873846-4.489847-10.555077-18.432c-19.692308-34.500923-74.397538-60.494769-127.212308-60.494769-9.294769 0-18.235077 0.827077-26.663384 2.441846-75.539692 14.336-123.313231 66.284308-138.712616 150.449231l-1.142154 0.196923a282.505846 282.505846 0 0 0-28.356923 5.710769c-82.313846 22.291692-132.647385 98.225231-122.486154 184.635077 9.294769 78.611692 80.541538 141.587692 162.225231 143.36a2571.894154 2571.894154 0 0 0 111.340308 0 167.660308 167.660308 0 0 0 163.209846-161.831384c0.866462-25.166769 14.454154-40.172308 36.352-40.172308h0.748308c10.003692 0.157538 18.510769 3.544615 24.615384 9.846154 7.207385 7.364923 10.870154 18.313846 10.633846 31.625846a232.448 232.448 0 0 1-32.571076 114.372923c-2.599385 4.411077-5.238154 8.743385-8.349539 13.784616l-5.238154 8.546461-14.966154 24.536615 28.829539-0.866461c47.261538-1.457231 86.646154-18.550154 117.051077-50.806154 48.088615-51.121231 60.494769-111.891692 35.761231-175.773538-24.930462-64.512-75.697231-101.612308-146.747077-107.204923a154.387692 154.387692 0 0 0-12.091077-0.472616c-84.125538 0-158.089846 68.568615-164.903385 152.851692m-136.664615 253.873231c-116.696615-0.512-214.567385-77.508923-237.922462-187.273846-24.418462-114.412308 32.137846-224.019692 140.642462-272.738461 12.406154-5.553231 21.858462-17.723077 26.54523-27.293539C337.683692 244.972308 411.963077 196.923077 511.881846 196.923077h1.496616c100.115692 0.472615 174.198154 48.679385 220.16 143.36 5.592615 11.421538 16.147692 21.937231 26.978461 26.820923 96.886154 43.716923 152.300308 135.995077 144.620308 240.797538-8.625231 118.153846-107.52 213.976615-225.083077 218.112-18.589538 0.669538-38.439385 0.984615-62.424616 0.984616-17.408 0-34.816-0.157538-52.263384-0.315077-17.486769-0.157538-35.012923-0.354462-52.499692-0.354462h-15.714462v0.669539L465.526154 827.076923 418.146462 827.076923c-18.825846 0-37.612308 0-56.39877-0.118154" fill="#69AFE8" />
        </svg>
      </div>
      <div class="login">
        <h4>用户登录</h4>
        <a-form :form="form" @submit="handleSubmit">
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
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" block>登录</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Cookies from 'js-cookie'
import { STORE_SECRET_PERFIX_KEY, STORE_LAST_LOGIN_USERNAME_KEY } from './constants'
import storage from '@/utils/storage'

export default {
  name: 'Login',
  data () {
    return {
      loading: false,
      form: this.$form.createForm(this),
      decorator: {
        username: [
          'username',
          { rules: [{ required: true, message: '请输入用户名' }] },
        ],
        password: [
          'password',
          { rules: [{ required: true, message: '请输入密码' }] },
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
    ...mapGetters(['auth', 'userInfo']),
  },
  methods: {
    updateLastLoginUserName (currentUserName) {
      const lastLoginUserName = storage.get(STORE_LAST_LOGIN_USERNAME_KEY)
      if (lastLoginUserName !== currentUserName) {
        Cookies.remove('tenant')
        Cookies.remove('scope')
      }
      storage.set(STORE_LAST_LOGIN_USERNAME_KEY, currentUserName)
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields(async (err, values) => {
        if (err) return
        this.loading = true
        const data = { ...values }
        const tenant = Cookies.get('tenant')
        const scope = Cookies.get('scope')
        if (tenant) data.username = `${tenant}/${data.username}`
        if (scope) data.scope = scope
        try {
          const { loginResponse, userInfoResponse } = await this.$store.dispatch('auth/login', data)
          this.updateLastLoginUserName(userInfoResponse.name)
          this.onTotpLogin(loginResponse)
        } catch (error) {
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
        this.$router.push('/')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
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
    svg {
      width: 120px;
    }
  }
}
.login {
  margin: 5px 60px 20px;
  h4 {
    font-weight: normal;
    margin-bottom: 40px;
  }
}
</style>
