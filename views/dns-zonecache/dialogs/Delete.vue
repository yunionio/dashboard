<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">释放缓存</div>
    <div slot="body">
      <dialog-selected-tips name="缓存" :count="params.data.length" action="释放缓存" />
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
  name: 'DnsDeleteCacheDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    doSubmit () {
      const params = {
        cloudaccount_id: this.params.data[0].cloudaccount_id,
      }
      return new this.$Manager('dns_zones').performAction({
        id: this.params.resData.id,
        action: 'uncache',
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = true
        await this.doSubmit()
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
