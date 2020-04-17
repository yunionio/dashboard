<template>
  <div class="register-body">
    <div class="logo mb-2">
      <img :src="logo" />
    </div>
    <h4>管理员注册</h4>
    <a-form :form="form.fc" @submit="handleSubmit">
      <a-form-item>
        <a-input class="material-input" v-decorator="decorator.account_name" placeholder="管理员账号">
          <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input class="material-input" v-decorator="decorator.account_password" type="password" placeholder="请输入密码">
          <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input class="material-input" v-decorator="decorator.company" placeholder="请输入企业名称">
          <a-icon slot="prefix" type="home" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input class="material-input" v-decorator="decorator.email" placeholder="请输入邮箱">
          <a-icon slot="prefix" type="mail" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input class="material-input" v-decorator="decorator.mobile" placeholder="请输入手机">
          <a-icon slot="prefix" type="phone" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" block>注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Cookies from 'js-cookie'

const INIT_SETUP = 'INIT_SETUP'

export default {
  name: 'Register',
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorator: {
        account_name: [
          'account_name',
          { rules: [{ required: true, message: '请输入管理员账号' }] },
        ],
        account_password: [
          'account_password',
          { rules: [{ required: true, message: '请输入管理员密码' }] },
        ],
        company: [
          'company',
          { rules: [{ required: true, message: '请输入企业名称' }] },
        ],
        email: [
          'email',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入邮箱地址' },
            ],
          },
        ],
        mobile: [
          'mobile',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入手机' },
              { validator: this.$validate('phone') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['logo']),
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.fc.validateFields(async (err, values) => {
        if (err) return
        this.loading = true
        try {
          await this.$http.post('/v1/registers', values)
          Cookies.set(INIT_SETUP, true)
          this.$router.replace({ name: 'Login' })
        } finally {
          this.loading = false
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../../../src/styles/variables";
.logo {
  text-align: right;
  img {
    height: 40px;
  }
}
h4 {
  margin-top: 20px;
  margin-bottom: 40px;
}
.register-body {
  width: 370px;
  height: 640px;
  position: relative;
  background-color: #fff;
  padding: 40px;
}
</style>
