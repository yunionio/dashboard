<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">新建备份</div>
    <a-form :form="form.fc" class="mt-3" slot="body">
      <h1>dasds</h1>
    </a-form>
    <div slot="footer">
      <a-button :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
// import validateForm from '@/utils/validate'

export default {
  name: 'RDSBackupRecovery',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      rdsListLoading: false,
      rdsList: [],
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  created () {
    this.fetchQueryRDSList()
  },
  methods: {
    async fetchQueryRDSList () {
      const backupItem = this.params.data[0]
      // eslint-disable-next-line camelcase
      const { provider, engine, cloudregion_id, engine_version } = backupItem
      const params = {
        scope: this.$store.getters.scope,
        limit: 0,
        status: 'running',
        provider,
        engine,
        cloudregion_id,
        engine_version,
      }
      this.rdsListLoading = true
      try {
        const { data } = await new this.$Manager('dbinstances', 'v2').list({ params })
        this.rdsList = data.data
      } finally {
        this.rdsListLoading = false
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            if (!this.isNullRDS) {
              values['dbinstance_id'] = this.params.rdsItem.id
              values['dbinstance'] = this.params.rdsItem.id
            }
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.params.list.onManager('create', {
          managerArgs: {
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
