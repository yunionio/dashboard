<template>
  <div>
    <page-header :title="$t('k8s.text_146')" />
    <a-alert :showIcon="true" type="info" banner class="mt-2">
      <template slot="message">
        <div>
          <p>{{$t('k8s.text_147')}}</p>
          <p>{{$t('k8s.text_148')}}</p>
          <p>{{$t('k8s.text_149')}}</p>
        </div>
      </template>
    </a-alert>
    <a-alert :showIcon="true" type="error" v-if="!preCheckResp.pass">
      <template slot="message">
        <div>
          {{$t('k8s.provider_image_not_prepared')}}
          <help-link :href="docs[provider.hypervisor]">{{$t('k8s.ref_prepare_doc')}}</help-link>
        </div>
      </template>
    </a-alert>
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-form-item
        :label="$t('k8s.text_412')"
        v-bind="formItemLayout">
        <base-select
          v-if="$store.getters.isAdminMode"
          v-decorator="decorators.project_domain_id"
          resource="domains"
          version="v1"
          :params="params.domain"
          @change="domainChange"
          is-default-select
          filterable />
        <div v-else>{{ $store.getters.userInfo.projectDomain }}</div>
      </a-form-item>
      <a-form-item
        :label="$t('k8s.platform')"
        v-bind="formItemLayout">
        <a-radio-group
          v-decorator="decorators.provider(provider)"
          v-if="providers.length"
          @change="providerChange">
          <a-radio-button v-for="item in providers" :key="item.value" :value="item">
            {{ item.label }}
          </a-radio-button>
        </a-radio-group>
        <div v-else>{{ $t('common_467') }}</div>
      </a-form-item>
      <a-form-item :label="$t('k8s.region')" class="mb-0" v-bind="formItemLayout" v-if="provider.brand">
        <cloudregion-vpc
          :cloudregion-params="cloudregionParams"
          :vpc-params="params.vpcParams"
          :decorator="decorators.regionVpc" />
      </a-form-item>
      <a-form-item
        :label="$t('k8s.text_41')"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_152')" v-if="cloudregionId" v-bind="formItemLayout">
        <server-config
          :form="form"
          :cloudregionId="cloudregionId"
          :decorator="decorators.serverConfig"
          :hypervisor="hypervisor"
          :platform="platform"
          :networkParams="params.network" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_153')" v-bind="formItemLayout">
        <base-select
          v-decorator="decorators.version"
          :options="k8sVersionOps"
          :filterable="true"
          :select-props="{ placeholder: $t('k8s.text_154') }" />
      </a-form-item>
      <!-- <a-form-item :label="$t('k8s.text_155')" v-bind="formItemLayout" v-if="isAdminMode">
        <a-switch :checkedChildren="$t('k8s.text_156')" :unCheckedChildren="$t('k8s.text_157')" v-decorator="decorators.is_public" />
      </a-form-item> -->
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
/* import * as R from 'ramda' */
import { mapGetters } from 'vuex'
import { HYPERVISORS_MAP } from '@/constants'
import { KUBE_PROVIDER, K8S_HYPERVISORS_MAP, getClusterDocs } from '../constants'
import ServerConfig from '@K8S/sections/serverConfig'
import CloudregionVpc from '@/sections/CloudregionVpc'
import { isWithinRange, isRequired } from '@/utils/validate'
import { findPlatform } from '@/utils/common/hypervisor'

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
    CloudregionVpc,
    ServerConfig,
  },
  data () {
    return {
      loading: false,
      providers: [],
      provider: {},
      cloudregionId: '',
      capability: {},
      preCheckResp: {
        pass: true,
      },
      docs: getClusterDocs(this.$store.getters.scope),
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.vpc && values.vpc.key) {
              this.params.network = {
                vpc: values.vpc.key,
                filter: 'server_type.notin(ipmi, pxe)',
                scope: this.scope,
              }
            }
            if (values.cloudregion && values.cloudregion.key) {
              this.cloudregionId = values.cloudregion.key
            }
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fi: {
          /* hypervisors: ['kvm'], */
          /* capability: {}, */
        },
        fd: {
          /* hypervisor: hyperOpts[0].value, */
          project_domain_id: this.$store.getters.projectDomainId,
        },
      },
      decorators: {
        project_domain_id: [
          'project_domain_id',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_413') },
            ],
          },
        ],
        provider: defaultProvider => [
          'provider',
          {
            initialValue: defaultProvider,
            rules: [
              { required: true, message: this.$t('k8s.text_164') },
            ],
          },
        ],
        regionVpc: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: this.$t('k8s.text_165') },
              ],
            },
          ],
          vpc: [
            'vpc',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: this.$t('k8s.text_165') },
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
          sku: i => [
            `sku[${i}]`,
            {
              rules: [
                { validator: isRequired(true, 'id'), message: this.$t('compute.text_216') },
              ],
            },
          ],
          imageOS: i => [
            `image[${i}]`,
            {
              rules: [
                { validator: isRequired(true, 'id'), message: this.$t('compute.text_214') },
              ],
            },
          ],
          /*
           * vcpu_count: i => [
           *   `vcpu_count[${i}]`,
           *   {
           *     initialValue: 4,
           *     rules: [
           *       { required: true, message: this.$t('k8s.text_99') },
           *       { validator: this.validator('vcpu_count') },
           *     ],
           *   },
           * ],
           * vmem_size: i => [
           *   `vmem_size[${i}]`,
           *   {
           *     initialValue: 4,
           *     rules: [
           *       { required: true, message: this.$t('k8s.text_167') },
           *       { validator: this.validator('vmem_size') },
           *     ],
           *   },
           * ],
           */
          disk: i => ({
            type: [
              `systemDiskType[${i}]`,
              {
                rules: [
                  { validator: isRequired(), message: this.$t('compute.text_121') },
                ],
              },
            ],
            size: [
              `systemDiskSize[${i}]`,
              {
                rules: [
                  { required: true, message: this.$t('compute.text_122') },
                ],
              },
            ],
            schedtag: [
              `systemDiskSchedtag[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policy: [
              `systemDiskPolicy[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
          }),
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
              rules: [
                { required: true },
              ],
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
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 2 },
        },
      },
      params: {
        vpcParams: {
          usable: true,
          show_emulated: true,
          order_by: 'created_at',
          order: 'asc',
          scope: this.scope,
          'filter.0': 'external_access_mode.in(eip,eip-distgw)',
        },
        network: {},
        k8sVersions: {
          provider: KUBE_PROVIDER,
          resource_type: 'guest',
        },
        domain: {
          scope: this.$store.getters.scope,
          limit: 0,
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
    cloudregionParams () {
      const provider = this.provider
      /* const type = findPlatform(provider, 'hypervisor') */
      const param = {
        usable: true,
        usable_vpc: true,
        project_domain: this.form.fd.project_domain_id,
        brand: provider.brand,
      }
      /*
       * switch (type) {
       *   case 'idc':
       *     param = { cloud_env: 'onpremise' }
       *     break
       *   case 'public':
       *     param = { cloud_env: 'public' }
       *     break
       *   case 'private':
       *     param = { cloud_env: 'private', show_emulated: true }
       *     break
       *   default :
       *     param = { is_on_premise: true }
       * }
       */
      return param
    },
    hypervisor () {
      return this.provider.hypervisor
    },
    platform () {
      return findPlatform(this.hypervisor, 'hypervisor')
    },
  },
  created () {
    this.clustersM = new this.$Manager('kubeclusters', 'v1')
    this.form.fc.getFieldDecorator('cloudregion', { preserve: true })
    /* this.form.fc.getFieldDecorator('zone', { preserve: true }) */
    this.fetchK8sVersions()
  },
  methods: {
    /*
     * async fetchCapability (id, resource) {
     *   const params = {
     *     show_emulated: true,
     *     resource_type: 'shared',
     *     scope: this.scope,
     *   }
     *   const capabilityParams = { id, spec: 'capability', params }
     *   if (!id) return
     *   this.capabilityParams = capabilityParams
     *   try {
     *     const { data } = await new this.$Manager(`${resource}s`).getSpecific(this.capabilityParams)
     *     let hypervisors = R.is(Object, data) ? (data.hypervisors || []) : []
     *     if (hypervisors.includes(HYPERVISORS_MAP.kvm.key)) { // kvm 排序为第一个
     *       hypervisors = [HYPERVISORS_MAP.kvm.key].concat(hypervisors).filter(val => val !== 'baremetal')
     *     }
     *     hypervisors = Array.from(new Set(hypervisors))
     *     this.form.fi.hypervisors = hypervisors
     *     this.form.fi.capability = data
     *   } catch (error) {
     *     throw error
     *   }
     * },
     */
    domainChange (val) {
      this.form.fd.project_domain_id = val
      this.fetchCapability(val)
    },
    fetchCapability (domainId) {
      new this.$Manager('capabilities', 'v2').list({
        params: {
          domain: domainId,
          scope: this.scope,
        },
      }).then(({ data }) => {
        this.capability = data.data[0]
        this.updateProviders(this.capability)
      })
    },
    updateProviders (capability) {
      const brands = capability.brands || []
      const providers = Object.entries(K8S_HYPERVISORS_MAP).filter(item => {
        const itemProvider = item[1].provider
        return brands.includes(itemProvider)
      }).map(item => item[1])
      this.providers = providers
      if (this.providers.length > 0) {
        // set default provider
        this.provider = this.providers[0]
        this.preCheckK8sProvider(this.provider)
      }
    },
    providerChange (e) {
      this.provider = e.target.value
      this.cloudregionId = ''
      this.preCheckK8sProvider(this.provider)
      /*
       * const type = findPlatform(provider, 'hypervisor')
       * let param = {
       *   usable: true,
       *   project_domain: this.form.fd.project_domain_id,
       *   brand: provider.brand,
       * }
       * switch (type) {
       *   case 'idc':
       *     param = { cloud_env: 'onpremise' }
       *     break
       *   case 'public':
       *     param = { cloud_env: 'public' }
       *     break
       *   case 'private':
       *     param = { cloud_env: 'private', show_emulated: true }
       *     break
       *   default :
       *     param = { is_on_premise: true }
       * }
       * this.params.cloudregion = {
       *   ...this.params.cloudregion,
       *   ...param,
       * }
       */
    },
    preCheckK8sProvider (provider) {
      this.clustersM.performAction({
        id: 'pre-check',
        action: '',
        data: {
          provider: this.provider.hypervisor,
          resource_type: 'guest',
        },
      }).then(({ data }) => {
        this.preCheckResp = data
      })
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
      const { provider, version: k8sVersion, name, vpc, cloudregion, sku } = data
      const hypervisor = provider.hypervisor
      const values = {
        project_domain_id: data.project_domain_id,
        version: k8sVersion,
        machines: [],
        name,
        resource_type: 'guest',
        cloudregion_id: cloudregion.key,
        vpc_id: vpc.key,
      }
      if (data.image_repository_url) {
        values.image_repository = {}
        values.image_repository.url = data.image_repository_url
      }
      if (data.image_repository_insecure) values.image_repository.insecure = data.image_repository_insecure
      Object.keys(data.sku).map(key => {
        const disks = [{
          index: 0,
          size: data.systemDiskSize[key] * 1024,
          backend: data.systemDiskType[key].key,
        }]
        if (data.systemDiskSchedtag) {
          if (data.systemDiskSchedtag[key] && data.systemDiskPolicy[key]) {
            disks[0].schedtags = [{ id: data.systemDiskSchedtag[key], strategy: data.systemDiskPolicy[key] }]
          }
        }
        if (hypervisor === HYPERVISORS_MAP.kvm.key && disks[0].backend.indexOf('local') !== -1) {
          disks[0].medium = disks[0].backend.split('-')[1]
          disks[0].backend = disks[0].backend.split('-')[0]
        }
        const machinesItem = {
          vm: {
            /* vcpu_count: data.vcpu_count[key], */
            /* vmem_size: data.vmem_size[key] * 1024, */
            instance_type: sku[key].name,
            hypervisor,
            disks,
            nets: [{ network: data.network[key] }],
          },
        }
        if (data.ip && data.ip[key]) machinesItem.vm.nets[0].address = data.ip[key]
        if (data.num[key] > 1) {
          for (let i = 0; i < data.num[key]; i++) {
            values.machines.push({ config: machinesItem, role: data.role[key], resource_type: 'vm' })
          }
        } else {
          values.machines.push({ config: machinesItem, role: data.role[key], resource_type: 'vm' })
        }
      })
      return values
    },
    async handleConfirm () {
      if (!this.providers || !this.providers.length) {
        this.$message.error(this.$t('common_468'))
        return
      }
      try {
        const values = await this.form.fc.validateFields()
        const genValues = this.genData(values)
        const hasControl = genValues.machines.some(val => val.role === 'controlplane')
        if (!hasControl) {
          this.$message.warning(this.$t('k8s.text_175'))
          this.loading = false
          return
        }
        this.loading = true
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
