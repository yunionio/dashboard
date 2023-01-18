import { arrayToObj } from '@/utils/utils'
import store from '@/store'

export function getRangeScopeOptions (subscriptionScope) {
  const scope = store.getters.scope
  const domainLabel = [subscriptionScope, scope].every(item => item === 'domain') ? this.$t('common.rangescope.domain.all') : this.$t('common.rangescope.domain')
  const projectLabel = [subscriptionScope, scope].every(item => item === 'project') ? this.$t('common.rangescope.project.all') : this.$t('common.rangescope.project')
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
