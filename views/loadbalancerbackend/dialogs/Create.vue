<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item label="类型">
          <a-radio-group v-decorator="decorators.backend_type" @change="handleBackendTypeChange">
            <a-radio-button v-for="(v, k) in backendTypes" :value="k" :key="k">{{v}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item key="server" :label="$t('dictionary.server')" v-show="backend_type === 'guest'">
          <base-select
            resource="servers"
            need-params
            filterable
            :params="serverParams"
            v-decorator="decorators.guest_backend"
            show-sync
            :mapper="serverlistMapper"
            :select-props="{ placeholder: `请选择${$t('dictionary.server')}` }" />
            <div slot="extra">
            没有想要的{{ $t('dictionary.server') }}？可以前往
            <help-link :href="serverHref"> 新建</help-link>
          </div>
        </a-form-item>
        <a-form-item key="host" :label="$t('dictionary.host')" v-show="backend_type === 'host'">
          <base-select
            show-sync
            class="w-100"
            v-decorator="decorators.host_backend"
            resource="hosts"
            :params="hostParams"
            :select-props="{ placeholder: '请选择宿主机' }" />
        </a-form-item>
        <a-form-item key="ip" label="IP地址" v-show="backend_type === 'ip'" extra="支持通过IP地址选择未被OneCloud纳管的服务器作为后端服务器">
          <a-input v-decorator="decorators.ip_backend" placeholder="请输入IP" />
        </a-form-item>
        <a-form-item label="端口" extra="端口范围是1-65535，同一台服务器在一个组中，端口不可以重复">
          <a-input-number v-decorator="decorators.port" />
        </a-form-item>
        <a-form-item label="权重" :extra="`权重范围是0-${params.maxWeight}，权重越大转发到该服务器的请求越多`">
          <a-input-number v-decorator="decorators.weight" />
        </a-form-item>
        <a-form-item label="SSL" extra="通过加密方式访问后端服务器">
          <a-switch v-decorator="decorators.ssl" />
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
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'LoadbalancerbackendCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      backend_type: 'guest',
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
    backendTypes () {
      const _ = {
        guest: '指定虚拟机',
        host: '指定宿主机',
        ip: '外部机器',
      }
      const { isAdminMode, isDomainMode } = this.$store.getters
      if (!isAdminMode && !isDomainMode) {
        delete _.host
      }
      return _
    },
    decorators () {
      const isRequired = (k) => this.backend_type === k
      return {
        backend_type: [
          'backend_type',
          {
            initialValue: 'guest',
            rules: [
              { required: true, message: '请选择类型' },
            ],
          },
        ],
        guest_backend: [
          'guest_backend',
          {
            rules: [
              { required: isRequired('guest'), message: '请指定虚拟机' },
            ],
          },
        ],
        host_backend: [
          'host_backend',
          {
            rules: [
              { required: isRequired('host'), message: '请指定宿主机' },
            ],
          },
        ],
        ip_backend: [
          'ip_backend',
          {
            validateFirst: true,
            rules: [
              { required: isRequired('ip'), message: '请指定IP' },
              { validator: this.$validate('IPv4', false) },
            ],
          },
        ],
        port: [
          'port',
          {
            validateFirst: true,
            initialValue: 1,
            rules: [
              { required: true, message: '请输入端口' },
              { type: 'number', min: 1, max: 65535, message: '端口范围在1-65535之间' },
            ],
          },
        ],
        weight: [
          'weight',
          {
            validateFirst: true,
            initialValue: 1,
            rules: [
              { required: true, message: '请输入权重' },
              { type: 'number', min: 0, max: this.params.maxWeight, message: `端口范围在1-${this.params.maxWeight}之间` },
            ],
          },
        ],
        ssl: ['ssl'],
      }
    },
    serverHref () {
      const { provider } = this.params.lbBackendgroupData
      const platform = findPlatform(provider, 'provider')
      const platformArr = ['idc', 'private', 'public']
      if (platformArr.includes(platform)) return `/vminstance/create?type=${platform}`
      return '/vminstance/create'
    },
    serverParams () {
      const params = {
        'filter.0': 'status.equals(running,ready)',
        region: this.params.lbBackendgroupData.region_id,
        scope: this.$store.getters.scope,
        project: this.params.lbBackendgroupData.tenant_id,
      }
      if (this.params.lbBackendgroupData.vpc_id) {
        params.vpc = this.params.lbBackendgroupData.vpc_id
      }
      // 网络是公网的阿里云LB实例，添加服务器时不应传参数vpc
      if (this.params.lbBackendgroupData.address_type === 'internet' && this.params.lbBackendgroupData.brand.toLowerCase() === 'aliyun') {
        delete params.vpc
      }
      return params
    },
    hostParams () {
      return {
        brand: 'OneCloud',
        'filter.0': 'status.equals(running,ready)',
      }
    },
  },
  methods: {
    handleBackendTypeChange (e) {
      this.form.fc.setFieldsValue({
        backend: undefined,
      }, () => {
        this.backend_type = e.target.value
      })
    },
    serverlistMapper (list) {
      return list.filter(v => {
        if (v.nics) { // is_exit=false 表示内网网卡，有一个为false既可做负载均衡服务器
          return v.nics.some(n => n.is_exit === false)
        }
        return true
      })
    },
    async doCreate (values) {
      const { backend_type } = values
      const data = {
        ...values,
        backend_group: this.params.lbBackendgroupData.id,
        ssl: values ? 'on' : 'off',
        backend: values[`${backend_type}_backend`],
      }
      await new this.$Manager('loadbalancerbackends').create({
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
