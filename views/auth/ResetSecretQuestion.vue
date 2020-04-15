<template>
  <div class="wrap">
    <secret-question-form
      title="请回答以下安全问题，用以身份验证"
      :loading="loading"
      :questions="questions"
      submit-text="重置"
      @submit="onSubmit" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SecretQuestionForm from './components/SecretQuestionForm'
import { STORE_SECRET_PERFIX_KEY } from './constants'
import storage from '@/utils/storage'

export default {
  name: 'ResetSecretQuestion',
  components: {
    SecretQuestionForm,
  },
  data () {
    return {
      loading: false,
      fetching: false,
      questions: [],
    }
  },
  computed: {
    ...mapGetters(['auth']),
  },
  created () {
    this.getRecovery()
  },
  methods: {
    getRecovery () {
      this.fetching = true
      this.$http.get('/v1/auth/recovery').then(res => {
        const data = res.data.data || []
        this.questions = data
        this.fetching = false
      }).catch(() => {
        this.fetching = false
      })
    },
    onSubmit (data) {
      this.loading = true
      this.$store.dispatch('auth/credential', data).then(res => {
        this.loading = false
        storage.set(`${STORE_SECRET_PERFIX_KEY}${this.auth.inputUsername}`, res.data.qrcode)
        this.$message.success('重置秘钥成功，请重新扫码绑定')
        this.$router.replace({
          name: 'BindSecret',
        })
      }).catch(() => {
        this.loading = false
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  width: 600px;
  height: 660px;
  position: relative;
}
</style>
