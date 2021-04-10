import * as R from 'ramda'
import { merge } from 'lodash'
import i18n from '@/locales'
const yaml = require('js-yaml')

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
      if (!value) return false
      if (value.length < 2 || value.length > 128) return false
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
  resourceCreateName: {
    regexp: /^[a-zA-Z$][a-zA-Z0-9-${}]{0,60}([a-zA-Z0-9}]|#{1,3})$/,
    message: i18n.t('validator.resourceCreateName'),
  },
  serverCreateName: {
    func: value => {
      const regexp = /^[a-z$][a-z0-9-${}]{0,60}([a-z0-9}]|#{1,3})$/
      return regexp.test(value)
      // if (regexp.test(value)) {
      //   const supportVars = ['brand', 'charge_type', 'cloud_env', 'cloudregion_id', 'cpu', 'host', 'host_id', 'hypervisor', 'ip_addr', 'mem', 'os_distribution', 'os_type', 'os_version', 'owner_tenant', 'owner_tenant_id', 'provider', 'region', 'region_id', 'res_name', 'template_id', 'zone', 'zone_id']
      //   const reg = /\$\{([a-zA-Z_]+)\}/g
      //   const match = value.match(reg)
      //   if (R.is(Array, match)) {
      //     const r = /^\$\{([a-zA-Z_]+)\}$/
      //     const valid = match.every(val => {
      //       const strMatch = val.match(r)
      //       if (R.is(Array, strMatch)) {
      //         const str = strMatch[1]
      //         return supportVars.includes(str)
      //       }
      //       return false
      //     })
      //     if (valid) {
      //       return true
      //     }
      //     return `仅支持以下表达式：${supportVars.join('，')}`
      //   } else {
      //     return true
      //   }
      // }
      // return false
    },
    message: i18n.t('validator.serverCreateName'),
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
    regexp: /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/,
    message: i18n.t('validator.domain'),
  },
  /* eslint-disable no-useless-escape */
  url: {
    regexp: /^(https?):\/\/(-\.)?([^\s\/?\.#]+\.?)+(\/[^\s]*)?$/i,
    message: i18n.t('validator.url'),
  },
  password: {
    regexp: /^(?=.*[0-9].*)(?=.*[A-Z].*)(?=.*[a-z].*).{8,}$/,
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
      const spec = ALL_PUNC.some(v => value.includes(v))
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
    message: i18n.t('validator.sshPassword'),
  },
  imageName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9._-]{1,127}$/,
    message: i18n.t('validator.imageName'),
  },
  mac: {
    regexp: /^([0-9a-fA-F]{2})(([/\s:][0-9a-fA-F]{2}){5})$/,
    message: i18n.t('validator.mac'),
  },
  broadName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9_-]{1,20}$/,
    message: i18n.t('validator.broadName'),
  },
  CIDR: {
    regexp: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/,
    message: i18n.t('validator.CIDR'),
  },
  certName: {
    regexp: /^[a-zA-Z][a-zA-Z0-9-]{0,127}([a-zA-Z0-9-]|#{1,3})$/,
    message: i18n.t('validator.certName'),
  },
  idCard: {
    regexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message: i18n.t('validator.idCard'),
  },
  postCode: {
    regexp: /^[1-9][0-9]{5}$/,
    message: i18n.t('validator.postCode'),
  },
  domainName: {
    regexp: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*/,
    message: i18n.t('validator.domain'),
  },
  bucketName: {
    func: value => {
      if (!value) return false
      if (value.length < 4 || value.length > 64) return false
      const regexp = /^([a-z]+(\.|-|_|:|[a-z]|\d)*)$/
      if (regexp.test(value)) {
        return true
      }
      return false
    },
    message: i18n.t('validator.bucketName'),
  },
  k8sLabel: {
    regexp: /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/,
    message: i18n.t('validator.k8sLabel'),
  },
  k8sName: {
    regexp: /^[a-z]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
    message: i18n.t('validator.k8sName'),
  },
  domainAccount: {
    regexp: /^[a-z][a-z0-9]{5,}/,
    message: i18n.t('validator.domainAccount'),
  },
  domainPassword: {
    regexp: /[a-zA-Z0-9_@#]{6,64}/,
    message: i18n.t('validator.domainPassword'),
  },
  dnsName: {
    regexp: /^([a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62}){1}(\.[a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62})*[\._]?$/,
    message: i18n.t('validator.dnsName'),
  },
  tagName: {
    func: value => {
      if (R.is(Object, value) && Object.keys(value).length > 20) {
        return false
      }
      return true
    },
    message: i18n.t('common_732'),
  },
}

/**
 * @description 是否为必填参数
 * @param {Boolean} isObj: 是否是验证对象，vue-ant-design 里面的 form 的对象格式为 { key: '', value: '' }
 * @return {Function} validator: vue-ant-design 要求的自定义规则校验函数
 */
export const isRequired = (isObj = true, valueKey = 'key') => {
  return function (rule, value, callback) {
    if (isObj && R.is(Object, value)) {
      if (value[valueKey]) {
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
  const sensitives = ['Huawei@', 'huawei@', 'Admin@', 'admin@', 'Root@', 'root@', 'ABC@', 'abc@', 'ABCD@', 'abcd@', 'Huawei123@', 'huawei123@', 'Admin123@', 'admin123@', 'Root123@', 'root123@', 'Huawei#', 'huawei#', 'Admin#', 'admin#', 'Root#', 'root#', 'ABC#', 'abc#', 'ABCD#', 'abcd#', 'Huawei123#', 'huawei123#', 'Admin123#', 'admin123#', 'Root123#', 'root123#，Huawei!', 'huawei!', 'Admin!', 'admin!', 'Root!', 'root!', 'ABC!', 'abc!', 'ABCD!', 'abcd!', 'Huawei123!', 'huawei123!', 'Admin123!', 'admin123!', 'Root123!', 'root123!', 'ABC123!', 'abc123!', 'Huawei@123', 'huawei@123', 'Admin@123', 'admin@123', 'Root@123', 'root@123', 'ABC@123', 'abc@123', '123@Huawei', '123@Root', '123@abc', 'Huawei123', 'huawei123', 'Admin123', 'admin123', 'Root123', 'root123', 'abc123', 'Huawei_123', 'huawei_123', 'Admin_123', 'admin_123', 'Root_123', 'root_123', 'ABC_123', 'abc_123', '123abc', '123abcd', '1234abc', '1234abcd', 'abcd123', 'abc1234', 'abcd1234', 'abcd@1234', 'abcd1234!', 'abcd_1234', 'a123456', '123.com', '123@com', '123_com', 'Huawei!@#', 'huawei!@#', 'Admin!@#', 'admin!@#', 'Root!@#', 'root!@#', 'Huawei!@', 'huawei!@', 'Admin!@', 'admin!@', 'Root!@', 'root!@', 'Huaweiroot', 'HuaweiRoot', 'huaweiroot', 'huaweiRoot', 'Huaweiadmin', 'HuaweiAdmin', 'huaweiadmin', 'huaweiAdmin', 'Adminroot', 'AdminRoot', 'adminRoot', 'adminroot', 'Rootadmin', 'RootAdmin', 'rootAdmin', 'rootadmin', 'Rootroot', 'RootRoot', 'rootroot', 'Administrator', 'Password', 'Password123', 'Password@123', 'Password_123', 'Password123!', 'DDM@123', 'ddM@123', 'dDm@123']
  const sensitiveValidator = () => {
    if (sensitives.indexOf(value) > -1) {
      _callback(new Error(i18n.t('validator.passwordValidator', [value])))
      return false
    }
    return true
  }
  if (ALL_DIGITS.test(value) && ALL_LETTERS.test(value) && ALL_UPPERS.test(value) && spec && value.charAt(0) !== '/' && value.length >= 12 && value.length <= 30) {
    if (sensitiveValidator()) {
      _callback()
    }
  } else {
    // callback(new Error('8~30个字符，密码中有一个数字、大写字母、小写字母、特殊符号 ~`!@#$%^&*()-_=+[]{}|:\':\\",./<>?中至少一个'))
    _callback(new Error(i18n.t('validator.sshPassword')))
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
    let msg = i18n.t('validator.validateForm')
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
    let msg = validateItem.message || i18n.t('validator.validateForm')
    let result = true
    if (validateItem.regexp) {
      result = validateItem.regexp.test(value)
    }
    if (result && validateItem.func) {
      result = validateItem.func(value) // 支持自定义函数判断
      if (R.is(String, result)) {
        msg = result
        result = false
      }
    }
    if (!result) {
      return {
        result,
        msg,
      }
    }
    return true
  } else {
    console.error(i18n.t('validate', [regexpItem]))
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
  if (!lowerBound || !upperBound) return false // 没有起始IP或结束IP
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

/**
 * @description 校验yaml格式是否正确
 * @param {String} content
 * @param {Object} opts
*/
export const validateYaml = (content, opts) => {
  const DEFAULT_LINT_OPTION = {
    schema: 'DEFAULT_SAFE_SCHEMA',
  }
  const options = merge({}, DEFAULT_LINT_OPTION, opts)
  return new Promise((resolve, reject) => {
    try {
      yaml.safeLoad(content, {
        schema: yaml[options.schema],
      })
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 检测资源是否被锁定
 * @param {*} value
 */
export const isValidateResourceLock = (value = {}, callback) => {
  const ret = { validate: true, tooltip: null }
  if (Array.isArray(value)) {
    const someResLock = value.some(item => item.freezed)
    if (someResLock) {
      ret.validate = false
      ret.tooltip = i18n.t('common.res_lock_tip')
    }
  } else {
    if (value.freezed) {
      ret.validate = false
      ret.tooltip = i18n.t('common.res_lock_tip')
    }
  }
  if (ret.validate) {
    return (callback && callback()) || ret
  }
  return ret
}

export default validateForm
