<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="title"  :name="params.name" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        class="mt-3"
        :form="form.fc">
        <a-form-item label="删除保护" v-bind="formItemLayout">
          <a-radio-group  v-decorator="decorators.disable_delete">
            <a-radio :value="true">启用</a-radio>
            <a-radio :value="false">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ChangeDisableDelete',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, { onFieldsChange: this.onFieldsChange }),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  computed: {
    title () {
      return this.params.title || '设置删除保护'
    },
    decorators () {
      const { data } = this.params
      let initialValueDisableDelete = true
      if (data && data.length === 1) {
        const item = data[0]
        if (item.protected !== undefined) {
          initialValueDisableDelete = item.protected === 'true'
        } else {
          initialValueDisableDelete = data[0]['disable_delete']
        }
      }
      return {
        disable_delete: [
          'disable_delete',
          {
            initialValue: initialValueDisableDelete,
          },
        ],
      }
    },
  },
  created () {},
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = false
        const isDelete = this.form.fc.getFieldValue('disable_delete')
        const ids = this.params.data.map(({ id }) => id)
        await this.params.list.batchUpdate(ids, {
          disable_delete: isDelete,
          protected: `${isDelete}`,
        })
        this.cancelDialog()
        this.$message.success('操作成功')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
