<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">公网IP转EIP</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" action="公网IP转EIP" />
      <dialog-table :data="params.data" :columns="columns" />
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
  name: 'VmPublicIpToEipDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'ip', 'brand']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    doPublicIpToEipSubmit (data) {
      const selectedIds = this.params.data.map(item => item.id)
      return new this.$Manager('servers', 'v2').batchPerformAction({
        ids: selectedIds,
        action: 'publicip-to-eip',
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doPublicIpToEipSubmit()
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
