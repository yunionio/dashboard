<template>
  <div class="wrap">
    <div class="logo mb-2">
      <img :src="logo" />
    </div>
    <h4>管理员注册</h4>
    <a-form-model
      ref="form"
      :model="fd"
      :rules="rules"
      @submit.prevent.stop="handleRegister">
      <a-form-model-item prop="account_name">
        <a-input class="material-input" v-model="fd.account_name" :placeholder="$t('auth.register.account_name.placeholder')">
          <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item prop="account_password">
        <a-input-password class="material-input" v-model="fd.account_password" :placeholder="$t('auth.register.account_password.placeholder')">
          <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
        </a-input-password>
      </a-form-model-item>
      <a-form-model-item prop="company">
        <a-input class="material-input" v-model="fd.company" :placeholder="$t('auth.register.company.placeholder')">
          <a-icon slot="prefix" type="home" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item prop="email">
        <a-input class="material-input" v-model="fd.email" :placeholder="$t('auth.register.email.placeholder')">
          <a-icon slot="prefix" type="mail" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item prop="mobile">
        <a-input class="material-input" v-model="fd.mobile" :placeholder="$t('auth.register.mobile.placeholder')">
          <a-icon slot="prefix" type="phone" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" html-type="submit" :loading="submiting" block>{{ $t('auth.register.submit') }}</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { setSetupInStorage } from '@/utils/auth'

export default {
  name: 'Register',
  data () {
    return {
      submiting: false,
      fd: {
        account_name: '',
        account_password: '',
        company: '',
        email: '',
        mobile: '',
      },
      rules: {
        account_name: [
          { required: true, message: this.$t('auth.register.account_name.validate') },
        ],
        account_password: [
          { required: true, message: this.$t('auth.register.account_password.validate') },
        ],
        company: [
          { required: true, message: this.$t('auth.register.company.validate') },
        ],
        email: [
          { required: true, message: this.$t('auth.register.email.validate') },
          { type: 'email', message: '请输入邮箱地址' },
        ],
        mobile: [
          { required: true, message: this.$t('auth.register.mobile.validate') },
          { validator: this.$validate('phone') },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['logo']),
  },
  methods: {
    async handleRegister () {
      this.submiting = true
      try {
        await this.$refs.form.validate()
        await this.$http.post('/v1/registers', this.fd)
        this.$router.replace('/auth/login')
        setSetupInStorage(true)
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  width: 370px;
  position: relative;
  background-color: #fff;
  padding: 40px;
  h4 {
    margin-top: 20px;
    margin-bottom: 40px;
  }
}

.logo {
  text-align: right;
  img {
    height: 40px;
  }
}
</style>
