import { getAccessUrlTableColumn, getAccountTableColumn } from '../utils/columns'
import {
  getCopyWithContentTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export const getResource = (row) => {
  if (row.accounts?.length > 0) {
    return 'cloudaccounts'
  }
  if (row.managers?.length > 0) {
    return 'cloudproviders'
  }
  return ''
}

export const getColumns = (row) => {
  if (row.accounts?.length > 0) {
    return [
      getCopyWithContentTableColumn({
        field: 'id',
        title: 'ID',
        minWidth: 140,
      }),
      getCopyWithContentTableColumn({
        field: 'name',
        title: i18n.t('cloudenv.text_95'),
      }),
      getAccessUrlTableColumn(),
      getBrandTableColumn(),
    ]
  }
  if (row.managers?.length > 0) {
    return [
      getCopyWithContentTableColumn({
        field: 'id',
        title: 'ID',
        minWidth: 140,
      }),
      getCopyWithContentTableColumn({
        field: 'name',
        title: i18n.t('cloudenv.text_95'),
      }),
      getBrandTableColumn(),
      getAccountTableColumn(),
    ]
  }
  return []
}
