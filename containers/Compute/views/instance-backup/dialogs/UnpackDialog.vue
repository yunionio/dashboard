<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          {{ $t('compute.unpack_alert') }}
        </div>
      </a-alert>
      <dialog-selected-tips :name="$t('compute.instance_backup')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.unpack_name')">
          <a-input
            v-decorator="decorators.name"
            :placeholder="$t('common.tips.input', [$t('compute.unpack_name')])" />
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
  name: 'UnpackDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.unpack'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('compute.unpack_name')]) },
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
    columns () {
      const showFields = ['name', 'brand', 'guest']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    doUnpackSubmit (values) {
      const params = {
        package_name: values.name,
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('performAction', {
        id: ids[0],
        steadyStatus: ['ready'],
        managerArgs: {
          action: 'pack',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doUnpackSubmit(values)
        this.params.refresh && this.params.refresh()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
