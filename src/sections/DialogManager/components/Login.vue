<template>
  <base-dialog @cancel="cancelDialog" :width="500" :modalProps="{ ...params.modalProps }">
    <div slot="header">{{$t('common.login_tip')}}</div>
    <div slot="body">
      <a-alert type="warning" :message="alertText" />
      <div class="login-wrapper mt-2">
        <login-challenge v-if="type === 'challenge'" :params="challangeParams" @chooser="handleChooser" @loginSucceed="cancelDialog" />
        <login-chooser v-else @challenge="handleChallenge" />
      </div>
    </div>
    <div slot="footer">
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapState } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import LoginChallenge from '@/sections/Auth/Login/components/LoginChallengeInDialog'
import LoginChooser from '@/sections/Auth/Login/components/LoginChooserInDialog'

export default {
  name: 'LoginDialog',
  components: {
    LoginChallenge,
    LoginChooser,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      type: 'challenge',
      challangeParams: {},
      expText: 3,
      timer: null,
    }
  },
  computed: {
    alertText () {
      const timeM = Math.ceil((this.expText || 0) / 60)
      if (timeM > 0) {
        return this.$t('common.token_exp_tip', [timeM])
      } else {
        return this.$t('common.token_eip_tip2')
      }
    },
    ...mapState(['auth']),
  },
  watch: {
    'auth.token': {
      handler: function (val) {
        if (!val) {
          clearInterval(this.timer)
          this.cancelDialog()
        }
      },
    },
  },
  created () {
    this.initInterval()
  },
  methods: {
    handleChooser () {
      this.type = 'chooser'
    },
    handleChallenge (params) {
      this.type = 'challenge'
      this.challangeParams = params
    },
    initInterval () {
      if (this.params.tokenExpTime) {
        const time = new Date(this.params.tokenExpTime).getTime()
        const current = new Date().getTime()
        let ms = parseInt((time - current) / 1000)
        if (ms > 0) {
          this.timer = setInterval(() => {
            if (ms > 0) {
              ms -= 1
              this.expText = ms
            } else {
              clearInterval(this.timer)
            }
          }, 1000)
        }
      }
    },
  },
}
</script>
