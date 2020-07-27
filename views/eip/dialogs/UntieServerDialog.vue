<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_219')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.eip')" :count="params.data.length" :action="$t('network.text_219')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'EipUntieServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    doUntie (data) {
      return this.params.onManager('performAction', {
        steadyStatus: 'ready',
        id: this.params.data[0].id,
        managerArgs: {
          action: 'dissociate',
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doUntie()
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
