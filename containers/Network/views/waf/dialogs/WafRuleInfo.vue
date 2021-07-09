<template>
  <base-dialog :width="1000" @cancel="cancelDialog">
    <div slot="header">{{title}}</div>
    <div slot="body">
      <a-form-model
        v-bind="formLayout"
        ref="ruleInfoForm"
        :model="ruleInfoForm"
        :rules="rules"
        :hideRequiredMark="true">
        <!-- 名称 -->
        <a-form-model-item :label="$t('network.waf.rule_name')" prop="name">
          <a-input v-model="ruleInfoForm.name" :placeholder="$t('network.waf.rule_name_placeholder')" :disabled="!canDialogEdit" />
        </a-form-model-item>
        <!-- 优先级 -->
        <a-form-model-item :label="$t('network.text_81')" prop="priority">
          <a-input v-model="ruleInfoForm.priority" :placeholder="$t('network.waf.rule_priority_placeholder')" :disabled="!canDialogEdit" />
        </a-form-model-item>
        <!-- 匹配规则 -->
        <a-form-model-item :label="$t('network.waf.rule_match')" prop="statement_conditon">
          <a-select v-model="ruleInfoForm.statement_conditon" :placeholder="$t('network.waf.rule_match_validator')" :disabled="!canDialogEdit">
            <a-select-option v-for="item in statementConditionOptions" :value="item.value" :key="item.value">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <!-- 条件 -->
        <template v-if="ruleInfoForm.statements.length">
          <a-form-model-item v-for="(statement,index) in ruleInfoForm.statements" :key="index"
            v-bind="index === 0 ? formLayout : formLayoutWithOutLabel"
            :label="index === 0 ? $t('network.waf.rule_condition') : ''">
            <div class="d-flex align-items-center">
              <waf-rule-statement :data="statement" :type="statement.type" />
              <!-- <a-button v-if="canDialogEdit" style="flex: 0 0 24px;margin-left: 20px" shape="circle" icon="minus" size="small" @click="deleteRule(item,index)" /> -->
            </div>
          </a-form-model-item>
        </template>
        <!-- <div v-if="canDialogEdit" class="d-flex align-items-center">
          <a-button type="primary" shape="circle" icon="plus" size="small" @click="addRule" />
          <a-button type="link" @click="addRule">{{$t('network.waf.rule_add')}}</a-button>
        </div> -->
        <!-- 处理动作 -->
        <a-form-model-item :label="$t('network.waf.action')" prop="action">
          <a-select v-model="ruleInfoForm.action" :disabled="!canDialogEdit">
            <a-select-option v-for="item in wafRuleActionOptions" :value="item.value" :key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
// import Tag from '../components/Tag'
// import ApplicationScope from '../components/ApplicationScope'
// import DomainSelect from '@/sections/DomainSelect'
import WafMixin from '../mixins/waf'
import WafRuleStatement from '../components/WafRuleStatement'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

let id = 0
export default {
  name: 'WafRuleInfoDialog',
  components: {
    WafRuleStatement,
    // DomainSelect,
    // Tag,
    // ApplicationScope,
  },
  mixins: [DialogMixin, WindowsMixin, WafMixin],
  props: {
    parmas: Object,
  },
  data () {
    const initTitle = this.params.title || this.$t('network.waf.rule_view')
    const projectDomainInitialValue = (this.params.domain && this.params.domain.key) || this.$store.getters.userInfo.projectDomainId
    // const { data = {} } = this.params
    // const { name = '', action = { action: '' }, priority = 0 } = data
    // const initMatch = ''
    // const initPriority = priority
    // const initName = name
    // const initAction = action
    return {
      loading: false,
      title: initTitle,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          applicationScope: 1,
        },
      },
      ruleInfoForm: {
        name: 'xx',
        priority: 10,
        statement_conditon: '',
        action: '',
        statements: [],
      },
      rules: {
        name: { required: true, message: this.$t('cloudenv.text_190') },
        priority: { required: true, validator: this.$validate('nonNegativeInt') },
        statement_conditon: { required: true, message: this.$t('network.waf.rule_match_validator') },
        action: { required: true, message: this.$t('network.waf.rule_action_validator') },
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        priority: [
          'priority',
          {
            rules: [
              { required: true, validator: this.$validate('nonNegativeInt') },
            ],
          },
        ],
        statement_conditon: [
          'statement_conditon',
          {
            rules: [{ required: true, message: this.$t('network.waf.rule_match_validator') }],
          },
        ],
        action: [
          'action',
          {
            rules: [{ required: true, message: this.$t('network.waf.rule_action_validator') }],
          },
        ],
        statements: [
          'statements',
          {
            rules: [{ required: true }],
          },
        ],
      },
      formLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      formLayoutWithOutLabel: {
        wrapperCol: {
          span: 20,
          offset: 4,
        },
      },
      domainParams: {
        limit: 0,
        filter: 'enabled.equals(1)',
      },
      statementConditionOptions: [
        {
          id: 1,
          name: this.$t('network.waf.match_any'),
          value: 'Or',
        },
        {
          id: 2,
          name: this.$t('network.waf.match_all'),
          value: 'And',
        },
        {
          id: 3,
          name: this.$t('network.waf.match_not'),
          value: 'Not',
        },
      ],
      wafRuleTypeOptions: [],
      projectOptions: [],
      accountOptions: [],
      projectDomainId: projectDomainInitialValue,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    canDialogEdit () {
      // return this.params.type !== 'view'
      return true
    },
  },
  watch: {
    wafRuleTypeMap: {
      handler: function (val) {
        if (val) {
          const wafRuleTypesKeys = Object.keys(val || {})
          this.wafRuleTypeOptions = wafRuleTypesKeys.map(key => {
            return val[key]
          })
        }
      },
      immediate: true,
    },
    // projectDomainId: {
    //   handler: function (val) {
    //     if (val) {
    //       // this.fetchCloudAccount()
    //       this.fetchProject()
    //     }
    //   },
    //   immediate: true,
    // },
  },
  created () {
    this.$r = new this.$Manager('waf_rules', 'v2')
    // this.$t = new this.$Manager('waf_rule_statements/distinct-field', 'v2')
    this.fetchRuleInfo()
  },
  mounted () {
    this.form.fc.getFieldDecorator('statements', { initialValue: [], preserve: true })
    // this.$t.list()
  },
  methods: {
    async fetchRuleInfo () {
      console.log('waf rule info params', this.params)
      const { data = [] } = this.params
      const id = data[0]?.id
      if (id) {
        try {
          const { data: ruleInfo = {} } = await this.$r.get({ id })
          console.log('规则详情', ruleInfo)
          // 更新内容
          // const { fc } = this.form
          console.log('匹配规则', ruleInfo.statement_conditon)
          // fc.setFieldsValue({
          //   name: ruleInfo.name || '',
          //   priority: ruleInfo.priority,
          //   statement_conditon: ruleInfo.statement_conditon || '',
          //   statements: [Object.assign({}, ruleInfo.statements[0]), Object.assign({}, ruleInfo.statements[0])],
          //   action: ruleInfo.action?.action ?? '',
          // })
          this.ruleInfoForm.name = ruleInfo.name || ''
          this.ruleInfoForm.priority = ruleInfo.priority || ''
          this.ruleInfoForm.statement_conditon = ruleInfo.statement_conditon || ''
          this.ruleInfoForm.action = ruleInfo.action?.action ?? ''
          this.ruleInfoForm.statements = ruleInfo.statements || []
        } catch (err) { throw err }
      }
    },
    // handleDomainChange (id) {
    //   this.form.fc.setFieldsValue({
    //     project_domain_id: id,
    //   })
    //   this.projectDomainId = id
    // },
    // async fetchCloudAccount () {
    //   this.$d = new this.$Manager('cloudaccounts')
    //   this.accountOptions = undefined
    //   this.form.fc.setFieldsValue({
    //     accounts: [],
    //   })
    //   try {
    //     const params = {
    //       scope: this.$store.getters.scope,
    //       project_domain_id: this.projectDomainId,
    //     }
    //     const { data } = await this.$d.list({ params })
    //     const cloudAccounts = data.data || []
    //     const accountOptions = []
    //     cloudAccounts.map(item => {
    //       const isPublic = findPlatform(item.brand.toLowerCase()) === 'public'
    //       if (isPublic) {
    //         accountOptions.push({
    //           id: item.id,
    //           name: item.name,
    //           brand: this.$t('cloudenv.text_102') + ': ' + brandMap[item.brand].label,
    //           project_mapping: item.project_mapping || false,
    //         })
    //       }
    //     })
    //     this.accountOptions = accountOptions
    //   } catch (err) {
    //     throw err
    //   } finally {
    //   }
    // },
    // async fetchProject () {
    //   this.$p = new this.$Manager('projects', 'v1')
    //   this.projectOptions = undefined
    //   this.form.fc.setFieldsValue({
    //     maps: [],
    //     rules: [],
    //   })
    //   try {
    //     const params = {
    //       scope: this.$store.getters.scope,
    //       project_domain_id: this.projectDomainId,
    //     }
    //     const { data } = await this.$p.list({ params })
    //     const projects = data.data || []
    //     this.projectOptions = projects.map(item => {
    //       return {
    //         id: item.id,
    //         name: item.name,
    //         value: item.name,
    //         // brand: this.$t('dashboard.text_98') + ': ' + item.brand,
    //       }
    //     })
    //   } catch (err) {
    //     throw err
    //   } finally {
    //   }
    // },
    doCreate (data) {
      return new this.$Manager('project_mappings').create({ data: data })
    },
    doBindByAccount ({ accountIds, project_mapping_id }) {
      const manager = new this.$Manager('cloudaccounts')
      return manager.batchPerformAction({
        ids: accountIds,
        action: 'project-mapping',
        data: { project_mapping_id },
      })
    },
    doBindByCloudProvider ({ cloudproviderIds, project_mapping_id }) {
      const manager = new this.$Manager('cloudproviders')
      return manager.batchPerformAction({
        ids: cloudproviderIds,
        action: 'project-mapping',
        data: { project_mapping_id },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        // const values = await this.form.fc.validateFields()
        const values = this.ruleInfoForm
        const { applicationScope } = this.form.fd
        // 获取参数
        const params = this.getCreateParams(values)
        const createResult = await this.doCreate(params)
        const { id } = createResult.data
        if (applicationScope === 1 && values.accounts?.length > 0) {
          await this.doBindByAccount({ accountIds: values.accounts, project_mapping_id: id })
        } else if (applicationScope === 2 && values.cloudproviders?.length > 0) {
          await this.doBindByCloudProvider({ cloudproviderIds: values.cloudproviders, project_mapping_id: id })
        }
        this.cancelDialog()
        this.params.success && this.params.success()
        this.$message.success(this.$t('cloudenv.text_381'))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    getCreateParams ({ project_domain_id, name, rules, tags, matchs, maps }) {
      const result = {
        project_domain_id,
        name,
        rules: [],
      }
      result.rules = rules.map((item, index) => {
        if (item !== -1 && tags[item] && matchs[item] && maps[item]) {
          return {
            condition: matchs[item],
            project_id: maps[item],
            tags: this.getTagValue(tags[item]),
          }
        }
      }).filter(item => {
        return !!item
      })
      return result
    },
    getTagValue (tag) {
      const result = []
      const keys = Object.keys(tag)
      keys.map(key => {
        result.push({
          key: R.replace(/(ext:|user:)/, '', key),
          value: tag[key],
        })
      })
      return result
    },
    addRule () {
      const { form } = this
      const keys = form.fc.getFieldValue('statements')
      const nextKeys = keys.concat(id++)
      // const matchs = form.fc.getFieldValue('maps') || []
      // const nextMatchs = matchs.concat(this.projectOptions.length ? this.projectOptions[0].id : '')
      form.fc.setFieldsValue({
        statements: nextKeys,
        // maps: nextMatchs,
      })
    },
    deleteRule (item, idx) {
      const { form } = this
      const rules = form.fc.getFieldValue('statements')
      const nextRules = rules.map(rule => {
        if (rule === item) {
          return -1
        }
        return rule
      })
      form.fc.setFieldsValue({
        rules: nextRules,
      })
    },
    tagsLengthValidate (rule, value, callback) {
      if (value) {
        const keys = Object.keys(value)
        if (keys.length > 20) {
        // eslint-disable-next-line
        callback(false)
        } else {
          callback()
        }
      } else {
        // eslint-disable-next-line
        callback(false)
      }
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
