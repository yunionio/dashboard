<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="指定项目" v-bind="formItemLayout" class="mb-0">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="domainChange" />
        </a-form-item>
        <a-form-item label="平台" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.platform" @change="platformChange">
            <a-radio-button value="public_cloud">
              公有云
            </a-radio-button>
            <a-radio-button value="private_cloud">
              私有云
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="云账号" v-bind="formItemLayout">
          <base-select
            :remote="true"
            v-decorator="decorators.manager"
            resource="cloudproviders"
            :params="providerParams"
            :mapper="providerMapper"
            :label-format="labelFormat"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            @update:item="providerChange"
            :select-props="{ placeholder: '平台、账号、子账号' }" />
        </a-form-item>
        <a-form-item label="区域" v-bind="formItemLayout">
          <base-select
            :remote="true"
            needParams
            v-decorator="decorators.region"
            resource="cloudregions"
            :params="regionParams"
            :remote-fn="q => ({ search: q })"
            @update:item="regionChange"
            :select-props="{ placeholder: '请选择' }" />
        </a-form-item>
        <a-form-item label="指定IP子网" v-bind="formItemLayout" v-if="providerC === 'zstack' || providerC === 'openstack'">
          <base-select
            :remote="true"
            needParams
            v-decorator="decorators.network"
            resource="networks"
            :params="networkParams"
            :label-format="genLabel"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            @update:item="regionChange"
            :select-props="{ placeholder: '请选择IP子网' }" />
        </a-form-item>
        <a-form-item label="ip地址" v-bind="formItemLayout" v-if="providerC === 'zstack' || providerC === 'openstack'">
          <a-input v-decorator="decorators.ip_addr" placeholder="请输入子网内ip" />
        </a-form-item>
        <a-form-item label="带宽" v-bind="formItemLayout" v-if="showBandwidth && selectedPlatform === 'public_cloud'">
          <a-row>
            <a-col :span="12">
              <a-slider :min="1" :max="maxBandwidth" v-decorator="decorators.bandwidth" />
            </a-col>
            <a-col :span="4">
              <a-input-number :min="1" :max="maxBandwidth" v-decorator="decorators.bandwidth" />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="字母开头，数字和字母大小写组合，长度为2-128个字符，不含'.','_','@'" />
        </a-form-item>
        <a-form-item label="计费方式" v-bind="formItemLayout" v-if="showBandwidth && selectedPlatform === 'public_cloud'">
          <a-radio-group v-decorator="decorators.charge_type" @change="chargeTypeChange">
            <a-radio-button v-for="item in chargeTypeOptions" :value="item.value" :key="item.value">
              {{item.label}}
            </a-radio-button>
          </a-radio-group>
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
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: '请选择域', trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: '请选择项目', trigger: 'change' },
            ],
          },
        ],
        platform: [
          'platform',
          {
            initialValue: 'public_cloud',
          },
        ],
        manager: [
          'manager',
          {
            rules: [
              { required: true, message: '请选择云账号' },
            ],
          },
        ],
        region: [
          'region',
          {
            rules: [
              { required: true, message: '请选择地区' },
            ],
          },
        ],
        network: [
          'network',
          {
            rules: [
              { required: true, message: '请选择IP子网' },
            ],
          },
        ],
        ip_addr: [
          'ip_addr',
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
              { required: true, message: '请填写名称' },
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
      selectedPlatform: 'public_cloud',
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
    regionParams () {
      if (this.manager) {
        const params = {
          manager: this.manager,
          usable: true,
          scope: this.$store.getters.scope,
          show_emulated: true,
        }
        if (this.isAdminMode) {
          params['project_domain'] = this.domain_id
          delete params.scope
        }
        return params
      }
      return {}
    },
    networkParams () {
      if (this.manager) {
        return {
          manager: this.manager,
          limit: 0,
          scope: this.$store.getters.scope,
        }
      } else {
        return {}
      }
    },
    chargeTypeOptions () {
      if (this.showBandwidth) {
        return [
          { label: '按流量计费', value: 'traffic' },
          { label: '按带宽计费', value: 'bandwidth' },
        ]
      } else {
        return [
          { label: '按流量计费', value: 'traffic' },
        ]
      }
    },
    maxBandwidth () {
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
    domainChange (id) {
      this.domain_id = id
      this.updateProviderParams = {
        ...this.updateProviderParams,
        domain_id: id,
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
      this.selectedPlatform = e.target.value
      this.form.fc.resetFields(['manager', 'region'])
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
          this.form.fc.setFieldsValue({ 'bandwidth': 0 })
          this.showBandwidth = false
        } else {
          this.form.fc.setFieldsValue({ 'bandwidth': 30 })
          this.showBandwidth = true
        }
        this.hiddenBrandwidthHandle(e.provider)
        this.providerC = e.provider.toLowerCase()
      }
    },
    regionChange (e) {
      if (e) {
        this.selectedRegionItem = e
      }
    },
    chargeTypeChange (e) {
      this.charge_type = e.target.value
    },
    labelFormat (item) {
      return `${item.provider}/${item.cloudaccount}/${item.name}`
    },
    genLabel (item) {
      return `${item.name}（${item.guest_ip_start} - ${item.guest_ip_end}, vlan=${item.vlan_id}）`
    },
    hiddenBrandwidthHandle (selectedProvider) {
      const providers = ['Azure', 'Aws', 'Qcloud']
      if (providers.some((v) => { return v === selectedProvider })) {
        this.form.fc.setFieldsValue({ 'bandwidth': 0 })
        this.showBandwidth = false
      } else {
        this.form.fc.setFieldsValue({ 'bandwidth': 30 })
        this.showBandwidth = true
      }
    },
    doCreate (data) {
      return this.params.list.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
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
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
