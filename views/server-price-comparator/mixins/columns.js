import { serverTypeMap } from '../constants'
import {
  getRegionTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import { BUY_DURATIONS_OPTIONS } from '@Compute/constants'

export default {
  created () {
    const columns = [
      {
        field: 'type',
        title: i18n.t('table.title.obj_type'),
        minWidth: 50,
        slots: {
          default: ({ row }) => {
            return serverTypeMap[row.type]
          },
        },
      },
      {
        field: 'instance_type',
        title: i18n.t('table.title.flavor'),
        showOverflow: 'ellipsis',
        minWidth: 120,
        sortable: true,
        slots: {
          default: ({ row }) => {
            const ret = []
            if (row.instance_type) {
              ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
            }
            const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
            return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
          },
        },
      },
      getBrandTableColumn(),
      getRegionTableColumn(),
      {
        field: 'billing_type',
        title: '计费模式',
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            const ret = []
            if (row.billing_type === 'postpaid') {
              ret.push(<div style={{ color: '#0A1F44' }}>{i18n.t('billingType.postpaid')}</div>)
            } else if (row.billing_type === 'prepaid') {
              ret.push(<div style={{ color: '#0A1F44' }}>{i18n.t('billingType.prepaid')}</div>)
            }
            return ret
          },
        },
      },
      {
        field: 'count',
        title: '购买数量',
        minWidth: 50,
        slots: {
          default: ({ row }) => {
            return `${row.count}${this.$t('common_62')}`
          },
        },
      },
      {
        field: 'duration',
        title: '购买时长',
        minWidth: 50,
        slots: {
          default: ({ row }) => {
            const curObj = BUY_DURATIONS_OPTIONS.find(v => v.value === row.duration)
            return curObj?.label || '1小时'
          },
        },
      },
      {
        field: 'fee',
        title: '费用估算',
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            return [
              <div style={{ color: '#f5222d', fontSize: '14px' }}>{ row.fee }</div>,
            ]
          },
        },
      },
    ]
    if (this.hideColumnFields) {
      this.columns = columns.filter((column) => { return !this.hideColumnFields.includes(column.field) })
    } else {
      this.columns = columns
    }
  },
}
