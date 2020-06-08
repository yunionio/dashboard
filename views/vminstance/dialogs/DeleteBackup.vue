<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">删除备份机</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" action="删除备份机" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="强制清除" v-bind="formItemLayout" extra="强制清除备份机记录（适用于备份机宿主机离线的情况下）">
          <a-switch checkedChildren="开" unCheckedChildren="关" :disabled="disableAutoPurge" v-decorator="decorators.purge" />
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
  name: 'VmDeleteBackupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        purge: [
          'purge',
          {
            initialValue: false,
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
    }
  },
  computed: {
    columns () {
      const col = this.params.columns.slice(0, 3)
      col.push({
        field: 'backup_host_status',
        title: '备份机的宿主机',
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
    disableAutoPurge () {
      return this.params.data.some((obj) => { return obj.backup_host_status === 'online' })
    },
  },
  mounted () {
    const isOnline = this.params.data.some((obj) => { return obj.backup_host_status === 'online' })
    if (!isOnline) {
      this.form.fc.setFieldsValue({
        purge: true,
      })
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'delete-backup',
            data: values,
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
