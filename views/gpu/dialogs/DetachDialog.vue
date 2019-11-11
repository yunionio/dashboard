<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">取消关联主机</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="取消关联主机" />
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
  name: 'DetachGpuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    doUpdate () {
      return new this.$Manager('servers').performAction({
        id: this.params.data[0].guest_id,
        action: 'detach-isolated-device',
        data: {
          auto_start: true,
          device: this.params.data[0].id,
        },
      })
    },
    async handleConfirm () {
      try {
        this.loading = true
        if (this.params.data.length === 1) {
          await this.doUpdate()
        } else {
          await this.doDetachSubmit()
        }
        this.loading = false
        this.params.list.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    doDetachSubmit () {
      const data = {
        detach_all: true,
        auto_start: true,
      }
      let selectedIds = this.params.data.map((item) => {
        return item.id
      })
      return new this.$Manager('servers').batchPerformAction({
        ids: selectedIds,
        action: 'detach-isolated-device',
        data,
      })
    },
  },
}
</script>
