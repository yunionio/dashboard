<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.create_disk_backup')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.create_disk_backup')" :name="$t('dictionary.disk')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.backup_name')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.backup_storage')">
          <base-select
            style="width: 100%"
            v-decorator="decorators.storage"
            :params="storageParams"
            :select-props="{ placeholder: $t('compute.text_1022', [$t('compute.backup_storage')]) }"
            resource="backupstorages"
            :filterable="true"
            :isDefaultSelect="true" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="confirmDisabled">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DiskCreateBackupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_416') },
              { validator: this.$validate('snapshotName') },
            ],
          },
        ],
        storage: [
          'storage',
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
      storageParams: {},
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
    doCreate (data) {
      return new this.$Manager('diskbackups').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.validateForm()
        values = {
          name: values.name,
          backup_storage_id: values.storage,
          disk_id: this.params.data[0].id,
        }
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
