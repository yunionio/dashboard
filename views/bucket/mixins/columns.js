import AccessInfo from '../components/AccessInfo'
import { ACL_TYPE } from '@Storage/constants/index.js'
import { getNameDescriptionTableColumn, getStatusTableColumn, getBrandTableColumn, getRegionTableColumn, getAccountTableColumn, getProjectTableColumn, getPublicScopeTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('storage.text_56') },
          { validator: this.$validate('bucketName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name_cn ? `${row.name}(${row.name_cn})` : row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'bucket', columns: () => this.columns, tipName: this.$t('dictionary.bucket') }),
      getStatusTableColumn({ statusModule: 'bucket' }),
      {
        field: 'storage_class',
        title: i18n.t('storage.text_38'),
        width: 120,
        formatter: ({ row }) => {
          return row.storage_class || '-'
        },
      },
      {
        field: 'acl',
        title: i18n.t('storage.text_93'),
        width: 120,
        formatter: ({ row }) => {
          return ACL_TYPE[row.acl] || row.acl || '-'
        },
      },
      {
        field: 'access-info',
        title: i18n.t('storage.text_91'),
        width: 120,
        slots: {
          default: ({ row }) => {
            return [
              <AccessInfo row={row} />,
            ]
          },
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'buckets' }),
      getRegionTableColumn(),
      getProjectTableColumn(),
    ]
  },
}
