import * as R from 'ramda'
import { WAF_RULE_OPTS_MAP, WAF_RULE_TYPES, WAF_RULE_TYPES_MAP, RATE_LIMIT_RULE_TYPES } from '../constants'

export const encodeRuleListToDescription = (ruleList) => {
  const list = []
  ruleList.forEach(rules => {
    const listInner = []
    rules.forEach(rule => {
      const { type, name, opt, value } = rule
      if (type && opt && WAF_RULE_OPTS_MAP[opt]) {
        const valueType = WAF_RULE_TYPES_MAP[type].valueType
        const str = WAF_RULE_OPTS_MAP[opt].valueFormat(type, name, formatRuleValue(value, R.is(Function, valueType) ? valueType(opt) : valueType, ''))
        listInner.push(str)
      }
    })
    list.push(`(${listInner.join(' and ')})`)
  })
  return list.join(' or ')
}

export const decodeRuleExpression = (expr = '', defaultValue = []) => {
  const list = splitExpr(expr)
  const ret = []
  list.forEach(arr => {
    const group = []
    arr.forEach(str => {
      for (const key in WAF_RULE_OPTS_MAP) {
        const decode = WAF_RULE_OPTS_MAP[key].decodeDescription ? WAF_RULE_OPTS_MAP[key].decodeDescription(str) : null
        if (decode) {
          group.push(decode)
          break
        }
      }
    })
    if (group.length) {
      ret.push(group)
    }
  })
  return ret.length ? ret : defaultValue
}

export const decodeRateLimitCustomRules = (rules) => {
  return rules.map(rule => {
    let row = {}
    for (let i = 0; i < RATE_LIMIT_RULE_TYPES.length; i++) {
      const item = RATE_LIMIT_RULE_TYPES[i]
      const decode = item.decodeDescription ? item.decodeDescription(rule) : null
      if (decode) {
        row = decode
        break
      }
    }
    return row
  })
}

function smartSplit (expr, sep) {
  const result = []
  let buf = ''
  let paren = 0
  let inQuote = false
  let quoteChar = ''
  let i = 0
  const sepLen = sep.length

  while (i < expr.length) {
    // 检查引号
    if (!inQuote && (expr[i] === '"' || expr[i] === "'")) {
      inQuote = true
      quoteChar = expr[i]
      buf += expr[i]
      i++
      continue
    }
    if (inQuote && expr[i] === quoteChar) {
      inQuote = false
      buf += expr[i]
      i++
      continue
    }
    // 检查括号
    if (!inQuote) {
      if (expr[i] === '(') paren++
      if (expr[i] === ')') paren--
    }
    // 检查分隔符
    if (!inQuote && paren === 0) {
      if (expr.slice(i, i + sepLen).toLowerCase() === sep &&
        (i + sepLen === expr.length || /[\s(]/.test(expr[i + sepLen]))) {
        result.push(buf.trim())
        buf = ''
        i += sepLen
        continue
      }
    }
    buf += expr[i]
    i++
  }
  if (buf.trim()) result.push(buf.trim())
  return result.map(str => {
    if (str.startsWith('(') && str.endsWith(')')) {
      return str.slice(1, -1)
    }
    return str
  })
}

// 递归拆分
function splitExpr (expr) {
  // 先按 or 拆
  const orParts = smartSplit(expr, 'or')
  // 每一段再按 and 拆
  return orParts.map(part => smartSplit(part, 'and'))
}

export const formatRuleValue = (originValue, valueType, defaultValue = undefined) => {
  let value = defaultValue
  if (valueType === 'multi-select') {
    if ((originValue && R.is(String, originValue)) || R.is(Number, originValue)) {
      value = [originValue]
    } else if (R.is(Boolean, originValue)) {
      value = []
    } else if (R.is(Array, originValue)) {
      value = originValue
    } else {
      value = []
    }
  } else if (valueType === 'single-select') {
    if ((originValue && R.is(String, originValue)) || R.is(Number, originValue)) {
      value = [originValue]
    } else if (R.is(Boolean, originValue)) {
      value = []
    } else if (R.is(Array, originValue)) {
      value = originValue.length ? originValue[0] : []
    } else {
      value = []
    }
  } else if (valueType === 'input' || valueType === 'input-number') {
    if (R.is(Boolean, originValue)) {
      value = undefined
    } else if (R.is(Array, originValue)) {
      value = originValue.length ? originValue[0] : []
    } else if (R.is(Number, originValue) || R.is(String, originValue)) {
      value = originValue
    }
  } else if (valueType === 'switch') {
    if (R.is(Boolean, originValue)) {
      value = originValue
    } else {
      value = false
    }
  }
  return value
}

export const getRuleConfig = (rule) => {
  const ruleTypes = WAF_RULE_TYPES
  const ret = { valueType: 'input', isShowName: false }
  if (rule.type) {
    const target = ruleTypes.filter(item => item.type === rule.type)
    if (target.length) {
      ret.valueType = R.is(Function, target[0].valueType) ? target[0].valueType(rule.opt) : target[0].valueType
      ret.isShowName = R.is(Function, target[0].isShowName) ? target[0].isShowName(rule.type, rule.opt) : target[0].isShowName
      ret.optDisabled = target[0].optDisabled
      ret.valueOpts = R.is(Function, target[0].valueOpts) ? target[0].valueOpts(ret.valueType) : target[0].valueOpts || []
      ret.opts = target[0].opts || []
      if (target[0].valueExtra) {
        ret.valueExtra = R.is(Function, target[0].valueExtra) ? target[0].valueExtra(rule.type, rule.opt) : target[0].valueExtra
      }
      ret.props = R.is(Function, target[0].props) ? target[0].props(rule.type, rule.opt) : target[0].props || {}
    }
  }
  return ret
}
