<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-spin :spinning="cpuCoresInfoLoading">
        <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
          <a-form-item :label="$t('compute.bind_physical_cpu')">
            <a-switch
              v-decorator="decorators.bindCpuCores"
              :checkedChildren="$t('compute.text_115')"
              :unCheckedChildren="$t('compute.text_116')" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_1058')" v-show="form.fd.bindCpuCores">
            <a-checkbox-group
              v-decorator="decorators.cpuCores"
              style="width: 100%; margin-top: 10px;">
              <a-row v-for="v in hostCores" :key="v">
                <a-col :span="4" v-for="c in v" :key="c">
                  <a-checkbox :value="c">{{ c }}</a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-form-item>
        </a-form>
      </a-spin>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import chunk from 'lodash/chunk'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BindPhysicalCpuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.bind_physical_cpu'),
      cpuCoresInfo: {},
      cpuCoresInfoLoading: false,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          bindCpuCores: false,
        },
      },
      decorators: {
        bindCpuCores: [
          'bindCpuCores',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
        cpuCores: [
          'cpuCores',
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    columns () {
      return this.params.columns.slice(0, 3)
    },
    hostCores () {
      const hostCores = (this.cpuCoresInfo.host_cores || []).sort((a, b) => a - b)
      return chunk(hostCores, 6)
    },
  },
  created () {
    this.loadCpusetCores()
  },
  methods: {
    async loadCpusetCores () {
      try {
        const id = this.params.data[0].id
        const manager = new this.$Manager('servers')
        this.cpuCoresInfoLoading = true
        const { data } = await manager.getSpecific({ id, spec: 'cpuset-cores' })
        this.cpuCoresInfo = data
        this.form.fc.setFieldsValue({
          cpuCores: data.pinned_cores,
          bindCpuCores: data.pinned_cores?.length > 0,
        })
      } catch (error) {
        throw error
      } finally {
        this.cpuCoresInfoLoading = false
      }
    },
    doBindPhysicalSubmit (values) {
      const { bindCpuCores, cpuCores } = values
      const ids = this.params.data.map(item => item.id)
      const params = { cpus: cpuCores }
      if (bindCpuCores) {
        return this.params.onManager('performAction', {
          id: ids[0],
          steadyStatus: ['ready'],
          managerArgs: {
            action: 'cpuset',
            data: params,
          },
        })
      } else {
        return this.params.onManager('performAction', {
          id: ids[0],
          steadyStatus: ['ready'],
          managerArgs: {
            action: 'cpuset-remove',
            data: {},
          },
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doBindPhysicalSubmit(values)
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        this.form.fd[key] = values[key]
      })
    },
  },
}
</script>
