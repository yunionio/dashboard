<template>
  <!-- 使用独立 a-form，避免嵌在 BillForm 的 form 内产生嵌套 form -->
  <a-form :form="form.fc" v-bind="formItemLayout" class="bill-subscribe-section">
    <a-alert v-if="showAlert" class="mb-3" type="info" show-icon>
      <template slot="message">
        <div>{{ providerExtra }}</div>
        <div class="mt-1">{{ noDuplicateTip }}</div>
      </template>
    </a-alert>
    <a-form-item
      v-if="!createOnly"
      :label="$t('cloudenv.bill_subscribe_action_mode')">
      <a-radio-group v-model="actionMode">
        <a-radio-button value="existing" :disabled="!existingOptions.length">
          {{ $t('cloudenv.bill_subscribe_use_existing') }}
        </a-radio-button>
        <a-radio-button value="new" :disabled="!availableTypes.length">
          {{ $t('cloudenv.bill_subscribe_create_new') }}
        </a-radio-button>
      </a-radio-group>
      <div v-if="!existingOptions.length && !availableTypes.length" slot="extra" class="text-color-help">
        {{ tKey('bill.bill_subscribe_all_subscribed', $t('cloudenv.bill_subscribe_all_subscribed')) }}
      </div>
    </a-form-item>
    <template v-if="actionMode === 'existing' && !createOnly">
      <a-form-item :label="$t('cloudenv.bill_subscribe_select_existing')">
        <a-select
          :key="'existing-' + selectRenderKey"
          v-decorator="decorators.existing_type"
          :loading="loadingSubscriptions"
          :placeholder="$t('cloudenv.bill_subscribe_select_existing_prompt')"
          allow-clear
          option-label-prop="label"
          @change="onExistingTypeChange">
          <a-select-option
            v-for="item in existingOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
            :title="item.hint ? `${item.label}：${item.hint}` : item.label">
            <div>{{ item.label }}</div>
            <div v-if="item.hint" class="text-color-help" style="font-size: 12px; white-space: normal; line-height: 1.4;">
              {{ item.hint }}
            </div>
          </a-select-option>
        </a-select>
        <div v-if="aliyunTypeGuide" slot="extra" class="text-color-help">
          {{ aliyunTypeGuide }}
        </div>
      </a-form-item>
    </template>
    <template v-else>
      <a-form-item :label="tKey('bill.bill_subscribe_type', $t('cloudenv.bill_subscribe_type'))">
        <!-- option-label-prop=label：下拉可富文本，选中态用 label，避免显示 consumeDetailBillV2 -->
        <a-select
          :key="'new-' + selectRenderKey"
          v-decorator="decorators.subscribe_type"
          :placeholder="tKey('bill.bill_subscribe_type_prompt', $t('cloudenv.bill_subscribe_type_prompt'))"
          :disabled="!availableTypes.length"
          option-label-prop="label"
          @change="onSubscribeTypeChange">
          <template v-if="isAws || isAzure">
            <a-select-option
              v-for="item in typeOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label">
              {{ item.label }}
            </a-select-option>
          </template>
          <template v-else>
            <!-- 不用 OptGroup：部分版本对 group 内 option 的 label 选中展示有问题 -->
            <a-select-option
              v-if="newTypeOptions.length"
              key="__group_new__"
              value="__group_new__"
              label=""
              disabled>
              {{ tKey('bill.bill_subscribe_type_group_new', $t('cloudenv.bill_subscribe_type_group_new')) }}
            </a-select-option>
            <a-select-option
              v-for="item in newTypeOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              :title="item.hint ? `${item.label}：${item.hint}` : item.label">
              <div>{{ item.label }}</div>
              <div v-if="item.hint" class="text-color-help" style="font-size: 12px; white-space: normal; line-height: 1.4;">
                {{ item.hint }}
              </div>
            </a-select-option>
            <a-select-option
              v-if="oldTypeOptions.length"
              key="__group_old__"
              value="__group_old__"
              label=""
              disabled>
              {{ tKey('bill.bill_subscribe_type_group_old', $t('cloudenv.bill_subscribe_type_group_old')) }}
            </a-select-option>
            <a-select-option
              v-for="item in oldTypeOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              :title="item.hint ? `${item.label}：${item.hint}` : item.label">
              <div>{{ item.label }}</div>
              <div v-if="item.hint" class="text-color-help" style="font-size: 12px; white-space: normal; line-height: 1.4;">
                {{ item.hint }}
              </div>
            </a-select-option>
          </template>
        </a-select>
        <div v-if="!availableTypes.length || aliyunTypeGuide" slot="extra" class="text-color-help">
          <template v-if="!availableTypes.length">
            {{ tKey('bill.bill_subscribe_all_subscribed', $t('cloudenv.bill_subscribe_all_subscribed')) }}
          </template>
          <template v-else>{{ aliyunTypeGuide }}</template>
        </div>
      </a-form-item>
      <a-form-item :label="tKey('bill.bill_subscribe_bucket', $t('cloudenv.bill_subscribe_bucket'))">
        <a-auto-complete
          v-decorator="decorators.subscribe_bucket"
          :data-source="bucketDataSource"
          :filter-option="filterBucketOption"
          :placeholder="tKey('bill.bill_subscribe_bucket_placeholder', $t('cloudenv.bill_subscribe_bucket_placeholder'))" />
      </a-form-item>
      <a-form-item :label="tKey('bill.bill_subscribe_bucket_path', $t('cloudenv.bill_subscribe_bucket_path'))">
        <a-input
          v-decorator="decorators.bucket_path"
          :placeholder="bucketPathPlaceholder" />
        <div slot="extra">{{ bucketPathExtra }}</div>
      </a-form-item>
      <a-form-item
        v-if="!isAws && !isAzure"
        :label="tKey('bill.bill_subscribe_begin_cycle', $t('cloudenv.bill_subscribe_begin_cycle'))">
        <a-month-picker
          v-decorator="decorators.begin_billing_cycle"
          format="YYYY-MM"
          style="width: 100%"
          :placeholder="tKey('bill.bill_subscribe_begin_cycle_placeholder', $t('cloudenv.bill_subscribe_begin_cycle_placeholder'))" />
        <div slot="extra">{{ tKey('bill.bill_subscribe_begin_cycle_extra', $t('cloudenv.bill_subscribe_begin_cycle_extra')) }}</div>
      </a-form-item>
      <a-form-item
        v-if="showSwitchMeter"
        :label="tKey('bill.bill_subscribe_switch_meter', $t('cloudenv.bill_subscribe_switch_meter'))">
        <a-checkbox v-decorator="decorators.switch_meter_type">
          {{ tKey('bill.bill_subscribe_switch_meter_label', $t('cloudenv.bill_subscribe_switch_meter_label')) }}
        </a-checkbox>
        <div slot="extra">{{ tKey('bill.bill_subscribe_switch_meter_extra', $t('cloudenv.bill_subscribe_switch_meter_extra')) }}</div>
      </a-form-item>
    </template>
  </a-form>
</template>

<script>
const ALIYUN_NEW_TYPES = ['consumeDetailBillV2', 'splitDetailBillV2']
const ALIYUN_OLD_TYPES = ['BillingItemDetailForBillingPeriod', 'SplitItemDetailDaily']
const ALIYUN_DEFAULT_TYPES = [...ALIYUN_NEW_TYPES, ...ALIYUN_OLD_TYPES]
const AWS_CREATABLE_TYPES = ['cur']
const AWS_METER_TYPES = ['cur', 'cur2', 'dbr']
const AWS_DEFAULT_REPORT_NAME = 'meter-cur'
const AZURE_CREATABLE_TYPES = ['export']
const AZURE_METER_TYPES = ['export']
const AZURE_DEFAULT_EXPORT_NAME = 'meter-export'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function normalizeBucketValue (val) {
  const raw = (val || '').trim()
  if (!raw) return ''
  if (raw.includes('://') || raw.includes('.oss-') || raw.includes('.s3.') || raw.includes('.amazonaws.') || raw.includes('.blob.core.')) {
    const host = raw.replace(/^https?:\/\//, '').split('/')[0]
    return host.split('.')[0] || raw
  }
  return raw
}

export default {
  name: 'BillSubscribeSection',
  props: {
    accountId: {
      type: String,
      required: true,
    },
    account: {
      type: Object,
      default: () => ({}),
    },
    provider: {
      type: String,
      default: '',
    },
    createOnly: {
      type: Boolean,
      default: false,
    },
    showAlert: {
      type: Boolean,
      default: true,
    },
    showSwitchMeter: {
      type: Boolean,
      default: true,
    },
    subscribedTypes: {
      type: Array,
      default: null,
    },
    supportedTypes: {
      type: Array,
      default: null,
    },
    formItemLayout: {
      type: Object,
      default: () => ({
        wrapperCol: { span: 18 },
        labelCol: { span: 6 },
      }),
    },
  },
  data () {
    const brand = (this.provider || this.account.brand || this.account.provider || '').toLowerCase()
    const defaultCreatable = brand === 'aws'
      ? [...AWS_CREATABLE_TYPES]
      : (brand === 'azure' ? [...AZURE_CREATABLE_TYPES] : [...ALIYUN_DEFAULT_TYPES])
    const options = (this.account && this.account.options) || {}
    const initialBucket = normalizeBucketValue(options.billing_report_bucket || '')
    const defaultPath = brand === 'aws'
      ? 'cur'
      : (brand === 'azure' ? 'exports/bill' : '')
    const creatable = (this.supportedTypes && this.supportedTypes.length)
      ? [...this.supportedTypes]
      : defaultCreatable
    const subscribed = this.subscribedTypes || []
    const available = creatable.filter(type => !subscribed.includes(type))
    return {
      brand,
      loadingSubscriptions: false,
      loadingBuckets: false,
      subscriptions: [],
      meterSupportedTypes: brand === 'aws'
        ? [...AWS_METER_TYPES]
        : (brand === 'azure' ? [...AZURE_METER_TYPES] : [...ALIYUN_DEFAULT_TYPES]),
      creatableTypes: creatable,
      innerSubscribedTypes: subscribed,
      bucketOptions: [],
      actionMode: 'new',
      selectedSubscribeType: available[0] || '',
      selectedExistingType: '',
      selectRenderKey: 0,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        existing_type: [
          'existing_type',
          {
            rules: [{ required: true, message: this.$t('cloudenv.bill_subscribe_select_existing_prompt') }],
          },
        ],
        subscribe_type: [
          'subscribe_type',
          {
            initialValue: available[0],
            rules: [{ required: true, message: this.$t('cloudenv.bill_subscribe_type_prompt') }],
          },
        ],
        subscribe_bucket: [
          'subscribe_bucket',
          {
            initialValue: initialBucket,
            rules: [{ required: true, message: this.$t('cloudenv.bill_subscribe_bucket_required') }],
          },
        ],
        bucket_path: [
          'bucket_path',
          {
            initialValue: options.billing_file_prefix || defaultPath,
          },
        ],
        begin_billing_cycle: [
          'begin_billing_cycle',
          { initialValue: undefined },
        ],
        switch_meter_type: [
          'switch_meter_type',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
      },
    }
  },
  computed: {
    isAws () {
      return this.brand === 'aws'
    },
    isAzure () {
      return this.brand === 'azure'
    },
    availableTypes () {
      // AWS / Azure 可创建多个同类型报告，不因已有订阅屏蔽类型
      if (this.isAws || this.isAzure) return [...(this.creatableTypes || [])]
      return (this.creatableTypes || []).filter(type => !(this.innerSubscribedTypes || []).includes(type))
    },
    typeOptions () {
      return this.availableTypes.map(value => ({
        value,
        label: this.subscribeTypeLabel(value),
        hint: this.subscribeTypeHint(value),
      }))
    },
    newTypeOptions () {
      return ALIYUN_NEW_TYPES
        .filter(value => this.availableTypes.includes(value))
        .map(value => ({
          value,
          label: this.subscribeTypeLabel(value),
          hint: this.subscribeTypeHint(value),
        }))
    },
    oldTypeOptions () {
      return ALIYUN_OLD_TYPES
        .filter(value => this.availableTypes.includes(value))
        .map(value => ({
          value,
          label: this.subscribeTypeLabel(value),
          hint: this.subscribeTypeHint(value),
        }))
    },
    existingOptions () {
      const seen = new Set()
      const opts = []
      ;(this.subscriptions || []).forEach(row => {
        // Azure / AWS：按 Export / Report 实例名列出，避免全部折叠成 export/cur
        const value = (this.isAws || this.isAzure)
          ? (row.subscribe_type || '')
          : this.meterTypeFromRow(row)
        if (!value || seen.has(value)) return
        seen.add(value)
        opts.push({
          value,
          label: this.subscriptionRowLabel(row),
          hint: (!this.isAws && !this.isAzure) ? this.subscribeTypeHint(value) : '',
        })
      })
      return opts
    },
    // 阿里云类型选择引导（新建 / 选用已有）
    aliyunTypeGuide () {
      if (this.isAws || this.isAzure) return ''
      return this.tKey(
        'bill.bill_subscribe_type_guide_aliyun',
        this.$t('cloudenv.bill_subscribe_type_guide_aliyun'),
      )
    },
    bucketDataSource () {
      return (this.bucketOptions || []).map(item => item.value)
    },
    providerExtra () {
      if (this.isAws) return this.tKey('bill.bill_subscribe_extra_aws', this.$t('cloudenv.bill_subscribe_extra_aws'))
      if (this.isAzure) return this.tKey('bill.bill_subscribe_extra_azure', this.$t('cloudenv.bill_subscribe_extra_azure'))
      return this.tKey('bill.bill_subscribe_extra', this.$t('cloudenv.bill_subscribe_extra'))
    },
    noDuplicateTip () {
      if (this.isAzure) {
        return this.tKey('bill.bill_subscribe_no_duplicate_tip_azure', this.$t('cloudenv.bill_subscribe_no_duplicate_tip_azure'))
      }
      if (this.isAws) {
        return this.tKey('bill.bill_subscribe_no_duplicate_tip_aws', this.$t('cloudenv.bill_subscribe_no_duplicate_tip_aws'))
      }
      return this.tKey('bill.bill_subscribe_no_duplicate_tip', this.$t('cloudenv.bill_subscribe_no_duplicate_tip'))
    },
    bucketPathPlaceholder () {
      if (this.isAws) {
        return this.tKey('bill.bill_subscribe_bucket_path_placeholder_aws', this.$t('cloudenv.bill_subscribe_bucket_path_placeholder_aws'))
      }
      if (this.isAzure) {
        return this.tKey('bill.bill_subscribe_bucket_path_placeholder_azure', this.$t('cloudenv.bill_subscribe_bucket_path_placeholder_azure'))
      }
      return this.tKey('bill.bill_subscribe_bucket_path_placeholder', this.$t('cloudenv.bill_subscribe_bucket_path_placeholder'))
    },
    bucketPathExtra () {
      if (this.isAws) {
        return this.tKey('bill.bill_subscribe_bucket_path_extra_aws', this.$t('cloudenv.bill_subscribe_bucket_path_extra_aws'))
      }
      if (this.isAzure) {
        return this.tKey('bill.bill_subscribe_bucket_path_extra_azure', this.$t('cloudenv.bill_subscribe_bucket_path_extra_azure'))
      }
      return this.tKey('bill.bill_subscribe_bucket_path_extra', this.$t('cloudenv.bill_subscribe_bucket_path_extra'))
    },
    canSubmit () {
      if (this.actionMode === 'existing') return this.existingOptions.length > 0
      return this.availableTypes.length > 0
    },
  },
  watch: {
    availableTypes (val) {
      if (this.createOnly) {
        this.actionMode = 'new'
        return
      }
      if (this.actionMode === 'new' && (!val || !val.length) && this.existingOptions.length) {
        this.actionMode = 'existing'
      } else if (this.actionMode === 'existing' && !this.existingOptions.length && val && val.length) {
        this.actionMode = 'new'
      }
    },
    existingOptions (val) {
      if (this.createOnly) return
      if ((!val || !val.length) && this.availableTypes.length) {
        this.actionMode = 'new'
      }
    },
    actionMode (mode) {
      // 切换时 bump key 强制重建 select，并在下一拍写入值，确保用 label 展示而非原始 value
      this.selectRenderKey += 1
      this.$nextTick(() => {
        if (mode === 'new') {
          const cur = this.selectedSubscribeType || this.form.fc.getFieldValue('subscribe_type')
          const next = (this.availableTypes || []).includes(cur) ? cur : (this.availableTypes[0] || undefined)
          if (next) {
            this.selectedSubscribeType = next
            this.form.fc.setFieldsValue({ subscribe_type: next })
          }
        }
      })
    },
  },
  created () {
    this.manager = new this.$Manager('meter_cloudaccounts', 'v1')
    this.init()
  },
  methods: {
    tKey (key, fallback) {
      return this.$te(key) ? this.$t(key) : fallback
    },
    normalizeBucketValue,
    normalizePath (val) {
      return (val || '').trim().replace(/^\/+|\/+$/g, '')
    },
    subscribeTypeLabel (type) {
      if (!type) {
        return this.tKey('bill.bill_subscribe_meter_type_empty', this.$t('cloudenv.bill_subscribe_meter_type_empty'))
      }
      // 优先 bill.*（EE Bill 模块已加载时）；创建账号页可能未加载 Bill，回退 cloudenv.*
      const billKey = `bill.bill_subscribe_type_${type}`
      if (this.$te(billKey)) return this.$t(billKey)
      const cloudenvKey = `cloudenv.bill_subscribe_type_${type}`
      if (this.$te(cloudenvKey)) return this.$t(cloudenvKey)
      return type
    },
    subscribeTypeHint (type) {
      if (!type || this.isAws || this.isAzure) return ''
      const billKey = `bill.bill_subscribe_type_hint_${type}`
      if (this.$te(billKey)) return this.$t(billKey)
      const cloudenvKey = `cloudenv.bill_subscribe_type_hint_${type}`
      if (this.$te(cloudenvKey)) return this.$t(cloudenvKey)
      return ''
    },
    onSubscribeTypeChange (val) {
      this.selectedSubscribeType = val || ''
    },
    onExistingTypeChange (val) {
      this.selectedExistingType = val || ''
    },
    meterTypeFromRow (row) {
      if (!row) return ''
      if (this.isAws) {
        if (row.subscribe_type === AWS_DEFAULT_REPORT_NAME || row.bill_format === 'cur' || row.file_name_key === 'cur') return 'cur'
        return row.bill_format || row.file_name_key || ''
      }
      if (this.isAzure) {
        if (row.subscribe_type === AZURE_DEFAULT_EXPORT_NAME || row.bill_format === 'export' || row.file_name_key === 'export') return 'export'
        return row.bill_format || row.file_name_key || 'export'
      }
      return row.subscribe_type || ''
    },
    subscriptionRowLabel (row) {
      if (!row) return ''
      if (this.isAws) {
        const formatLabel = this.subscribeTypeLabel(row.bill_format || row.file_name_key || 'cur')
        return `${formatLabel}（${row.subscribe_type}）`
      }
      if (this.isAzure) {
        const formatLabel = this.subscribeTypeLabel(row.bill_format || row.file_name_key || 'export')
        const scope = row.scope_name ? ` @ ${row.scope_name}` : ''
        return `${formatLabel}（${row.subscribe_type}${scope}）`
      }
      return this.subscribeTypeLabel(row.subscribe_type)
    },
    filterBucketOption (input, option) {
      const text = ((option && (option.componentOptions.children[0].text || option.key)) || '').toLowerCase()
      return text.indexOf((input || '').toLowerCase()) >= 0
    },
    bucketNameFromOptionLabel (label) {
      const raw = (label || '').trim()
      const m = raw.match(/^([^\s（(]+)/)
      return m ? m[1] : raw
    },
    formatBeginCycle (val) {
      if (!val) return ''
      if (typeof val.format === 'function') return val.format('YYYY-MM')
      return String(val)
    },
    subscribedTypeSetFromList (list) {
      if (this.isAws || this.isAzure) {
        return new Set()
      }
      return new Set((list || []).map(item => item.subscribe_type).filter(Boolean))
    },
    async ensureMeterAccount () {
      if (!this.accountId) {
        throw new Error('missing account id')
      }
      let lastErr
      for (let i = 0; i < 6; i++) {
        try {
          await this.manager.get({ id: this.accountId })
          return
        } catch (err) {
          lastErr = err
          try {
            await this.manager.performClassAction({
              action: 'sync',
              data: { account_id: [this.accountId] },
            })
          } catch (syncErr) {
            lastErr = syncErr
          }
          await sleep(1000)
        }
      }
      throw lastErr || new Error('meter cloudaccount sync timeout')
    },
    async init () {
      try {
        await this.ensureMeterAccount()
      } catch (err) {
        // still try list/buckets; errors surface on submit
      }
      await Promise.all([this.fetchSubscriptions(), this.fetchBuckets()])
      if (!this.createOnly) {
        if (this.existingOptions.length && !this.availableTypes.length) {
          this.actionMode = 'existing'
        } else {
          this.actionMode = 'new'
        }
      }
    },
    async fetchSubscriptions () {
      if (!this.accountId) return
      this.loadingSubscriptions = true
      try {
        const { data } = await this.manager.getSpecific({
          id: this.accountId,
          spec: 'bill-subscription',
        })
        const list = (data && data.data) || []
        this.subscriptions = list
        if (data && data.supported_types && data.supported_types.length) {
          this.meterSupportedTypes = data.supported_types
        }
        if (!(this.supportedTypes && this.supportedTypes.length)) {
          if (this.isAws) this.creatableTypes = [...AWS_CREATABLE_TYPES]
          else if (this.isAzure) this.creatableTypes = [...AZURE_CREATABLE_TYPES]
        }
        if (this.subscribedTypes == null) {
          this.innerSubscribedTypes = Array.from(this.subscribedTypeSetFromList(list))
        }
      } catch (err) {
        this.subscriptions = []
      } finally {
        this.loadingSubscriptions = false
      }
    },
    async fetchBuckets () {
      if (!this.accountId) return
      this.loadingBuckets = true
      try {
        const { data } = await this.manager.getSpecific({
          id: this.accountId,
          spec: 'oss-buckets',
        })
        const list = (data && data.data) || []
        this.bucketOptions = list.map(item => ({
          value: item.name,
          label: item.name,
          url: item.url,
        }))
        const current = this.normalizeBucketValue(this.form.fc.getFieldValue('subscribe_bucket'))
        if (current && !this.bucketOptions.find(b => b.value === current)) {
          this.bucketOptions.unshift({ value: current, label: current })
        }
      } catch (err) {
        const current = this.normalizeBucketValue(this.form.fc.getFieldValue('subscribe_bucket'))
        if (current) {
          this.bucketOptions = [{ value: current, label: current }]
        }
      } finally {
        this.loadingBuckets = false
      }
    },
    /**
     * Validate & call meter APIs.
     * @returns {Promise<{ action: 'existing'|'new', switchMeterType: boolean, data?: object }>}
     */
    async submit () {
      await this.ensureMeterAccount()
      if (this.actionMode === 'existing' && !this.createOnly) {
        const values = await this.form.fc.validateFields(['existing_type'])
        const billSubscribeType = values.existing_type
        const { data } = await this.manager.performAction({
          id: this.accountId,
          action: 'set-bill-subscribe-type',
          data: { bill_subscribe_type: billSubscribeType || '' },
        })
        return {
          action: 'existing',
          switchMeterType: true,
          data,
        }
      }
      const fields = ['subscribe_type', 'subscribe_bucket', 'bucket_path']
      if (this.showSwitchMeter) fields.push('switch_meter_type')
      if (!this.isAws && !this.isAzure) fields.push('begin_billing_cycle')
      const values = await this.form.fc.validateFields(fields)
      if (!this.isAws && !this.isAzure && (this.innerSubscribedTypes || []).includes(values.subscribe_type)) {
        this.$message.warning(this.tKey('bill.bill_subscribe_already_exists', this.$t('cloudenv.bill_subscribe_already_exists')))
        throw new Error('already subscribed')
      }
      const payload = {
        subscribe_type: values.subscribe_type,
        subscribe_bucket: this.bucketNameFromOptionLabel(values.subscribe_bucket),
        bucket_path: this.normalizePath(values.bucket_path),
        switch_meter_type: this.showSwitchMeter ? values.switch_meter_type !== false : true,
      }
      if (!this.isAws && !this.isAzure) {
        const beginCycle = this.formatBeginCycle(values.begin_billing_cycle)
        if (beginCycle) payload.begin_billing_cycle = beginCycle
      }
      const { data } = await this.manager.performAction({
        id: this.accountId,
        action: 'subscribe-bill',
        data: payload,
      })
      return {
        action: 'new',
        switchMeterType: payload.switch_meter_type,
        data,
      }
    },
  },
}
</script>
