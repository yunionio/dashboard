import i18n from '@/locales'
const _ = require('lodash')
const regItems = /(\[\d+\])/g
const regProperties = /(\.)/g

function formatPath (path) {
  path = path.replace(regProperties, '.properties$1')
  path = path.replace(regItems, '.items$1')

  return path.substr(1)
}

export default function localize (errors = [], schema) {
  if (!errors.length) {
    return
  }

  for (let i = 0; i < errors.length; i++) {
    const e = errors[i]
    let out
    let n
    let cond
    let title
    let path = e.dataPath

    if (e.keyword === 'required') {
      path += '.' + e.params.missingProperty
      const s = _.get(schema, formatPath(path))
      title = s ? s.title : ''
    }

    if (e.keyword === 'errorMessage' && e.params.errors[0].keyword === 'required') {
      const er = e.params.errors[0]
      path += '.' + er.params.missingProperty
      const s = _.get(schema, formatPath(path))
      title = s ? s.title : ''
    }

    e.path = path.substr(1).replace(/\//g, '.')
    switch (e.keyword) {
      case '$ref':
        out = i18n.t('common_19') + (e.params.ref)
        break
      case 'additionalItems':
        out = ''
        n = e.params.limit
        out += i18n.t('common_20', [n])
        break
      case 'additionalProperties':
        out = i18n.t('common_22')
        break
      case 'anyOf':
        out = i18n.t('common_23')
        break
      case 'const':
        out = i18n.t('common_24')
        break
      case 'contains':
        out = i18n.t('common_25')
        break
      case 'custom':
        out = i18n.t('common_26', [e.keyword])
        break
      case 'dependencies':
        out = ''
        n = e.params.depsCount
        out += i18n.t('common_28') + (e.params.property) + i18n.t('common_29') + (e.params.deps)
        break
      case 'enum':
        out = i18n.t('common_30')
        break
      case 'exclusiveMaximum':
        out = ''
        cond = e.params.comparison + ' ' + e.params.limit
        out += i18n.t('common_31') + (cond)
        break
      case 'exclusiveMinimum':
        out = ''
        cond = e.params.comparison + ' ' + e.params.limit
        out += i18n.t('common_31') + (cond)
        break
      case 'false schema':
        out = i18n.t('common_32')
        break
      case 'format':
        out = i18n.t('common_33') + (e.params.format)
        break
      case 'formatExclusiveMaximum':
        out = i18n.t('common_34')
        break
      case 'formatExclusiveMinimum':
        out = i18n.t('common_35')
        break
      case 'formatMaximum':
        out = ''
        cond = e.params.comparison + ' ' + e.params.limit
        out += i18n.t('common_36') + (cond)
        break
      case 'formatMinimum':
        out = ''
        cond = e.params.comparison + ' ' + e.params.limit
        out += i18n.t('common_36') + (cond)
        break
      case 'if':
        out = i18n.t('common_37') + (e.params.failingKeyword)
        break
      case 'maximum':
        out = ''
        cond = e.params.comparison + ' ' + e.params.limit
        out += i18n.t('common_31') + (cond)
        break
      case 'maxItems':
        out = ''
        n = e.params.limit
        out += i18n.t('common_38') + (n) + i18n.t('common_39')
        break
      case 'maxLength':
        out = ''
        n = e.params.limit
        out += i18n.t('common_38') + (n) + i18n.t('common_40')
        break
      case 'maxProperties':
        out = ''
        n = e.params.limit
        out += i18n.t('common_41') + (n) + i18n.t('common_42')
        break
      case 'minimum':
        out = ''
        cond = e.params.comparison + ' ' + e.params.limit
        out += i18n.t('common_31') + (cond)
        break
      case 'minItems':
        out = ''
        n = e.params.limit
        out += i18n.t('common_43') + (n) + i18n.t('common_39')
        break
      case 'minLength':
        out = ''
        n = e.params.limit
        out += i18n.t('common_43') + (n) + i18n.t('common_40')
        break
      case 'minProperties':
        out = ''
        n = e.params.limit
        out += i18n.t('common_44') + (n) + i18n.t('common_42')
        break
      case 'multipleOf':
        out = i18n.t('common_36') + (e.params.multipleOf) + i18n.t('common_45')
        break
      case 'not':
        out = i18n.t('common_46') + 'not schema'
        break
      case 'oneOf':
        out = i18n.t('common_47') + 'oneOf' + i18n.t('common_48')
        break
      case 'pattern':
        out = i18n.t('common_37') + e.params.pattern
        break
      case 'patternRequired':
        out = i18n.t('common_49') + (e.params.missingPattern)
        break
      case 'propertyNames':
        out = i18n.t('common_50') + e.params.propertyName + i18n.t('common_51')
        break
      case 'required':
        out = i18n.t('common_52', [title || e.params.missingProperty])
        break
      case 'switch':
        out = i18n.t('common_53') + (e.params.caseIndex) + i18n.t('common_54') + 'switch' + i18n.t('common_55')
        break
      case 'type':
        out = i18n.t('common_36') + (e.params.type) + i18n.t('common_56')
        break
      case 'uniqueItems':
        out = i18n.t('common_57') + (e.params.j) + i18n.t('common_58') + (e.params.i) + i18n.t('common_59')
        break
      default:
        continue
    }

    e.message = out
  }
}
