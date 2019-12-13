<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">合并IP子网</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="合并IP子网" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
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
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
