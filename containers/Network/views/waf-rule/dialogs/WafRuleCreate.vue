<template>
  <base-dialog :width="1000" @cancel="cancelDialog">
    <div slot="header">{{params.title || $t('compute.perform_create')}}</div>
    <div slot="body">
      <a-form-model :model="form" :rules="rules" ref="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-model-item :label="$t('network.waf.rule_type')" prop="rule_type" :extra="$t(`network.waf.rule_type.${form.rule_type}.extra`)">
          <a-select v-model="form.rule_type" :placeholder="$t('network.waf.rule_type')">
            <a-select-option v-for="item in ruleTypes" :key="item" :value="item">
              {{ $t(`network.waf.rule_type.${item}`) }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item v-if="form.rule_type !== 'managed'" :label="$t('network.waf.rule_name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('network.waf.rule_name')" />
        </a-form-model-item>
        <a-form-item :label="$t('network.waf.rule')" v-if="form.rule_type === 'custom' || form.rule_type === 'rate_limit'" required>
          <rule-form ref="ruleForm" :form="form" :ruleType="form.rule_type" :rules="rules" />
        </a-form-item>
        <!-- 速率限制规则 -->
        <template v-if="form.rule_type === 'rate_limit'" class="mb-0">
          <a-form-model-item :label="$t('network.waf.cache_status')">
            <a-checkbox v-model="form.cache_status">
              {{ $t('network.waf.cache_status_limit') }}
            </a-checkbox>
          </a-form-model-item>
          <a-form-item :label="$t('network.waf.rule_limit.characteristics')" required>
            <rate-limit-rule-form ref="rateLimitRules" :form="form" ruleFormKey="rate_limit_rules" />
            <a-form-model-item :extra="rateLimitRuleExtra">
              <a-checkbox v-model="form.customCounter">
                {{ $t('network.waf.rule_limit.use_custom_counter') }}
              </a-checkbox>
            </a-form-model-item>
            <rule-form v-if="form.customCounter" ref="rateLimitCustomRules" :form="form" ruleFormKey="rate_limit_custom_rules" ruleType="ratelimit_custom" />
          </a-form-item>
          <a-form-item :label="$t('network.waf.rule_limit.title')" class="mb-0" required>
            <div class="d-flex">
              <a-form-model-item class="mr-2" prop="period">
                <a-select v-model="form.period" style="width: 150px" :placeholder="$t('network.waf.rule_limit.period')">
                  <a-select-option v-for="item in periodOptions" :key="item" :value="item">
                    {{ $t(`network.waf.rule_limit_period.${item}`) }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
              {{ $t('network.waf.rule_limit.period_text') }}
              <a-form-model-item class="ml-2 mr-2" prop="requests_per_period">
                <a-input-number v-model="form.requests_per_period" style="width: 100px" :placeholder="$t('network.waf.rule_limit.request_count')" />
              </a-form-model-item>
              {{ $t('network.waf.rule_limit.period_text_2') }}
            </div>
          </a-form-item>
        </template>
        <!-- 采取措施 -->
        <a-form-model-item v-if="form.rule_type === 'custom' || form.rule_type === 'rate_limit' || form.rule_type === 'ua'" :label="$t('network.waf.rule_action.title')" :extra="ruleActionExtra" prop="rule_action">
          <a-select v-model="form.rule_action" :placeholder="$t('network.waf.rule_action.title')">
            <a-select-option v-for="item in ruleActions" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <!-- 阻止措施 -->
        <template v-if="form.rule_type === 'custom' && form.rule_action === 'block'">
          <a-form-model-item :label="$t('network.waf.response_type')" prop="response_type">
            <a-select v-model="form.response_type" :placeholder="$t('network.waf.response_type')">
              <a-select-option v-for="item in blockTypeOptions" :key="item.key" :value="item.key">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item v-if="form.response_type !== 'default'" :label="$t('network.waf.response_content')" prop="response_content">
            <a-textarea v-model="form.response_content" :placeholder="$t('network.waf.response_content')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('network.waf.response_code')" prop="response_code">
            <a-input-number :disabled="form.response_type === 'default'" v-model="form.response_code" :placeholder="$t('network.waf.response_code')" />
          </a-form-model-item>
        </template>
        <!-- 自定义规则 -->
        <template v-if="form.rule_type === 'custom'">
          <a-form-item :label="$t('network.waf.custom_index')" class="mb-0" required>
            <div>
              <a-form-model-item class="mr-2" prop="custom_index">
                <a-select v-model="form.custom_index" :placeholder="$t('network.waf.custom_index')">
                  <a-select-option value="first">{{ $t('network.waf.custom_index.first') }}</a-select-option>
                  <a-select-option value="last">{{ $t('network.waf.custom_index.last') }}</a-select-option>
                  <a-select-option value="custom">{{ $t('network.waf.custom_index.custom') }}</a-select-option>
                </a-select>
              </a-form-model-item>
              <a-form-model-item prop="custom_index_rule">
                <a-select v-if="form.custom_index === 'custom'" v-model="form.custom_index_rule" :placeholder="$t('network.waf.custom_index_rule')">
                  <a-select-option v-for="item in customRules" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </div>
          </a-form-item>
        </template>
        <!-- 速率限制规则 持续时间 放置位置 -->
        <template v-if="form.rule_type === 'rate_limit'">
          <a-form-item :label="$t('network.waf.rule_limit_method')" class="mb-0" required>
            <a-form-model-item prop="rate_limit_method" class="mb-0" :extra="rateLimitMethodExtra">
              <a-radio-group v-model="form.rate_limit_method">
                <a-radio-button value="duration">
                  {{ $t('network.waf.rule_limit_method.time_duration', [form.rule_action ? $t(`network.waf.rule_action.${form.rule_action}`) : '']) }}
                </a-radio-button>
                <a-radio-button value="limit">
                  {{ $t('network.waf.rule_limit_method.rate_limit') }}
                </a-radio-button>
              </a-radio-group>
            </a-form-model-item>
            <a-form-model-item prop="mitigation_timeout" v-if="form.rate_limit_method === 'duration'">
              <a-select v-model="form.mitigation_timeout" :placeholder="$t('network.waf.rule_duration.title')" prop="mitigation_timeout">
                <a-select-option v-for="item in durationOptions" :key="item" :value="item">
                  {{ $t(`network.waf.rule_limit_period.${item}`) }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-form-item>
          <a-form-model-item :label="$t('network.waf.custom_index')" prop="rate_limit_index">
            <a-select v-model="form.rate_limit_index" :placeholder="$t('network.waf.custom_index')">
              <a-select-option value="first">{{ $t('network.waf.custom_index.first') }}</a-select-option>
              <a-select-option value="last">{{ $t('network.waf.custom_index.last') }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </template>
        <!-- 托管规则 -->
        <template v-if="form.rule_type === 'managed'">
          <a-form-model-item :label="$t('network.waf.rule_managed.rule_set')" prop="rule_managed_rule_set">
            <a-select v-model="form.rule_managed_rule_set" :placeholder="$t('network.waf.rule_managed.rule_set')">
              <a-select-option v-for="item in ruleManagedRuleSetOptions" :key="item.key" :value="item.key">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </template>
        <!-- IP 访问规则 -->
        <template v-if="form.rule_type === 'access'">
          <a-form-model-item :label="$t('network.waf.ip_range')" prop="ip_range" :extra="$t('network.waf.ip_range.extra')">
            <a-select v-model="form.ip_range" :placeholder="$t('network.waf.ip_range')">
              <a-select-option v-for="item in ipRangeOptions" :key="item.key" :value="item.key">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('network.waf.rule_action.title')" prop="rule_action">
            <a-select v-model="form.rule_action" :placeholder="$t('network.waf.rule_action.title')">
              <a-select-option v-for="item in ruleActions" :key="item.key" :value="item.key">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('network.waf.ip_rule_scope')" prop="ip_rule_scope">
            <a-select v-model="form.ip_rule_scope" :placeholder="$t('network.waf.ip_rule_scope')">
              <a-select-option v-for="item in ipRuleScopeOptions" :key="item.key" :value="item.key">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('network.waf.ip_rule_notes')">
            <a-input v-model="form.ip_rule_notes" :placeholder="$t('network.waf.ip_rule_notes')" />
          </a-form-model-item>
        </template>
        <!-- 区域锁定规则 -->
        <template v-if="form.rule_type === 'lockdown'">
          <a-form-model-item label="URL" prop="lockdown_url" :extra="$t('network.waf.lockdown_url.extra')">
            <a-input v-model="form.lockdown_url" placeholder="URL" />
          </a-form-model-item>
          <a-form-model-item label="IP / CIDR" prop="lockdown_ip" :extra="$t('network.waf.lockdown_ip.extra')">
            <a-input v-model="form.lockdown_ip" placeholder="IP / CIDR" />
          </a-form-model-item>
          <span><span class="mr-2">{{$t('network.text_94')}}</span><a-switch v-model="form.is_show_lockdown_priority" /></span>
          <a-form-model-item class="mt-3" v-if="form.is_show_lockdown_priority" :label="$t('network.waf.priority')">
            <a-input-number v-model="form.priority" :min="1" :step="1" :placeholder="$t('network.waf.priority')" />
          </a-form-model-item>
        </template>
        <!-- 用户代理阻止 -->
        <template v-if="form.rule_type === 'ua'">
          <a-form-model-item :label="$t('network.waf.user_agent_value')" prop="ua_value" :extra="$t('network.waf.user_agent_value.extra')">
            <a-input v-model="form.ua_value" :placeholder="$t('network.waf.user_agent_value')" />
          </a-form-model-item>
        </template>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog" v-if="params.type !== 'info'">{{ $t('network.text_33') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import RuleForm from '../components/RuleForm'
import RateLimitRuleForm from '../components/RateLimitRuleForm'
import { RULE_ACTIONS, BLOCK_TYPES, COUNTRYS, RATE_LIMIT_RULE_TYPES } from '../constants'
import { encodeRuleListToDescription, decodeRuleExpression, decodeRateLimitCustomRules } from '../utils'

export default {
  name: 'WafRuleCreateDialog',
  components: {
    RuleForm,
    RateLimitRuleForm,
  },
  mixins: [DialogMixin, WindowsMixin],
  props: {
    parmas: Object,
  },
  data () {
    const initData = this.params.data ? this.params.data[0] : {}
    // eslint-disable-next-line
    let responseContent, initAction, period, requestsPerPeriod, mitigationTimeout, responseType = 'default', responseCode = 403, ruleManagedRuleSet, cacheStatus = true, customCounter = false, ipRange, ipRuleScope, ipRuleNotes, lockdownUrl, lockdownIp, uaValue, isShowLockdownPriority = false, priority
    let initRules = [
      [
        { type: undefined, name: undefined, value: undefined, opt: undefined },
      ],
    ]
    const rateLimitRules = [
      [
        { type: 'ip.src', value: undefined },
      ],
    ]
    let rateLimitCustomRules = [
      [
        { type: undefined, name: undefined, value: undefined, opt: undefined },
      ],
    ]
    // let rateLimitRules = [[
    //   {
    //     type: 'ip.src',
    //     value: undefined,
    //   },
    // ]]
    if (initData.type === 'custom') {
      initAction = initData.action.action
      initRules = decodeRuleExpression(initData.expression, initRules)
      if (initAction === 'block' && initData.config?.action_parameters?.response) {
        responseType = initData.config.action_parameters.response.content_type
        responseCode = initData.config.action_parameters.response.status_code
        responseContent = initData.config.action_parameters.response.content
      }
      // TODO index不固定
    }
    if (initData.type === 'rate_limit') {
      initAction = initData.action.action
      initRules = decodeRuleExpression(initData.expression, initRules)
      rateLimitRules[0] = decodeRateLimitCustomRules(initData.config.ratelimit.characteristics)
      cacheStatus = !initData.config.ratelimit.requests_to_origin
      period = initData.config.ratelimit.period
      requestsPerPeriod = initData.config.ratelimit.requests_per_period
      mitigationTimeout = initData.config.ratelimit.mitigation_timeout
      customCounter = initData.config.customCounter
      if (customCounter) {
        rateLimitCustomRules = decodeRuleExpression(initData.config.ratelimit.counting_expression, rateLimitCustomRules)
      }
    }
    if (initData.type === 'managed') {
      ruleManagedRuleSet = initData.name
    }
    if (initData.type === 'access') {
      initAction = initData.action.action
      ipRange = initData.config.configuration.value
      ipRuleScope = initData.config.mode
      ipRuleNotes = initData.config.notes
    }
    if (initData.type === 'ua') {
      initAction = initData.action.action
      uaValue = initData.config.configuration.value
    }
    if (initData.type === 'lockdown') {
      initAction = initData.action.action
      lockdownUrl = initData.config.urls.join(',')
      lockdownIp = initData.config.configurations.map(item => item.value).join(',')
      if (initData.priority) {
        isShowLockdownPriority = true
        priority = initData.priority
      }
    }
    return {
      loading: false,
      form: {
        name: initData.name || undefined,
        rule_type: initData.type || 'custom',
        rules: initRules,
        rate_limit_rules: rateLimitRules,
        rate_limit_custom_rules: rateLimitCustomRules,
        period,
        requests_per_period: requestsPerPeriod,
        mitigation_timeout: mitigationTimeout,
        response_type: responseType,
        response_content: responseContent,
        response_code: responseCode,
        cache_status: cacheStatus,
        rate_limit_method: 'duration',
        rule_managed_skip_type: 'other',
        rule_managed_log_request: true,
        ip_range: ipRange,
        rule_action: initAction,
        ip_rule_scope: ipRuleScope || 'zone',
        ip_rule_notes: ipRuleNotes,
        lockdown_url: lockdownUrl,
        lockdown_ip: lockdownIp,
        custom_index: 'last',
        custom_index_rule: 'last',
        rate_limit_index: undefined,
        ua_value: uaValue,
        rule_managed_rule_set: ruleManagedRuleSet,
        is_show_lockdown_priority: isShowLockdownPriority,
        priority,
        customCounter,
      },
      ruleTypes: ['custom', 'rate_limit', 'managed', 'access', 'ua', 'lockdown'],
      durationOptions: ['10', '60', '120', '300', '600', '3600', '86400'],
      periodOptions: ['10', '60', '120', '300', '600', '3600'],
      blockTypeOptions: BLOCK_TYPES,
      ruleManagedSkipTargetOptions: [],
      ipRuleScopeOptions: [
        { key: 'zone', label: this.$t('network.waf.ip_rule_scope.zone') },
        { key: 'account', label: this.$t('network.waf.ip_rule_scope.account') },
      ],
      customRules: [],
      ruleManagedRuleSetOptions: [
        {
          key: 'Cloudflare Managed Ruleset',
          label: 'Cloudflare Managed Ruleset',
        },
        {
          key: 'Cloudflare OWASP Core Ruleset',
          label: 'Cloudflare OWASP Core Ruleset',
        },
      ],
      rules: {
        rule_type: { required: true },
        name: { required: true, message: this.$t('common.tips.input', [this.$t('network.waf.rule_name')]) },
        rule_action: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.rule_action.title')]) },
        custom_index_rule: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.custom_index_rule')]) },
        period: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.rule_limit.period')]) },
        requests_per_period: { required: true, message: this.$t('common.tips.input', [this.$t('network.waf.rule_limit.request_count')]) },
        rate_limit_method: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.rule_limit_method')]) },
        mitigation_timeout: { required: true, message: this.$t('common.tips.input', [this.$t('network.waf.rule_duration.title')]) },
        rule_managed_rule_set: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.rule_managed.rule_set')]) },
        rate_limit_index: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.custom_index')]) },
        ip_range: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.ip_range')]) },
        ip_rule_scope: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.ip_rule_scope')]) },
        ua_value: { required: true, message: this.$t('common.tips.input', [this.$t('network.waf.user_agent_value')]) },
        response_type: { required: true, message: this.$t('common.tips.select', [this.$t('network.waf.response_type')]) },
        response_code: { required: true, message: this.$t('common.tips.input', [this.$t('network.waf.response_code')]) },
        response_content: { required: true, message: this.$t('common.tips.input', [this.$t('network.waf.response_content')]) },
        // type: { required: true, message: this.$t('common.tips.select', [this.$t('network.field')]) },
        // value: { required: true, message: this.$t('common.required_cols', [this.$t('network.value')]) },
        lockdown_url: {
          required: true,
          validator: (rule, value, callback) => {
            const reg = /^((https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?)(,\s*(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?)*$/i
            if (value && reg.test(value)) {
              callback()
            } else {
              callback(new Error(this.$t('common.tips.input', ['URL'])))
            }
          },
        },
        lockdown_ip: {
          required: true,
          validator: (rule, value, callback) => {
            const reg = /^((?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\/(3[0-2]|[12]?\d))?)(,\s*(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\/(3[0-2]|[12]?\d))?)*$/
            if (value && reg.test(value)) {
              callback()
            } else {
              callback(new Error(this.$t('common.tips.input', ['IP / CIDR'])))
            }
          },
        },
      },
    }
  },
  computed: {
    ruleActionExtra () {
      return this.form.rule_action ? this.$t(`network.waf.rule_action.${this.form.rule_action}.extra`) : ''
    },
    ruleExpression () {
      return encodeRuleListToDescription(this.form.rules)
    },
    rateLimitCustomExpression () {
      return encodeRuleListToDescription(this.form.rate_limit_custom_rules)
    },
    ruleActions () {
      const { rule_type } = this.form
      if (rule_type === 'custom') {
        return RULE_ACTIONS.filter(item => !['allow'].includes(item.key))
      }
      if (rule_type === 'ua') {
        return RULE_ACTIONS.filter(item => ['managed_challenge', 'block', 'js_challenge', 'challenge'].includes(item.key))
      }
      if (rule_type === 'access') {
        return RULE_ACTIONS.filter(item => ['managed_challenge', 'allow', 'block', 'js_challenge', 'challenge'].includes(item.key))
      }
      if (rule_type === 'rate_limit') {
        return RULE_ACTIONS.filter(item => ['managed_challenge', 'log', 'block', 'js_challenge', 'challenge'].includes(item.key))
      }
      return RULE_ACTIONS
    },
    // rules () {
    //   return decodeRuleExpression(this.ruleExpression)
    // },
    rateLimitRulesValue () {
      return this.form.rate_limit_rules[0].map(row => {
        if (row.type) {
          const target = RATE_LIMIT_RULE_TYPES.find(item => item.type === row.type)
          if (target) {
            return target.valueFormat(row.type, row.value)
          }
        }
        return ''
      }).filter(item => item)
    },
    ipRangeOptions () {
      return [...COUNTRYS, { key: 'T1', label: 'TOR' }, { key: 'XX', label: 'Unknown states, other entities or organizations' }]
    },
    rateLimitMethodExtra () {
      return this.$t(`network.waf.rule_limit_method.extra.${this.form.rate_limit_method}`, [this.form.rule_action ? this.$t(`network.waf.rule_action.${this.form.rule_action}`) : this.$t('compute.text_863')])
    },
    rateLimitRuleExtra () {
      return this.form.customCounter ? this.$t('network.waf.rule_limit.use_custom_counter.extra') : ''
    },
  },
  watch: {
    'form.rules': {
      handler () {
        if (this.$refs.ruleForm) {
          this.$refs.ruleForm.validateRule()
        }
      },
      deep: true,
    },
    'form.rate_limit_rules': {
      handler () {
        if (this.$refs.rateLimitRules) {
          this.$refs.rateLimitRules.validateRule()
        }
      },
      deep: true,
    },
    'form.rate_limit_custom_rules': {
      handler () {
        if (this.$refs.rateLimitCustomRules) {
          this.$refs.rateLimitCustomRules.validateRule()
        }
      },
      deep: true,
    },
  },
  created () {
    this.$M = new this.$Manager('waf_rules')
    this.fetchCustomRules()
  },
  methods: {
    fetchCustomRules () {
      try {
        this.$M.list({
          params: { limit: 0, type: 'custom' },
        }).then(res => {
          this.customRules = res.data.data
        })
      } catch (e) {
        throw e
      }
    },
    genParams () {
      const {
        name,
        rule_type,
        rule_action,
        custom_index,
        custom_index_rule,
        cache_status,
        customCounter,
        period,
        requests_per_period,
        rate_limit_method,
        mitigation_timeout,
        rate_limit_index,
        rule_managed_rule_set,
        ua_value,
        ip_rule_scope,
        ip_rule_notes,
        ip_range,
        lockdown_url,
        lockdown_ip,
        is_show_lockdown_priority,
        priority,
        response_type,
        response_code,
        response_content,
      } = this.form
      const ret = {
        name,
        type: rule_type,
        waf_instance_id: this.params.waf.id,
        config: {},
      }
      if (this.form.rule_type === 'custom') {
        ret.action = { action: rule_action }
        ret.expression = this.ruleExpression
        if (custom_index === 'first') {
          ret.config.position = { index: 1 }
        } else if (custom_index === 'last') {
          ret.config.position = { index: this.customRules.length + 1 }
        } else if (custom_index === 'custom') {
          ret.config.position = { after: custom_index_rule }
        }
        if (rule_action === 'block') {
          if (response_type !== 'default') {
            ret.config.action_parameters = { response: { content_type: response_type, status_code: response_code, content: response_content } }
          }
        }
      } else if (rule_type === 'rate_limit') {
        ret.expression = this.ruleExpression
        ret.config.ratelimit = {}
        ret.config.ratelimit.requests_to_origin = !cache_status
        ret.config.ratelimit.characteristics = this.rateLimitRulesValue
        ret.config.ratelimit.rate_exceeds = 'request_base'
        ret.config.customCounter = customCounter
        if (ret.config.customCounter) {
          ret.config.ratelimit.counting_expression = this.rateLimitCustomExpression
        }
        ret.config.ratelimit.requests_per_period = requests_per_period
        ret.config.ratelimit.period = period
        ret.action = { action: rule_action }
        if (rate_limit_method === 'duration') {
          ret.config.ratelimit.mitigation_timeout = mitigation_timeout
        }
        if (rate_limit_index === 'first') {
          ret.config.ratelimit.position = { index: 1 }
        }
      } else if (rule_type === 'managed') {
        ret.name = rule_managed_rule_set
        ret.description = rule_managed_rule_set
        ret.action = { action: 'execute' }
      } else if (rule_type === 'ua') {
        ret.action = { action: rule_action }
        ret.config.configuration = {
          target: 'ua',
          value: ua_value,
        }
      } else if (rule_type === 'access') {
        ret.action = { action: rule_action }
        ret.config.mode = ip_rule_scope
        ret.config.configuration = {
          target: 'country',
          value: ip_range,
        }
        ret.config.notes = ip_rule_notes
      } else if (rule_type === 'lockdown') {
        ret.config.urls = lockdown_url.split(',').map(item => item.trim())
        ret.config.configurations = lockdown_ip.split(',').map(item => item.trim()).map(item => {
          return {
            target: item.includes('/') ? 'ip_range' : 'ip',
            value: item,
          }
        })
        if (is_show_lockdown_priority) {
          ret.priority = priority
        }
        ret.action = { action: 'execute' }
      }
      return ret
    },
    async handleConfirm () {
      if (this.params.type === 'info') {
        this.cancelDialog()
        return
      }
      try {
        this.loading = true
        await this.$refs.form.validate()
        if (this.$refs.ruleForm) {
          const validate = this.$refs.ruleForm.validateRule()
          if (!validate) {
            this.loading = false
            return
          }
        }
        if (this.$refs.rateLimitRules) {
          const validate = this.$refs.rateLimitRules.validateRule()
          if (!validate) {
            this.loading = false
            return
          }
        }
        if (this.$refs.rateLimitCustomRules) {
          const validate = this.$refs.rateLimitCustomRules.validateRule()
          if (!validate) {
            this.loading = false
            return
          }
        }
        const data = this.genParams()
        await new this.$Manager('waf_rules').create({ data })
        this.loading = false
        this.params.success()
        this.cancelDialog()
      } catch (e) {
        this.loading = false
        throw e
      }
    },
  },
}
</script>
