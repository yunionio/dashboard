import { CHARGE_TYPE, LB_SPEC } from '@Network/views/lb/constants'
import LbListCell from '@Network/views/lb/components/LbListCell'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  // getTimeTableColumn,
  getProjectTableColumn,
  getBrandTableColumn,
  getTagTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  components: {
    LbListCell,
  },
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        title: i18n.t('network.text_21'),
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'lb', title: i18n.t('network.text_27') }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'loadbalancer', columns: () => this.columns }),
      {
        field: 'address',
        title: i18n.t('network.text_248'),
        minWidth: 150,
        slots: {
          default: ({ row }) => {
            let text = row.address || '-'
            let weakTip = ''
            if (row.eip) {
              text = row.eip
              if (row.eip_mode === 'elastic_ip') {
                weakTip = i18n.t('network.text_304')
              } else if (row.eip_mode === 'public_ip') {
                weakTip = i18n.t('network.text_305')
              } else {
                weakTip = ''
              }
            } else {
              weakTip = row.address_type === 'intranet' ? i18n.t('network.text_306') : i18n.t('network.text_307')
            }
            return [<div>
              <list-body-cell-wrap hide-field copy field={row.eip ? 'eip' : 'address' } row={row}>
                <span style={{ color: '#53627C' }}>{ text }</span>
              </list-body-cell-wrap>
              <span class="text-color-secondary">{ weakTip }</span>
            </div>]
          },
        },
      },
      {
        field: 'loadbalancer_spec',
        title: i18n.t('network.text_249'),
        minWidth: 100,
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
      {
        field: 'vpc',
        title: 'VPC',
        minWidth: 100,
        hidden: this.$store.getters.isProjectMode,
      },
      {
        field: 'charge_type',
        title: i18n.t('network.text_192'),
        minWidth: 100,
        formatter: ({ row }) => {
          if (row.charge_type) return CHARGE_TYPE[row.charge_type] || row.charge_type
          return '-'
        },
      },
      getBrandTableColumn(),
      {
        field: 'cluster',
        title: i18n.t('network.text_19'),
        minWidth: 100,
        formatter: ({ row }) => {
          return row.cluster || '-'
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
      getRegionTableColumn({ showOverflow: false }),
      {
        field: 'account',
        title: i18n.t('network.text_196'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            const ret = []
            ret.push(
              <list-body-cell-wrap hide-field copy field='account' row={row}>
                <span style={{ color: '#0A1F44' }}>{ row.account }</span>
              </list-body-cell-wrap>,
            )
            if (row.manager) {
              ret.push(
                <list-body-cell-wrap hide-field copy field='manager' row={row}>
                  <span style={{ color: '#53627C' }}>{ row.manager }</span>
                </list-body-cell-wrap>,
              )
            }
            return ret
          },
        },
        hidden: this.$store.getters.isProjectMode,
      },
      // getTimeTableColumn(), // 列表太长先隐藏
    ]
  },
}
