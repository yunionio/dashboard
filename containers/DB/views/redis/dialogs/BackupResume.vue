<template>
    <base-dialog @cancel="cancelDialog">
        <div slot="header">{{title}}</div>
        <div slot="body">
          <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="title" />
          <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
        </div>
         <div slot="footer">
            <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
            <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
         </div>
    </base-dialog>
</template>

<script>
import { ACCOUNT_PRIVILEGES } from '../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
// import validateForm from '@/utils/validate'

export default {
  name: 'RedisBackupResumeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      title: this.$t('db.text_45'),
      loading: false,
      privileges: ACCOUNT_PRIVILEGES,
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.params.list.onManager('performAction', {
          steadyStatus: 'running',
          id: this.params.data[0].id,
          managerArgs: {
            action: 'restore-instance',
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
