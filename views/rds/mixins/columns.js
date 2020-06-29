import { DBINSTANCE_CATEGORY } from '../constants/index.js'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn, getBillingTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        addBackup: true,
        formRules: [
          { required: true, message: '请输入名称' },
          { validator: this.$validate('resourceCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'dbinstance', columns: () => this.columns }),
      {
        field: 'category',
        title: '类型',
        width: 100,
        slots: {
          default: ({ row }) => {
            return DBINSTANCE_CATEGORY[row.category]
          },
        },
      },
      {
        field: 'vcpu_count',
        title: '配置',
        width: 100,
        slots: {
          default: ({ row }) => {
            return `${row.vcpu_count}核 ${sizestr(row.vmem_size_mb, 'M', 1024)}`
          },
        },
      },
      {
        field: 'engine',
        title: '数据库引擎',
        width: 100,
        slots: {
          default: ({ row }) => {
            return `${row.engine} ${row.engine_version}`
          },
        },
      },
      {
        field: 'internal_connection_str',
        title: '链接地址',
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
              connection('内网', pri),
              connection('外网', pub),
            ]
          },
        },
      },
      {
        title: '数据库端口号',
        field: 'port',
        width: 100,
        slots: {
          default: ({ row }) => row.port || '-',
        },
      },
      {
        field: 'account',
        minWidth: 100,
        title: '云账号',
      },
      getBillingTableColumn({ vm: this }),
      getStatusTableColumn({ statusModule: 'rds' }),
      getProjectTableColumn(),
      getBrandTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
