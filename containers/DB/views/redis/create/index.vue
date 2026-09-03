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
          <secgroup-config :max="5" :decorators="decorators.secgroup" :form="form" :secgroup-params="secgroupParams" />
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
  REDIS_CREATE_FORM_DRAFT_SYNC_FIELDS,
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
import { getComponentDraft } from '@/utils/createFormDraft'
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
      getCreateFormDraftPreferred: (key) => {
        if (key) return this.readRedisSkuDraftField(key)
        // 聚合草稿供级联回填（勿用当前空表单值）
        const sku = this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.SKU)
        return {
          engine: this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.ENGINE),
          engine_version: this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.ENGINE_VERSION),
          local_category: this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.LOCAL_CATEGORY),
          node_type: this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.NODE_TYPE),
          performance_type: this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.PERFORMANCE_TYPE),
          memory_size_mb: this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.MEMORY_SIZE_MB),
          sku,
          sku_id: sku?.id,
          sku_name: sku?.name,
        }
      },
    }
  },
  watch: {
    'form.fd.billing_type' (val) {
      if (val === 'prepaid') {
        this.$nextTick(() => this.restoreRedisPrepaidBillingDraft())
      }
    },
  },
  created () {
    this._redisPrepaidBillingDraftApplied = false
    this.bindRedisCreateFormFcDrafts()
    this.bindRedisCreateFormCompositeDrafts()
    this.bindRedisPrepaidBillingDrafts()
  },
  mounted () {
    // billing_type 草稿回填可能只改 fc、未触发 fd watch；补一次
    this.$nextTick(() => {
      if (this.form?.fc?.getFieldValue?.('billing_type') === 'prepaid') {
        this.restoreRedisPrepaidBillingDraft()
      }
    })
  },
  methods: {
    /**
     * 套餐回填：未交互前优先 local，避开 session 被「默认第一项」级联污染
     */
    readRedisSkuDraftField (fieldKey) {
      if (!fieldKey || !this.canRestoreCreateFormDraft) return null
      if (!this.createFormDraftUserInteracted) {
        const scope = this.getCreateFormDraftScope()
        if (scope) {
          const fromLs = getComponentDraft(scope, fieldKey)
          if (fromLs != null && fromLs !== '') return fromLs
        }
      }
      return this.readCreateFormFieldDraft(fieldKey)
    },
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
    /** SYNC 字段取值：无值返回 undefined（跳过 flush），禁止 null 误清草稿 */
    getRedisSyncDraftValue (formField) {
      if (formField === 'sku') {
        const sku = this.form?.fc?.getFieldValue?.('sku')
        if (!sku || typeof sku !== 'object') return undefined
        if (!sku.id && !sku.name) return undefined
        return { id: sku.id, name: sku.name }
      }
      const val = this.form?.fc?.getFieldValue?.(formField)
      if (val === undefined || val === null || val === '') return undefined
      return val
    },
    bindRedisCreateFormFcDrafts () {
      this._redisCreateFormFcDraftMap = Object.create(null)
      // billing_type：set 时同步 fd，并在 prepaid 时回填购买时长/自动续费
      this._redisCreateFormFcDraftMap.billing_type = REDIS_CREATE_FORM_DRAFT_FIELD.BILLING_TYPE
      this.bindCreateFormFieldDraft({
        key: REDIS_CREATE_FORM_DRAFT_FIELD.BILLING_TYPE,
        kind: 'selection',
        get: () => {
          const v = this.form?.fc?.getFieldValue?.('billing_type')
          return (v === undefined || v === null || v === '') ? undefined : v
        },
        set: (val) => {
          if (val == null || val === '' || !this.form?.fc) return
          this.form.fc.setFieldsValue({ billing_type: val })
          if (this.form.fd) this.$set(this.form.fd, 'billing_type', val)
          if (val === 'prepaid') {
            this.$nextTick(() => this.restoreRedisPrepaidBillingDraft())
          }
        },
      })
      // 套餐级联：仅 flush 落盘；回填由 ItemFilters/List 对照 options 自管
      ;(REDIS_CREATE_FORM_DRAFT_SYNC_FIELDS || []).forEach((item) => {
        if (!item?.key || !item.formField) return
        this._redisCreateFormFcDraftMap[item.formField] = item.key
        const formField = item.formField
        this.bindCreateFormFieldDraft({
          key: item.key,
          kind: item.kind || 'selection',
          get: () => this.getRedisSyncDraftValue(formField),
        })
      })
    },
    /**
     * 包年包月：ClearingRadios 的 duration / auto_renew（与到期释放 Duration 组件 key 分离）
     */
    bindRedisPrepaidBillingDrafts () {
      this.bindCreateFormFieldDraft({
        key: REDIS_CREATE_FORM_DRAFT_FIELD.PREPAID_DURATION,
        kind: 'selection',
        get: () => {
          if (this.form?.fc?.getFieldValue?.('billing_type') !== 'prepaid') return null
          const val = this.form.fc.getFieldValue('duration')
          return (val === undefined || val === null || val === '') ? undefined : val
        },
      })
      this.bindCreateFormFieldDraft({
        key: REDIS_CREATE_FORM_DRAFT_FIELD.AUTO_RENEW,
        kind: 'selection',
        get: () => {
          if (this.form?.fc?.getFieldValue?.('billing_type') !== 'prepaid') return null
          const val = this.form.fc.getFieldValue('auto_renew')
          if (val === undefined || val === null) return undefined
          return !!val
        },
      })
    },
    /** billing_type=prepaid 且 ClearingRadios 挂载 duration 后再回填 */
    restoreRedisPrepaidBillingDraft () {
      if (this._redisPrepaidBillingDraftApplied) return
      if (!this.canRestoreCreateFormDraft || !this.form?.fc) return
      if (this.form.fc.getFieldValue('billing_type') !== 'prepaid') return
      const duration = this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.PREPAID_DURATION)
      const autoRenew = this.readRedisSkuDraftField(REDIS_CREATE_FORM_DRAFT_FIELD.AUTO_RENEW)
      const fields = {}
      if (duration != null && duration !== '') fields.duration = duration
      if (autoRenew != null) fields.auto_renew = !!autoRenew
      if (!Object.keys(fields).length) {
        this._redisPrepaidBillingDraftApplied = true
        return
      }
      // 等 ClearingRadios 按 prepaid 渲染并注册 duration / auto_renew
      this.$nextTick(() => {
        this.$nextTick(() => {
          if (this.form.fc.getFieldValue('billing_type') !== 'prepaid') return
          this.form.fc.setFieldsValue(fields)
          Object.keys(fields).forEach((k) => {
            if (this.form.fd) this.$set(this.form.fd, k, fields[k])
          })
          this._redisPrepaidBillingDraftApplied = true
        })
      })
    },
    bindRedisCreateFormCompositeDrafts () {
      this.bindCreateFormFieldDraft({
        key: REDIS_CREATE_FORM_DRAFT_FIELD.NETWORK,
        kind: 'composite',
        get: () => {
          const fc = this.form?.fc
          if (!fc) return undefined
          const vpc = fc.getFieldValue('vpc')
          const network = fc.getFieldValue('network')
          if (vpc == null && network == null) return undefined
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
  },
}
</script>
