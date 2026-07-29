<template>
  <div class="rds-create-index pb-5">
    <page-header :title="$t('db.text_140')" />
    <a-form hideRequiredMark :form="form.fc" class="mt-3"  v-bind="formItemLayout">
      <a-form-item :label="$t('db.text_139', [$t('dictionary.project')])" v-bind="formItemLayout">
        <domain-project
          :decorators="decorators.projectDomain"
          :fc="form.fc"
          :labelInValue="false"
          :ignoreStorage="ignoreLocalFormStorage"
          @fetchDomainCallback="fetchDomainCallback"
          @fetchProjectCallback="fetchProjectCallback" />
      </a-form-item>
      <a-form-item :label="$t('db.text_60')" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.resourceCreateName')" v-decorator="decorators.generate_name" />
        <template #extra>
          <name-repeated
            res="dbinstances"
            :name="form.getFieldValue('generate_name')"
            :default-text="$t('db.text_142')"  />
        </template>
      </a-form-item>
      <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" :auto_renew="false" />
      <a-form-item :label="$t('db.text_71')" v-if="form.fd.billing_type !== 'prepaid'">
        <duration :decorators="decorators.duration" :form="form" />
      </a-form-item>
      <a-form-item :label="$t('db.text_265')">
        <a-input-number v-decorator="decorators.__count__" />
      </a-form-item>
      <!-- 区域 -->
      <item-area
        ref="ITEM_AREA"
        :billingType="form.fd.billing_type"
        v-if="form.fd.project"
        class="mb-0"
        :isRequired="true"
        :names="['provider', 'cloudregion']"
        :defaultActiveFirstOption="areaDefaultActiveFirstOption"
        filterBrandResource="rds_engine"
        @fetchsDone="onAreaSelectsFetchsDone" />
      <!-- 套餐信息 -->
      <s-k-u ref="SKU" />
      <a-form-item v-if="form.fd.provider !== 'Aliyun'" :label="$t('db.text_143')">
        <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
      </a-form-item>
      <!-- 网络 -->
      <item-network ref="NETWORK" @vpcListChange="handleVpcListChange" />
      <!-- 选择安全组 -->
      <a-form-item v-if="showSecgroup(form)" :label="$t('db.text_144')">
        <secgroup-config :max="getSecgroupMax(form)" :decorators="decorators.secgroup" :secgroup-params="secgroupParams" />
      </a-form-item>
      <!-- 标签 -->
      <a-form-item :label="$t('table.title.tag')" class="mb-3">
        <tag v-decorator="decorators.__meta__" :allowNoValue="false" :default-checked="tagDefaultChecked" />
      </a-form-item>
      <bottom-bar :provider="provider" :values="form.getFieldsValue()" :cloudAccountId="cloudAccountId" @cancel="handleCancel" @create-success="onRdsCreateSuccess" />
    </a-form>
  </div>
</template>
<script>
import * as R from 'ramda'
import ServerPassword from '@Compute/sections/ServerPassword'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import Duration from '@Compute/sections/Duration'
import ItemArea from '@DB/sections/ItemArea'
import ItemNetwork from '@DB/sections/ItemNetwork'
import {
  mergeRdsCreateDraft,
  isMeaningfulRdsCreateDraft,
  buildRdsCreateDraftPayload,
} from '@DB/views/rds/utils/rdsCreateDraft'
import NameRepeated from '@/sections/NameRepeated'
import DomainProject from '@/sections/DomainProject'
import Tag from '@/sections/Tag'
import { getInitialValue } from '@/utils/common/ant'
import createFormDraftMixin from '@/mixins/createFormDraft'
import changeMinxin from './changeMinxin'
import BottomBar from './components/BottomBar'
import SKU from './components/SKU'
import { DECORATORS } from './constants/index'

export default {
  name: 'RDSCreate',
  components: {
    SKU,
    DomainProject,
    BottomBar,
    ServerPassword,
    ItemArea,
    ItemNetwork,
    SecgroupConfig,
    NameRepeated,
    Duration,
    Tag,
  },
  mixins: [changeMinxin, createFormDraftMixin],
  data () {
    return {
      loginTypes: ['random', 'password'],
      decorators: DECORATORS,
      formItemLayout: {
        wrapperCol: {
          lg: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 21 },
        },
        labelCol: {
          lg: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 3 },
        },
      },
      tailFormItemLayout: {
        wrapperCol: {
          lg: { span: 18, offset: 6 },
          xl: { span: 20, offset: 4 },
          xxl: { span: 21, offset: 3 },
        },
      },
      scopeParams: {
        scope: this.$store.getters.scope,
        project_domain: '',
      },
      vpcList: [],
      vpc: '',
      tagDefaultChecked: {},
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onValuesChange: this.handleValuesChange })
      const initFd = getInitialValue(DECORATORS)
      const { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue } = fc
      return {
        fc,
        fd: initFd,
        getFieldDecorator,
        getFieldValue,
        getFieldsValue,
        setFieldsValue,
      }
    },
    createFormDraftOptions () {
      return {
        formScope: 'db.rds',
        omitKeys: ['loginPassword', 'password'],
        serialize: () => this.serializeCreateFormDraft(),
        applyDraft: async (draftData) => {
          await this.applyRdsCreateDraft(draftData)
        },
        isMeaningfulDraft: (data) => isMeaningfulRdsCreateDraft(data),
      }
    },
    ignoreLocalFormStorage () {
      return !!this._draftInitFormData
    },
    isFormBackfill () {
      if (this._draftInitFormData && !this.createFormDraftUserInteracted) return true
      return this.isCreateFormDraftHydrating
    },
    effectiveInitFormData () {
      if (this._draftInitFormData && !this.createFormDraftUserInteracted) return this._draftInitFormData
      if (this.isCreateFormDraftHydrating && this._draftInitFormData) return this._draftInitFormData
      return {}
    },
    areaDefaultActiveFirstOption () {
      if (this.isFormBackfill) return false
      return true
    },
    providers () {
      if (this.form.fd.billing_type === 'prepaid') {
        return ['Aliyun', 'Huawei']
      }
      return ['Aliyun', 'Huawei', 'Google', 'Aws']
    },
    cloudAccountId () {
      const values = this.form.getFieldsValue()
      const currentVpc = this.vpcList.filter(item => item.id === values.vpc)
      if (currentVpc[0]) {
        return currentVpc[0].account_id
      }
      return ''
    },
    secgroupParams () {
      const ret = {}
      if (this.vpc) {
        ret.vpc_id = this.vpc
      }
      return ret
    },
  },
  provide () {
    return {
      form: this.form,
      formItemLayout: this.formItemLayout,
      scopeParams: this.scopeParams,
      tailFormItemLayout: this.tailFormItemLayout,
      getCreateFormDraftPreferred: () => {
        if (!this.isCreateFormDraftHydrating || !this._draftInitFormData) return null
        return this._draftInitFormData
      },
    }
  },
  methods: {
    showSecgroup (form) {
      const provider = form.getFieldValue('provider')
      if (provider === 'Qcloud') {
        return form.getFieldValue('category') !== 'basic'
      }

      return ['Huawei', 'Aliyun'].includes(provider)
    },
    getSecgroupMax (form) {
      const secgroupMaxMap = {
        Huawei: 1,
        Qcloud: 5,
        Aliyun: 3,
      }
      return secgroupMaxMap[form.getFieldValue('provider')] || 5
    },
    handleVpcListChange (list) {
      this.vpcList = list
    },
    handleCancel () {
      this.$router.push({ name: 'RDSIndex' })
    },
    /**
     * 回填计费：prepaid 时 duration/auto_renew 依赖 ClearingRadios 条件渲染后再写
     */
    async applyRdsBillingDraft (data) {
      if (!data) return
      const billingType = data.billing_type || 'postpaid'
      this.form.fc.setFieldsValue({ billing_type: billingType })
      this.$set(this.form.fd, 'billing_type', billingType)
      await this.$nextTick()
      if (billingType === 'prepaid') {
        const vals = {}
        if (data.duration) vals.duration = data.duration
        if (data.auto_renew != null) vals.auto_renew = !!data.auto_renew
        if (Object.keys(vals).length) {
          this.form.fc.setFieldsValue(vals)
          Object.keys(vals).forEach(k => this.$set(this.form.fd, k, vals[k]))
        }
      } else {
        const vals = {}
        if (data.durationStandard) vals.durationStandard = data.durationStandard
        if (data.duration) vals.duration = data.duration
        if (Object.keys(vals).length) {
          this.form.fc.setFieldsValue(vals)
          Object.keys(vals).forEach(k => this.$set(this.form.fd, k, vals[k]))
        }
      }
    },
    serializeCreateFormDraft () {
      try {
        const values = this.form.fc.getFieldsValue() || {}
        if (!values.provider && !values.cloudregion && !values.engine) {
          return null
        }
        return buildRdsCreateDraftPayload({
          ...values,
          domain: values.domain || this.form.fd.domain,
          project: values.project || this.form.fd.project,
          project_id: values.project || this.form.fd.project,
        }, {
          __resource_type__: 'rds',
          domain_id: values.domain || this.form.fd.domain,
        })
      } catch (e) {
        return null
      }
    },
    async applyRdsCreateDraft (draft) {
      const data = mergeRdsCreateDraft(draft)
      if (!data) return
      this._draftInitFormData = data
      this.isDraftRestore = true
      this.draftRestored = true
      this._rdsAreaApplied = false
      this._rdsAreaApplying = false
      const extra = data.extraData || {}
      const domainId = data.domain || extra.domain_id
      const projectId = data.project || data.project_id
      if (domainId) {
        this.form.fc.setFieldsValue({ domain: domainId })
        this.$set(this.form.fd, 'domain', domainId)
        this.domain_change()
      }
      if (projectId) {
        this.form.fc.setFieldsValue({ project: projectId })
        this.$set(this.form.fd, 'project', projectId)
      }
      const early = {}
      if (data.loginType) early.loginType = data.loginType
      if (data.multi_az != null) early.multi_az = data.multi_az
      if (Object.keys(early).length) {
        this.form.fc.setFieldsValue(early)
        Object.keys(early).forEach(k => this.$set(this.form.fd, k, early[k]))
      }
      // 包年包月的 duration / auto_renew 挂在 ClearingRadios 内，需等 billing_type 切到 prepaid 后再回填
      await this.applyRdsBillingDraft(data)
      if (data.__meta__ && !R.isEmpty(data.__meta__)) {
        const ret = {}
        R.forEachObjIndexed((value, key) => {
          ret[key] = R.is(Array, value) ? value : [value]
        }, data.__meta__)
        this.tagDefaultChecked = ret
        this.form.fc.setFieldsValue({ __meta__: data.__meta__ })
      } else {
        this.tagDefaultChecked = {}
        this.form.fc.setFieldsValue({ __meta__: undefined })
      }
      await this.$nextTick()
      await this.onAreaSelectsFetchsDone()
      await this.applyRdsSecondaryFields(data)
    },
    async onAreaSelectsFetchsDone () {
      if (!this.isFormBackfill || !this._draftInitFormData) return
      if (this._rdsAreaApplied || this._rdsAreaApplying) return
      await this.applyRdsAreaFields()
    },
    async applyRdsAreaFields () {
      const data = this._draftInitFormData
      if (!this.isFormBackfill || !data) return
      if (this._rdsAreaApplied || this._rdsAreaApplying) return
      this._rdsAreaApplying = true
      try {
        const areaRef = this.$refs.ITEM_AREA && this.$refs.ITEM_AREA.$refs.areaSelects
        if (!areaRef) return
        if (!(areaRef.providerList || []).length && !(areaRef.cloudregionList || []).length) return
        if (data.provider) {
          this.form.fc.setFieldsValue({ provider: data.provider })
          this.$set(this.form.fd, 'provider', data.provider)
          this.provider = data.provider
          await this.$nextTick()
          if (typeof areaRef.fetchListsOnly === 'function') {
            await areaRef.fetchListsOnly(['cloudregion'], { skipDefaultSelect: true })
          }
        }
        if (data.cloudregion) {
          this.form.fc.setFieldsValue({ cloudregion: data.cloudregion })
          this.$set(this.form.fd, 'cloudregion', data.cloudregion)
          this.cloudregion_change()
        }
        this._rdsAreaApplied = true
      } finally {
        this._rdsAreaApplying = false
      }
    },
    async applyRdsSecondaryFields (data) {
      if (!data || !this.isCreateFormDraftHydrating) return
      const start = Date.now()
      while (Date.now() - start < 12000) {
        const sku = this.form.fc.getFieldValue('sku')
        if (sku && (sku.id || sku.name)) break
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      const values = {}
      if (data.disk_size_gb != null) values.disk_size_gb = data.disk_size_gb
      if (data.multi_az != null) values.multi_az = data.multi_az
      if (data.loginType) values.loginType = data.loginType
      if (Object.keys(values).length) {
        this.form.fc.setFieldsValue(values)
      }
      await this.waitAndSetVpcNetwork(data)
      await this.waitAndSetSecgroup(data)
    },
    async waitAndSetVpcNetwork (data, timeout = 10000) {
      if (!data.vpc && !data.network) return
      const start = Date.now()
      while (Date.now() - start < timeout) {
        if (this.networkRef || this.$refs.NETWORK) {
          const vals = {}
          if (data.vpc) vals.vpc = data.vpc
          if (data.network) vals.network = data.network
          if (Object.keys(vals).length) {
            this.form.fc.setFieldsValue(vals)
            if (data.vpc) this.vpc = data.vpc
          }
          return
        }
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    },
    async waitAndSetSecgroup (data, timeout = 8000) {
      if (!data.secgroup && !data.secgroup_type) return
      const start = Date.now()
      while (Date.now() - start < timeout) {
        if (this.showSecgroup(this.form)) {
          const vals = {}
          if (data.secgroup_type) vals.secgroup_type = data.secgroup_type
          if (data.secgroup) vals.secgroup = data.secgroup
          if (Object.keys(vals).length) {
            this.form.fc.setFieldsValue(vals)
          }
          return
        }
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    },
    fetchDomainCallback () {
      let domain = this.$route.query.domain_id
      if (!domain && this.isFormBackfill) {
        domain = this.effectiveInitFormData?.extraData?.domain_id ||
          this.effectiveInitFormData?.domain
      }
      if (domain) {
        this.form.fc.setFieldsValue({ domain })
        this.$set(this.form.fd, 'domain', domain)
        this.domain_change()
      }
    },
    fetchProjectCallback () {
      let project = this.$route.query.tenant_id
      if (!project && this.isFormBackfill) {
        project = this.effectiveInitFormData?.project_id ||
          this.effectiveInitFormData?.project
      }
      if (project) {
        this.form.fc.setFieldsValue({ project })
        this.$set(this.form.fd, 'project', project)
      }
    },
    onRdsCreateSuccess () {
      this.saveCreateFormDraft(this.serializeCreateFormDraft(), { fromSubmit: true })
    },
  },
}
</script>
