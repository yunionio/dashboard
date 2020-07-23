<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
      <a-alert :showIcon="false" banner class="mt-2">
        <template slot="message">
          <div>
            <p>控制节点(controlplane)：同时运行 kube-apiserver 和 etcd 的节点，默认不运行pod，建议部署 1个或 3个</p>
            <p>计算节点(node)：只运行 pod 的节点</p>
          </div>
        </template>
      </a-alert>
      <a-form
      class="mt-3"
      :form="form.fc">
        <a-form-item label="区域" class="mb-0" v-bind="formItemLayout">
          <cloudregion-zone
            :zone-params="param.zone"
            :cloudregion-params="param.region"
            :decorator="decorators.regionZone" />
        </a-form-item>
        <a-form-item label="机器配置" v-bind="formItemLayout">
          <server-config :decorator="decorators.serverConfig" :network-params="param.network" />
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
import { mapGetters } from 'vuex'
import ServerConfig from '@K8S/sections/serverConfig'
import { KUBE_PROVIDER } from '@K8S/views/cluster/constants'
import CloudregionZone from '@/sections/CloudregionZone'
import { isWithinRange } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

function checkIpInSegment (i, networkData) {
  return (rule, value, _callback) => {
    const isIn = isWithinRange(value, networkData.guest_ip_start, networkData.guest_ip_end)
    if (isIn) {
      _callback()
    } else {
      _callback('输入的IP不在选择子网网段中')
    }
  }
}

export default {
  name: 'CreateKubemachinesDialog',
  components: {
    CloudregionZone,
    ServerConfig,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.zone && values.zone.key) {
              this.param.network = {
                zone: values.zone.key,
                filter: 'server_type.notin(ipmi, pxe)',
                scope: this.scope,
              }
            }
          },
        }),
      },
      decorators: {
        regionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: '请选择区域' },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: '请选择可用区' },
              ],
            },
          ],
        },
        serverConfig: {
          vcpu_count: i => [
            `vcpu_count[${i}]`,
            {
              initialValue: 4,
              rules: [
                { required: true, message: '请输入CPU核数' },
                { validator: this.validator('vcpu_count') },
              ],
            },
          ],
          vmem_size: i => [
            `vmem_size[${i}]`,
            {
              initialValue: 4,
              rules: [
                { required: true, message: '请输入内存大小' },
                { validator: this.validator('vmem_size') },
              ],
            },
          ],
          disk: i => [
            `disk[${i}]`,
            {
              initialValue: 100,
              rules: [
                { required: true, message: '请输入磁盘大小' },
                { validator: this.validator('disk') },
              ],
            },
          ],
          network: i => [
            `network[${i}]`,
            {
              rules: [
                { required: true, message: '请选择IP子网' },
              ],
            },
          ],
          ip: (i, networkData) => [
            `ip[${i}]`,
            {
              validateFirst: true,
              validateTrigger: ['blur', 'change'],
              rules: [{
                required: true,
                message: '请输入ip',
              }, {
                validator: checkIpInSegment(i, networkData),
              }],
            },
          ],
          num: i => [
            `num[${i}]`,
            {
              initialValue: 1,
            },
          ],
          role: i => [
            `role[${i}]`,
            {
              initialValue: 'controlplane',
            },
          ],
        },
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      param: {
        zone: {
          usable: true,
          show_emulated: true,
          order_by: 'created_at',
          order: 'asc',
          scope: this.scope,
        },
        region: {
          usable: true,
          scope: this.scope,
          cloud_env: 'onpremise',
        },
        network: {},
        k8sVersions: {
          provider: KUBE_PROVIDER,
          resource_type: 'guest',
        },
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    ...mapGetters(['scope']),
  },
  created () {
    this.form.fc.getFieldDecorator('cloudregion', { preserve: true })
    this.form.fc.getFieldDecorator('zone', { preserve: true })
  },
  methods: {
    validator (type) {
      return (rule, value, _callback) => {
        if (type === 'vcpu_count') {
          if (value < 4 || value > 32) {
            return _callback('输入范围 4 - 32 核')
          }
        } else if (type === 'vmem_size') {
          if (value < 4 || value > 128) {
            return _callback('输入范围 4 - 128 G')
          }
        } else if (type === 'disk') {
          if (value < 1 || value > 128) {
            return _callback('输入范围 40 - 500 G')
          }
        }
        return _callback()
      }
    },
    doCreate (data) {
      return new this.$Manager('kubeclusters', 'v1').performAction({
        id: this.params.data.name,
        action: 'add-machines',
        data,
      })
    },
    genData (data) {
      const values = {
        machines: [],
      }
      data.vcpu_count.map((item, index) => {
        const machinesItem = {
          vm: {
            vcpu_count: item,
            vmem_size: data.vmem_size[index] * 1024,
            disks: [{ index: 0, size: data.disk[index] * 1024 }],
            nets: [{ network: data.network[index] }],
          },
        }
        if (data.ip && data.ip.length > 0) machinesItem.vm.nets[0].address = data.ip[index]
        if (data.num[index] > 1) {
          for (let i = 0; i < data.num[index]; i++) {
            values.machines.push({ config: machinesItem, role: data.role[index], resource_type: 'vm' })
          }
        } else {
          values.machines.push({ config: machinesItem, role: data.role[index], resource_type: 'vm' })
        }
      })
      return values
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const genValues = this.genData(values)
        await this.doCreate(genValues)
        this.loading = false
        this.$message.success('创建节点成功，并开始部署')
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
