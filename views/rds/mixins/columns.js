import { DBINSTANCE_CATEGORY } from '../constants/index.js'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'

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
          { validator: this.$validate('serverCreateName') },
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
      {
        field: 'billing_type',
        title: '计费方式',
        width: 100,
        slots: {
          default: ({ row }) => {
            const ret = []
            if (row.billing_type === 'postpaid') {
              ret.push(<div style={{ color: '#0A1F44' }}>按量付费</div>)
            } else if (row.billing_type === 'prepaid') {
              ret.push(<div style={{ color: '#0A1F44' }}>包年包月</div>)
            }
            if (row.expired_at) {
              let dateArr = this.$moment(row.expired_at).fromNow().split(' ')
              let date = dateArr.join('')
              let seconds = this.$moment(row.expired_at).diff(new Date()) / 1000
              let textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
              let text = seconds < 0 ? '已过期' : `${date.substring(0, date.length - 1)}后到期`
              ret.push(<div style={{ color: textColor }}>{text}</div>)
            }
            return ret
          },
        },
      },
      getStatusTableColumn({ statusModule: 'rds' }),
      getProjectTableColumn(),
      getBrandTableColumn(),
      getRegionTableColumn(),
    ]
  },
}
