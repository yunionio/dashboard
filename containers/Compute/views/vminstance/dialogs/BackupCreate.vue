<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.create_disk_backup')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.create_disk_backup')" />
      <dialog-table
        :data="params.data"
        :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.backup_type')">
          <a-radio-group
            v-decorator="decorators.type"
            @change="typeChangeHandle">
            <a-radio value="disk" :disabled="isEsxi">{{$t('compute.disk_backup')}}</a-radio>
            <a-radio value="instance">{{$t('compute.instance_backup')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="$t('compute.text_1254')"
          v-if="isDiskBackup">
          <base-select
            style="width: 100%"
            v-decorator="decorators.disk"
            :params="diskParams"
            :select-props="{ placeholder: $t('compute.text_1085') }"
            resource="disks"
            idKey="disk_id"
            nameKey="disk"
            :label-format="getDiskLabel"
            :ctx="[['servers', this.params.data[0].id]]"
            :filterable="true"
            :isDefaultSelect="true"
            :item.sync="selectDisk" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.backup_name')"
          class="mb-0">
          <a-input
            v-decorator="decorators.name"
            :placeholder="$t('validator.resourceName')" />
          <div slot="extra">
            <div v-if="showRepeatTips">{{$t('compute.text_1091')}}</div>
          </div>
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
      <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="disabledSubmit">{{
        $t("dialog.ok")
      }}</a-button>
      <a-button @click="cancelDialog">{{ $t("dialog.cancel") }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { DISK_TYPE } from '@Compute/constants'
import { INPUT_DEBOUNCE_TIMER } from '@/constants/config'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmBackupCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      showRepeatTips: false,
      form: {
        fc: this.$form.createForm(this, {
          name: 'backup_create_form',
          onFieldsChange: this.onFieldsChange,
          onValuesChange: this.onValuesChange,
        }),
        fd: {
          name: '',
          type: this.params.data[0].hypervisor === hypervisorMap.esxi.key ? 'instance' : 'disk',
        },
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: this.params.data[0].hypervisor === hypervisorMap.esxi.key ? 'instance' : 'disk',
          },
        ],
        disk: [
          'disk',
          {
            rules: [
              { required: true, message: this.$t('compute.text_1085'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_1256') },
              // { validator: this.$validate('resourceName') },
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
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      selectDisk: {},
      disabledSubmit: false,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    diskParams () {
      return {
        scope: this.$store.getters.scope,
        details: true,
        with_meta: true,
      }
    },
    isDiskBackup () {
      return this.form.fd.type === 'disk'
    },
    manager () {
      return new this.$Manager(this.isDiskBackup ? 'diskbackups' : 'instancebackups', 'v2')
    },
    storageParams () {
      return {
        scope: this.scope,
      }
    },
  },
  watch: {
    'form.fd.name' (val) {
      this.debounceCheckTemplateName()
    },
    'selectDisk' (val) {
      this.disabledSubmit = val.storage_type === 'nova'
    },
  },
  created () {
    this.debounceCheckTemplateName = debounce(() => {
      this.checkTemplateName()
    }, INPUT_DEBOUNCE_TIMER)
  },
  methods: {
    checkTemplateName () {
      const name = this.form.fd.name
      if (!R.isNil(name) && !R.isEmpty(name)) {
        this.manager.get({ id: name, params: { scope: this.$store.getters.scope } })
          .then(res => {
            const data = res.data
            if (!R.isNil(data) && !R.isEmpty(data)) {
              this.showRepeatTips = true // 重复名字
            }
          }).catch(() => {
            this.showRepeatTips = false
          })
      } else {
        this.showRepeatTips = false
      }
    },
    validateForm (fileds = []) {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields(fileds, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async doCreateDiskBackup () {
      const values = await this.validateForm(['disk', 'name', 'storage'])
      const params = {
        disk_id: values.disk,
        name: values.name,
        backup_storage_id: values.storage,
      }
      return this.manager.create({ data: params })
    },
    async doCreateInstanceBackup () {
      const values = await this.validateForm(['name', 'storage'])
      const params = {
        name: values.name,
        backup_storage_id: values.storage,
      }
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'instance-backup',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isDiskBackup) {
          await this.doCreateDiskBackup()
        } else {
          await this.doCreateInstanceBackup()
        }
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
        this.$message.success(this.$t('compute.text_322'))
      } catch (error) {
        this.loading = false
        this.cancelDialog()
      }
    },
    getDiskLabel (item) {
      return `${item.disk}（${
        item.disk_type === DISK_TYPE.sys.value
          ? DISK_TYPE.sys.text
          : DISK_TYPE.data.text
      }, ${sizestr(item.disk_size, 'M', 1024)}）`
    },
    typeChangeHandle (e) {
      this.$nextTick(() => {
        this.debounceCheckTemplateName()
      })
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        this.form.fd[key] = values[key]
      })
    },
  },
}
</script>
