<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">新建备份</div>
    <a-form :form="form.fc" class="mt-3" slot="body">
      <a-form-item label="恢复到" v-bind="formItemLayout">
        <a-radio-group v-model="recoveryType">
          <a-radio-button :value="0">当前实例</a-radio-button>
          <a-radio-button :value="1">已有实例</a-radio-button>
        </a-radio-group>
        <div style="width:100%">
          <rds-list :backupItem="backupItem" v-show="!!recoveryType" />
        </div>
      </a-form-item>
    </a-form>
    <div slot="footer">
      <a-button :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { CreateServerForm } from '@Compute/constants'
import RdsList from '../components/BackupRecoveryRdsList'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
// import validateForm from '@/utils/validate'
export default {
  name: 'RDSBackupRecovery',
  components: { RdsList },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      recoveryType: 0,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  computed: {
    backupItem () {
      return this.params.data ? this.params.data[0] : {}
    },
  },
  provide () {
    return {
      form: this.form,
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
    async handleConfirm () {
      this.loading = true
      try {
        // const values = await this.validateForm()
        const manager = new this.$Manager('dbinstances', 'v2')
        await manager.performAction({
          id: this.backupItem.dbinstance_id,
          action: 'recovery',
          data: {
            dbinstancebackup: this.backupItem.id,
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
