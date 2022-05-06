import { DBINSTANCE_CATEGORY } from '../constants/index.js'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn, getBillingTableColumn, getTagTableColumn, getAccountTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'rds_dbinstances', columns: () => this.columns }),
      {
        field: 'category',
        title: i18n.t('db.text_61'),
        width: 100,
        slots: {
          default: ({ row }) => {
            return DBINSTANCE_CATEGORY[row.category] || row.category || '-'
          },
        },
      },
      {
        field: 'vcpu_count',
        title: i18n.t('db.text_109'),
        width: 120,
        slots: {
          default: ({ row }) => {
            if (!row.brand) return '-'
            if (row.brand.toLowerCase() === 'qcloud') return i18n.t('db.text_349', [row.vcpu_count, sizestr(row.vmem_size_mb, 'M', 1024), row.disk_size_gb])
            if (row.brand.toLowerCase() === 'azure') {
              if (row.metadata && row.metadata['sys:DTU']) {
                return row.metadata['sys:DTU'] + 'DTU'
              }
            }
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
        slots: {
          default: ({ row }) => {
            const pri = row.internal_connection_str
            const pub = row.connection_str
            const ip_addrs = (row.ip_addrs || '').split(',')
            if (!pri && !pub) {
              return '-'
            }
            const connection = (title, value) => {
              if (!value) {
                return null
              }
              // return (
              //   <div class="d-flex align-items-center">
              //     <span class="text-truncate">
              //       {title}：{value}
              //     </span>
              //     <copy message={value} />
              //   </div>
              // )
              return [
                <list-body-cell-wrap hide-field copy message={value}>
                  {title} : <span>{ value || '-' }</span>
                </list-body-cell-wrap>,
              ]
            }
            return [
              connection(i18n.t('db.text_153'), pri),
              connection(i18n.t('db.text_154'), pub),
              ...ip_addrs.map(ip => {
                return (<list-body-cell-wrap hide-field copy message={ip}><span>{ip}</span></list-body-cell-wrap>)
              }),
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
      getAccountTableColumn(),
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
      getTimeTableColumn(),
    ]
  },
}
