<template>
  <div>
    <page-header title="新建集群" />
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
      <a-form-item
        label="平台"
        v-bind="formItemLayout">
        <a-radio-group v-decorator="decorators.hypervisor">
          <a-radio-button v-for="item in hypervisorsC" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="区域" class="mb-0" v-bind="formItemLayout">
        <cloudregion-zone
          :zone-params="params.zone"
          :cloudregion-params="params.region"
          :decorator="decorators.regionZone" />
      </a-form-item>
      <a-form-item
        label="名称"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item label="机器配置" v-bind="formItemLayout">
        <server-config :decorator="decorators.serverConfig" />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
        <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{$t('dialog.ok')}}</a-button>
        <a-button @click="cancel">取消</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ServerConfig from '@K8S/sections/serverConfig'
import { hyperOpts } from '../constants'
import CloudregionZone from '@/sections/CloudregionZone'

export default {
  name: 'ClusterCreate',
  components: {
    CloudregionZone,
    ServerConfig,
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        hypervisor: [
          'hypervisor',
          {
            rules: [
              { required: true, message: '请选择平台' },
            ],
          },
        ],
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
        name: [
          'name',
          {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('serverName') },
            ],
          },
        ],
        serverConfig: {
          vcpu_count: [
            'vcpu_count',
            {
              initialValue: 4,
              rules: [
                { required: true, message: '请输入CPU核数' },
                { validator: this.validator('vcpu_count') },
              ],
            },
          ],
          vmem_size: [
            'vmem_size',
            {
              initialValue: 4,
              rules: [
                { required: true, message: '请输入内存大小' },
                { validator: this.validator('vmem_size') },
              ],
            },
          ],
          disk: [
            'disk',
            {
              initialValue: 100,
              rules: [
                { required: true, message: '请输入磁盘大小' },
                { validator: this.validator('disk') },
              ],
            },
          ],
        },
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      params: {
        zone: {},
        region: {
          usable: true,
          is_on_premise: true,
          scope: this.$store.getters.scope,
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
    ...mapGetters(['userInfo']),
    hypervisorsC () {
      const opts = hyperOpts.filter(item => {
        return this.userInfo.hypervisors.find(val => val === item.value.toLowerCase() || item.external)
      })
      this.form.fc.getFieldDecorator('hypervisor', { preserve: true, initialValue: opts.length ? opts[0].value : '' })
      if (!opts.length) {
        this.$message.error('无可用平台')
      }
      return opts
    },
  },
  created () {
    this.form.fc.getFieldDecorator('cloudregion', { preserve: true })
    this.form.fc.getFieldDecorator('zone', { preserve: true })
  },
  methods: {
    validator (type) {
      return (rule, value, _callback) => {
        if (type === 'vcpu_count') {
          if (value < 2 || value > 32) {
            return _callback('输入范围 2 - 32 核')
          }
        } else if (type === 'vmem_size') {
          if (value < 1 || value > 128) {
            return _callback('输入范围 1 - 128 G')
          }
        } else if (type === 'disk') {
          if (value < 1 || value > 128) {
            return _callback('输入范围 40 - 500 G')
          }
        }
        return _callback()
      }
    },
    handleConfirm () {},
    cancel () {},
  },
}
</script>
