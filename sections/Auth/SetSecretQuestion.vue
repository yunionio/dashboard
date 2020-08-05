<template>
  <div class="wrap shadow-lg bg-white rounded">
    <secret-question-form
      :title="$t('auth.question.title')"
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
  created () {
    if (!this.$store.getters['auth/currentHistoryUserKey']) {
      this.$router.replace({
        path: '/auth/login',
        query: {
          rf: this.$route.query.rf,
        },
      })
    }
  },
  methods: {
    onSubmit (data) {
      this.loading = true
      this.$store.dispatch('auth/setRecovery', data).then(() => {
        this.loading = false
        this.$message.success(this.$t('auth.question.set.success'))
        this.$router.replace({
          path: '/auth/bindsecret',
          query: {
            rf: this.$route.query.rf,
          },
        })
      }).catch(() => {
        this.loading = false
      })
    },
  },
}
</script>

<style lang="less" scoped>
.wrap {
  width: 600px;
  position: relative;
}
</style>
