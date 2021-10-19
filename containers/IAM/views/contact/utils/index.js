import i18n from '@/locales'

export const getNote = (note) => {
  let _note = ''
  switch (note) {
    case 'no such mobile':
      _note = i18n.t('system.no_such_mobile')
      break
    case 'service exceptions':
      _note = i18n.t('system.service_exceptions')
      break
    case 'incomplete config':
      _note = i18n.t('system.incomplete_config')
      break
    case 'mobile changed, re-verify':
      _note = i18n.t('system.mobile_changed_re_verify')
      break
    default:
      _note = i18n.t('scope.text_957')
      break
  }
  return _note
}
