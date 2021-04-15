import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export const getRwAccessTypeColumn = ({
  field = 'rw_access_type',
  title = i18n.t('storage.access.group.rule.rw.access_type'),
} = {}) => {
  return {
    field,
    title,
    formatter: ({ row }) => {
      switch (row.rw_access_type) {
        case 'RW':
          return i18n.t('storage.access.group.rule.rw.access_type.rw')
        case 'R':
          return i18n.t('storage.access.group.rule.rw.access_type.r')
        default:
          return row.rw_access_type
      }
    },
  }
}

export const getUserAccessTypeColumn = ({
  field = 'user_access_type',
  title = i18n.t('storage.access.group.rule.user.access_type'),
} = {}) => {
  return {
    field,
    title,
    formatter: ({ row }) => {
      switch (row.user_access_type) {
        case 'no_root_squash':
          return i18n.t('storage.access.group.rule.user.access_type.no_root_squash')
        case 'root_squash':
          return i18n.t('storage.access.group.rule.user.access_type.root_squash')
        case 'all_squash':
          return i18n.t('storage.access.group.rule.user.access_type.all_squash')
        default:
          return row.user_access_type
      }
    },
  }
}

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'accessGroup' }),
      getPublicScopeTableColumn({ vm: this, resource: 'access_groups' }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
