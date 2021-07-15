<template>
  <detail
    :on-manager="onManager"
    :data="data"
    statusModule="lb"
    resource="lbs"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { LB_SPEC, CHARGE_TYPE } from '@Network/views/lb/constants'
import { getBrandTableColumn, getCopyWithContentTableColumn, getZone1TableColumn, getSwitchTableColumn } from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  // getExtTagColumn,
} from '@/utils/common/detailColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LbDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'loadbalancer', columns: () => this.columns }),
        // getExtTagColumn({ onManager: this.onManager, resource: 'loadbalancer', columns: () => this.columns }),
        {
          field: 'loadbalance_type',
          title: this.$t('network.text_268'),
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
          field: 'cluster',
          title: this.$t('network.text_19'),
          formatter: ({ row }) => {
            return row.cluster || '-'
          },
        },
        getBrandTableColumn(),
        getCopyWithContentTableColumn({
          field: 'region',
          title: this.$t('network.text_199'),
          hideField: true,
          slotCallback: row => {
            if (!row.region) return '-'
            return [
              <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.region_id} vm={this}>{ row.region }</side-page-trigger>,
            ]
          },
        }),
        {
          field: 'zone',
          title: this.$t('network.text_199'),
          slots: {
            default: ({ row }) => {
              if (row.zone_1) {
                const ret = [<div>{ row.zone }({this.$t('db.text_165')})</div>]
                ret.push(
                  <div>
                    {row.zone_1_name}({this.$t('db.text_164')})
                  </div>,
                )
                return ret
              }
              return row.zone || '-'
            },
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('network.text_308'),
          items: [
            getZone1TableColumn(),
            {
              field: 'address',
              title: this.$t('network.text_248'),
              slots: {
                default: ({ row }) => {
                  const ret = []
                  if (row.eip) {
                    let weakTip = ''
                    if (row.eip_mode === 'elastic_ip') {
                      weakTip = this.$t('network.text_304')
                    } else if (row.eip_mode === 'public_ip') {
                      weakTip = this.$t('network.text_305')
                    }
                    ret.push(<div>
                      <span>{row.eip}</span>
                      <span className="text-color-secondary">{weakTip}</span>
                      <copy message={row.eip}/>
                    </div>)
                  }

                  if (ret.length === 0 || (ret.length > 0 && row.address_type === 'intranet' && !!row.address)) {
                    ret.push(<div>
                      <span>{row.address || '-'}</span>
                      <span className="text-color-secondary">{row.address_type === 'intranet' ? this.$t('network.text_306') : this.$t('network.text_307')}</span>
                      <copy message={row.address}/>
                    </div>)
                  }

                  return ret
                },
              },
            },
            getCopyWithContentTableColumn({
              field: 'vpc',
              title: 'VPC',
              hideField: true,
              slotCallback: row => {
                if (!row.vpc) return '-'
                return [
                  <side-page-trigger permission='vpcs_get' name='VpcSidePage' id={row.vpc_id} vm={this}>{ row.vpc }</side-page-trigger>,
                ]
              },
              hidden: this.$store.getters.isProjectMode,
            }),
            getCopyWithContentTableColumn({
              field: 'network',
              title: this.$t('network.text_565'),
              hideField: true,
              slotCallback: row => {
                if (!row.network) return '-'
                return [
                  <side-page-trigger permission='networks_get' name='NetworkSidePage' id={row.network_id} vm={this}>{ row.network }</side-page-trigger>,
                ]
              },
              hidden: this.$store.getters.isProjectMode,
            }),
            {
              field: 'charge_type',
              title: this.$t('network.text_192_0'),
              formatter: ({ row }) => {
                if (row.charge_type) return CHARGE_TYPE[row.charge_type] || row.charge_type
                return '-'
              },
            },
          ],
        },
        {
          title: this.$t('db.text_179'),
          items: [
            getSwitchTableColumn({
              field: 'disable_delete',
              title: this.$t('common.text00076'),
              change: val => {
                this.onManager('update', {
                  id: this.data.id,
                  managerArgs: {
                    data: { disable_delete: val },
                  },
                })
              },
            }),
          ],
        },
      ],
    }
  },
}
</script>
