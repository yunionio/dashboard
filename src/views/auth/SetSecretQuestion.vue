<template>
  <div class="wrap">
    <secret-question-form
      title="请设置安全问题，用以重置安全码密钥时验证身份"
      :loading="loading"
      @submit="onSubmit" />
  </div>
</template>

<script>
import SecretQuestionForm from './components/SecretQuestionForm'

export default {
  name: 'SetSecretQuestion',
  components: {
    SecretQuestionForm,
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    onSubmit (data) {
      this.loading = true
      this.$store.dispatch('auth/setRecovery', data).then(() => {
        this.loading = false
        this.$message.success('设置安全问题成功')
        this.$router.push({
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
