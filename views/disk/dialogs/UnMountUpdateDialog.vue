<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.disk_perform_detach')}}</div>
    <div slot="body">
      <a-alert :message="$t('compute.text_440')" banner />
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.disk_perform_detach')" :name="$t('dictionary.disk')" />
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
