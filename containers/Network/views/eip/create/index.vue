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
          :form-draft-key="eipDraftFields.areaSelects"
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
      if (regionIds.length === 1) {
        params.cloudregion_id = regionIds[0]
      } else if (regionIds.length > 1) {
        params['filter.0'] = `cloudregion_id.in(${regionIds.join(',')})`
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
      this.$refs.areaSelects && this.$refs.areaSelects.fetchs(this.areaselectsName)
      this.form.fc.resetFields(['manager'])
      this.manager = ''
      this.providerC = ''
      this.cloudproviderItem = null
      this.cloudproviderData = []
      this.tagDefaultChecked = {}
      this.form.fc.setFieldsValue({ __meta__: undefined })
      this.charge_type = newValue === 'onpremise' ? 'bandwidth' : 'traffic'
      this.$nextTick(() => {
        this.form.fc.getFieldDecorator('charge_type', { initialValue: newValue === 'onpremise' ? 'bandwidth' : 'traffic' })
      })
      this.bandwidth = newValue === 'private' && !this.isHCSO && !this.isHCS ? 0 : 30
    },
    isAliyun (newValue) {
      if (newValue) {
        this.bgpTypeOptions = BGP_TYPES.map(item => item.value)
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ bgp_type: 'BGP' })
        })
      } else {
        this.fetchBgpType()
      }
    },
  },
  provide () {
    return {
      form: this.form,
      cloudEnv: this.cloudEnv,
      getCreateFormDraftScope: () => this.getCreateFormDraftScope(),
      canUseCreateFormFieldDraft: () => this.canUseCreateFormDraft,
      registerCreateFormFieldDraftFlush: (fn) => this.registerCreateFormFieldDraftFlush(fn),
      readCreateFormFieldDraft: (key) => this.readCreateFormFieldDraft(key),
      writeCreateFormFieldDraft: (key, data, options) => this.writeCreateFormFieldDraft(key, data, options),
      bindCreateFormFieldDraft: (spec) => this.bindCreateFormFieldDraft(spec),
      flushCreateFormFieldDrafts: () => this.flushCreateFormFieldDrafts(),
    }
  },
  created () {
    this._eipAreaApplying = false
    this._eipAreaRestoreAgain = false
    this.fetchBgpType()
    this.$nextTick(() => {
      this.form.fc.getFieldDecorator('charge_type', { initialValue: this.cloudEnv === 'onpremise' ? 'bandwidth' : 'traffic' })
    })
    this.bindCreateFormFieldDraft({
      key: EIP_CREATE_FORM_DRAFT_FIELD.TAG,
      get: () => {
        const meta = this.form.fc.getFieldValue('__meta__')
        if (!meta || !Object.keys(meta).length) return undefined
        return { checked: meta }
      },
      set: (draft) => {
        if (!draft?.checked) return
        this.tagDefaultChecked = { ...draft.checked }
        this.form.fc.setFieldsValue({ __meta__: draft.checked })
      },
    })
    this.bindEipCreateFormFcDrafts()
  },
  methods: {
    bindEipCreateFormFcDrafts () {
      this._eipCreateFormFcDraftMap = Object.create(null)
      const type = this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv
      ;(EIP_CREATE_FORM_DRAFT_FC_BINDINGS || []).forEach((item) => {
        if (!item?.key || !item.formField) return
        if (item.types && !item.types.includes(type)) return
        this._eipCreateFormFcDraftMap[item.formField] = item.key
        this.bindFormFcFieldDraft(item.key, { formField: item.formField })
      })
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
      if (Object.prototype.hasOwnProperty.call(newField, '__meta__')) {
        const meta = newField.__meta__
        this.writeCreateFormFieldDraft(
          EIP_CREATE_FORM_DRAFT_FIELD.TAG,
          meta && Object.keys(meta).length ? { checked: meta } : undefined,
        )
      }
    },
    /**
     * AreaSelects.fetchs 结束后再回填平台/区域，避免与 resetSelect 竞态（同 VM Public）
     */
    onAreaSelectsFetchsDone () {
      if (this._eipAreaApplying) {
        this._eipAreaRestoreAgain = true
        return
      }
      if (this.createFormDraftUserInteracted) return
      this.restoreEipAreaFormFieldDraft()
    },
    /**
     * 将草稿平台名对齐到 providerList 的 name（option value）
     */
    resolveEipDraftProviderNames (list = [], draftProviders = []) {
      const names = []
      this.toAreaValue(draftProviders).filter(Boolean).forEach((p) => {
        const matched = this.matchProviderFromList(list, p)
        const name = matched ? matched.name : p
        if (name && !names.includes(name)) names.push(name)
      })
      // 列表已就绪时只保留仍存在的项，避免 Select 因非法 value 清空
      if (list.length) {
        return names.filter(n => list.some(item => item.name === n))
      }
      return names
    },
    async restoreEipAreaFormFieldDraft () {
      if (!this.canUseCreateFormDraft) return
      if (this.createFormDraftUserInteracted) return
      if (this._eipAreaApplying) {
        this._eipAreaRestoreAgain = true
        return
      }
      const areaRef = this.$refs.areaSelects
      if (!areaRef) return

      // 优先读控件草稿（与落盘路径一致），再回退页面 session/localStorage
      const draft = (typeof areaRef.readFormFieldDraft === 'function' && areaRef.readFormFieldDraft()) ||
        this.readCreateFormFieldDraft(EIP_CREATE_FORM_DRAFT_FIELD.AREA_SELECTS)
      if (!draft || typeof draft !== 'object') return

      const region = this.toAreaValue(draft.cloudregion).filter(Boolean)
      const list = areaRef.providerList || []
      // public 必须等平台列表就绪再回填
      if (this.isPublic && this.areaselectsName.includes('provider') && !list.length) return

      const provider = this.isPublic
        ? this.resolveEipDraftProviderNames(list, draft.provider)
        : this.toAreaValue(draft.provider).filter(Boolean)
      if (!provider.length && !region.length) return

      this._eipAreaApplying = true
      if (areaRef.areaDraftRestoring !== undefined) areaRef.areaDraftRestoring = true
      try {
        // 先写 fd.provider，保证 cloudregion-mapper 能按平台过滤
        if (provider.length) {
          const providerVal = this.isPublic ? provider : provider[0]
          this.form.fc.setFieldsValue({ provider: providerVal })
          this.$set(this.form.fd, 'provider', providerVal)
          await this.$nextTick()
        }

        if (this.isPublic && typeof areaRef.applyMultipleSelection === 'function') {
          await areaRef.applyMultipleSelection({
            provider,
            cloudregion: region,
          })
          // 固化锁定草稿，防止后续 params watch 的 fetchs 冲掉
          if (areaRef._lockedAreaDraft !== undefined) {
            areaRef._lockedAreaDraft = {
              provider: this.form.fc.getFieldValue('provider') || provider,
              cloudregion: this.form.fc.getFieldValue('cloudregion') || region,
              zone: this.form.fc.getFieldValue('zone'),
            }
            areaRef._pendingAreaDraft = null
            areaRef._areaDraftApplied = true
          }
        } else if (typeof areaRef.applyCreateFormFieldDraft === 'function') {
          await areaRef.applyCreateFormFieldDraft({
            provider: draft.provider,
            cloudregion: draft.cloudregion,
            zone: draft.zone,
          })
        }

        const values = {
          provider: this.form.fc.getFieldValue('provider'),
          cloudregion: this.form.fc.getFieldValue('cloudregion'),
        }
        Object.keys(values).forEach((key) => {
          if (values[key] !== undefined) this.$set(this.form.fd, key, values[key])
        })
        this.cloudregionChange()

        // 平台仍空则下一轮 fetchsDone 再试
        const appliedProvider = this.toAreaValue(values.provider).filter(Boolean)
        if (this.isPublic && provider.length && !appliedProvider.length) {
          this._eipAreaRestoreAgain = true
        }
      } finally {
        this._eipAreaApplying = false
        await this.$nextTick()
        if (areaRef) areaRef.areaDraftRestoring = false
        if (this._eipAreaRestoreAgain) {
          this._eipAreaRestoreAgain = false
          this.$nextTick(() => this.onAreaSelectsFetchsDone())
        }
      }
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
        // 多区域时用云订阅收敛到具体区域
        if (e.cloudregion_id && this.regionList[e.cloudregion_id]) {
          this.selectedRegionItem = this.regionList[e.cloudregion_id]
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
