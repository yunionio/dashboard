<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_206')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" v-bind="formItemLayout" class="mb-0">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="domainChange" />
        </a-form-item>
         <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_198')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.platform" @change="platformChange">
            <a-radio-button value="idc">{{$t('network.text_207')}}</a-radio-button>
            <a-radio-button value="private_cloud">{{$t('network.text_208')}}</a-radio-button>
            <a-radio-button value="public_cloud">{{$t('network.text_209')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('network.text_196')" v-bind="formItemLayout"  v-if="selectedPlatform !== 'idc'" key="manager">
          <base-select
            :remote="true"
            v-decorator="decorators.manager"
            resource="cloudproviders"
            :params="providerParams"
            :mapper="providerMapper"
            :label-format="labelFormat"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            @update:item="providerChange"
            :isDefaultSelect="true"
            :select-props="{ placeholder: $t('network.text_210') }"
            style="width: 320px" />
        </a-form-item>
        <a-form-item :label="$t('network.text_199')" v-bind="formItemLayout" key="region">
           <base-select
            :remote="true"
            v-decorator="decorators.region"
            resource="cloudregions"
            :params="regionParams"
            :remote-fn="q => ({ search: q })"
            @update:item="regionChange"
            :isDefaultSelect="true"
            :select-props="{ placeholder: $t('network.text_203') }"
            style="width: 320px" />
        </a-form-item>
        <template v-if="(providerC === 'zstack' || providerC === 'openstack') || (selectedPlatform === 'idc' && this.selectedRegionItem && this.selectedRegionItem.id)">
          <a-form-item :label="$t('network.text_211')" v-bind="formItemLayout">
            <base-select
              :remote="true"
              needParams
              v-decorator="decorators.network"
              resource="networks"
              :params="networkParams"
              :remote-fn="q => ({ filter: `name.contains(${q})` })"
              :select-props="{ placeholder: $t('network.text_212') }" />
          </a-form-item>
          <a-form-item :label="$t('network.text_213')" v-bind="formItemLayout">
            <a-radio-group v-model="inputIpType">
              <template  v-for="(v, k) in this.$t('passwordInputTypes')">
                <a-radio-button v-if="['random', 'password'].indexOf(k) > -1" :value="k" :key="k">
                  {{v}}
                </a-radio-button>
               </template>
            </a-radio-group>
            <a-input v-if="inputIpType === 'password'" v-decorator="decorators.ip_addr" :placeholder="$t('network.text_214')" />
          </a-form-item>
        </template>
        <template v-if="(showBandwidth && selectedPlatform === 'public_cloud') || selectedPlatform === 'idc'">
          <a-form-item :label="$t('network.text_195')" v-bind="formItemLayout">
            <div class="d-flex align-items-center">
              <a-input-number v-if="selectedPlatform === 'idc'" style="width: 120px" :precision="0" :min="1" :max="200" v-decorator="decorators.bandwidth" />
               <a-tooltip v-else placement="top" :title="`范围在 1～${maxBandwidth}Mbps`">
                <a-input-number
                  style="width: 120px"
                  :min="1"
                  :max="maxBandwidth"
                  :step="50"
                  :formatter="format"
                  :parse="format"
                  v-decorator="decorators.bandwidth" />
                  <span class="ml-2">Mbps</span>
                </a-tooltip>
            </div>
          </a-form-item>
          <a-form-item :label="$t('network.text_192')" v-bind="formItemLayout" v-if="selectedPlatform !== 'idc' ">
            <a-radio-group v-decorator="decorators.charge_type" @change="chargeTypeChange">
              <a-radio-button v-for="item in chargeTypeOptions" :value="item.value" :key="item.value">
                {{item.label}}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
        </template>
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
import { mapGetters } from 'vuex'
import DomainProject from '@/sections/DomainProject'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { isRequired } from '@/utils/validate'

export default {
  name: 'EipCreateDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      inputIpType: 'random',
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('dictionary.project'), trigger: 'change' },
            ],
          },
        ],
        platform: [
          'platform',
          {
            initialValue: 'idc',
          },
        ],
        manager: [
          'manager',
          {
            rules: [
              { required: true, message: this.$t('network.text_215') },
            ],
          },
        ],
        region: [
          'region',
          {
            rules: [
              { required: true, message: this.$t('network.text_216') },
            ],
          },
        ],
        // idcRegion: [
        //   'idcRegion',
        //   {
        //     rules: [
        //       { required: true, message: '请输入区域' },
        //     ],
        //   },
        // ],
        network: [
          'network',
          {
            rules: [
              { required: true, message: this.$t('network.text_212') },
            ],
          },
        ],
        ip_addr: [
          'ip_addr',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_217') },
              { validator: this.$validate('IPv4') },
            ],
          },
        ],
        bandwidth: [
          'bandwidth',
          {
            initialValue: 30,
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_218') },
              { validator: this.$validate('serverName') },
            ],
          },
        ],
        charge_type: [
          'charge_type',
          {
            initialValue: 'traffic',
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
      manager: '',
      selectedRegionItem: {},
      showBandwidth: true,
      charge_type: 'traffic',
      selectedPlatform: 'idc',
      providerC: '',
      domain_id: 'default',
      providerParams: {
        enabled: 1,
        details: true,
        public_cloud: true,
        scope: this.$store.getters.scope,
        usable: true,
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    sliderMarks () {
      let ret = { [this.maxBandwidth / 2]: `${this.maxBandwidth / 2}Mbps` }
      ret = { ...ret, ...{ 1: '1Mbps', [this.maxBandwidth]: `${this.maxBandwidth}Mbps` } }
      return ret
    },
    regionParams () {
      let params = {}
      if (this.manager) {
        params = {
          manager: this.manager,
          usable: true,
          scope: this.$store.getters.scope,
          show_emulated: true,
          capability: 'compute',
        }
      }
      if (this.selectedPlatform === 'idc') {
        params = {
          cloud_env: 'onpremise',
          usable: true,
          show_emulated: true,
          scope: this.$store.getters.scope,
        }
      }
      if (this.isAdminMode) {
        params.project_domain = this.domain_id
        delete params.scope
      }
      return params
    },
    networkParams () {
      if (this.manager) {
        return {
          manager: this.manager,
          limit: 0,
          scope: this.$store.getters.scope,
        }
      }
      if (this.selectedPlatform === 'idc' && this.selectedRegionItem) {
        return {
          limit: 0,
          scope: this.$store.getters.scope,
          server_type: 'eip',
          cloudregion_id: this.selectedRegionItem.id,
        }
      }
      return {}
    },
    chargeTypeOptions () {
      if (this.showBandwidth) {
        return [
          { label: this.$t('network.text_193'), value: 'traffic' },
          { label: this.$t('network.text_194'), value: 'bandwidth' },
        ]
      } else {
        return [
          { label: this.$t('network.text_193'), value: 'traffic' },
        ]
      }
    },
    maxBandwidth () {
      if (this.selectedPlatform === 'idc') {
        return 999999
      }
      let maxBandwidth = 200
      if (!R.isEmpty(this.selectedRegionItem)) {
        if (this.charge_type === 'bandwidth') {
          if (this.selectedRegionItem.provider === 'Huawei') {
            maxBandwidth = 2000
          } else if (this.selectedRegionItem.provider === 'Aliyun') {
            maxBandwidth = 500
          }
        } else {
          if (this.selectedRegionItem.provider === 'Huawei') {
            maxBandwidth = 300
          } else {
            maxBandwidth = 200
          }
        }
      }
      return maxBandwidth
    },
    updateProviderParams: {
      get () {
        return this.providerParams
      },
      set (newValue) {
        this.providerParams = newValue
      },
    },
  },
  methods: {
    format (val) {
      return +val || 1
    },
    domainChange (item) {
      if (R.type(item) === 'Object') {
        this.domain_id = item.key
      } else {
        this.domain_id = item
      }
      if (this.isAdminMode) {
        this.updateProviderParams = {
          ...this.updateProviderParams,
          project_domain: this.domain_id,
        }
        delete this.updateProviderParams.scope
      } else {
        this.updateProviderParams = {
          ...this.updateProviderParams,
          scope: this.$store.getters.scope,
        }
      }
    },
    platformChange (e) {
      if (R.has('public_cloud', this.updateProviderParams)) {
        Reflect.deleteProperty(this.updateProviderParams, 'public_cloud')
      } else {
        Reflect.deleteProperty(this.updateProviderParams, 'private_cloud')
      }
      const platform = e.target.value
      this.updateProviderParams = {
        ...this.updateProviderParams,
        [platform]: true,
      }
      this.selectedPlatform = platform
      this.form.fc.resetFields(['manager', 'region'])
      this.manager = ''
      this.providerC = ''
    },
    providerMapper (data) {
      data = data.filter(item => item.status === 'connected' && item.enabled)
      return data
    },
    providerChange (e) {
      if (e) {
        this.manager = e.id
        if (e.provider.toLowerCase() === 'azure') {
          this.form.fc.setFieldsValue({ bandwidth: 0 })
          this.showBandwidth = false
        } else {
          this.form.fc.setFieldsValue({ bandwidth: 30 })
          this.showBandwidth = true
        }
        this.hiddenBrandwidthHandle(e.provider)
        this.providerC = e.provider.toLowerCase()
      }
    },
    regionChange (e) {
      this.selectedRegionItem = e
    },
    chargeTypeChange (e) {
      this.charge_type = e.target.value
    },
    labelFormat (item) {
      return `${item.provider}/${item.cloudaccount}/${item.name}`
    },
    hiddenBrandwidthHandle (selectedProvider) {
      const providers = ['Azure', 'Aws', 'Qcloud', 'Google']
      if (providers.some((v) => { return v === selectedProvider })) {
        this.form.fc.setFieldsValue({ bandwidth: 0 })
        this.showBandwidth = false
      } else {
        this.form.fc.setFieldsValue({ bandwidth: 30 })
        this.showBandwidth = true
      }
    },
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        values.tenant = values.project.key
        Reflect.deleteProperty(values, 'project')
        if (values.platform === 'private_cloud') {
          delete values.charge_type
          values.bandwidth = 0
          if (values.ip_addr) {
            values.ip = values.ip_addr
            delete values.ip_addr
          }
        }
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
