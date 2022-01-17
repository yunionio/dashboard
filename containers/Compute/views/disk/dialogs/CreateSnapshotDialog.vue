<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.disk_perform_create_snapshot')}}</div>
    <div slot="body">
      <a-alert :message="errorInfo" banner v-if="errorInfo !== ''" />
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.disk_perform_create_snapshot')" :name="$t('dictionary.disk')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_415')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" />
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
import { HYPERVISORS_MAP } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DiskCreateSnapshotDialog',
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
          {
            rules: [
              { required: true, message: this.$t('compute.text_1022', [this.$t('compute.backup_storage')]), trigger: 'change' },
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
      serversOpts: [],
    }
  },
  computed: {
    errorInfo () {
      if (this.isKvm) {
        if (this.isCeph) return ''
        if (this.manualSnapshotCount === this.maxManualSnapshotCount) {
          return this.$t('compute.text_417')
        }
        return this.$t('compute.text_418', [this.manualSnapshotCount, this.maxManualSnapshotCount - this.manualSnapshotCount])
      }
      return ''
    },
    confirmDisabled () {
      if (!this.isKvm) return
      if (this.isCeph) return
      return this.manualSnapshotCount === this.maxManualSnapshotCount
    },
    isKvm () {
      return this.params.data[0].provider === HYPERVISORS_MAP.kvm.provider
    },
    isHuawei () {
      return this.params.data[0].provider === HYPERVISORS_MAP.huawei.provider
    },
    isCeph () {
      return this.params.data[0].storage_type === 'rbd'
    },
    maxManualSnapshotCount () {
      return this.params.data[0].max_manual_snapshot_count || 2
    },
    manualSnapshotCount () {
      return this.params.data[0].manual_snapshot_count || 0
    },
  },
  created () {
    const params = {
      details: false,
      disk: this.params.data[0].id,
    }
    new this.$Manager('servers').list({ params })
      .then((res) => {
        this.serversOpts = res.data.data
      })
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
      return new this.$Manager('snapshots').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.validateForm()
        values = {
          ...values,
          disk: this.params.data[0].id,
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
