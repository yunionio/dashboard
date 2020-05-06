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
        <a-radio-group v-decorator="decorators.hypervisor" @change="hypervisorChange">
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
        <server-config :decorator="decorators.serverConfig" :network-params="params.network" />
      </a-form-item>
      <a-form-item label="版本" v-bind="formItemLayout">
        <base-select
          v-decorator="decorators.k8s_version"
          :options="k8sVersionOps"
          :filterable="true"
          :select-props="{ placeholder: '输入关键词搜索' }" />
      </a-form-item>
      <a-form-item label="设置为公有" v-bind="formItemLayout" v-if="isAdminMode">
        <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.is_public" />
      </a-form-item>
      <a-form-item label="镜像仓库" v-bind="formItemLayout">
        <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.isConfigImage" @change="isConfigImageChange" />
      </a-form-item>
      <a-form-item
        v-if="isConfigImage"
        label="镜像仓库地址"
        v-bind="formItemLayout"
        extra="比如: registry.hub.docker.com/yunion">
        <a-input v-decorator="decorators.image_repository_url" placeholder="请输入镜像仓库的地址" />
      </a-form-item>
      <a-form-item v-if="isConfigImage" :wrapper-col="{ span: 20, offset: 3 }">
        <a-checkbox v-decorator="decorators.image_repository_insecure">是否为不安全</a-checkbox>
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
import { hyperOpts, KUBE_PROVIDER } from '../constants'
import CloudregionZone from '@/sections/CloudregionZone'
import { isWithinRange } from '@/utils/validate'
import { findPlatform } from '@/utils/common/hypervisor'

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
  name: 'ClusterCreate',
  components: {
    CloudregionZone,
    ServerConfig,
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.zone && values.zone.key) {
              this.params.network = {
                zone: values.zone.key,
                filter: 'server_type.notin(ipmi, pxe)',
                scope: this.scope,
              }
            }
          },
        }),
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
              rules: [
                { required: true, message: '请填写数量' },
              ],
            },
          ],
          role: i => [
            `role[${i}]`,
            {
              initialValue: 'controlplane',
            },
          ],
        },
        k8s_version: [
          'k8s_version',
        ],
        is_public: [
          'is_public',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
        isConfigImage: [
          'isConfigImage',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
        image_repository_url: [
          'image_repository_url',
          {
            rules: [
              { required: true, message: '请输入镜像仓库地址' },
            ],
          },
        ],
        image_repository_insecure: [
          'image_repository_insecure',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
      },
      isConfigImage: false,
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      params: {
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
      k8sVersionOps: [],
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'scope', 'isAdminMode']),
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
    this.fetchK8sVersions()
  },
  methods: {
    hypervisorChange (e) {
      const type = findPlatform(e.target.value, 'hypervisor') || 'idc'
      let param = {}
      switch (type) {
        case 'idc':
          param = { 'cloud_env': 'onpremise' }
          break
        case 'public':
          param = { 'cloud_env': 'public' }
          break
        case 'private':
          param = { 'cloud_env': 'private', show_emulated: true }
          break
        default :
          param = { is_on_premise: true }
      }
      this.params.region = {
        ...this.params.region,
        ...param,
      }
    },
    fetchK8sVersions () {
      new this.$Manager('kubeclusters/k8s-versions', 'v1').list({
        params: this.params.k8sVersions,
      }).then(({ data }) => {
        data.map((item, index) => {
          this.k8sVersionOps.push({ key: item, label: item })
        })
        this.form.fc.setFieldsValue({ 'k8s_version': data[0] })
      })
    },
    isConfigImageChange (val) {
      this.isConfigImage = val
    },
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
          if (value < 1 || value > 500) {
            return _callback('输入范围 40 - 500 G')
          }
        }
        return _callback()
      }
    },
    k8sVersionsLabelFormat (val) {
      return val.model
    },
    doCreate (data) {
      return new this.$Manager('kubeclusters', 'v1').create({
        data,
      })
    },
    genData (data) {
      const { hypervisor, is_public: isPublic, k8s_version: k8sVersion, name, zone, cloudregion } = data
      const values = {
        hypervisor,
        is_public: isPublic,
        k8s_version: k8sVersion,
        machines: [],
        name,
        resource_type: 'guest',
        zone: {
          id: zone.key,
          name: zone.name,
          regionId: cloudregion.key,
        },
      }
      if (data.image_repository_url) {
        values.image_repository = {}
        values.image_repository['url'] = data.image_repository_url
      }
      if (data.image_repository_insecure) values.image_repository['insecure'] = data.image_repository_insecure
      data.vcpu_count.map((item, index) => {
        const machinesItem = {
          vm: {
            vcpu_count: item,
            vmem_size: data.vmem_size[index] * 1024,
            hypervisor,
            disk: [{ index: 0, size: data.disk[index] * 1024 }],
            nets: [{ network: data.network[index] }],
          },
        }
        if (data.ip && data.ip.length > 0) machinesItem.vm.nets[0]['address'] = data.ip[index]
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
        const hasControl = genValues.machines.some(val => val.role === 'controlplane')
        if (!hasControl) {
          this.$message.warning('新建集群中最少有一台机器是控制节点')
          this.loading = false
          return
        }
        await this.doCreate(genValues)
        this.loading = false
        this.$router.push('/k8s-cluster')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-cluster')
    },
  },
}
</script>
