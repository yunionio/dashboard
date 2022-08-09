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
      <!-- <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button> -->
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
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
    }
  },
  computed: {
    alertText () {
      if (this.params.tokenExpTime) {
        const time = this.$moment(this.params.tokenExpTime).format()
        return this.$t('common.token_exp_tip', [time])
      }
      return ''
    },
  },
  methods: {
    handleChooser () {
      this.type = 'chooser'
    },
    handleChallenge (params) {
      this.type = 'challenge'
      this.challangeParams = params
    },
  },
}
</script>
<style lang="less" scoped>
// .login-wrapper {
//   width: 60%;
//   margin-left: 50%;
//   transform: translateX(-50%);
// }
</style>
