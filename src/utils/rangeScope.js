import { arrayToObj } from '@/utils/utils'

export function getRangeScopeOptions (subscriptionScope) {
  const domainLabel = subscriptionScope === 'domain' ? this.$t('common.rangescope.domain.all') : this.$t('common.rangescope.domain')
  const projectLabel = subscriptionScope === 'project' ? this.$t('common.rangescope.project.all') : this.$t('common.rangescope.project')
  const options = [
    { label: this.$t('common.rangescope.system'), value: 'system', scope: ['system'] },
    { label: this.$t('common.rangescope.any_domain'), value: 'any_domain', scope: ['system'] },
    { label: domainLabel, value: 'domain', scope: ['system', 'domain'] },
    { label: this.$t('common.rangescope.any_project'), value: 'any_project', scope: ['system', 'domain'] },
    { label: this.$t('common.rangescope.any_project_in_domain'), value: 'any_project_in_domain', scope: ['system'] },
    { label: projectLabel, value: 'project', scope: ['system', 'domain', 'project'] },
  ]
  return options
}

export function getRangeScopeOptionMap (subscriptionScope) {
  const options = getRangeScopeOptions.call(this, subscriptionScope)
  return arrayToObj(options, 'value')
}
