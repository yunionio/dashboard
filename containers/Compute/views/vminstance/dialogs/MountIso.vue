<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">挂载ISO</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="挂载ISO" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="ISO镜像" v-bind="formItemLayout">
          <base-select
            remote
            filterable
            version="v1"
            v-decorator="decorators.image_id"
            resource="images"
            search-key="search"
            :select-props="{ placeholder: '请选择ISO镜像' }" />
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
  name: 'VmMountIsoDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        image_id: [
          'image_id',
          {
            rules: [
              { required: true, message: '请选择ISO镜像' },
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
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.$promiseValidateForm(this.form.fc)
        const ids = this.params.data.map(item => item.id)
        await this.params.list.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'insertiso',
            data: values,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
