<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1259')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1259')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="$t('compute.text_1209')" v-bind="formItemLayout" :extra="$t('compute.text_1260')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.delete_backup" />
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
  computed: {
    columns () {
      const col = this.params.columns.slice(0, 3)
      col.push({
        field: 'backup_host_status',
        title: this.$t('compute.text_1163'),
        width: 120,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            return [<status status={ row.backup_host_status } statusModule='host_status'/>]
          },
        },
      })
      return col
    },
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
        await this.params.onManager('batchPerformAction', {
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
