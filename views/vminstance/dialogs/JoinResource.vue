<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1215')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('compute.text_1216')}}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1215')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item v-bind="formItemLayout">
          <a-checkbox v-decorator="decorators.autoDestroy">{{$t('compute.text_1217')}}</a-checkbox>
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
  name: 'VmJoinResourceDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        autoDestroy: [
          'autoDestroy',
          {
            initialValue: true,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 12,
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
    doJoinResourceSubmit (data) {
      const selectedIds = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: selectedIds,
        managerArgs: {
          action: 'prepaid-recycle',
          data: {
            auto_delete: data.autoDestroy,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.doJoinResourceSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
