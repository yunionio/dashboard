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
          <a-input v-if="params.isEdit" v-model="ruleInfoForm.name" :placeholder="$t('network.waf.rule_name_placeholder')" />
          <box-show v-else :value="ruleInfoForm.name" />
        </a-form-model-item>
        <!-- 优先级 -->
        <a-form-model-item :label="$t('network.text_81')" prop="priority">
          <a-input v-if="params.isEdit" v-model="ruleInfoForm.priority" :placeholder="$t('network.waf.rule_priority_placeholder')" />
          <box-show v-else :value="ruleInfoForm.priority" />
        </a-form-model-item>
        <!-- 匹配规则 -->
        <a-form-model-item :label="$t('network.waf.rule_match')" prop="statement_conditon">
          <a-select v-if="params.isEdit" v-model="ruleInfoForm.statement_conditon" :placeholder="$t('network.waf.rule_match_validator')">
            <a-select-option v-for="item in statementConditionOptions" :value="item.value" :key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
          <box-show v-else :value="ruleStatementCondition" />
        </a-form-model-item>
        <!-- 条件 -->
        <template v-if="ruleInfoForm.statements.length">
          <a-form-model-item v-for="(statement,index) in ruleInfoForm.statements" :key="index"
            v-bind="index === 0 ? formLayout : formLayoutWithOutLabel"
            :label="index === 0 ? $t('network.waf.rule_condition') : ''">
            <div class="d-flex align-items-center">
              <waf-rule-statement :data="statement" :type="statement.type" :wafBrand="ruleInfoData.brand" :isEdit="params.isEdit" />
              <!-- <a-button style="flex: 0 0 24px;margin-left: 20px" shape="circle" icon="minus" size="small" @click="deleteRule(item,index)" /> -->
            </div>
          </a-form-model-item>
        </template>
        <!-- <div class="d-flex align-items-center">
          <a-button type="primary" shape="circle" icon="plus" size="small" @click="addRule" />
          <a-button type="link" @click="addRule">{{$t('network.waf.rule_add')}}</a-button>
        </div> -->
        <!-- 处理动作 -->
        <a-form-model-item :label="$t('network.waf.action')" prop="action">
          <a-select v-if="params.isEdit" v-model="ruleInfoForm.action">
            <a-select-option v-for="item in wafRuleActionOptions" :value="item.value" :key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
          <box-show v-else :value="ruleAction" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <!-- <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button> -->
      <a-button @click="cancelDialog">{{ $t('network.text_33') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import WafMixin from '../mixins/waf'
import BoxShow from '../components/statementComponents/BoxShow'
import WafRuleStatement from '../components/WafRuleStatement'

export default {
  name: 'WafRuleInfoDialog',
  components: {
    WafRuleStatement,
    BoxShow,
  },
  mixins: [DialogMixin, WindowsMixin, WafMixin],
  props: {
    parmas: Object,
  },
  data () {
    const initTitle = this.params.title || this.$t('network.waf.rule_view')
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
        name: '',
        priority: 0,
        statement_conditon: '',
        action: '',
        statements: [],
      },
      ruleInfoData: {},
      rules: {
        name: { required: true, message: this.$t('cloudenv.text_190') },
        priority: { required: true, validator: this.$validate('nonNegativeInt') },
        statement_conditon: { message: this.$t('network.waf.rule_match_validator') },
        action: { required: true, message: this.$t('network.waf.rule_action_validator') },
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
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    ruleStatementCondition () {
      const statementCondition = this.statementConditionOptions.filter(item => item.value === this.ruleInfoForm.statement_conditon)
      if (statementCondition && statementCondition.length) {
        return statementCondition[0].label
      } else {
        return this.ruleInfoForm.statement_conditon
      }
    },
    ruleAction () {
      const action = this.wafRuleActionOptions.filter(item => item.value === this.ruleInfoForm.action)
      if (action && action.length) {
        return action[0].label
      } else {
        return this.ruleInfoForm.action || this.$t('network.waf.match_null')
      }
    },
  },
  created () {
    this.$r = new this.$Manager('waf_rules', 'v2')
    this.fetchRuleInfo()
  },
  methods: {
    async fetchRuleInfo () {
      const { data = [] } = this.params
      const id = data[0]?.id
      if (id) {
        try {
          const { data: ruleInfo = {} } = await this.$r.get({ id })
          this.ruleInfoForm.name = ruleInfo.name || ''
          this.ruleInfoForm.priority = ruleInfo.priority || 0
          this.ruleInfoForm.statement_conditon = ruleInfo.statement_conditon || ''
          this.ruleInfoForm.action = ruleInfo.action?.action ?? ''
          this.ruleInfoForm.statements = ruleInfo.statements || []
          // 是否每条数据都有brand来区分是哪个平台的waf规则
          this.ruleInfoData = Object.assign({}, { brand: 'Azure' }, ruleInfo)
        } catch (err) { throw err }
      }
    },
  },
}
</script>
