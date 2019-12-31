<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          开关打开后可绑定一个或多个GPU卡，开关关闭后则取消绑定所有GPU卡
        </div>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="是否绑定" v-bind="formItemLayout">
          <a-switch v-model="form.fi.isOpenGpu" />
        </a-form-item>
        <a-form-item label="GPU卡" v-bind="formItemLayout" v-show="form.fi.isOpenGpu">
          <base-select
            v-decorator="decorators.device"
            :params="gpuParams"
            :need-params="false"
            :labelFormat="labelFormat"
            :mapper="mapper"
            filterable
            multiple
            placeholder="请选择GPU设备"
            resource="isolated_devices" />
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
        fi: {
          isOpenGpu: false,
        },
      },
      decorators: {
        device: [
          'device',
          {
            rules: [
              { required: true, message: '请选择GPU设备', trigger: 'change' },
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
      bindGpus: [],
      bindGpusNames: [],
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
  },
  watch: {
    bindGpus (val) {
      this.form.fc.setFieldsValue({ device: val })
      if (val && val.length > 0) {
        this.form.fi.isOpenGpu = true
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
        if (this.form.fi.isOpenGpu) {
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
    labelFormat (val) {
      return val.model
    },
    mapper (list) {
      return list.filter((val) => {
        if (val.guest) {
          if (val.guest_id === this.selectedItems[0].id) {
            this.bindGpus.push(val.id)
            this.bindGpusNames.push(val.model)
          }
          return false
        }
        return true
      })
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        if (key === 'device') {
          this.form.fd[key] = [values[key]]
        } else {
          this.form.fd[key] = values[key]
        }
      })
    },
  },
}
</script>
