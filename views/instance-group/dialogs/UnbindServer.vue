<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_716', [$t('dictionary.instancegroup')])}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.instancegroup')" :count="params.data.length" :action="$t('compute.text_715', [$t('dictionary.instancegroup')])" />
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
  name: 'InstanceGroupUnbindServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const manager = new this.$Manager('instancegroups')
      const data = {}
      for (let i = 0, len = this.params.data.length; i < len; i++) {
        data[`guest.${i}`] = this.params.data[i].id
      }
      try {
        await manager.performAction({
          id: this.params.instanceGroupId,
          action: 'unbind-guests',
          data,
        })
        this.params.refresh()
        this.cancelDialog()
        this.$bus.$emit('InstanceGroupListRefresh')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
