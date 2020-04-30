<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.name}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" action="宕机自动迁移" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
       <a-form
        :form="form.fc">
        <a-form-item label="自动迁移" v-bind="formItemLayout" extra="当宿主机宕机后，其上的虚拟机(仅限硬盘为共享存储)是否会自动迁移到其他宿主机">
          <a-switch v-decorator="decorators.enable" checkedChildren="开" unCheckedChildren="关" />
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
  name: 'DowntimeMigrateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        enable: [
          'enable',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  methods: {
    doMigrate (data) {
      data = {
        'auto-migrate-on-host-down': data.enable ? 'enable' : 'disable',
      }
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'auto-migrate-on-host-down',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        await this.doMigrate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
