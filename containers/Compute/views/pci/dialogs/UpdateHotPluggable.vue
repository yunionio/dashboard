<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common.edit') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.pci.hot_pluggable')" :extra="$t('compute.pci.hot_pluggable.tips')">
          <a-switch v-decorator="decorators.hot_pluggable" :checked-children="$t('table.title.on')" :un-checked-children="$t('table.title.off')" />
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
  name: 'UpdateHotPluggableDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initHotPluggable = this.params.data[0].hot_pluggable

    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        hot_pluggable: [
          'hot_pluggable',
          {
            initialValue: initHotPluggable,
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
  created () {
    this.bizManager = new this.$Manager('isolated_device_models')
  },
  methods: {
    doSubmit (data) {
      return this.bizManager.update({
        id: this.params.data[0].id,
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      const { validateFields } = this.form.fc
      try {
        this.loading = true
        const values = await validateFields()
        const data = {
          hot_pluggable: values.hot_pluggable,
        }
        await this.doSubmit(data)
        this.loading = false
        this.cancelDialog()
        this.$message.success(this.$t('common.success'))
        this.params.refresh && this.params.refresh()
      } catch (error) {
        this.$message.error(this.$t('common.failed'))
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
