<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.disk_backup')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.rollback_type')">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button value="new">
              {{ $t('compute.create_new_disk') }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.disk_name')">
          <a-input
            v-decorator="decorators.name"
            :placeholder="$t('compute.disk_name_placeholder')" />
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
  name: 'DiskBackupRollbackDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.rollback_disk_backup'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: 'new',
          },
        ],
        name: [
          'name',
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'brand', 'disk_type']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    async doRollbackSubmit (values) {
      const params = {
        name: values.name,
      }
      const ids = this.params.data.map(item => item.id)
      await this.params.onManager('performAction', {
        id: ids[0],
        steadyStatus: ['ready'],
        managerArgs: {
          action: 'recovery',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doRollbackSubmit(values)
        this.params.refresh()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        console.log(error)
        this.loading = false
      }
    },
  },
}
</script>
