<template>
  <div>
    <a-alert class="mb-2" :message="$t('system.text_322', [$t('dictionary.policy'),$t('dictionary.role')])" type="success" />
    <a-form-model
      ref="form"
      :model="model"
      :rules="rules"
      v-bind="formItemLayout">
      <a-form-model-item :label="$t('dictionary.domain')" v-if="!isUpdate && isAdminMode && l3PermissionEnable" prop="domain">
        <base-select
          v-model="model.domain"
          resource="domains"
          version="v1"
          remote
          :params="{ enabled: true }"
          :remote-fn="q => ({ filter: `name.contains(${q})` })"
          :select-props="{ allowClear: true }"
          @update:item="handleDomainChange" />
      </a-form-model-item>
      <a-form-model-item :label="$t('system.text_101')" prop="name">
        <a-input v-model="model.name" :placeholder="$t('system.text_323', [$t('dictionary.policy')])" />
      </a-form-model-item>
      <a-form-model-item :label="$t('common.description')" prop="description">
        <a-input v-model="model.description" :placeholder="$t('common.tips.input', [$t('common.description')])" />
      </a-form-model-item>
      <a-form-model-item :label="$t('system.text_326', [$t('dictionary.policy')])" porp="scope">
        <!--template v-slot:extra v-if="!isUpdate">
          <template v-if="isAdminMode">
            <span>{{ $t('system.text_332', [$t('dictionary.policy')]) }}<strong>{{ $t('system.text_334') }}</strong>，</span>
          </template>
          <span v-if="l3PermissionEnable">{{ $t('system.text_335', [$t('dictionary.domain'), $t('dictionary.policy')]) }}<strong>{{ $t('system.text_335', [$t('dictionary.domain')]) }}</strong>，</span>
          <span>{{$t('system.text_337')}}</span>
        </template-->
        <template v-if="!isUpdate">
          <scope-select v-model="model.scope" />
        </template>
        <template v-else>{{ $t(`policyScopeLabel.${model.scope}`) }}</template>
      </a-form-model-item>
      <a-form-model-item :label="$t('system.text_324')">
        <a-radio-group :default-value="editType" :value="editType" @change="e => $emit('edit-type-change', e.target.value)">
          <template v-for="item of editTypeOptions">
            <a-radio-button :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
          </template>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item :label="$t('common_738')" prop="__meta__">
        <pairs-tag :value="tags" @change="handleTagsChange" />
      </a-form-model-item>
      <template v-if="editType === 'checkbox'">
        <template v-if="showPolicyCheckbox">
          <a-form-model-item :label="$t('system.text_327', [$t('dictionary.policy')])">
            <policy-rule-checkbox :check-all-disabled="checkAllDisabled" :data="policyRuleOptions" :permissions="permissions" :scope="model.scope" />
          </a-form-model-item>
        </template>
      </template>
      <template v-if="editType === 'yaml'">
        <a-form-model-item :label="$t('system.text_327', [$t('dictionary.policy')])">
          <code-mirror v-model="yamlPolicy" :options="cmOptions" />
        </a-form-model-item>
      </template>
    </a-form-model>
  </div>
</template>

<script>
import 'codemirror/theme/material.css'
import yaml from 'js-yaml'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { SCOPES_MAP } from '@/constants'
import i18n from '@/locales'
import { genPolicyGroups } from '../../utils'
import { DEFAULT_ACTIONS_KEY } from '../../constants'
import ScopeSelect from './ScopeSelect'
import PolicyRuleCheckbox from './PolicyRuleCheckbox'
import PairsTag from '@/sections/PairsTag'
import validateForm from '@/utils/validate'

// 权限级别
const policyLevel = {
  deny: 0,
  allow: 1,
}

const genPolicyRuleOptions = (scopeResource, isUpdate, permissions) => {
  const groups = genPolicyGroups()
  let checkAllDisabled = true
  const options = groups.map(item => {
    let serviceDisable = true
    const resources = item.resources.map(resource => {
      let resourceDisabled = true
      // ---------------- actions start map ----------------
      const actions = DEFAULT_ACTIONS_KEY.map(action => {
        let actionDisabled = true
        let operatorPolicy = 'allow'
        let currentPolicy = 'allow'
        if (isUpdate) {
          const permissionItem = permissions[`${resource.resource}_${action}`]
          // 操作者权限
          operatorPolicy = permissionItem[permissionItem.length - 1]
          // 当前权限
          currentPolicy = permissionItem[permissionItem.length - 2]
          // 当前权限大于操作权限属于逾越权限，需要disabled
          if (
            operatorPolicy === 'allow' &&
            policyLevel[currentPolicy] <= policyLevel[operatorPolicy]
          ) {
            actionDisabled = false
          }
        } else {
          actionDisabled = false
        }
        if (!actionDisabled) {
          resourceDisabled = false
        }
        return {
          label: i18n.t(`policyDefaultActions.${action}`),
          action,
          value: action,
          service: item.service,
          resource: resource.resource,
          disabled: actionDisabled,
          operatorPolicy,
          currentPolicy,
        }
      })
      // ---------------- actions map end ----------------

      // ---------------- extras actions start map ----------------
      if (resource.extras && resource.extras) {
        resource.extras.forEach(extras => {
          let actionDisabled = true
          let operatorPolicy = 'allow'
          let currentPolicy = 'allow'
          if (isUpdate) {
            const permissionItem = permissions[`${resource.resource}_${extras.action}_${extras.value}`]
            // 操作者权限
            operatorPolicy = permissionItem[permissionItem.length - 1]
            // 当前权限
            currentPolicy = permissionItem[permissionItem.length - 2]
            // 当前权限大于操作权限属于逾越权限，需要disabled
            if (
              operatorPolicy === 'allow' &&
              policyLevel[currentPolicy] <= policyLevel[operatorPolicy]
            ) {
              actionDisabled = false
            }
          } else {
            actionDisabled = false
          }
          if (!actionDisabled) {
            resourceDisabled = false
          }
          actions.push({
            parent: extras.action,
            extraAction: 'vnc',
            label: extras.label,
            action: `${extras.action}_${extras.value}`,
            value: `${extras.action}_${extras.value}`,
            service: item.service,
            resource: resource.resource,
            disabled: actionDisabled,
            operatorPolicy,
            currentPolicy,
          })
        })
      }
      // ---------------- extras actions map end ----------------
      if (!resourceDisabled) {
        serviceDisable = false
      }
      return {
        checkAll: false,
        service: item.service,
        resource: resource.resource,
        label: resource.label,
        checked: [],
        isDomainRes: scopeResource.domain.includes(resource.resource),
        isSystemRes: scopeResource.system.includes(resource.resource),
        isIndeterminate: false,
        actions,
        disabled: resourceDisabled,
      }
    })
    if (!serviceDisable) {
      checkAllDisabled = false
    }
    return {
      checkAll: false,
      label: item.label,
      service: item.service,
      isIndeterminate: false,
      resources,
      disabled: serviceDisable,
    }
  })
  return { options, checkAllDisabled }
}

export default {
  name: 'PolicyForm',
  components: {
    ScopeSelect,
    PolicyRuleCheckbox,
    PairsTag,
  },
  props: {
    policy: Object,
    permissions: Object,
    isUpdate: Boolean,
    editType: {
      type: String,
      required: true,
    },
    policyLoading: Boolean,
  },
  data () {
    const initialNameValue = (this.policy && this.policy.name) || ''
    const initialDomainValue = (this.policy && this.policy.domain_id) || this.$store.getters.userInfo.projectDomainId
    const initialScopeValue = (this.policy && this.policy.scope) || SCOPES_MAP.project.key
    const initialYamlPolicyValue = (this.editType === 'yaml' && this.policy && this.policy.policy) || 'policy:\n  "*": allow'
    const initialDescriptionValue = (this.policy && this.policy.description) || ''
    const initTagsValue = (this.policy && this.policy.project_tags) || []
    return {
      checkAllDisabled: false,
      scopesMap: SCOPES_MAP,
      policyRuleOptions: [],
      model: {
        name: initialNameValue,
        scope: initialScopeValue,
        domain: initialDomainValue,
        description: initialDescriptionValue,
      },
      tags: initTagsValue,
      currentDomain: {},
      rules: {
        name: [
          { required: true, message: this.$t('common.text00042') },
          { validator: this.$validate('resourceName') },
        ],
        __meta__: [
          { validator: validateForm('tagName') },
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
      editTypeOptions: [
        { key: 'yaml', label: this.$t('system.policy_edit_type_yaml') },
        // { key: 'checkbox', label: this.$t('system.policy_edit_type_checkbox') },
      ],
      yamlPolicy: initialYamlPolicyValue,
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        theme: 'material',
        mode: 'text/x-yaml',
      },
      showPolicyCheckbox: this.editType === 'checkbox',
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable', 'isAdminMode', 'scope', 'scopeResource']),
    roleParams () {
      const params = {
        details: true,
        scope: this.scope,
      }
      if (this.isAdminMode && this.model.domain) {
        params.domain_id = this.model.domain
      }
      return params
    },
  },
  watch: {
    policy (val) {
      if (!R.isNil(val) && !R.isEmpty(val)) {
        const name = (val && val.name) || ''
        const domain = (val && val.domain_id) || ''
        const scope = (val && val.scope) || SCOPES_MAP.project.key
        const description = (val && val.policy.description) || ''
        this.yamlPolicy = (this.editType === 'yaml' && val.policy) || ''
        this.model.name = name
        this.model.scope = scope
        this.model.domain = domain
        this.model.description = description
      }
    },
    editType (val) {
      if (val === 'checkbox') {
        this.$nextTick(() => {
          setTimeout(() => {
            this.showPolicyCheckbox = true
          }, 100)
        })
      } else {
        this.showPolicyCheckbox = false
      }
    },
  },
  created () {
    const { options, checkAllDisabled } = genPolicyRuleOptions(this.scopeResource, this.isUpdate, this.permissions)
    this.policyRuleOptions = options
    this.checkAllDisabled = checkAllDisabled
  },
  methods: {
    async getData () {
      try {
        await this.$refs.form.validate()
        const { name, scope, domain, description } = this.model
        const { tags } = this
        let data = {}
        let policy
        if (this.editType === 'checkbox') {
          policy = this.genPostPolicyData()
          // 无论如何设置，usages都设置为有权限
          policy.compute.usages = {
            get: { '*': 'allow' },
            list: { '*': 'allow' },
          }
          policy.image.usages = {
            get: { '*': 'allow' },
            list: { '*': 'allow' },
          }
          policy.identity.usages = {
            get: { '*': 'allow' },
            list: { '*': 'allow' },
          }
          data = {
            type: name,
            policy: {
              policy,
            },
            scope,
          }
        } else if (this.editType === 'yaml') {
          data.type = name
          data.name = name
          data.policy = yaml.safeLoad(this.yamlPolicy)
          data.scope = scope
        }
        if (this.isAdminMode) {
          data.domain_id = domain
        }
        if (description) {
          data.description = description
        }
        data.project_tags = tags
        return data
      } catch (error) {
        throw error
      }
    },
    genPostPolicyData () {
      const ret = {}
      for (let i = 0, len = this.policyRuleOptions.length; i < len; i++) {
        const item = this.policyRuleOptions[i]
        const service = item.service
        ret[service] = {}
        for (let j = 0, jlen = item.resources.length; j < jlen; j++) {
          const resource = item.resources[j]
          let isContinue = true
          if (this.model.scope === SCOPES_MAP.project.key) {
            if (resource.isDomainRes || resource.isSystemRes) isContinue = false
          }
          if (this.model.scope === SCOPES_MAP.domain.key) {
            if (resource.isSystemRes) isContinue = false
          }
          if (!isContinue) continue
          const resKey = resource.resource
          ret[service][resKey] = {}
          for (let k = 0, klen = DEFAULT_ACTIONS_KEY.length; k < klen; k++) {
            const action = DEFAULT_ACTIONS_KEY[k]
            if (resource.checked.includes(action)) {
              ret[service][resKey][action] = {
                '*': 'allow',
              }
            } else {
              ret[service][resKey][action] = {
                '*': 'deny',
              }
            }
            /**
             * 如果大于DEFAULT_ACTIONS_KEY的长度
             * 则代表有其他的 extras, 如 get vnc
             * 则过滤出来当前 action 的 extras，然后进行重新组装该action的policy
             */
            if (resource.actions.length > DEFAULT_ACTIONS_KEY.length) {
              const extras = resource.actions.slice(DEFAULT_ACTIONS_KEY.length).filter(extra => extra.parent === action)
              if (extras && extras.length > 0) {
                for (let m = 0, mlen = extras.length; m < mlen; m++) {
                  const extra = extras[m]
                  if (resource.checked.includes(extra.action)) {
                    ret[service][resKey][action][extra.extraAction] = 'allow'
                  } else {
                    ret[service][resKey][action][extra.extraAction] = 'deny'
                  }
                }
              }
            }
          }
        }
      }
      return ret
    },
    handleDomainChange (domain) {
      this.currentDomain = domain
    },
    handleTagsChange (tags) {
      this.tags = tags || []
    },
  },
}
</script>
