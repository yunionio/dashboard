<template>
  <div class="wrap">
    <secret-question-form
      :title="$t('auth.mfa.title')"
      :loading="loading"
      :questions="questions"
      :submit-text="$t('common.text00117')"
      @submit="onSubmit" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import SecretQuestionForm from './components/SecretQuestionForm'

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
    ...mapGetters(['auth', 'userInfo']),
    ...mapState('auth', {
      historyUsers: state => state.historyUsers,
    }),
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
        this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          key: this.$store.getters['auth/currentHistoryUserKey'],
          value: {
            secret: res.data.qrcode,
          },
        })
        this.$message.success(this.$('auth.question.reset.success'))
        this.$router.replace('/auth/bindsecret')
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
