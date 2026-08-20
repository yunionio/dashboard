<template>
  <div class="rds-create-index pb-5">
    <page-header :title="$t('db.text_140')" />
    <a-form hideRequiredMark :form="form.fc" class="mt-3"  v-bind="formItemLayout">
      <a-form-item :label="$t('db.text_139', [$t('dictionary.project')])" v-bind="formItemLayout">
        <domain-project
          :decorators="decorators.projectDomain"
          :fc="form.fc"
          :labelInValue="false"
          :form-draft-key="rdsDraftFields.domainProject"
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
        <duration :decorators="decorators.duration" :form="form" :form-draft-key="rdsDraftFields.duration" />
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
        :defaultActiveFirstOption="true"
        :form-draft-key="rdsDraftFields.areaSelects"
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
        <secgroup-config :max="getSecgroupMax(form)" :decorators="decorators.secgroup" :form="form" :secgroup-params="secgroupParams" :form-draft-key="rdsDraftFields.secgroup" />
      </a-form-item>
      <!-- 标签 -->
      <a-form-item :label="$t('table.title.tag')" class="mb-3">
        <tag v-decorator="decorators.__meta__" :allowNoValue="false" :default-checked="tagDefaultChecked" />
      </a-form-item>
      <bottom-bar :provider="provider" :values="form.getFieldsValue()" :cloudAccountId="cloudAccountId" @cancel="handleCancel" />
    </a-form>
  </div>
</template>
<script>
import ServerPassword from '@Compute/sections/ServerPassword'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import Duration from '@Compute/sections/Duration'
import ItemArea from '@DB/sections/ItemArea'
import ItemNetwork from '@DB/sections/ItemNetwork'
import NameRepeated from '@/sections/NameRepeated'
import DomainProject from '@/sections/DomainProject'
import Tag from '@/sections/Tag'
import { getInitialValue } from '@/utils/common/ant'
import { getComponentDraft } from '@/utils/createFormDraft'
import {
  RDS_CREATE_FORM_DRAFT_FIELD,
  RDS_CREATE_FORM_DRAFT_FIELDS,
  RDS_CREATE_FORM_DRAFT_FC_BINDINGS,
  RDS_CREATE_FORM_DRAFT_SCOPE,
} from '@DB/views/rds/utils/rdsCreateFormDraft'
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
    createFormDraftOptions () {
      return {
        formScope: RDS_CREATE_FORM_DRAFT_SCOPE,
        // 工单修改 / 购物车改单期间禁用，避免与回填数据打架
        disableWhen: () => !!(this.$route.query.workflow || this.$route.query.order_set_id),
      }
    },
    rdsDraftFields () {
      return RDS_CREATE_FORM_DRAFT_FIELDS
    },
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
      getCreateFormDraftScope: () => this.getCreateFormDraftScope(),
      canUseCreateFormFieldDraft: () => this.canUseCreateFormDraft,
      registerCreateFormFieldDraftFlush: (fn) => this.registerCreateFormFieldDraftFlush(fn),
      readCreateFormFieldDraft: (key) => this.readCreateFormFieldDraft(key),
      writeCreateFormFieldDraft: (key, data, options) => this.writeCreateFormFieldDraft(key, data, options),
      bindCreateFormFieldDraft: (spec) => this.bindCreateFormFieldDraft(spec),
      flushCreateFormFieldDrafts: () => this.flushCreateFormFieldDrafts(),
      setRdsSkuDraftRestoring: (v) => { this._rdsSkuDraftRestoring = !!v },
      // 用户点选套餐字段时落盘（程序化回填不走这里）
      persistRdsSkuDraftField: (formField, val) => {
        if (val === undefined || val === null || val === '') return
        this.markCreateFormDraftUserInteracted()
        const draftKey = this._rdsCreateFormFcDraftMap?.[formField]
        if (!draftKey) return
        this.writeCreateFormFieldDraft(draftKey, val)
      },
      getCreateFormDraftPreferred: (key) => {
        if (key) return this.readRdsSkuDraftField(key)
        // 聚合草稿供 Filters/SizeFilters/List 级联回填
        const sku = this.readRdsSkuDraftField(RDS_CREATE_FORM_DRAFT_FIELD.SKU)
        return {
          engine: this.readRdsSkuDraftField(RDS_CREATE_FORM_DRAFT_FIELD.ENGINE),
          engine_version: this.readRdsSkuDraftField(RDS_CREATE_FORM_DRAFT_FIELD.ENGINE_VERSION),
          category: this.readRdsSkuDraftField(RDS_CREATE_FORM_DRAFT_FIELD.CATEGORY),
          storage_type: this.readRdsSkuDraftField(RDS_CREATE_FORM_DRAFT_FIELD.STORAGE_TYPE),
          vcpu_count: this.readRdsSkuDraftField(RDS_CREATE_FORM_DRAFT_FIELD.VCPU_COUNT),
          vmem_size_mb: this.readRdsSkuDraftField(RDS_CREATE_FORM_DRAFT_FIELD.VMEM_SIZE_MB),
          zones: this.readRdsSkuDraftField(RDS_CREATE_FORM_DRAFT_FIELD.ZONES),
          sku,
          sku_id: sku?.id,
          sku_name: sku?.name,
        }
      },
    }
  },
  created () {
    this._rdsSkuDraftRestoring = false
    this.bindRdsCreateFormFcDrafts()
    this.bindRdsCreateFormCompositeDrafts()
    this.bindFormFcFieldDraft(RDS_CREATE_FORM_DRAFT_FIELD.DURATION, { formField: 'duration' })
  },
  methods: {
    /**
     * 套餐回填优先读 localStorage，避开 session 被「默认第一项」级联污染
     */
    readRdsSkuDraftField (fieldKey) {
      if (!fieldKey || !this.canUseCreateFormDraft) return null
      if (!this.createFormDraftUserInteracted) {
        const scope = this.getCreateFormDraftScope()
        if (scope) {
          const fromLs = getComponentDraft(scope, fieldKey)
          if (fromLs != null && fromLs !== '') return fromLs
        }
      }
      return this.readCreateFormFieldDraft(fieldKey)
    },
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
    onAreaSelectsFetchsDone () {},
    fetchDomainCallback () {
      const domain = this.$route.query.domain_id
      if (domain) {
        this.form.fc.setFieldsValue({ domain })
        this.$set(this.form.fd, 'domain', domain)
        this.domain_change()
      }
    },
    fetchProjectCallback () {
      const project = this.$route.query.tenant_id
      if (project) {
        this.form.fc.setFieldsValue({ project })
        this.$set(this.form.fd, 'project', project)
      }
    },
    bindRdsCreateFormFcDrafts () {
      this._rdsCreateFormFcDraftMap = Object.create(null)
      ;(RDS_CREATE_FORM_DRAFT_FC_BINDINGS || []).forEach((item) => {
        if (!item?.key || !item.formField) return
        this._rdsCreateFormFcDraftMap[item.formField] = item.key
        this.bindFormFcFieldDraft(item.key, {
          formField: item.formField,
          restore: item.restore !== false,
        })
      })
    },
    bindRdsCreateFormCompositeDrafts () {
      this.bindCreateFormFieldDraft({
        key: RDS_CREATE_FORM_DRAFT_FIELD.NETWORK,
        get: () => {
          const fc = this.form?.fc
          if (!fc) return null
          const vpc = fc.getFieldValue('vpc')
          const network = fc.getFieldValue('network')
          if (vpc == null && network == null) return null
          return { vpc, network }
        },
        set: (val) => {
          if (!val || !this.form?.fc) return
          const fields = {}
          if (val.vpc != null) fields.vpc = val.vpc
          if (val.network != null) fields.network = val.network
          if (Object.keys(fields).length) this.form.fc.setFieldsValue(fields)
        },
      })
    },
    syncCreateFormFcDrafts (newField) {
      if (!this.canUseCreateFormDraft || !newField || typeof newField !== 'object') return
      if (!this.createFormDraftUserInteracted) return
      // 套餐字段仅用户点击 persistRdsSkuDraftField 落盘，程序化回填/级联不同步
      const skuFcSkip = {
        engine: true,
        engine_version: true,
        category: true,
        storage_type: true,
        vcpu_count: true,
        vmem_size_mb: true,
        zones: true,
        sku: true,
      }
      const map = this._rdsCreateFormFcDraftMap || {}
      Object.keys(newField).forEach((formField) => {
        if (skuFcSkip[formField]) return
        const draftKey = map[formField]
        if (!draftKey) return
        const val = newField[formField]
        if (val === undefined || val === null || val === '') return
        this.writeCreateFormFieldDraft(draftKey, val)
      })
      if (Object.prototype.hasOwnProperty.call(newField, 'vpc') || Object.prototype.hasOwnProperty.call(newField, 'network')) {
        const fc = this.form?.fc
        if (!fc) return
        const vpc = fc.getFieldValue('vpc')
        const network = fc.getFieldValue('network')
        if (vpc != null || network != null) {
          this.writeCreateFormFieldDraft(RDS_CREATE_FORM_DRAFT_FIELD.NETWORK, { vpc, network })
        } else {
          this.clearCreateFormFieldDraft(RDS_CREATE_FORM_DRAFT_FIELD.NETWORK)
        }
      }
      if (Object.prototype.hasOwnProperty.call(newField, 'duration')) {
        this.writeCreateFormFieldDraft(RDS_CREATE_FORM_DRAFT_FIELD.DURATION, newField.duration)
      }
      if (Object.prototype.hasOwnProperty.call(newField, 'billing_type')) {
        this.writeCreateFormFieldDraft(RDS_CREATE_FORM_DRAFT_FIELD.BILLING_TYPE, newField.billing_type)
      }
    },
  },
}
</script>
