<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" name="快照" :action="action" />
      <vxe-grid class="mb-2" :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="字母开头，数字和字母大小写组合，长度为2-128个字符，不含'.','_','@'" />
        </a-form-item>
        <a-form-item label="容量" v-bind="formItemLayout">
          <a-input-number :min="1" :max="100000" v-decorator="decorators.size" /> GB
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
  name: 'DiskCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      action: '新建硬盘',
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: '字母开头，数字和字母大小写组合，长度为2-128个字符，不含".","_","@"' },
              { validator: this.$validate('snapshotName') },
            ],
          },
        ],
        size: [
          'size',
          {
            initialValue: 10,
            rules: [
              { required: true },
            ],
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
    selectedItem () {
      return this.params.data
    },
    columns () {
      const showFields = ['name', 'disk_type', 'size']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    doCreate (values) {
      const params = { ...values }
      const manager = new this.$Manager('disks')
      return manager.create({
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          backend: this.selectedItem.storage_type,
          size: values.size * 1024,
          storage_id: this.selectedItem.storage_id,
          prefer_region: this.selectedItem.cloudregion_id,
        }
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
