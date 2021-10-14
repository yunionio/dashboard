import i18n from '@/locales'
import { getNote } from './index'

export const getMobileTableColumn = () => {
  return {
    title: i18n.t('system.text_131'),
    field: 'international_mobile',
    minWidth: 120,
    formatter: ({ row }) => {
      if (row.international_mobile) {
        if (row.international_mobile.area_code && row.international_mobile.mobile) {
          return `+${row.international_mobile.area_code} ${row.international_mobile.mobile}`
        } else {
          return row.international_mobile.mobile || '-'
        }
      }

      return '-'
    },
  }
}

export const getEmailTableColumn = () => {
  return {
    title: i18n.t('system.text_146'),
    field: 'email',
    minWidth: 120,
    formatter: ({ row }) => {
      return row.email
    },
  }
}

export const getVerifiedContactTypesTableColumn = ({ field = 'verified_contact_types', title = i18n.t('common_599'), vm } = {}) => {
  return {
    title: i18n.t('common_599'),
    field: 'verified_contact_types',
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        const color = {
          true: '#52c41a',
          false: 'rgba(0, 0, 0, 0.25)',
        }
        const enabled_contact_types = row.enabled_contact_types || []
        const renderComponents = []
        enabled_contact_types.forEach((type) => {
          const item = row.verified_infos.find(obj => obj.contact_type === type)
          const enabled = item.verified
          let title = ''
          let note = getNote(item.note)
          switch (item.contact_type) {
            case 'webconsole':
              note = enabled ? note : i18n.t('system.text_576')
              title = enabled ? i18n.t('system.webconsole', [i18n.t(`status.verified.${enabled}`)]) : note
              renderComponents.push(<icon type='webconsole' onClick={() => vm.verifyConcact(item, row)} style={{ color: color[enabled] }} title={title} />)
              break
            case 'email':
              note = enabled ? note : i18n.t('system.text_576')
              title = enabled ? i18n.t('system.text_148', [i18n.t(`status.verified.${enabled}`)]) : note
              renderComponents.push(<icon class='ml-2' type='email' onClick={() => vm.verifyConcact(item, row)} style={{ color: color[enabled] }} title={title} />)
              break
            case 'mobile':
              note = enabled ? note : i18n.t('system.text_576')
              title = enabled ? i18n.t('system.text_149', [i18n.t(`status.verified.${enabled}`)]) : note
              renderComponents.push(<icon class='ml-2' type='mobile' onClick={() => vm.verifyConcact(item, row)} style={{ color: color[enabled] }} title={title} />)
              break
            case 'dingtalk':
              title = enabled ? i18n.t('system.text_150', [i18n.t(`status.verified.${enabled}`)]) : note
              renderComponents.push(<icon class='ml-2' type='dingtalk' onClick={() => vm.verifyConcact(item, row)} style={{ color: color[enabled] }} title={title} />)
              break
            case 'feishu':
              title = enabled ? i18n.t('system.text_151', [i18n.t(`status.verified.${enabled}`)]) : note
              renderComponents.push(<icon class='ml-2' type='feishu' onClick={() => vm.verifyConcact(item, row)} style={{ color: color[enabled] }} title={title} />)
              break
            case 'workwx':
              title = enabled ? i18n.t('system.wecom', [i18n.t(`status.verified.${enabled}`)]) : note
              renderComponents.push(<icon class='ml-2' type='workwx' onClick={() => vm.verifyConcact(item, row)} style={{ color: color[enabled] }} title={title} />)
              break
            default:
              break
          }
        })
        return renderComponents
      },
    },
  }
}
