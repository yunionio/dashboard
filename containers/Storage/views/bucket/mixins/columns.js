// import AccessInfo from '../components/AccessInfo'
import { ACL_TYPE, STORAGE_CLASS } from '@Storage/constants/index.js'
import { getNameDescriptionTableColumn, getStatusTableColumn, getBrandTableColumn, getRegionTableColumn, getAccountTableColumn, getProjectTableColumn, getPublicScopeTableColumn, getTagTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
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
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.name')
        },
      }),
      getStatusTableColumn({
        statusModule: 'bucket',
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.status')
        },
      }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'buckets',
        columns: () => this.columns,
        tipName: this.$t('dictionary.bucket'),
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.metadata')
        },
      }),
      {
        field: 'storage_class',
        title: i18n.t('storage.text_38'),
        width: 120,
        formatter: ({ row }) => {
          return row.storage_class ? STORAGE_CLASS[row.storage_class] || row.storage_class : '-'
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.storage_class')
        },
      },
      {
        field: 'acl',
        title: i18n.t('storage.text_93'),
        width: 120,
        formatter: ({ row }) => {
          return ACL_TYPE[row.acl] || row.acl || '-'
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.acl')
        },
      },
      // {
      //   field: 'access-info',
      //   title: i18n.t('storage.text_91'),
      //   width: 120,
      //   slots: {
      //     default: ({ row }) => {
      //       return [
      //         <AccessInfo row={row} />,
      //       ]
      //     },
      //   },
      // },
      getBrandTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.brand')
        },
      }),
      getAccountTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.account')
        },
      }),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'buckets',
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.public_scope')
        },
      }),
      getProjectTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.tenant')
        },
      }),
      getRegionTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.region')
        },
      }),
      getTimeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('oss_hidden_columns.created_at')
        },
      }),
    ]
  },
}
