<template>
  <div class="redis-create-index db-create-index pb-5">
    <page-header :title="$t('db.text_280')" />
    <page-body needMarginBottom>
      <a-form
        class="mt-3"
        v-bind="formItemLayout"
        :form="form.fc"
        hideRequiredMark>
        <a-form-item :label="$t('db.text_281')">
          <domain-project
            :decorators="decorators.projectDomain"
            :fc="form.fc"
            :labelInValue="false"
            :form-draft-key="redisDraftFields.domainProject"
            @fetchDomainCallback="fetchDomainCallback"
            @fetchProjectCallback="fetchProjectCallback" />
        </a-form-item>
        <a-form-item :label="$t('db.text_60')">
          <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.resourceCreateName')" />
          <template #extra>
            <name-repeated res="dbinstances" :name="form.getFieldValue('generate_name')" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <!-- 计费方式 -->
        <clearing-radios v-bind="formItemLayout" :auto_renew="false" />
        <a-form-item :label="$t('db.text_71')" v-if="form.fd.billing_type !== 'prepaid'">
          <duration :decorators="decorators.duration" :form="form" :form-draft-key="redisDraftFields.duration" />
        </a-form-item>
        <a-form-item :label="$t('db.text_265')">
          <a-input-number v-decorator="decorators.count" :min="1" :max="10" />
        </a-form-item>
        <!-- 区域 -->
        <item-area
          ref="ITEM_AREA"
          v-if="form.fd.project"
          class="mb-0"
          :defaultActiveFirstOption="['provider', 'cloudregion']"
          :values="form.fc.getFieldsValue()"
          :form-draft-key="redisDraftFields.areaSelects"
          filterBrandResource="redis_engine"
          @fetchsDone="onAreaSelectsFetchsDone" />
        <!-- 套餐 -->
        <s-k-u ref="REF_SKU" />
        <a-form-item :label="$t('db.text_143')">
          <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
        </a-form-item>
        <!-- 网络 -->
        <item-network ref="REF_NETWORK" @vpcListChange="handleVpcListChange" />
        <!-- 安全组 -->
        <a-form-item v-if="form.getFieldValue('provider') === 'Qcloud'" :label="$t('db.text_144')">
          <secgroup-config :max="5" :decorators="decorators.secgroup" :form="form" :secgroup-params="secgroupParams" :form-draft-key="redisDraftFields.secgroup" />
        </a-form-item>
        <!-- 标签 -->
        <a-form-item :label="$t('table.title.tag')">
          <tag v-decorator="decorators.__meta__" :allowNoValue="false" :default-checked="tagDefaultChecked" />
        </a-form-item>
        <bottom-bar :provider="provider" :values="form.fc.getFieldsValue()" :cloudAccountId="cloudAccountId" @cancel="handleCancel" />
      </a-form>
    </page-body>
  </div>
</template>
<script>
import { DECORATORS } from '@DB/views/redis/constants'
import {
  REDIS_CREATE_FORM_DRAFT_FIELD,
  REDIS_CREATE_FORM_DRAFT_FIELDS,
  REDIS_CREATE_FORM_DRAFT_FC_BINDINGS,
  REDIS_CREATE_FORM_DRAFT_SCOPE,
} from '@DB/views/redis/utils/redisCreateFormDraft'
import ServerPassword from '@Compute/sections/ServerPassword'
import Duration from '@Compute/sections/Duration'
import ItemArea from '@DB/sections/ItemArea'
import ItemNetwork from '@DB/sections/ItemNetwork'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'
import Tag from '@/sections/Tag'
import createFormDraftMixin from '@/mixins/createFormDraft'
import changeMinxin from './changeMinxin'
import BottomBar from './components/BottomBar'
import SKU from './components/SKU'

export default {
  name: 'IDCCreate',
  components: {
    Duration,
    ItemArea,
    SKU,
    DomainProject,
    ServerPassword,
    ItemNetwork,
    SecgroupConfig,
    BottomBar,
    NameRepeated,
    Tag,
  },
  mixins: [changeMinxin, createFormDraftMixin],
  data () {
    return {
      loginTypes: ['random', 'password'],
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
      decorators: DECORATORS,
      project_id: '',
      vpcList: [],
      vpc: '',
      tagDefaultChecked: {},
    }
  },
  computed: {
    createFormDraftOptions () {
      return {
        formScope: REDIS_CREATE_FORM_DRAFT_SCOPE,
        disableWhen: () => !!(this.$route.query.workflow || this.$route.query.order_set_id),
      }
    },
    redisDraftFields () {
      return REDIS_CREATE_FORM_DRAFT_FIELDS
    },
    secgroupParams () {
      const ret = {
        project_id: this.project_id,
        ...this.scopeParam,
      }
      if (this.vpc) {
        ret.vpc_id = this.vpc
      }
      return ret
    },
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.project_domain,
        }
      }
      return { scope: this.$store.getters.scope }
    },
    cloudAccountId () {
      const values = this.form.getFieldsValue()
      const currentVpc = this.vpcList.filter(item => item.id === values.vpc)
      if (currentVpc[0]) {
        return currentVpc[0].account_id
      }
      return ''
    },
  },
  provide () {
    return {
      form: this.form,
      scopeParams: this.scopeParams,
      formItemLayout: this.formItemLayout,
      tailFormItemLayout: this.tailFormItemLayout,
      redisItem: this.redisItem,
      getCreateFormDraftScope: () => this.getCreateFormDraftScope(),
      canUseCreateFormFieldDraft: () => this.canUseCreateFormDraft,
      registerCreateFormFieldDraftFlush: (fn) => this.registerCreateFormFieldDraftFlush(fn),
      readCreateFormFieldDraft: (key) => this.readCreateFormFieldDraft(key),
      writeCreateFormFieldDraft: (key, data, options) => this.writeCreateFormFieldDraft(key, data, options),
      bindCreateFormFieldDraft: (spec) => this.bindCreateFormFieldDraft(spec),
      flushCreateFormFieldDrafts: () => this.flushCreateFormFieldDrafts(),
      persistRedisSkuDraftField: (formField, val) => {
        if (val === undefined || val === null || val === '') return
        this.markCreateFormDraftUserInteracted()
        const draftKey = this._redisCreateFormFcDraftMap?.[formField]
        if (!draftKey) return
        this.writeCreateFormFieldDraft(draftKey, val)
      },
      getCreateFormDraftPreferred: (key) => {
        if (key) return this.readCreateFormFieldDraft(key)
        // 聚合草稿供级联回填（勿用当前空表单值）
        const sku = this.readCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.SKU)
        return {
          engine: this.readCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.ENGINE),
          engine_version: this.readCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.ENGINE_VERSION),
          local_category: this.readCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.LOCAL_CATEGORY),
          node_type: this.readCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.NODE_TYPE),
          performance_type: this.readCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.PERFORMANCE_TYPE),
          memory_size_mb: this.readCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.MEMORY_SIZE_MB),
          sku,
          sku_id: sku?.id,
          sku_name: sku?.name,
        }
      },
    }
  },
  created () {
    this.bindRedisCreateFormFcDrafts()
    this.bindRedisCreateFormCompositeDrafts()
    this.bindFormFcFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.DURATION, { formField: 'duration' })
  },
  methods: {
    handleVpcListChange (list) {
      this.vpcList = list
    },
    handleCancel () {
      this.$router.push({ name: 'Redis' })
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
        this.project_id = project
      }
    },
    bindRedisCreateFormFcDrafts () {
      this._redisCreateFormFcDraftMap = Object.create(null)
      ;(REDIS_CREATE_FORM_DRAFT_FC_BINDINGS || []).forEach((item) => {
        if (!item?.key || !item.formField) return
        this._redisCreateFormFcDraftMap[item.formField] = item.key
        this.bindFormFcFieldDraft(item.key, {
          formField: item.formField,
          restore: item.restore !== false,
        })
      })
    },
    bindRedisCreateFormCompositeDrafts () {
      this.bindCreateFormFieldDraft({
        key: REDIS_CREATE_FORM_DRAFT_FIELD.NETWORK,
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
      // 套餐字段仅用户点击 persistRedisSkuDraftField 落盘
      const skuFcSkip = {
        engine: true,
        engine_version: true,
        local_category: true,
        node_type: true,
        performance_type: true,
        memory_size_mb: true,
        sku: true,
      }
      const map = this._redisCreateFormFcDraftMap || {}
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
          this.writeCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.NETWORK, { vpc, network })
        } else {
          this.clearCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.NETWORK)
        }
      }
      if (Object.prototype.hasOwnProperty.call(newField, 'duration')) {
        this.writeCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.DURATION, newField.duration)
      }
      if (Object.prototype.hasOwnProperty.call(newField, 'billing_type')) {
        this.writeCreateFormFieldDraft(REDIS_CREATE_FORM_DRAFT_FIELD.BILLING_TYPE, newField.billing_type)
      }
    },
  },
}
</script>
