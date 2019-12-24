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
  resourceName: {
    // regexp: /^[a-zA-Z][a-zA-Z0-9-]{1,126}(?<!-)$/, // firefox 不支持 后行否定断言
    func: value => {
      const regexp = /^(?!-|[0-9])[a-zA-Z0-9-]{1,126}$/
      if (regexp.test(value) && !value.endsWith('-')) {
        return true
      }
      return false
    },
    message: i18n.t('validator.resourceName'),
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
    regexp: /^(https?):\/\/(-\.)?([^\s\/?\.#]+\.?)+(\/[^\s]*)?$/i,
    message: i18n.t('validator.url'),
  },
  password: {
    regexp: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    message: i18n.t('validator.password'),
  },
  publicKey: {
    func: value => {
      if (value.startsWith('ssh-rsa') || value.startsWith('ssh-dss')) {
        return true
      }
      return false
    },
    message: i18n.t('validator.publicKey'),
  },
  secretKeyName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9._@-]*$/,
    message: i18n.t('validator.secretKeyName'),
  },
  snapshotName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9._-]{1,127}$/,
    message: i18n.t('validator.snapshotName'),
  },
  templateName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9-]{0,127}([a-zA-Z0-9-]|#{1,3})$/,
    message: i18n.t('validator.resourceName'),
  },
  cidr: {
    regexp: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/,
    message: i18n.t('validator.cidr'),
  },
  ports: {
    regexp: /^([1-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
    message: i18n.t('validator.ports'),
  },
  networkSegment: {
    regexp: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})$/,
    message: i18n.t('validator.networkSegment'),
  },
  wiresName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9-]{1,8}$/,
    message: i18n.t('validator.wiresName'),
  },
  dbName: {
    // regexp: /^[a-zA-Z][a-zA-Z0-9-]{1,126}(?<!-)$/, // firefox 不支持 后行否定断言
    func: value => {
      const regexp = /^(?!_|[0-9])[a-zA-Z0-9_]{4,16}$/
      if (regexp.test(value) && !value.endsWith('_')) {
        return true
      }
      return false
    },
    message: i18n.t('validator.dbName'),
  },
  sshPassword: {
    func: value => {
      const ALL_DIGITS = /\d+/g
      const ALL_LETTERS = /[a-z]/g
      const ALL_UPPERS = /[A-Z]/g
      /* eslint-disable no-useless-escape */
      const ALL_PUNC = '~`!@#$%^&*()-_=+[]{}|;\':\",./<>?'.split('')
      let spec = ALL_PUNC.some(v => value.includes(v))
      if (
        !(
          ALL_DIGITS.test(value) &&
          ALL_LETTERS.test(value) &&
          ALL_UPPERS.test(value) &&
          spec &&
          value.charAt(0) !== '/' &&
          value.length >= 12 &&
          value.length <= 30
        )
      ) {
        return false
      }
      return true
    },
    // json 里面下面的字符串不合法，只能放在js文件里面
    message: '12~30个字符，必须同时包含三项（大小写字母、数字、特殊符号 ~`!@#$%^&*()-_=+[]{}|:\':\\",./<>?中至少一个），不能以“/”开头',
  },
  imageName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9._-]{1,127}$/,
    message: i18n.t('validator.imageName'),
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
 * @description 校验密码
 */
export const passwordValidator = (rule, value, _callback) => {
  value = value.trim()
  const ALL_DIGITS = /\d+/g
  const ALL_LETTERS = /[a-z]/g
  const ALL_UPPERS = /[A-Z]/g
  /* eslint-disable no-useless-escape */
  const ALL_PUNC = '~`!@#$%^&*()-_=+[]{}|;\':\",./<>?'.split('')
  let spec = false
  ALL_PUNC.forEach(v => {
    if (value.includes(v)) {
      spec = true
    }
  })
  if (ALL_DIGITS.test(value) && ALL_LETTERS.test(value) && ALL_UPPERS.test(value) && spec && value.charAt(0) !== '/' && value.length >= 12 && value.length <= 30) {
    _callback()
  } else {
    // callback(new Error('8~30个字符，密码中有一个数字、大写字母、小写字母、特殊符号 ~`!@#$%^&*()-_=+[]{}|:\':\\",./<>?中至少一个'))
    _callback(new Error('12~30个字符，必须同时包含三项（大小写字母、数字、特殊符号 ~`!@#$%^&*()-_=+[]{}|:\':\\",./<>?中至少一个），不能以“/”开头'))
  }
}

/**
 * @description 传入验证规则，得到验证结果，全局的 $validate 方法
 * @param {Array|String} rules: 验证的规则数组 例如： ['email', 'phone']
 * @param {String} checkMethod: 默认是 every, 既有一个规则不合格则失败，some 表示 有一个规则合格则成功
 * @return {Function} validator: vue-ant-design 要求的自定义规则校验函数
 */
const validateForm = (rules, isRequired = true, checkMethod = 'every') => {
  rules = R.unless(R.is(Array), R.of)(rules)
  return (rule, value, callback) => {
    if (!isRequired && (R.isNil(value) || R.isEmpty(value))) return callback()
    let msg = '输入信息不正确'
    const everyIsTrue = rules[checkMethod](r => {
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
