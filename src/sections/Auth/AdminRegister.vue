<template>
  <div class="wrap shadow-lg bg-white rounded">
    <h4 class="text-center">{{$t('common_80')}}</h4>
    <a-form-model
      ref="form"
      :model="fd"
      :rules="rules"
      @submit.prevent.stop="handleRegister">
      <a-form-model-item prop="account_name">
        <a-input v-model="fd.account_name" :placeholder="$t('auth.register.account_name.placeholder')">
          <a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item>
      <a-form-model-item prop="account_password">
        <a-input-password v-model="fd.account_password" :placeholder="$t('auth.register.account_password.placeholder')">
          <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
        </a-input-password>
      </a-form-model-item>
      <a-form-model-item prop="confirm_account_password">
        <a-input-password v-model="fd.confirm_account_password" :placeholder="$t('auth.register.confirm_account_password.placeholder')">
          <a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, .25)" />
        </a-input-password>
      </a-form-model-item>
      <!-- <a-form-model-item prop="company">
        <a-input v-model="fd.company" :placeholder="$t('auth.register.company.placeholder')">
          <a-icon slot="prefix" type="home" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item> -->
      <!-- <a-form-model-item prop="email">
        <a-input v-model="fd.email" :placeholder="$t('auth.register.email.placeholder ')">
          <a-icon slot="prefix" type="mail" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item> -->
      <!-- <a-form-model-item prop="mobile">
        <a-input v-model="fd.mobile" :placeholder="$t('auth.register.mobile.placeholder')">
          <a-icon slot="prefix" type="phone" style="color: rgba(0, 0, 0, .25)" />
        </a-input>
      </a-form-model-item> -->
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
        confirm_account_password: '',
        company: '',
        email: '',
        mobile: '',
      },
      rules: {
        account_name: [
          { required: true, message: this.$t('auth.register.account_name.validate') },
          { validator: this.$validate('domainAccount') },
        ],
        account_password: [
          { required: true, message: this.$t('auth.register.account_password.validate') },
          { validator: this.$validate('domainPassword') },
        ],
        company: [
          { required: true, message: this.$t('auth.register.company.validate') },
        ],
        email: [
          { required: true, message: this.$t('auth.register.email.validate') },
          { type: 'email', message: this.$t('common_81') },
        ],
        mobile: [
          { required: true, message: this.$t('auth.register.mobile.validate') },
          { validator: this.$validate('phone') },
        ],
        confirm_account_password: [
          { required: true, message: this.$t('auth.register.confirm_account_password.placeholder') },
          {
            validator: (rule, value, _callback) => {
              if (value && value !== this.fd.account_password) {
                _callback(this.$t('common_82'))
              } else {
                _callback()
              }
            },
          },
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
        await this.$http.post('/v1/registers', {
          account_name: this.fd.account_name,
          account_password: this.fd.account_password,
        })
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

<style lang="less" scoped>
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
</style>
