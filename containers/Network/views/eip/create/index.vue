<template>
  <div>
    <page-header :title="$t('network.text_724')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body needMarginBottom>
      <a-form
        :form="form.fc"
        hideRequiredMark>
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" v-bind="formItemLayout">
          <domain-project
            :fc="form.fc"
            :fd="form.fd"
            :form-layout="formItemLayout"
            :decorators="{ project: decorators.project, domain: decorators.domain }"
            :form-draft-key="eipDraftFields.domainProject"
            @update:domain="domainChange"
            @fetchDomainCallback="fetchDomainCallback"
            @fetchProjectCallback="fetchProjectCallback" />
        </a-form-item>
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item v-if="isPublic" :label="$t('regionMap.enable_world_map')" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.enableWorldMap" />
        </a-form-item>
        <a-form-item v-if="isPublic && form.fd.enableWorldMap" :label="$t('compute.region_map')" v-bind="formItemLayout">
          <region-map
            :region-filter-params="regionMapParams"
            filter-brand-resource="network_manage"
            :region-mapper="filterMapCloudregionList"
            split-key="provider"
            @select="onRegionSelect"
            @params-change="onRegionMapParamsChange" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :key="`eip-area-${cloudEnv}`"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :cloudregionParams="regionParams"
          :providerParams="cloudProviderParams"
          :isRequired="true"
          :provider-multiple="isPublic"
          :cloudregion-multiple="isPublic"
          :cloudregion-mapper="filterCloudregionListByProvider"
          :defaultActiveFirstOption="isPublic ? [] : true"
          :region.sync="regionList"
          filterBrandResource="network_manage"
          @change="cloudregionChange"
          @fetchsDone="onAreaSelectsFetchsDone" />
        <a-form-item :label="$t('network.text_743')" v-bind="formItemLayout" v-if="showBgpTypes">
          <a-select v-decorator="decorators.bgp_type" @change="handleBgpTypeChange">
            <a-select-option v-for="item in bgpTypeOptions" :value="item" :key="item">{{ item === '' ? $t('network.text_749') : BGP_TYPES_MAP[item] ? BGP_TYPES_MAP[item].label : item }}</a-select-option>
          </a-select>
        </a-form-item>
        <template v-if="showIpSubnet">
          <ip-subnet
            :label="$t('network.text_211')"
            :isRequired="true"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :decorator="decorators"
            :vpcParams="vpcParams"
            :networkParams="networkParams"
            :vpcResourceMapper="vpcResourceMapper"
            :showIpConfig="cloudEnv !== 'public'"
            :form-draft-key="eipDraftFields.ipSubnet"
            :helplink="{ipSubnetHelp: $t('network.eip.tip'), ipSubnetHref: '/network/create'}" />
        </template>
        <template v-if="cloudEnv !== 'private' || isHCSO || isHCS">
          <a-form-item :label="$t('network.text_192')" v-bind="formItemLayout">
            <a-radio-group v-decorator="decorators.charge_type" @change="chargeTypeChange">
              <a-radio-button v-for="item in chargeTypeOptions" :value="item.value" :key="item.value">
                {{item.label}}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="$t('network.text_484')" v-bind="formItemLayout">
            <div class="d-flex align-items-center">
              <a-tooltip placement="top" :title="$t('network.eip.text_725', [maxBandwidth])">
                <a-input-number
                  style="width: 120px"
                  :min="1"
                  :max="maxBandwidth"
                  :step="cloudEnv === 'onpremise' ? 1 : 50"
                  :formatter="format"
                  :parse="format"
                  v-decorator="decorators.bandwidth" />
              </a-tooltip>
              <span class="ml-2">Mbps</span>
            </div>
          </a-form-item>
        </template>
        <a-form-item :label="$t('compute.text_15')" v-bind="formItemLayout" v-if="showCloudprovider" key="manager">
          <base-select
            :remote="true"
            v-decorator="decorators.manager"
            resource="cloudproviders"
            :params="providerParams"
            :mapper="providerMapper"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :resList.sync="cloudproviderData"
            @update:item="providerChange"
            :isDefaultSelect="true"
            :select-props="{ placeholder: $t('compute.text_1387') }"
            style="width: 320px" />
        </a-form-item>
        <a-form-item :label="$t('common.text00012')" class="mb-0" v-bind="formItemLayout">
          <tag
            :key="`eip-tag-${cloudEnv}`"
            v-decorator="decorators.__meta__"
            :allowNoValue="false"
            :default-checked="tagDefaultChecked" />
        </a-form-item>
      </a-form>
    </page-body>
    <bottom-bar
      :isHCSO="isHCSO || isHCS"
      :cloud-env="cloudEnv"
      :current-cloudregion="selectedRegionItem"
      :size="bandwidth"
      :bgp-type="bgp_type"
      :cloudAccountId="cloudAccountId" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import IpSubnet from '@Network/sections/IpSubnet'
import RegionMap from '@Compute/sections/RegionMap'
import AreaSelects from '@/sections/AreaSelects'
import DomainProject from '@/sections/DomainProject'
import validateForm, { isRequired } from '@/utils/validate'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import { cloudregionFilterByCapability } from '@/utils/common/capability'
import Tag from '@/sections/Tag'
import { BGP_TYPES, BGP_TYPES_MAP } from '@/constants/network'
import { HYPERVISORS_MAP, PROVIDER_MAP, resolveHypervisorKey } from '@/constants'
import createFormDraftMixin from '@/mixins/createFormDraft'
import {
  EIP_CREATE_FORM_DRAFT_FIELD,
  EIP_CREATE_FORM_DRAFT_FIELDS,
  EIP_CREATE_FORM_DRAFT_FC_BINDINGS,
  getEipCreateFormDraftScope,
} from '../utils/eipCreateFormDraft'
import BottomBar from './components/BottomBar'

export default {
  name: 'EipCreate',
  components: {
    AreaSelects,
    RegionMap,
    DomainProject,
    IpSubnet,
    BottomBar,
    Tag,
  },
  mixins: [createFormDraftMixin],
  data () {
    const cloudEnvOptions = getCloudEnvOptions('network_manage_brands', true)
    const queryType = this.$route.query.type
    let cloudEnv = queryType === 'idc' ? 'onpremise' : this.$route.query.type
    let routerQuery = this.$route.query.type
    if (!cloudEnvOptions.find(val => val.key === cloudEnv)) {
      cloudEnv = cloudEnvOptions[0].key
      routerQuery = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
    }
    return {
      BGP_TYPES_MAP,
      loading: false,
      inputIpType: 'random',
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
            if (values.hasOwnProperty('cloudregion')) {
              const regionId = this.pickSingleAreaValue(values.cloudregion)
              this.selectedRegionItem = regionId ? (this.regionList[regionId] || {}) : {}
            }
            if (values.bandwidth) {
              this.bandwidth = values.bandwidth
            }
            this.syncEipCreateFormFcDrafts(values)
          },
        }),
        fd: {
          enableWorldMap: false,
        },
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
        enableWorldMap: [
          'enableWorldMap',
          {
            valuePropName: 'checked',
            initialValue: false,
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
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_212') },
            ],
          },
        ],
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
        description: ['description'],
        charge_type: [
          'charge_type',
        ],
        bgp_type: [
          'bgp_type',
        ],
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 17 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 7 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
      manager: '',
      cloudAccountId: '',
      cloudproviderItem: null,
      cloudproviderData: [],
      selectedRegionItem: {},
      showBandwidth: true,
      charge_type: cloudEnv === 'onpremise' ? 'bandwidth' : 'traffic',
      providerC: '',
      domain_id: 'default',
      regionList: {},
      bandwidth: cloudEnv !== 'private' ? 30 : 0,
      bgpTypeOptions: [],
      bgp_type: undefined,
      tagDefaultChecked: {},
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo', 'capability']),
    createFormDraftOptions () {
      return {
        formScope: getEipCreateFormDraftScope({ cloudEnv: this.cloudEnv }),
        disableWhen: () => !!this.$route.query.workflow,
      }
    },
    eipDraftFields () {
      return EIP_CREATE_FORM_DRAFT_FIELDS
    },
    isPublic () {
      return this.cloudEnv === 'public'
    },
    showCloudprovider () {
      return this.isPublic || this.isHCSO || this.isHCS
    },
    sliderMarks () {
      let ret = { [this.maxBandwidth / 2]: `${this.maxBandwidth / 2}Mbps` }
      ret = { ...ret, ...{ 1: '1Mbps', [this.maxBandwidth]: `${this.maxBandwidth}Mbps` } }
      return ret
    },
    isOnpremise () {
      return this.cloudEnv === 'onpremise'
    },
    isHCSO () {
      if (this.selectedRegionItem) {
        return this.selectedRegionItem.provider === HYPERVISORS_MAP.hcso.provider
      }
      return false
    },
    isHCS () {
      if (this.selectedRegionItem) {
        return this.selectedRegionItem.provider === HYPERVISORS_MAP.hcs.provider
      }
      return false
    },
    isAliyun () {
      if (this.selectedRegionItem) {
        return this.selectedRegionItem.provider === HYPERVISORS_MAP.aliyun.provider
      }
      return false
    },
    regionMapParams () {
      const params = {
        cloud_env: 'public',
        usable: true,
        show_emulated: true,
        read_only: false,
      }
      if (this.isAdminMode) {
        params.project_domain = this.domain_id
      } else {
        params.scope = this.scope
      }
      return params
    },
    providerParams () {
      const regionIds = this.normalizeAreaValues(this.form.fd.cloudregion)
      const brands = this.normalizeAreaValues(this.form.fd.provider)
        .map(p => this.mapAreaProviderToBrand(p))
        .filter(Boolean)
      const params = {
        enabled: 1,
        details: true,
        read_only: false,
        public_cloud: !this.isHCSO && !this.isHCS,
        scope: this.$store.getters.scope,
        usable: true,
      }
      if (this.isAdminMode) {
        params.project_domain_id = this.domain_id
        delete params.scope
      }
      // 单区域 cloudregion_id；多区域用独立 filter 字段，避免覆盖其它 filter
      if (regionIds.length) {
        params.cloudregion_id = regionIds
      }
      // brand 多选直接传数组
      if (brands.length) {
        params.brand = brands
      }
      return params
    },
    showBgpTypes () {
      if (!this.bgpTypeOptions || this.bgpTypeOptions.length === 0) {
        return false
      }
      if (this.bgpTypeOptions.length === 1 && this.bgpTypeOptions[0] === '') {
        return false
      }

      return this.isOnpremise || this.isAliyun
    },
    regionParams () {
      let params = {
        cloud_env: this.cloudEnv,
      }
      if (this.cloudEnv === 'onpremise') {
        params = {
          ...params,
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
      const ret = {
        limit: 0,
        scope: this.scope,
        bgp_type: this.bgp_type,
      }
      if (this.manager) {
        ret.manager = this.manager
        return ret
      }
      if (this.cloudEnv === 'onpremise' && !R.isEmpty(this.selectedRegionItem)) {
        ret.server_type = 'eip'
        ret.cloudregion_id = this.selectedRegionItem.id
        return ret
      }
      return ret
    },
    vpcParams () {
      const params = {
        scope: this.scope,
        cloudregion_id: this.selectedRegionItem.id,
      }
      if (this.selectedRegionItem.provider === 'HCS') {
        params['@external_access_mode'] = 'eip'
        params.show_emulated = true
      }
      if (this.isAdminMode) {
        params.project_domain = this.domain_id
        delete params.scope
      }
      return params
    },
    chargeTypeOptions () {
      const arr = [
        { label: this.$t('network.text_194'), value: 'bandwidth' },
        { label: this.$t('network.text_193'), value: 'traffic' },
      ]
      if (this.cloudEnv === 'onpremise') {
        return [arr[0]]
      }
      if (!this.showBandwidth) {
        arr.shift()
      }
      return arr
    },
    maxBandwidth () {
      if (this.cloudEnv === 'onpremise') {
        return 10000
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
    areaselectsName () {
      if (this.cloudEnv === 'private' || this.cloudEnv === 'onpremise') {
        return ['cloudregion']
      }
      return ['provider', 'cloudregion']
    },
    showIpSubnet () {
      if (this.selectedRegionItem.provider === HYPERVISORS_MAP.hcso.provider) return false
      if (this.selectedRegionItem.provider === HYPERVISORS_MAP.hcs.provider) return true
      if (this.providerC === 'zstack' || this.providerC === 'openstack') return true
      if (this.cloudEnv === 'onpremise' && this.selectedRegionItem && this.selectedRegionItem.id) return true
      if (this.cloudEnv === 'private' && this.selectedRegionItem && this.selectedRegionItem.id) return true
      return false
    },
    cloudProviderParams () {
      const param = {
        scope: this.scope,
        cloudEnv: this.cloudEnv,
      }
      if (this.isAdminMode) {
        param.project_domain_id = this.domain_id
        delete param.scope
      }
      return param
    },
    bgpTypeParams () {
      return {
        usable: true,
        limit: 0,
        scope: this.scope,
        server_type: 'eip',
        field: 'bgp_type',
      }
    },
  },
  watch: {
    async cloudEnv (newValue) {
      this.bindEipCreateFormFcDrafts()
      // 跨 tab 共用 form.fc：清掉平台/区域/订阅，避免本地区域 default 残留到公有云
      const isPublic = newValue === 'public'
      this.form.fc.resetFields(['manager', 'provider', 'cloudregion', 'enableWorldMap'])
      this.form.fc.setFieldsValue({
        provider: isPublic ? [] : undefined,
        cloudregion: isPublic ? [] : undefined,
        manager: undefined,
        enableWorldMap: false,
      })
      this.$set(this.form.fd, 'provider', isPublic ? [] : undefined)
      this.$set(this.form.fd, 'cloudregion', isPublic ? [] : undefined)
      this.$set(this.form.fd, 'enableWorldMap', false)
      this.manager = ''
      this.providerC = ''
      this.cloudproviderItem = null
      this.cloudproviderData = []
      this.selectedRegionItem = {}
      this.regionList = {}
      this.tagDefaultChecked = {}
      this.form.fc.setFieldsValue({ __meta__: undefined })
      this.charge_type = newValue === 'onpremise' ? 'bandwidth' : 'traffic'
      this.$nextTick(() => {
        this.$refs.areaSelects && this.$refs.areaSelects.fetchs(this.areaselectsName)
        this.form.fc.getFieldDecorator('charge_type', { initialValue: newValue === 'onpremise' ? 'bandwidth' : 'traffic' })
        this.restoreEipBandwidthAndBgpDraft()
      })
      this.bandwidth = newValue === 'private' && !this.isHCSO && !this.isHCS ? 0 : 30
    },
    isAliyun (newValue) {
      if (newValue) {
        this.bgpTypeOptions = BGP_TYPES.map(item => item.value)
        this.$nextTick(() => {
          // 无草稿时默认 BGP；有草稿由 restoreEipBandwidthAndBgpDraft 覆盖
          if (this.form.fc.getFieldValue('bgp_type') == null && this.bgp_type == null) {
            this.form.fc.setFieldsValue({ bgp_type: 'BGP' })
            this.bgp_type = 'BGP'
          }
          this.restoreEipBandwidthAndBgpDraft()
        })
      } else {
        this.fetchBgpType()
      }
    },
    maxBandwidth () {
      this.clampEipBandwidthToMax()
    },
    bgpTypeOptions () {
      this.clampEipBgpTypeToOptions()
      this.$nextTick(() => this.restoreEipBandwidthAndBgpDraft())
    },
  },
  provide () {
    return {
      form: this.form,
      // 勿直接传 this.cloudEnv 字符串：provide 只取一次快照，tab 切换后 BottomBar 仍是旧值
      getCloudEnv: () => this.cloudEnv,
      getCreateFormDraftScope: () => this.getCreateFormDraftScope(),
      canUseCreateFormFieldDraft: () => this.canRestoreCreateFormDraft,
      canRestoreCreateFormFieldDraft: () => this.canRestoreCreateFormDraft,
      canBackupCreateFormFieldDraft: () => this.canBackupCreateFormDraft,
      canBackupCreateFormFieldDraftOnSubmit: () => this.canBackupCreateFormDraftOnSubmit,
      registerCreateFormFieldDraftFlush: (fn) => this.registerCreateFormFieldDraftFlush(fn),
      readCreateFormFieldDraft: (key) => this.readCreateFormFieldDraft(key),
      writeCreateFormFieldDraft: (key, data, options) => this.writeCreateFormFieldDraft(key, data, options),
      bindCreateFormFieldDraft: (spec) => this.bindCreateFormFieldDraft(spec),
      flushCreateFormFieldDrafts: () => this.flushCreateFormFieldDrafts(),
      isCreateFormFieldTouched: (key) => this.isCreateFormFieldTouched(key),
      markCreateFormFieldTouched: (key) => this.markCreateFormFieldTouched(key),
      isCreateFormFieldDraftFromLocal: (key) => this.isCreateFormFieldDraftFromLocal(key),
      persistEipDraftAfterValidate: (values) => this.persistEipDraftAfterValidate(values),
      resolvePublicSubmitLocation: (values) => this.resolvePublicSubmitLocation(values),
    }
  },
  created () {
    this._eipAreaApplying = false
    this.fetchBgpType()
    this.$nextTick(() => {
      this.form.fc.getFieldDecorator('charge_type', { initialValue: this.cloudEnv === 'onpremise' ? 'bandwidth' : 'traffic' })
    })
    this.bindEipCreateFormFcDrafts()
  },
  mounted () {
    this.$nextTick(() => this.restoreEipBandwidthAndBgpDraft())
  },
  methods: {
    bindEipCreateFormFcDrafts () {
      this._eipCreateFormFcDraftMap = Object.create(null)
      const type = this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv
      ;(EIP_CREATE_FORM_DRAFT_FC_BINDINGS || []).forEach((item) => {
        if (!item?.key || !item.formField) return
        if (item.types && !item.types.includes(type)) return
        this._eipCreateFormFcDraftMap[item.formField] = item.key
        this.bindFormFcFieldDraft(item.key, {
          formField: item.formField,
          kind: item.kind,
        })
      })
      // 线路类型：flush 落盘；回填等 bgpTypeOptions 就绪后由 restoreEipBandwidthAndBgpDraft 处理
      this._eipCreateFormFcDraftMap.bgp_type = EIP_CREATE_FORM_DRAFT_FIELD.BGP_TYPE
      this.bindEipBgpTypeDraft()
    },
    /**
     * bgp_type 只注册一次 flusher；cloudEnv 切换时只更新 get，避免重复 flush 误清
     * get 无值返回 undefined（跳过），禁止返回 null（会 clearCreateFormFieldDraft）
     */
    bindEipBgpTypeDraft () {
      const key = EIP_CREATE_FORM_DRAFT_FIELD.BGP_TYPE
      const get = () => {
        const fromFc = this.form?.fc?.getFieldValue?.('bgp_type')
        if (fromFc !== undefined && fromFc !== null) return fromFc
        const fromFd = this.form?.fd?.bgp_type
        if (fromFd !== undefined && fromFd !== null) return fromFd
        if (this.bgp_type !== undefined && this.bgp_type !== null) return this.bgp_type
        return undefined
      }
      if (this._boundCreateFormFieldDrafts?.[key]) {
        this._boundCreateFormFieldDrafts[key] = { key, kind: 'selection', get }
        if (!this._createFormFieldKinds) this._createFormFieldKinds = Object.create(null)
        this._createFormFieldKinds[key] = 'selection'
        return
      }
      this.bindCreateFormFieldDraft({ key, kind: 'selection', get })
    },
    /** validateFields 后按 values 补写 bgp（避免 getFieldValue 空导致未落盘） */
    persistEipDraftAfterValidate (values) {
      if (!values || !Object.prototype.hasOwnProperty.call(values, 'bgp_type')) return
      if (values.bgp_type === undefined || values.bgp_type === null) return
      this.bgp_type = values.bgp_type
      if (this.form?.fd) this.$set(this.form.fd, 'bgp_type', values.bgp_type)
      this.writeCreateFormFieldDraft(EIP_CREATE_FORM_DRAFT_FIELD.BGP_TYPE, values.bgp_type, {
        fromSubmit: true,
        kind: 'selection',
      })
    },
    /** 草稿 bgp 对照 options；bandwidth 为输入字段不回填 */
    restoreEipBandwidthAndBgpDraft () {
      if (!this.canUseCreateFormDraft || !this.form?.fc) return
      if (this.createFormDraftUserInteracted) return
      if (!this.showBgpTypes) return
      const bgpDraft = this.readCreateFormFieldDraft(EIP_CREATE_FORM_DRAFT_FIELD.BGP_TYPE)
      if (bgpDraft === null || bgpDraft === undefined) return
      if (!Array.isArray(this.bgpTypeOptions) || !this.bgpTypeOptions.length) return
      if (!this.bgpTypeOptions.includes(bgpDraft)) return
      this.form.fc.setFieldsValue({ bgp_type: bgpDraft })
      this.bgp_type = bgpDraft
    },
    clampEipBandwidthToMax () {
      if (!this.form?.fc) return
      const cur = this.form.fc.getFieldValue('bandwidth')
      if (cur == null || cur === '') return
      const max = this.maxBandwidth
      if (max != null && Number(cur) > max) {
        this.form.fc.setFieldsValue({ bandwidth: max })
        this.bandwidth = max
      }
    },
    clampEipBgpTypeToOptions () {
      if (!this.form?.fc) return
      const opts = this.bgpTypeOptions
      if (!Array.isArray(opts) || !opts.length) return
      const cur = this.form.fc.getFieldValue('bgp_type')
      if (cur == null || cur === '') return
      if (!opts.includes(cur)) {
        const next = opts[0]
        this.form.fc.setFieldsValue({ bgp_type: next })
        this.bgp_type = next
      }
    },
    syncEipCreateFormFcDrafts (newField) {
      if (!this.canUseCreateFormDraft || !newField || typeof newField !== 'object') return
      if (this._eipAreaApplying) return
      // 仅用户交互后落盘，避免程序化 setFieldsValue 污染草稿
      if (!this.createFormDraftUserInteracted) return
      const map = this._eipCreateFormFcDraftMap || {}
      Object.keys(newField).forEach((formField) => {
        const draftKey = map[formField]
        if (!draftKey) return
        const val = newField[formField]
        if (val === undefined || val === null || val === '') return
        if (Array.isArray(val) && !val.length) return
        this.writeCreateFormFieldDraft(draftKey, val)
      })
    },
    /**
     * AreaSelects.fetchs 结束后：不接线 areaSelects 草稿，仅保留钩子供后续扩展
     */
    onAreaSelectsFetchsDone () {
      // intentionally empty：按约定不落盘/回填 areaSelects
    },
    pickSingleAreaValue (value) {
      if (Array.isArray(value)) return value[0] || undefined
      return value || undefined
    },
    normalizeAreaValues (value) {
      if (Array.isArray(value)) return value.filter(Boolean)
      return value ? [value] : []
    },
    toAreaValue (value) {
      if (value === undefined || value === null) return []
      return Array.isArray(value) ? value : [value]
    },
    mapAreaProviderToBrand (value) {
      if (!value) return undefined
      if (PROVIDER_MAP[value]) {
        return PROVIDER_MAP[value].brand || PROVIDER_MAP[value].provider
      }
      const hv = HYPERVISORS_MAP[String(value).toLowerCase()]
      if (hv) {
        return hv.brand || hv.provider
      }
      return value
    },
    getSelectedProviderNames () {
      return this.normalizeAreaValues(this.form.fd.provider).map(p => String(p))
    },
    normalizeAreaProviderKey (val) {
      return resolveHypervisorKey(val)
    },
    isAreaProviderMatch (selected, itemProvider) {
      return this.normalizeAreaProviderKey(selected) === this.normalizeAreaProviderKey(itemProvider)
    },
    /** 公有云：云订阅无区域，region 取已选中匹配该订阅 provider 的第一项 */
    resolvePublicSubmitLocation (values) {
      const regionIds = this.normalizeAreaValues(values.cloudregion)
      const managerId = values.manager
      if (!this.isPublic || !managerId) {
        return {
          cloudregionId: this.pickSingleAreaValue(values.cloudregion),
          provider: this.pickSingleAreaValue(values.provider),
        }
      }
      const cloudproviderItem = (this.cloudproviderData || []).find(i => i.id === managerId)
      const subscriptionProvider = cloudproviderItem?.provider
      let cloudregionId = this.pickSingleAreaValue(values.cloudregion)
      if (subscriptionProvider && regionIds.length) {
        const matched = regionIds.find((regionId) => {
          const region = this.regionList[regionId]
          if (!region) return false
          return this.isAreaProviderMatch(subscriptionProvider, region.provider || region.brand)
        })
        cloudregionId = matched || regionIds[0]
      }
      return {
        cloudregionId,
        provider: subscriptionProvider || this.pickSingleAreaValue(values.provider),
      }
    },
    filterCloudregionListByProvider (list = []) {
      if (!this.isPublic) return list
      const providers = this.getSelectedProviderNames()
      if (!providers.length) return list
      return list.filter(item => {
        const raw = item.provider || item.brand || ''
        return providers.some(p => this.isAreaProviderMatch(p, raw))
      })
    },
    filterMapCloudregionList (list = []) {
      return cloudregionFilterByCapability({
        dataList: list,
        capability: this.capability,
        resource: 'network_manage',
      })
    },
    matchProviderFromList (list, hypervisor) {
      const hvKey = String(hypervisor || '').toLowerCase()
      const hvObj = HYPERVISORS_MAP[hvKey]
      if (!hvObj || !list?.length) return null
      const hvProvider = String(hvObj.provider || '').toLowerCase()
      return list.find(item => {
        const name = String(item.name || '').toLowerCase()
        const provider = String(item.provider || '').toLowerCase()
        return name === hvKey || name === hvProvider || provider === hvKey || provider === hvProvider
      }) || null
    },
    clearPublicLocationFields () {
      this.form.fc.setFieldsValue({
        provider: [],
        cloudregion: [],
        manager: undefined,
      })
      this.manager = ''
      this.cloudproviderItem = null
      this.selectedRegionItem = {}
    },
    onRegionSelect (payload) {
      const regions = payload?.nearbyRegions || []
      if (!regions.length) {
        this.clearPublicLocationFields()
        this.$nextTick(() => {
          this.$refs.areaSelects && this.$refs.areaSelects.fetchs(this.areaselectsName)
        })
        return
      }
      this.applyMapSelectionToAreaSelects(regions)
    },
    onRegionMapParamsChange () {
      if (!this.form.fd.enableWorldMap) return
      // 草稿回填打开地图时 params-change 会清空平台，未交互前跳过
      if (this._eipAreaApplying || !this.createFormDraftUserInteracted) return
      this.onRegionSelect({ nearbyRegions: [] })
    },
    async applyMapSelectionToAreaSelects (regions = []) {
      const providerList = this.$refs.areaSelects?.providerList || []
      const providerKeys = [...new Set(regions.map(item => {
        const raw = item.provider || item.brand
        if (!raw) return null
        const hvKey = resolveHypervisorKey(raw)
        const matched = this.matchProviderFromList(providerList, hvKey)
        return matched ? matched.name : hvKey
      }).filter(Boolean))]
      const cloudregionIds = regions.map(item => item.id).filter(Boolean)
      this.form.fc.setFieldsValue({
        manager: undefined,
      })
      this.manager = ''
      this.cloudproviderItem = null
      await this.$nextTick()
      const areaRef = this.$refs.areaSelects
      if (areaRef) {
        await areaRef.applyMultipleSelection({
          provider: this.toAreaValue(providerKeys),
          cloudregion: this.toAreaValue(cloudregionIds),
        })
      }
    },
    fetchBgpType () {
      if (this.isAliyun) {
        return
      }
      new this.$Manager('networks/distinct-field').list({
        params: {
          usable: true,
          limit: 0,
          field: 'bgp_type',
          scope: this.$store.getters.scope,
          server_type: 'eip',
        },
      }).then(({ data }) => {
        this.bgpTypeOptions = data.bgp_type
        this.$nextTick(() => this.restoreEipBandwidthAndBgpDraft())
      })
    },
    handleBgpTypeChange (value) {
      this.bgp_type = value
    },
    format (val) {
      if (this.cloudEnv === 'onpremise') return val
      return +val || 1
    },
    vpcResourceMapper (data) {
      if (this.cloudEnv === 'onpremise') {
        data = data.filter(item => item.id === 'default')
        return data
      }
      return data
    },
    domainChange (item) {
      if (R.type(item) === 'Object') {
        this.domain_id = item.key
      } else {
        this.domain_id = item
      }
    },
    cloudregionChange () {
      if (this.isPublic && this.manager) {
        const values = this.form.fc.getFieldsValue()
        const { cloudregionId } = this.resolvePublicSubmitLocation({
          ...values,
          cloudregion: values.cloudregion || this.form.fd.cloudregion,
          manager: this.manager,
        })
        this.selectedRegionItem = cloudregionId ? (this.regionList[cloudregionId] || {}) : {}
        return
      }
      const regionId = this.pickSingleAreaValue(
        this.form.fc.getFieldValue('cloudregion') || this.form.fd.cloudregion,
      )
      this.selectedRegionItem = regionId ? (this.regionList[regionId] || {}) : {}
    },
    providerMapper (data) {
      data = data.filter(item => item.status === 'connected' && item.enabled)
      return data
    },
    providerChange (e) {
      if (e) {
        this.manager = e.id
        this.cloudproviderItem = e
        if (this.isPublic) {
          const values = this.form.fc.getFieldsValue()
          const { cloudregionId } = this.resolvePublicSubmitLocation({
            ...values,
            cloudregion: values.cloudregion || this.form.fd.cloudregion,
            manager: e.id,
          })
          this.selectedRegionItem = cloudregionId ? (this.regionList[cloudregionId] || {}) : {}
        }
        if (e.provider.toLowerCase() === 'azure') {
          this.form.fc.setFieldsValue({ bandwidth: 0 })
        } else {
          this.form.fc.setFieldsValue({ bandwidth: 30 })
        }
        this.hiddenBrandwidthHandle(e.provider)
        this.providerC = e.provider.toLowerCase()
        this.cloudAccountId = e.cloudaccount_id || ''
      } else {
        this.cloudproviderItem = null
        this.cloudAccountId = ''
      }
    },
    chargeTypeChange (e) {
      this.charge_type = e.target.value
    },
    hiddenBrandwidthHandle (selectedProvider) {
      const providers = ['Azure', 'Aws', 'Google']
      if (providers.some(v => v === selectedProvider)) {
        this.form.fc.setFieldsValue({ bandwidth: 1 })
        this.showBandwidth = false
      } else {
        this.form.fc.setFieldsValue({ bandwidth: 30 })
        this.showBandwidth = true
      }
    },
    fetchDomainCallback () {
      const domain = this.$route.query.domain_id
      if (domain) {
        this.domain_id = domain
        this.form.fc.setFieldsValue({
          domain: { key: domain },
        })
      }
    },
    fetchProjectCallback () {
      const project = this.$route.query.tenant_id
      if (project) {
        this.form.fc.setFieldsValue({
          project: { key: project },
        })
      }
    },
  },
}
</script>
