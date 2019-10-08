import * as R from 'ramda'
import i18n from '@/locales'

export const REGEXP = {
  IPv4: {
    regexp: /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/,
    message: i18n.t('validator.IPv4'),
  },
  IPv6: {
    regexp: /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(.(25[0-5\]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(.(25[0-5]|2[0-4][0-9]|1[0-9\][0-9]|[1-9]?[0-9])){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(.(25[0-5]|2[0-4][0-9]|1[0\-9][0-9]|[1-9]?[0-9])){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(.(25[0-5]|2[0-4][0\-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(.(25[0-5]|2\[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(.(25\[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(.(25[0-5]|2[0-4][0\-9]|1[0-9][0-9]|[1-9]?[0-9])){3}))|:)))(%.+)?\s*$/,
    message: i18n.t('validator.IPv6'),
  },
  serverName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9-]{0,127}([a-zA-Z0-9-]|#{1,3})$/,
    message: i18n.t('validator.serverName'),
  },
  email: {
    regexp: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
    message: i18n.t('validator.email'),
  },
  phone: {
    regexp: /^1[0-9-]{10}$/,
    message: i18n.t('validator.phone'),
  },
  isChinese: {
    regexp: /[\u4e00-\u9fa5]/,
    message: i18n.t('validator.isChinese'),
  },
  domain: {
    regexp: /^([a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62}){1}(\.[a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62})*[._]?$/,
    message: i18n.t('validator.domain'),
  },
  /* eslint-disable no-useless-escape */
  url: {
    regexp: /^(https?):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i,
    message: i18n.t('validator.url'),
  },
}

/**
 * @description 是否为必填参数
 * @param {Boolean} isObj: 是否是验证对象，vue-ant-design 里面的 form 的对象格式为 { key: '', value: '' }
 * @return {Function} validator: vue-ant-design 要求的自定义规则校验函数
 */
export const isRequired = (isObj = true) => {
  return function (rule, value, callback) {
    if (isObj && R.is(Object, value)) {
      if (value.key) {
        callback()
      } else {
        callback(Error)
      }
    } else {
      callback(Error)
    }
  }
}

/**
 * @description 传入验证规则，得到验证结果，全局的 $validate 方法
 * @param {Array|String} rules: 验证的规则数组 例如： ['email', 'phone']
 * @return {Function} validator: vue-ant-design 要求的自定义规则校验函数
 */
const validateForm = (rules, isRequired = true) => {
  rules = R.unless(R.is(Array), R.of)(rules)
  return (rule, value, callback) => {
    if (!isRequired && (R.isNil(value) || R.isEmpty(value))) return callback()
    let msg = '输入信息不正确'
    const everyIsTrue = rules.every(r => {
      const result = validate(value, r)
      if (result === true) return true
      msg = result.msg
      return false
    })
    if (everyIsTrue) {
      callback()
    } else {
      callback(msg)
    }
  }
}

/**
 * 对内服务，对外暴露的检验方法
 * @param {String} value 要检验的值
 * @param {String} regexpItem REGEXP里面的待检验的规则key
 * @returns {Boolean} 是否通过校验
 */
export const validate = (value, regexpItem) => {
  const validateItem = REGEXP[regexpItem]
  if (validateItem) {
    let msg = '输入信息不正确'
    let result = true
    if (validateItem.regexp) {
      result = validateItem.regexp.test(value)
    }
    if (result && validateItem.func) {
      result = validateItem.func(value) // 支持自定义函数判断
    }
    if (!result) {
      msg = validateItem.message
      return {
        result,
        msg,
      }
    }
    return true
  } else {
    console.error(`OneCloud: REGEXP 里面没有记录 ${regexpItem}规则, 请及时添加`)
    return false
  }
}

/**
 * Checks if an IP address is within range of 2 other IP addresses
 * @param  {String}  ip         IP to validate
 * @param  {String}  lowerBound The lower bound of the range
 * @param  {String}  upperBound The upper bound of the range
 * @return {Boolean}            True or false
 */
export const isWithinRange = (ip, lowerBound, upperBound) => {
  // Put all IPs into one array for iterating and split all into their own
  // array of segments
  var ips = [ip.split('.'), lowerBound.split('.'), upperBound.split('.')]

  // Convert all IPs to ints
  for (var i = 0; i < ips.length; i++) {
    // Typecast all segments of all ips to ints
    for (var j = 0; j < ips[i].length; j++) {
      ips[i][j] = parseInt(ips[i][j])
    }

    // Bit shift each segment to make it easier to compare
    ips[i] =
      (ips[i][0] << 24) +
      (ips[i][1] << 16) +
      (ips[i][2] << 8) +
      (ips[i][3])
  }

  // Do comparisons
  if (ips[0] >= ips[1] && ips[0] <= ips[2]) return true

  return false
}

export default validateForm
