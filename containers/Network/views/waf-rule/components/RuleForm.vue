<template>
  <div>
    <template v-for="(group, idx) in form[ruleFormKey]">
      <div :key="idx">
        <div>
          <div v-for="(rule, idx2) in group" :key="`${idx}-${idx2}`">
            <div class="d-flex">
              <div style="flex: 0 0 20%;">
                <!-- 字段 -->
                <a-form-model-item class="mb-0">
                  <a-select v-model="rule.type" :placeholder="$t('network.field')" @change="handleTypeChange(idx, idx2)">
                    <a-select-option v-for="item in ruleTypes" :key="item.key" :value="item.key">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </div>
              <div v-if="getRuleConfig(rule).isShowName" style="width:40%" class="ml-2">
                <!-- 名称 -->
                <a-form-model-item class="mb-0">
                  <a-input v-model="rule.name" :placeholder="$t('network.text_21')" />
                </a-form-model-item>
              </div>
              <div style="width:25%" class="ml-2">
                <!-- 运算符 -->
                <a-form-model-item class="mb-0">
                  <a-select v-model="rule.opt" :placeholder="$t('compute.text_745')" :disabled="getRuleConfig(rule).optDisabled" @change="handleOptChange(idx, idx2)">
                    <a-select-option v-for="item in getRuleOpts(idx, idx2)" :key="item.key" :value="item.key">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </div>
              <div style="width:50%;position:relative" class="ml-2">
                <!-- 值 -->
                <a-form-model-item class="mb-0">
                  <a-input v-if="getRuleConfig(rule).valueType === 'input'" v-model="rule.value" :placeholder="$t('network.value')" />
                  <a-input-number v-if="getRuleConfig(rule).valueType === 'input-number'" class="w-100" v-model="rule.value" :placeholder="$t('network.value')" v-bind="getRuleConfig(rule).props" />
                  <a-select v-if="getRuleConfig(rule).valueType === 'multi-select'" v-model="rule.value" :placeholder="$t('network.value')" mode="multiple" showSearch>
                    <a-select-option v-for="item in getRuleConfig(rule).valueOpts" :key="item.key" :value="item.key">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                  <a-select v-if="getRuleConfig(rule).valueType === 'single-select'" v-model="rule.value" :placeholder="$t('network.value')" showSearch>
                    <a-select-option v-for="item in getRuleConfig(rule).valueOpts" :key="item.key" :value="item.key">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                  <a-switch v-if="getRuleConfig(rule).valueType === 'switch'" v-model="rule.value" />
                </a-form-model-item>
                <div class="extra-text" v-if="getRuleConfig(rule).valueExtra">
                  {{ getRuleConfig(rule).valueExtra }}
                </div>
              </div>
              <div><a-button @click="addRule('and', idx, idx2)" class="ml-2">And</a-button></div>
              <div v-if="idx === form[ruleFormKey].length - 1 && idx2 === group.length - 1"><a-button @click="addRule('or', idx, idx2)" class="ml-2">Or</a-button></div>
              <div v-if="allRuleLen > 1"><a-icon type="close" class="ml-2 mr-1 close-icon" @click="delRule(idx, idx2)" /></div>
            </div>
            <div class="split-and-container" v-if="idx2 !== group.length - 1">
              <div class="split-and">And</div>
              <div class="left-border" />
            </div>
          </div>
        </div>
        <div class="split-or" v-if="idx !== form[ruleFormKey].length - 1">Or</div>
      </div>
    </template>
    <div class="expression-container mt-3">
      <div class="title d-flex justify-content-between">
        <div class="title-text">
          {{ $t('network.waf.rule_expression') }}
        </div>
        <div class="title-text">
          <a-button type="link" @click="handleEditExpression">
            {{ $t('network.waf.rule_expression_edit') }}
          </a-button>
        </div>
      </div>
      <div class="content">
        {{ ruleExpression }}
      </div>
    </div>
    <div class="error" v-if="!validate">{{ $t('network.waf.rule_form.error') }}</div>
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { WAF_RULE_TYPES } from '../constants'
import { formatRuleValue, getRuleConfig, encodeRuleListToDescription } from '../utils'

export default {
  name: 'RateLimitRuleForm',
  mixins: [WindowsMixin],
  props: {
    form: {
      type: Object,
      required: true,
    },
    ruleFormKey: {
      type: String,
      required: true,
      default: 'rules',
    },
    ruleType: {
      type: String,
      default: 'custom',
    },
  },
  data () {
    return {
      validate: true,
      getRuleConfig,
    }
  },
  computed: {
    allRuleLen () {
      return this.form[this.ruleFormKey].reduce((acc, cur) => acc + cur.length, 0)
    },
    ruleTypes () {
      return WAF_RULE_TYPES.map(item => ({ key: item.type, label: this.$t(`network.waf.rule_type.${item.type}`), ...item })).filter(item => {
        return !item.belongs || item.belongs.includes(this.ruleType)
      })
    },
    ruleExpression () {
      return encodeRuleListToDescription(this.form[this.ruleFormKey])
    },
  },
  watch: {
  },
  methods: {
    getRuleOpts (idx, idx2) {
      const rule = this.form[this.ruleFormKey][idx][idx2]
      if (rule.type) {
        const target = this.ruleTypes.find(item => item.key === rule.type)
        if (target && target.opts) {
          return target.opts.map(key => ({ key, label: this.$t(`network.waf.rule_opt.${key}`) }))
        }
      }
      return []
    },
    addRule (type, idx, idx2) {
      if (type === 'or') {
        this.form[this.ruleFormKey].push([{ type: undefined, name: undefined, opt: undefined, value: undefined }])
      } else {
        const list = []
        this.form[this.ruleFormKey][idx].forEach((item, i) => {
          list.push(item)
          if (i === idx2) {
            list.push({ type: undefined, name: undefined, opt: undefined, value: undefined })
          }
        })
        this.$set(this.form[this.ruleFormKey], idx, list)
      }
    },
    delRule (idx, idx2) {
      if (this.form[this.ruleFormKey][idx].length === 1) {
        this.form[this.ruleFormKey].splice(idx, 1)
      } else {
        this.form[this.ruleFormKey][idx].splice(idx2, 1)
      }
    },
    handleTypeChange (idx, idx2) {
      this.$nextTick(() => {
        const opt = this.getRuleConfig(this.form[this.ruleFormKey][idx][idx2]).opts[0]
        this.form[this.ruleFormKey][idx][idx2].opt = opt
        this.form[this.ruleFormKey][idx][idx2].value = undefined
        this.form[this.ruleFormKey][idx][idx2].name = undefined
      })
    },
    handleOptChange (idx, idx2) {
      this.$nextTick(() => {
        const valueType = this.getRuleConfig(this.form[this.ruleFormKey][idx][idx2]).valueType
        const originValue = this.form[this.ruleFormKey][idx][idx2].value
        if (this.form[this.ruleFormKey][idx][idx2].type === 'ip.src') {
          this.form[this.ruleFormKey][idx][idx2].value = undefined
        } else {
          this.form[this.ruleFormKey][idx][idx2].value = formatRuleValue(originValue, valueType)
        }
      })
    },
    handleEditExpression () {
      this.createDialog('WafRuleEditDialog', {
        expression: this.ruleExpression,
        success: (rules) => {
          this.form[this.ruleFormKey] = rules
        },
      })
    },
    validateRule () {
      const rules = this.form[this.ruleFormKey]
      let validate = true
      rules.forEach(group => {
        group.forEach(rule => {
          if (!rule.type || !rule.opt) {
            validate = false
            return
          }
          const config = getRuleConfig(rule)
          if (config.isShowName && !rule.name) {
            validate = false
            return
          }
          if (config.valueType === 'input' || config.valueType === 'input-number' || config.valueType === 'single-select') {
            if (!rule.value) {
              validate = false
              return
            }
          }
          if (config.valueType === 'multi-select') {
            if (!Array.isArray(rule.value) || rule.value.length === 0) {
              validate = false
            }
          }
        })
      })
      this.validate = validate
      return validate
    },
  },
}
</script>

<style lang="less" scoped>
.rule-group-container {
  background-color: #cacaca50;
  padding: 10px;
}
.close-icon {
  font-size: 18px;
  transform: translateY(3px);
  cursor: pointer;
  &:hover {
    color: var(--antd-wave-shadow-color);
  }
}
.split-or {
  display: inline-block;
  height: 30px;
  line-height: 30px;
  padding: 0 15px;
  // padding: 3px 10px;
  background-color: #cacaca50;
  border: solid 1px #cacaca80;
  margin: 15px 0;
}
.split-and-container {
  height: 30px;
  position: relative;
  .split-and {
    display: inline-block;
    height: 25px;
    line-height: 25px;
    padding: 0 10px;
    // background-color: #cacaca50;
    border: solid 1px #cacaca80;
    border-left: none;
    position: absolute;
    left: 0;
    top: 2.5px;
    color: #aaa;
  }
  .left-border {
    position: absolute;
    width: 1px;
    height: 40px;
    left: 0;
    top: -5px;
    font-size: 18px;
    border-left: solid 1px #cacaca90;
  }
}
.content {
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  letter-spacing: 1px;
}
.extra-text {
  position: absolute;
  left: 0;
  top: 30px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}
.error {
  font-size: 14px;
  color: red;
}
</style>
