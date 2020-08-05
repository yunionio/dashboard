<template>
  <div class="wrap shadow-lg bg-white rounded">
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
    if (!this.$store.getters['auth/currentHistoryUserKey']) {
      this.$router.replace({
        path: '/auth/login',
        query: {
          rf: this.$route.query.rf,
        },
      })
    } else {
      this.getRecovery()
    }
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
      this.$store.dispatch('auth/credential', data).then(data => {
        this.loading = false
        this.$store.commit('auth/UPDATE_HISTORY_USERS', {
          key: this.$store.getters['auth/currentHistoryUserKey'],
          value: {
            secret: data.qrcode,
          },
        })
        this.$message.success(this.$t('auth.question.reset.success'))
        this.$router.replace({
          path: '/auth/bindsecret',
          query: {
            rf: this.$route.query.rf,
          },
        })
      }).catch(error => {
        this.loading = false
        throw error
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
