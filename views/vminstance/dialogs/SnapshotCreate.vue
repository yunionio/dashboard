<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_414')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('compute.text_1251')}}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_414')" />
      <dialog-table
        :data="params.data"
        :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_1071')" v-if="isKvm || isEsxi">
          <a-radio-group
            v-decorator="decorators.snapshotType"
            @change="snapshotTypeChangeHandle">
            <a-tooltip>
              <template slot="title" v-if="isEsxi">
                <span>{{$t('compute.text_1358')}}</span>
              </template>
              <a-radio value="disk" :disabled="isEsxi">{{$t('compute.text_1252')}}</a-radio>
            </a-tooltip>
            <a-radio value="instance">{{$t('compute.text_1253')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="$t('compute.text_1254')"
          v-if="isDiskSnapshot">
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
            :item.sync="selectDisk" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.text_415')">
          <a-input
            v-decorator="decorators.snapshotName"
            :placeholder="$t('validator.resourceName')" />
          <div slot="extra">
            <div v-if="showRepeatTips">{{$t('compute.text_1091')}}</div>
            <div v-show="!isDiskSnapshot">{{$t('compute.text_1255', [ diskCount ])}}</div>
          </div>
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
import { DISK_TYPE } from '@Compute/constants'
import { INPUT_DEBOUNCE_TIMER } from '@/constants/config'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmSnapshotCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      showRepeatTips: false,
      form: {
        fc: this.$form.createForm(this, {
          name: 'snapshort_create_form',
          onFieldsChange: this.onFieldsChange,
          onValuesChange: this.onValuesChange,
        }),
        fd: {
          snapshotName: '',
          snapshotType: this.isKvm ? 'disk' : 'instance',
        },
      },
      decorators: {
        snapshotType: [
          'snapshotType',
          {
            initialValue: this.isKvm ? 'disk' : 'instance',
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
        snapshotName: [
          'snapshotName',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_1256') },
              { validator: this.$validate('resourceName') },
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
    isKvm () {
      return this.params.data[0].hypervisor === hypervisorMap.kvm.key
    },
    isEsxi () {
      return this.params.data[0].hypervisor === hypervisorMap.esxi.key
    },
    diskParams () {
      return {
        scope: this.$store.getters.scope,
        details: true,
        with_meta: true,
      }
    },
    isDiskSnapshot () {
      return this.form.fd.snapshotType === 'disk'
    },
    manager () {
      return new this.$Manager(this.isDiskSnapshot ? 'snapshots' : 'instance_snapshots', 'v2')
    },
    diskCount () {
      return this.params.data[0].disk_count
    },
  },
  watch: {
    'form.fd.snapshotName' (val) {
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
      const snapshotName = this.form.fd.snapshotName
      if (!R.isNil(snapshotName) && !R.isEmpty(snapshotName)) {
        this.manager.get({ id: snapshotName, params: { scope: this.$store.getters.scope } })
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
    async doCreateDiskSnapshot () {
      const values = await this.validateForm(['disk', 'snapshotName'])
      const params = {
        disk: values.disk,
        generate_name: values.snapshotName,
      }
      return this.manager.create({ data: params })
    },
    async doCreateInstanceSnapshot () {
      const values = await this.validateForm(['snapshotName'])
      const params = {
        generate_name: values.snapshotName,
      }
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'instance-snapshot',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isDiskSnapshot) {
          await this.doCreateDiskSnapshot()
        } else {
          await this.doCreateInstanceSnapshot()
        }
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    getDiskLabel (item) {
      return `${item.disk}（${
        item.disk_type === DISK_TYPE.sys.value
          ? DISK_TYPE.sys.text
          : DISK_TYPE.data.text
      }, ${sizestr(item.disk_size, 'M', 1024)}）`
    },
    snapshotTypeChangeHandle (e) {
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
