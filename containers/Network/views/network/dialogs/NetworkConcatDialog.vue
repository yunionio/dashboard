<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_623')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.network')" :count="params.data.length" :action="$t('network.text_623')" />
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
  name: 'NetworkConcatDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    doConcat () {
      return new this.$Manager('networks').performAction({
        id: this.params.itemData.nameFrom,
        action: 'merge',
        data: { target: this.params.itemData.nameTo },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doConcat()
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
