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
            :ignoreStorage="ignoreLocalFormStorage"
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
          <duration :decorators="decorators.duration" :form="form" />
        </a-form-item>
        <a-form-item :label="$t('db.text_265')">
          <a-input-number v-decorator="decorators.count" :min="1" :max="10" />
        </a-form-item>
        <!-- 区域 -->
        <item-area
          ref="ITEM_AREA"
          v-if="form.fd.project"
          class="mb-0"
          :defaultActiveFirstOption="areaDefaultActiveFirstOption"
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
          <secgroup-config :max="5" :decorators="decorators.secgroup" :secgroup-params="secgroupParams" />
        </a-form-item>
        <!-- 标签 -->
        <a-form-item :label="$t('table.title.tag')">
          <tag v-decorator="decorators.__meta__" :allowNoValue="false" :default-checked="tagDefaultChecked" />
        </a-form-item>
        <bottom-bar :provider="provider" :values="form.fc.getFieldsValue()" :cloudAccountId="cloudAccountId" @cancel="handleCancel" @create-success="onRedisCreateSuccess" />
      </a-form>
    </page-body>
  </div>
</template>
<script>
import * as R from 'ramda'
import { DECORATORS } from '@DB/views/redis/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import Duration from '@Compute/sections/Duration'
import ItemArea from '@DB/sections/ItemArea'
import ItemNetwork from '@DB/sections/ItemNetwork'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import {
  mergeRedisCreateDraft,
  isMeaningfulRedisCreateDraft,
  buildRedisCreateDraftPayload,
} from '@DB/views/redis/utils/redisCreateDraft'
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
    // 区域
    ItemArea,
    // SKU
    SKU,
    // 指定项目
    DomainProject,
    // 管理员密码
    ServerPassword,
    // 网络
    ItemNetwork,
    // 安全组
    SecgroupConfig,
    // 表单提交
    BottomBar,
    NameRepeated,
    // 标签
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
        formScope: 'db.redis',
        omitKeys: ['loginPassword', 'password'],
        serialize: () => this.serializeCreateFormDraft(),
        applyDraft: async (draftData) => {
          await this.applyRedisCreateDraft(draftData)
        },
        isMeaningfulDraft: (data) => isMeaningfulRedisCreateDraft(data),
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
      return ['provider', 'cloudregion']
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
  methods: {
    handleVpcListChange (list) {
      this.vpcList = list
    },
    handleCancel () {
      this.$router.push({ name: 'Redis' })
    },
    /**
     * 回填计费：prepaid 时 duration/auto_renew 依赖 ClearingRadios 条件渲染后再写
     */
    async applyRedisBillingDraft (data) {
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
        return buildRedisCreateDraftPayload({
          ...values,
          domain: values.domain || this.form.fd.domain,
          project: values.project || this.form.fd.project,
          project_id: values.project || this.form.fd.project,
        }, {
          __resource_type__: 'redis',
          domain_id: values.domain || this.form.fd.domain,
        })
      } catch (e) {
        return null
      }
    },
    async applyRedisCreateDraft (draft) {
      const data = mergeRedisCreateDraft(draft)
      if (!data) return
      this._draftInitFormData = data
      this.isDraftRestore = true
      this.draftRestored = true
      this._redisAreaApplied = false
      this._redisAreaApplying = false
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
        this.project_id = projectId
        this.project_change()
      }
      const early = {}
      if (data.loginType) early.loginType = data.loginType
      if (Object.keys(early).length) {
        this.form.fc.setFieldsValue(early)
        Object.keys(early).forEach(k => this.$set(this.form.fd, k, early[k]))
      }
      // 包年包月的 duration / auto_renew 挂在 ClearingRadios 内，需等 billing_type 切到 prepaid 后再回填
      await this.applyRedisBillingDraft(data)
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
      await this.applyRedisSecondaryFields(data)
    },
    async onAreaSelectsFetchsDone () {
      if (!this.isFormBackfill || !this._draftInitFormData) return
      if (this._redisAreaApplied || this._redisAreaApplying) return
      await this.applyRedisAreaFields()
    },
    async applyRedisAreaFields () {
      const data = this._draftInitFormData
      if (!this.isFormBackfill || !data) return
      if (this._redisAreaApplied || this._redisAreaApplying) return
      this._redisAreaApplying = true
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
          // redis 区域变化走 area_change → capability
          this.area_change()
        }
        this._redisAreaApplied = true
      } finally {
        this._redisAreaApplying = false
      }
    },
    async applyRedisSecondaryFields (data) {
      if (!data || !this.isCreateFormDraftHydrating) return
      const start = Date.now()
      while (Date.now() - start < 12000) {
        const sku = this.form.fc.getFieldValue('sku')
        if (sku && (sku.id || sku.name)) break
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      if (data.loginType) {
        this.form.fc.setFieldsValue({ loginType: data.loginType })
      }
      await this.waitAndSetVpcNetwork(data)
      await this.waitAndSetSecgroup(data)
    },
    async waitAndSetVpcNetwork (data, timeout = 10000) {
      if (!data.vpc && !data.network) return
      const start = Date.now()
      while (Date.now() - start < timeout) {
        if (this.networkRef || this.$refs.REF_NETWORK) {
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
        if (this.form.getFieldValue('provider') === 'Qcloud') {
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
        this.project_id = project
      }
    },
    onRedisCreateSuccess () {
      this.saveCreateFormDraft(this.serializeCreateFormDraft(), { fromSubmit: true })
    },
  },
}
</script>
