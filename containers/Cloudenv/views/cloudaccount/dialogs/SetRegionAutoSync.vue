<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_363')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.region')" :count="params.data.length" :action="$t('cloudenv.text_363')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('cloudenv.text_364')" v-bind="formItemLayout">
          <a-switch :checkedChildren="$t('cloudenv.text_84')" :unCheckedChildren="$t('cloudenv.text_85')" v-decorator="decorators.enabled" />
          <div slot="extra">{{$t('cloudenv.text_365')}}</div>
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
import { Manager } from '@/utils/manager'

export default {
  name: 'SetRegionAutoSyncDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.data[0]
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        enabled: [
          'enabled',
          {
            initialValue: data.enabled,
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
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    updateAutoSyncStatus (values, ids) {
      const manager = new Manager(`cloudproviders/${this.params.cloudproviderId}/cloudregions`)
      if (ids.length > 1) { // 批量操作
        return manager.batchUpdate({
          ids,
          data: {
            enabled: values.enabled,
          },
        })
      } else {
        return manager.update({
          id: ids[0],
          data: {
            enabled: values.enabled,
          },
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const ids = this.params.data.map(item => item.id)
        this.loading = true
        await this.updateAutoSyncStatus(values, ids)
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
