<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('db.text_290')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        class="mt-3"
        :form="form.fc">
        <a-form-item :label="$t('db.text_145')" v-bind="formItemLayout">
          <a-radio-group  v-decorator="decorators.disable_delete">
            <a-radio :value="true">{{$t('db.text_146')}}</a-radio>
            <a-radio :value="false">{{$t('db.text_147')}}</a-radio>
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
  name: 'RedisEditAttrDialog',
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
    decorators () {
      const { data } = this.params
      let initialValueDisableDelete = true
      if (data && data.length === 1) {
        initialValueDisableDelete = data[0].disable_delete
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
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        this.loading = false
        const ids = this.params.data.map(({ id }) => id)
        await this.params.onManager('batchUpdate', {
          id: ids,
          steadyStatus: 'running',
          managerArgs: {
            data: {
              disable_delete: this.form.fc.getFieldValue('disable_delete'),
            },
          },
        })
        this.cancelDialog()
        this.$message.success(this.$t('db.text_149'))
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
