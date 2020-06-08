<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">克隆</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.secgroup')" :count="params.data.length" action="克隆" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="模版" v-bind="formItemLayout">
          <a-select v-decorator="decorators.template">
            <a-select-option v-for="(v, k) in templateOps" :key="k" :value="k">
              {{v}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="请输入名称" />
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
  name: 'CloneSecgroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        template: [
          'template',
          {
            initialValue: '1',
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请填写名称' },
              { validator: this.$validate('templateName') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 8,
        },
        labelCol: {
          span: 2,
        },
      },
      templateOps: {
        1: '通用Web服务器',
        2: '开放全部端口',
        3: '自定义',
      },
    }
  },
  methods: {
    doCreate (data) {
      return new this.$Manager('secgroups').performAction({
        id: this.params.data[0].id,
        action: 'clone',
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
