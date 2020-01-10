<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message" v-if="params.data.length === 0">
          开关打开时可关联或解绑多个GPU卡，关闭后则解绑所有GPU卡
        </div>
        <div slot="message" v-else>
          <p>批量关联只支持同时关联同种型号及同样数量的GPU卡</p>
          <p>批量取消会同时取消所有实例已关联的GPU卡</p>
        </div>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <vxe-grid class="mb-2" :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item label="是否绑定" v-bind="formItemLayout">
          <a-switch v-model="isOpenGpu" />
        </a-form-item>
        <a-form-item label="GPU卡" v-bind="formItemLayout" v-show="isOpenGpu" extra="只能关联与主机处于同一宿主机的GPU卡">
          <base-select
            v-decorator="decorators.device"
            :params="gpuParams"
            :need-params="false"
            :labelFormat="labelFormat"
            :disabled-items="disabledItems"
            filterable
            :options.sync="gpuOpt"
            :mapper="mapper"
            resource="isolated_devices"
            :select-props="{ allowClear: true, placeholder: '请选择GPU设备', mode: 'multiple' }" />
        </a-form-item>
        <a-form-item label="自动启动" v-bind="formItemLayout" extra="设置成功后是否自动启动">
          <a-switch v-decorator="decorators.autoStart" />
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
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmAttachGpuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: '关联GPU卡',
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          device: [],
        },
      },
      decorators: {
        device: [
          'device',
          {
            rules: [
              { required: true, type: 'array', message: '请选择GPU设备', trigger: 'change' },
            ],
          },
        ],
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: true,
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
      gpuOpt: [],
      isOpenGpu: false,
      bindGpus: [],
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        {
          field: 'ip',
          title: 'IP',
        },
        {
          field: 'gpu',
          title: 'GPU',
        },
      ],
    }
  },
  computed: {
    selectedItems () {
      return this.params.data
    },
    gpuParams () {
      if (this.selectedItems && this.selectedItems[0]) {
        return { host: this.selectedItems[0].host_id, limit: 0 }
      }
      return {}
    },
    attchGpu () {
      return this.form.fd.device.filter((id) => { return !this.bindGpus.includes(id) })
    },
    detachGpu () {
      return this.bindGpus.filter((id) => { return !this.form.fd.device.includes(id) })
    },
    disabledItems () {
      return this.gpuOpt.filter(val => { return val.usedCount === val.totalCount }).map(item => { return item.id })
    },
  },
  watch: {
    gpuOpt () {
      this.bindGpus = this.gpuOpt.filter(item => item.usedCount).map(item => { return item.id })
      if (this.bindGpus.length > 0 && this.params.data.length === 0) {
        this.form.fc.setFieldsValue({ device: this.bindGpus })
        this.isOpenGpu = true
      }
    },
  },
  methods: {
    async doAttachSubmit (data) {
      const params = {
        add_devices: this.attchGpu,
        del_devices: this.detachGpu,
        auto_start: data.autoStart,
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'set-isolated-device',
          data: params,
        },
      })
    },
    async doDetachSubmit (data) {
      const params = {
        add_devices: [],
        del_devices: this.bindGpus,
        auto_start: data.autoStart,
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'set-isolated-device',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenGpu) {
          const values = await this.form.fc.validateFields()
          await this.doAttachSubmit(values)
        } else {
          const values = await this.form.fc.getFieldsValue()
          await this.doDetachSubmit(values)
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    mapper (data) {
      const obj = {}
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (!obj[item.model]) {
          obj[item.model] = {
            usedCount: item.guest ? 1 : 0,
            totalCount: 1,
          }
          if (!item.guest) {
            obj[item.model] = {
              ...obj[item.model],
              ...item,
            }
          }
        } else {
          obj[item.model].totalCount += 1
          if (item.guest) {
            obj[item.model].usedCount += 1
          } else {
            obj[item.model] = {
              ...obj[item.model],
              ...item,
            }
          }
        }
      }
      const newData = []
      R.forEachObjIndexed((value, key) => {
        newData.push(value)
      }, obj)
      return newData
    },
    labelFormat (val) {
      return val.model
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        if (key === 'device') {
          this.form.fd[key] = values[key]
        } else {
          this.form.fd[key] = values[key]
        }
      })
    },
  },
}
</script>
