<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">切换备份机</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="切换备份机" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="删除备份机" v-bind="formItemLayout" extra="同时删除备份机（如果当前宿主机离线，则会强制清除数据库记录）">
          <a-switch v-decorator="decorators.delete_backup" />
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
  name: 'VmSwitchBackupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        delete_backup: [
          'delete_backup',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      purge_backup: false,
    }
  },
  created () {
    this.fetchHosts(this.params.data[0])
  },
  methods: {
    async fetchHosts (data) {
      this.loading = true
      try {
        const manager = new this.$Manager('hosts')
        const response = await manager.get({ id: data.host_id })
        if (response.data.host_status !== 'online') {
          this.form.fc.setFieldsValue({
            delete_backup: true,
          })
          this.purge_backup = true
        } else {
          this.form.fc.setFieldsValue({
            delete_backup: false,
          })
          this.purge_backup = false
        }
      } finally {
        this.loading = false
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        const purgeBackup = values.delete_backup ? this.purge_backup : false
        const data = { delete_backup: values.delete_backup, purge_backup: purgeBackup }
        await this.params.list.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'switch-to-backup',
            data,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
