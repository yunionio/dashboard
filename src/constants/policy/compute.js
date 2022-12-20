import { getPolicyOptions } from '@/utils/policy/policy-options'
import { POLICY_RES_NAME_KEY_MAP } from '@/constants/policy'
import i18n from '@/locales'

const policyOptionsMap = getPolicyOptions()

export default {
  key: 'tabMainframe',
  label: i18n.t('dictionary.compute'),
  childrens: [
    {
      key: 'mainframe',
      label: i18n.t('dictionary.compute'),
      childrens: [
        {
          key: POLICY_RES_NAME_KEY_MAP.vminstance.key,
          label: i18n.t('dictionary.server'),
          service: POLICY_RES_NAME_KEY_MAP.vminstance.service,
          resource: POLICY_RES_NAME_KEY_MAP.vminstance.resource,
          options: [
            ...policyOptionsMap[POLICY_RES_NAME_KEY_MAP.vminstance.key],
          ],
        },
      ],
    },
  ],
}
