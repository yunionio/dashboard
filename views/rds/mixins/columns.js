import { DBINSTANCE_CATEGORY } from '../constants/index.js'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn, getBillingTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        addBackup: true,
        formRules: [
          { required: true, message: i18n.t('db.text_136') },
          { validator: this.$validate('resourceCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'rds' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'dbinstance', columns: () => this.columns }),
      {
        field: 'category',
        title: i18n.t('db.text_61'),
        width: 100,
        slots: {
          default: ({ row }) => {
            return DBINSTANCE_CATEGORY[row.category]
          },
        },
      },
      {
        field: 'vcpu_count',
        title: i18n.t('db.text_109'),
        width: 120,
        slots: {
          default: ({ row }) => {
            if (row.brand.toLowerCase() === 'qcloud') return i18n.t('db.text_349', [row.vcpu_count, sizestr(row.vmem_size_mb, 'M', 1024), row.disk_size_gb])
            return i18n.t('db.text_151', [row.vcpu_count, sizestr(row.vmem_size_mb, 'M', 1024)])
          },
        },
      },
      {
        field: 'engine',
        title: i18n.t('db.text_57'),
        width: 100,
        slots: {
          default: ({ row }) => {
            return `${row.engine} ${row.engine_version}`
          },
        },
      },
      {
        field: 'internal_connection_str',
        title: i18n.t('db.text_152'),
        minWidth: 200,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            const pri = row.internal_connection_str
            const pub = row.connection_str
            if (!pri && !pub) {
              return '-'
            }
            const connection = (title, value) => {
              if (!value) {
                return null
              }
              return (
                <div class="d-flex align-items-center">
                  <span class="text-truncate">
                    {title}：{value}
                  </span>
                  <copy message={value} />
                </div>
              )
            }
            return [
              connection(i18n.t('db.text_153'), pri),
              connection(i18n.t('db.text_154'), pub),
            ]
          },
        },
      },
      {
        title: i18n.t('db.text_64'),
        field: 'port',
        width: 120,
        slots: {
          default: ({ row }) => row.port || '-',
        },
      },
      getBillingTableColumn({ vm: this }),
      getBrandTableColumn(),
      {
        field: 'account',
        minWidth: 100,
        title: i18n.t('db.text_67'),
      },
      getProjectTableColumn(),
      {
        field: 'region',
        minWidth: 120,
        showOverflow: 'ellipsis',
        title: i18n.t('db.text_40'),
        slots: {
          default: ({ row }, h) => {
            const ret = []
            ret.push(
              <list-body-cell-wrap hide-field copy field={'region'} row={row}>
                <span style={{ color: '#0A1F44' }}>{ row.region }</span>
              </list-body-cell-wrap>,
            )
            if (row.zone1_name) {
              ret.push(
                <list-body-cell-wrap hide-field copy field="zone1_name" row={row}>
                  <span style={{ color: '#53627C' }}>{ row.zone1_name }</span>
                </list-body-cell-wrap>,
              )
            }
            return ret
          },
        },
      },
    ]
  },
}
