<template>
  <div>
    <template v-for="(group, idx) in form[ruleFormKey]">
      <div :key="idx">
        <div>
          <div v-for="(rule, idx2) in group" :key="`${idx}-${idx2}`">
            <div class="d-flex">
              <div style="flex: 0 0 40%;">
                <!-- 字段 -->
                <a-form-model-item class="mb-0">
                  <a-select v-model="rule.type" :placeholder="$t('network.field')" @change="handleTypeChange(idx, idx2)">
                    <a-select-option v-for="item in rateLimitRuleTypes" :key="item.key" :value="item.key">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </div>
              <div class="ml-2" style="flex: 1 1 auto" v-if="getRule(idx, idx2).valueType">
                <!-- 值 -->
                <a-form-model-item class="mb-0">
                  <a-input v-model="rule.value" :placeholder="$t('network.value')" />
                </a-form-model-item>
              </div>
              <div><a-button @click="addRule('and', idx, idx2)" class="ml-2">And</a-button></div>
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
    <div class="error" v-if="!validate">{{ $t('network.waf.rule_form.error') }}</div>
  </div>
</template>

<script>
import { RATE_LIMIT_RULE_TYPES, RATE_LIMIT_RULE_TYPES_MAP } from '../constants'

export default {
  name: 'RateLimitRuleForm',
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
  },
  data () {
    return {
      validate: true,
      rateLimitRuleTypes: RATE_LIMIT_RULE_TYPES.map(item => {
        return {
          key: item.type,
          label: this.$t(`network.waf.rate_limit_rule_type.${item.type}`),
          ...item,
        }
      }),
    }
  },
  computed: {
    allRuleLen () {
      return this.form[this.ruleFormKey].reduce((acc, cur) => acc + cur.length, 0)
    },
  },
  methods: {
    getRule (idx, idx2) {
      const rule = this.form[this.ruleFormKey][idx][idx2]
      if (rule.type) {
        const target = this.rateLimitRuleTypes.find(item => item.key === rule.type)
        return target
      }
      return {}
    },
    addRule (type, idx, idx2) {
      if (type === 'or') {
        this.form[this.ruleFormKey].push([{ type: undefined, value: undefined }])
      } else {
        const list = []
        this.form[this.ruleFormKey][idx].forEach((item, i) => {
          list.push(item)
          if (i === idx2) {
            list.push({ type: undefined, value: undefined })
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
        this.form[this.ruleFormKey][idx][idx2].value = undefined
      })
    },
    validateRule () {
      const rules = this.form[this.ruleFormKey]
      let validate = true
      rules.forEach(group => {
        group.forEach(rule => {
          if (!rule.type) {
            validate = false
            return
          }
          if (RATE_LIMIT_RULE_TYPES_MAP[rule.type].valueType) {
            if (!rule.value) {
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
.error {
  font-size: 14px;
  color: red;
}
</style>
