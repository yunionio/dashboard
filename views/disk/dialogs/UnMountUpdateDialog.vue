<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">卸载</div>
    <div slot="body">
      <a-alert message="提示：如果是 Linux 主机，您应该先在主机里对磁盘执行 umount 命令，命令执行成功后再进入控制台从云服务器上'卸载'该磁盘。" banner />
      <dialog-selected-tips :count="params.data.length" action="卸载" :name="$t('dictionary.disk')" />
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
  name: 'DiskUnMountUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  created () {
    const params = {
      details: false,
      disk: this.params.data[0].id,
    }
    new this.$Manager('servers').list({ params })
      .then((res) => {
        this.serversOpts = res.data.data
      })
  },
  methods: {
    doUpdate (data) {
      const guestId = this.params.data[0] && this.params.data[0].guests[0] && this.params.data[0].guests[0].id
      return new this.$Manager('servers').performAction({
        action: 'detachdisk',
        id: guestId,
        data: {
          disk_id: this.params.data[0].id,
          keep_disk: true,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = true
        await this.doUpdate()
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
