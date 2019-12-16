<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">绑定</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="绑定" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="云服务器" v-bind="formItemLayout">
          <base-select
            :remote="true"
            v-decorator="decorators.instance_id"
            resource="servers"
            :params="instanceParams"
            :remote-fn="q => ({ search: q })"
            :select-props="{ placeholder: '请选择' }" />
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
  name: 'EipBindServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        instance_id: [
          'instance_id',
          {
            rules: [
              { required: true, message: '请选择要绑定的云服务器' },
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
      instanceParams: {
        usable_server_for_eip: this.params.data[0].id,
        filter: 'status.in(ready, running)',
        without_eip: true,
        details: true,
        with_meta: true,
        scope: this.$store.getters.scope,
      },
    }
  },
  methods: {
    doBind (data) {
      return this.params.list.singlePerformAction('associate', data)
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          id: this.params.data[0].id,
        }
        this.loading = true
        await this.doBind(values)
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
