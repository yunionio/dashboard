<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.disk_perform_detach')}}</div>
    <div slot="body">
      <a-alert :message="$t('compute.text_440')" banner />
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.disk_perform_detach')" :name="$t('dictionary.disk')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item class="mb-0">
          <a-checkbox v-decorator="decorators.keep_disk" :disabled="disabledKeepDisk">{{ $t('compute.disk.detach') }}</a-checkbox>
        </a-form-item>
      </a-form>
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
    const initKeepDisk = this.params.data[0] && (this.params.data[0].provider === 'VMware' || this.params.data[0].provider === 'Nutanix')
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        keep_disk: [
          'keep_disk',
          {
            valuePropName: 'checked',
            initialValue: initKeepDisk,
          },
        ],
      },
      disabledKeepDisk: initKeepDisk,
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
    async doUpdate (data) {
      const guestId = this.params.data[0] && this.params.data[0].guests[0] && this.params.data[0].guests[0].id
      const diskId = this.params.data[0] && this.params.data[0].id
      // 删除前先先将auto_delete改为true
      if (data.keep_disk) {
        await new this.$Manager('disks').update({
          id: diskId,
          data: {
            auto_delete: true,
          },
        })
      }
      return new this.$Manager('servers').performAction({
        action: 'detachdisk',
        id: guestId,
        data: {
          disk_id: this.params.data[0].id,
          keep_disk: !data.keep_disk,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = true
        const values = await this.form.fc.validateFields()
        await this.doUpdate(values)
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
