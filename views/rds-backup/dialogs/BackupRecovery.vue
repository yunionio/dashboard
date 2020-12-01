<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{$t('db.text_45')}}</div>
    <a-form :form="form.fc" class="mt-3" slot="body">
      <dialog-selected-tips :name="$t('dictionary.dbinstancebackups')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-item :label="$t('db.text_221')" v-bind="formItemLayout">
        <a-radio-group v-model="recoveryType">
          <a-tooltip>
            <template #title v-if="(isAliyun && !isSupportCurrentVersion) || !params.data[0].db_names">
              <p v-if="isAliyun && !isSupportCurrentVersion">{{$t('db.text_363')}}</p>
              <p v-if="!params.data[0].db_names">{{$t('db.text_364')}}</p>
            </template>
            <a-radio-button :value="0" :disabled="isDisabled">{{$t('db.text_222')}}</a-radio-button>
          </a-tooltip>
          <a-tooltip v-if="isGoogle" :title="$t('db.text_205')">
            <a-radio-button :disabled="true" :value="1">{{$t('db.text_223')}}</a-radio-button>
          </a-tooltip>
          <a-tooltip v-else>
            <template #title v-if="(isAliyun && !isSupportCurrentVersion) || !params.data[0].db_names">
              <p v-if="isAliyun && !isSupportCurrentVersion">{{$t('db.text_363')}}</p>
              <p v-if="!params.data[0].db_names">{{$t('db.text_364')}}</p>
            </template>
            <a-radio-button :value="1" :disabled="isDisabled">{{$t('db.text_223')}}</a-radio-button>
          </a-tooltip>
          <a-radio-button :value="2">{{$t('db.text_365')}}</a-radio-button>
        </a-radio-group>
        <div style="width:100%">
          <rds-list :backupItem="backupItem" v-if="recoveryType === 1" />
        </div>
      </a-form-item>
      <a-form-item :label="$t('db.text_366')" v-bind="formItemLayout" v-if="recoveryType === 1 || recoveryType === 0">
        <a-select v-decorator="decorators.databases" mode="multiple">
          <a-select-option :key="item" v-for="item in dbNameOptions">{{item}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('db.text_367')" v-bind="formItemLayout" v-if="recoveryType === 2">
        <a-input v-decorator="decorators.name" />
      </a-form-item>
    </a-form>
    <div slot="footer">
      <a-button :disabled="!form.fc.getFieldsValue().dbinstance_id" :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import RdsList from '../components/BackupRecoveryRdsList'
import { HYPERVISORS_MAP } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RDSBackupRecovery',
  components: { RdsList },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      recoveryType: '',
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
      decorators: {
        databases: [
          'databases',
          {
            rules: [{ required: true, message: this.$t('db.text_368') }],
          },
        ],
        name: [
          'name',
          {
            rules: [{ required: true, message: this.$t('db.text_369') }],
          },
        ],
      },

    }
  },
  computed: {
    backupItem () {
      return this.params.data ? this.params.data[0] : {}
    },
    isGoogle () {
      return this.backupItem.provider === 'Google'
    },
    isAliyun () {
      return this.params.data[0].provider === HYPERVISORS_MAP.aliyun.provider
    },
    isSupportCurrentVersion () {
      const { engine, engine_version, category, storage_type } = this.params.rdsItem
      const supportedEngine = ['MySQL']
      const supportedEngineVersion = ['5.6', '5.7', '8.0']
      const supportedCategory = ['high_availability']
      const supportedStorageType = ['local_ssd']
      if (!R.includes(engine, supportedEngine)) return false
      if (!R.includes(engine_version, supportedEngineVersion)) return false
      if (!R.includes(category, supportedCategory)) return false
      if (!R.includes(storage_type, supportedStorageType)) return false
      return true
    },
    isDisabled () {
      if (!this.params.data[0].db_names) return true
      if (!this.isAliyun) return true
      if (this.isAliyun) return !this.isSupportCurrentVersion
      return false
    },
    dbNameOptions () {
      return this.params.data[0].db_names ? this.params.data[0].db_names.split(',') : []
    },
  },
  watch: {
    recoveryType: {
      handler (type) {
        this.form.fc.getFieldDecorator('dbinstance_id', { preserve: true })
        this.form.fc.setFieldsValue({
          dbinstance_id: type === 0 || type === 2 ? this.backupItem.dbinstance_id : undefined,
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
    genData (values) {
      const ret = {}
      if (values.databases) {
        const _databases = {}
        values.databases.map(item => {
          _databases[item] = item + '_back'
        })
        ret.databases = _databases
      }
      if (values.name) ret.name = values.name
      if (this.recoveryType === 2) {
        ret.dbinstancebackup_id = this.backupItem.id
      } else {
        ret.dbinstancebackup = this.backupItem.id
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (!this.recoveryType) {
          this.$message.warn(this.$t('db.text_376'))
          return
        }
        const values = await this.validateForm()
        const manager = new this.$Manager('dbinstances', 'v2')
        const data = this.genData(values)
        const id = values.dbinstance_id
        if (this.recoveryType === 2) {
          await manager.create({
            id,
            data,
          })
        } else {
          await manager.performAction({
            id,
            action: 'recovery',
            data,
          })
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
