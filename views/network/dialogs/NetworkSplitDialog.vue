<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">分割IP子网</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="分割IP子网" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="新IP子网名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholer="请输入新IP子网名称" />
        </a-form-item>
        <a-form-item label="新IP子网起始IP" v-bind="formItemLayout">
          <a-input v-decorator="decorators.split_ip" placeholer="分割起始IP，例如：192.168.1.80" />
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
  name: 'NetworkSplitDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: 'IP子网名称不能为空' },
            ],
          },
        ],
        split_ip: [
          'split_ip',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '分割起始IP不能为空' },
              { validator: this.$validate('IPv4') },
            ],
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
    doSplit (data) {
      return this.params.list.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'split',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        if (values['split_ip'] === this.params.data[0].guest_ip_start || values['split_ip'] === this.params.data[0].guest_ip_end) {
          this.$message.error('新网络的起始IP不能写为原网络的起始IP或者终止IP')
          return
        }
        this.loading = true
        await this.doSplit(values)
        this.loading = false
        this.cancelDialog()
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
