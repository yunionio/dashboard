<template>
  <base-dialog @cancel="cancelDialog" :width="620" :modalProps="{ ...params.modalProps }">
    <div slot="header">{{$t('common.permission_tip')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" v-if="params.tip">
        <div slot="message">{{params.tip}}</div>
      </a-alert>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NoPermissionTipDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
  },
  methods: {
    async handleConfirm () {
      try {
        this.cancelDialog()
        await this.$store.dispatch('auth/logout')
        this.$router.push('/auth')
      } finally {
      }
    },
  },
}
</script>
