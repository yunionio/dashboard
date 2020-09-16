<template>
  <div>
    <page-header :title="$t('k8s.text_146')" />
    <a-alert :showIcon="false" banner class="mt-2">
      <template slot="message">
        <div>
          <p>{{$t('k8s.text_147')}}</p>
          <p>{{$t('k8s.text_148')}}</p>
          <p>{{$t('k8s.text_149')}}</p>
        </div>
      </template>
    </a-alert>
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-form-item
        :label="$t('k8s.text_150')"
        v-bind="formItemLayout">
        <a-radio-group v-if="hypervisorsC.length" v-decorator="decorators.hypervisor" @change="hypervisorChange">
          <a-radio-button v-for="item in hypervisorsC" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-radio-button>
        </a-radio-group>
        <div v-else>{{ $t('common_467') }}</div>
      </a-form-item>
      <a-form-item :label="$t('k8s.text_151')" class="mb-0" v-bind="formItemLayout">
        <cloudregion-zone
          :zone-params="params.zone"
          :cloudregion-params="params.region"
          :decorator="decorators.regionZone" />
      </a-form-item>
      <a-form-item
        :label="$t('k8s.text_41')"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_152')" v-bind="formItemLayout">
        <server-config :decorator="decorators.serverConfig" :network-params="params.network" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_153')" v-bind="formItemLayout">
        <base-select
          v-decorator="decorators.version"
          :options="k8sVersionOps"
          :filterable="true"
          :select-props="{ placeholder: $t('k8s.text_154') }" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_155')" v-bind="formItemLayout" v-if="isAdminMode">
        <a-switch :checkedChildren="$t('k8s.text_156')" :unCheckedChildren="$t('k8s.text_157')" v-decorator="decorators.is_public" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_158')" v-bind="formItemLayout">
        <a-switch :checkedChildren="$t('k8s.text_156')" :unCheckedChildren="$t('k8s.text_157')" v-decorator="decorators.isConfigImage" @change="isConfigImageChange" />
      </a-form-item>
      <a-form-item
        v-if="isConfigImage"
        :label="$t('k8s.text_52')"
        v-bind="formItemLayout"
        :extra="$t('k8s.text_159')">
        <a-input v-decorator="decorators.image_repository_url" :placeholder="$t('k8s.text_160')" />
      </a-form-item>
      <a-form-item v-if="isConfigImage" :wrapper-col="{ span: 20, offset: 3 }">
        <a-checkbox v-decorator="decorators.image_repository_insecure">{{$t('k8s.text_161')}}</a-checkbox>
      </a-form-item>
    </a-form>
    <page-footer>
      <div slot="right">
        <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{$t('common.create')}}</a-button>
        <a-button @click="cancel">{{ $t('dialog.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { hyperOpts, KUBE_PROVIDER } from '../constants'
import ServerConfig from '@K8S/sections/serverConfig'
import CloudregionZone from '@/sections/CloudregionZone'
import { isWithinRange } from '@/utils/validate'
import { findPlatform } from '@/utils/common/hypervisor'
import { HYPERVISORS_MAP } from '@/constants'

function checkIpInSegment (i, networkData) {
  return (rule, value, _callback) => {
    const isIn = isWithinRange(value, networkData.guest_ip_start, networkData.guest_ip_end)
    if (isIn) {
      _callback()
    } else {
      _callback(this.$t('k8s.text_163'))
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
              this.fetchCapability(values.zone.key, 'zone')
            }
            if (values.cloudregion && values.cloudregion.key) {
              this.fetchCapability(values.cloudregion.key, 'cloudregion')
            }
          },
        }),
        fi: {
          hypervisors: ['kvm'],
        },
      },
      decorators: {
        hypervisor: [
          'hypervisor',
          {
            initialValue: hyperOpts[0].value,
            rules: [
              { required: true, message: this.$t('k8s.text_164') },
            ],
          },
        ],
        regionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: this.$t('k8s.text_165') },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: this.$t('k8s.text_166') },
              ],
            },
          ],
        },
        name: [
          'name',
          {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: this.$t('k8s.text_60') },
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
                { required: true, message: this.$t('k8s.text_99') },
                { validator: this.validator('vcpu_count') },
              ],
            },
          ],
          vmem_size: i => [
            `vmem_size[${i}]`,
            {
              initialValue: 4,
              rules: [
                { required: true, message: this.$t('k8s.text_167') },
                { validator: this.validator('vmem_size') },
              ],
            },
          ],
          disk: i => [
            `disk[${i}]`,
            {
              initialValue: 100,
              rules: [
                { required: true, message: this.$t('k8s.text_168') },
                { validator: this.validator('disk') },
              ],
            },
          ],
          network: i => [
            `network[${i}]`,
            {
              rules: [
                { required: true, message: this.$t('k8s.text_122') },
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
                message: this.$t('k8s.text_169'),
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
                { required: true, message: this.$t('k8s.text_170') },
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
        version: [
          'version',
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
              { required: true, message: this.$t('k8s.text_53') },
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
        return (this.form.fi.hypervisors || []).find(val => val === item.value.toLowerCase())
      })
      return opts
    },
  },
  watch: {
    hypervisorsC (val) {
      if (val && val.length) {
        if (val[0].value !== this.decorators.hypervisor[1].initialValue) {
          this.form.fc.setFieldsValue({
            [this.decorators.hypervisor[0]]: val[0].value,
          })
        }
      }
    },
  },
  created () {
    this.form.fc.getFieldDecorator('cloudregion', { preserve: true })
    this.form.fc.getFieldDecorator('zone', { preserve: true })
    this.fetchK8sVersions()
  },
  methods: {
    async fetchCapability (id, resource) {
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        scope: this.scope,
      }
      const capabilityParams = { id, spec: 'capability', params }
      if (!id) return
      this.capabilityParams = capabilityParams
      try {
        const { data } = await new this.$Manager(`${resource}s`).getSpecific(this.capabilityParams)
        let hypervisors = R.is(Object, data) ? (data.hypervisors || []) : []
        if (hypervisors.includes(HYPERVISORS_MAP.kvm.key)) { // kvm 排序为第一个
          hypervisors = [HYPERVISORS_MAP.kvm.key].concat(hypervisors).filter(val => val !== 'baremetal')
        }
        hypervisors = Array.from(new Set(hypervisors))
        this.form.fi.hypervisors = hypervisors
      } catch (error) {
        throw error
      }
    },
    hypervisorChange (e) {
      const type = findPlatform(e.target.value, 'hypervisor') || 'idc'
      let param = {}
      switch (type) {
        case 'idc':
          param = { cloud_env: 'onpremise' }
          break
        case 'public':
          param = { cloud_env: 'public' }
          break
        case 'private':
          param = { cloud_env: 'private', show_emulated: true }
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
        this.form.fc.setFieldsValue({ version: data[0] })
      })
    },
    isConfigImageChange (val) {
      this.isConfigImage = val
    },
    validator (type) {
      return (rule, value, _callback) => {
        if (type === 'vcpu_count') {
          if (value < 4 || value > 32) {
            return _callback(this.$t('k8s.text_172'))
          }
        } else if (type === 'vmem_size') {
          if (value < 4 || value > 128) {
            return _callback(this.$t('k8s.text_173'))
          }
        } else if (type === 'disk') {
          if (value < 1 || value > 500) {
            return _callback(this.$t('k8s.text_174'))
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
      const { hypervisor, is_public: isPublic, version: k8sVersion, name, zone, cloudregion } = data
      const values = {
        hypervisor,
        is_public: isPublic,
        version: k8sVersion,
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
        values.image_repository.url = data.image_repository_url
      }
      if (data.image_repository_insecure) values.image_repository.insecure = data.image_repository_insecure
      data.vcpu_count.map((item, index) => {
        const machinesItem = {
          vm: {
            vcpu_count: item,
            vmem_size: data.vmem_size[index] * 1024,
            hypervisor,
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
      if (!this.hypervisorsC || !this.hypervisorsC.length) {
        this.$message.error(this.$t('common_468'))
        return
      }
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const genValues = this.genData(values)
        const hasControl = genValues.machines.some(val => val.role === 'controlplane')
        if (!hasControl) {
          this.$message.warning(this.$t('k8s.text_175'))
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
