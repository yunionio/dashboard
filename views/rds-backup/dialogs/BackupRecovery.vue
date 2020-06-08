<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">新建备份</div>
    <a-form :form="form.fc" class="mt-3" slot="body">
      <dialog-selected-tips :name="$t('dictionary.dbinstancebackups')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-item label="恢复到" v-bind="formItemLayout">
        <a-radio-group v-model="recoveryType">
          <a-radio-button :value="0">当前实例</a-radio-button>
          <a-tooltip  v-if="isGoogle" title="谷歌云不支持此操作">
             <a-radio-button :disabled="true" :value="1">已有实例</a-radio-button>
          </a-tooltip>
           <a-radio-button v-else :value="1">已有实例</a-radio-button>
        </a-radio-group>
        <div style="width:100%">
          <rds-list :backupItem="backupItem" v-if="!!recoveryType" />
        </div>
      </a-form-item>
    </a-form>
    <div slot="footer">
      <a-button :disabled="!form.fc.getFieldsValue().dbinstance_id" :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import RdsList from '../components/BackupRecoveryRdsList'
import { CreateServerForm } from '@Compute/constants'
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
    isGoogle () {
      return this.backupItem.provider === 'Aliyun'
    },
  },
  watch: {
    recoveryType: {
      handler (type) {
        this.form.fc.getFieldDecorator('dbinstance_id', { preserve: true })
        this.form.fc.setFieldsValue({
          dbinstance_id: !type ? this.backupItem.dbinstance_id : undefined,
        })
      },
      immediate: true,
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
        const values = await this.validateForm()
        const manager = new this.$Manager('dbinstances', 'v2')
        const id = values.dbinstance_id
        await manager.performAction({
          id,
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
