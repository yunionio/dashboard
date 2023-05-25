import { arrayToObj } from '@/utils/utils'
import store from '@/store'
import i18n from '@/locales'

function getDomainLabel (scope, subscriptionScope) {
  if (scope === 'domain') {
    return i18n.t('common.rangescope.domain.all')
  } else {
    return i18n.t('common.rangescope.domain')
  }
}

function getProjectLabel (scope, subscriptionScope) {
  if (scope === 'project') {
    return i18n.t('common.rangescope.project.all')
  } else {
    return i18n.t('common.rangescope.project')
  }
}

export function getRangeScopeOptions (subscriptionScope) {
  const scope = store.getters.scope
  const domainLabel = getDomainLabel(scope, subscriptionScope)
  const projectLabel = getProjectLabel(scope, subscriptionScope)
  const options = [
    { label: this.$t('common.rangescope.system'), value: 'system', scope: ['system'] },
    { label: this.$t('common.rangescope.any_domain'), value: 'any_domain', scope: ['system'] },
    { label: domainLabel, value: 'domain', scope: ['system', 'domain'] },
    { label: this.$t('common.rangescope.any_project'), value: 'any_project', scope: ['system'] },
    { label: this.$t('common.rangescope.any_project_in_domain'), value: 'any_project_in_domain', scope: ['system', 'domain'] },
    { label: projectLabel, value: 'project', scope: ['system', 'domain', 'project'] },
  ]
  return options
}

export function getRangeScopeOptionMap (subscriptionScope) {
  const options = getRangeScopeOptions.call(this, subscriptionScope)
  return arrayToObj(options, 'value')
}
