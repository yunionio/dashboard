<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item label="源/目标检查" v-bind="formItemLayout" help="虚拟机源/目标检查开关（MAC地址检查）">
          <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.open" />
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
  name: 'VmSourceTargetCheckDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const isAllClose = this.params.data.every((item) => { return !(item.src_ip_check && item.src_mac_check) })
    return {
      loading: false,
      action: '设置源/目标检查',
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        open: [
          'open',
          {
            initialValue: !isAllClose,
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
      const showFields = ['name', 'ip', 'brand']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    async doSubmit () {
      const ids = this.params.data.map(item => item.id)
      const values = await this.form.fc.validateFields()
      const open = values.open ? 'on' : 'off'
      const params = { 'src_ip_check': open, 'src_mac_check': open }
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: 'running',
        managerArgs: {
          action: 'modify-src-check',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
