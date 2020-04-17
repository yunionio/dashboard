import { CHARGE_TYPE, LB_SPEC } from '@Network/views/lb/constants'
import LbListCell from '@Network/views/lb/components/LbListCell'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  // getTimeTableColumn,
  getProjectTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

export default {
  components: {
    LbListCell,
  },
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: '名称',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'address',
        title: '服务地址',
        slots: {
          default: ({ row }) => {
            let text = row.address || '-'
            let weakTip = ''
            if (row.eip) {
              text = row.eip
              if (row.eip_mode === 'elastic_ip') {
                weakTip = '（弹性公网IP）'
              } else if (row.eip_mode === 'public_ip') {
                weakTip = '（公网ip）'
              } else {
                weakTip = ''
              }
            } else {
              weakTip = row.address_type === 'intranet' ? '（私网IP）' : '（公网IP）'
            }
            return [<div><span>{ text }</span><span class="text-color-secondary">{ weakTip }</span></div>]
          },
        },
      },
      {
        field: 'vpc',
        title: 'VPC',
      },
      getStatusTableColumn({ statusModule: 'lb' }),
      {
        field: 'charge_type',
        title: '计费方式',
        formatter: ({ row }) => {
          if (row.charge_type) return CHARGE_TYPE[row.charge_type] || row.charge_type
          return '-'
        },
      },
      {
        field: 'loadbalancer_spec',
        title: '类型',
        formatter: ({ row }) => {
          let { provider } = row
          if (provider) {
            provider = provider.toLowerCase()
            const platformList = LB_SPEC[provider]
            if (platformList) {
              const specItem = platformList.find(val => val.key === row.loadbalancer_spec)
              if (specItem) return specItem.label
            }
          }
          return row.loadbalancer_spec || '-'
        },
      },
      // {
      //   field: 'server_type',
      //   title: '端口/健康检查/后端服务器',
      //   minWidth: 300,
      //   slots: {
      //     default: ({ row }, h) => {
      //       const attrs = {
      //         props: {
      //           params: {
      //             loadbalancer: row.id,
      //             scope: this.$store.getters.scope,
      //           },
      //           type: 'lb',
      //           manager: new this.$Manager('loadbalancerlisteners', 'v2'),
      //           format: item => {
      //             const healthText = item.health_check === 'on' ? '启用' : '未启用'
      //             return `${item.listener_type}:${item.listener_port} ${healthText} ${item.backend_group || '-'}`
      //           },
      //           status: row.status,
      //         },
      //       }
      //       return [<LbListCell { ...attrs } />]
      //     },
      //   },
      // },
      getProjectTableColumn(),
      getBrandTableColumn(),
      {
        field: 'region',
        title: '区域',
      },
      {
        field: 'account',
        title: '云账号',
      },
      // getTimeTableColumn(), // 列表太长先隐藏
    ]
  },
}
