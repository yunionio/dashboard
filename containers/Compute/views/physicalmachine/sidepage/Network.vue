<template>
  <div>
    <h5>{{ $t('compute.text_600') }}</h5>
    <vxe-grid resizable class="mb-2" :data="nicInfo" :columns="columns" />
    <h5>BMC{{ this.$t('compute.text_600') }}</h5>
    <vxe-grid resizable class="mb-2" :data="ipmiList" :columns="columns" />
  </div>
</template>

<script>
import _ from 'lodash'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NetworkList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    hostInfo: {
      type: Object,
      required: true,
    },
  },
  data () {
    const cols = [
      /*
      {
        field: 'index',
        title: this.$t('compute.text_375'),
        formatter: ({ row }) => {
          return row.index
        },
      },
      */
      getCopyWithContentTableColumn({ field: 'mac', width: 200, title: this.$t('compute.text_385') }),
      {
        field: 'nic_type',
        title: this.$t('compute.text_860'),
        width: 100,
        formatter: ({ row }) => {
          if (row.nic_type === 'admin') {
            return this.$t('compute.text_861')
          } else if (row.nic_type === 'ipmi') {
            return this.$t('compute.text_862')
          } else {
            return '-'
          }
        },
      },
      {
        field: 'ip_addr',
        title: this.$t('compute.text_386'),
        width: 160,
        slots: {
          default: ({ row }, h) => {
            const ret = []
            if (row.ip_addr) {
              ret.push(
                <list-body-cell-wrap copy hideField={true} field='ip_addr' row={row} message={row.ip_addr}>
                  {row.ip_addr}/{row.masklen}
                </list-body-cell-wrap>,
              )
            }
            if (row.ip6_addr) {
              ret.push(
                <list-body-cell-wrap copy hideField={true} field='ip6_addr' row={row} message={row.ip6_addr}>
                  {row.ip6_addr}/{row.masklen6}
                </list-body-cell-wrap>,
              )
            }
            return ret
          },
        },
      },
      getCopyWithContentTableColumn({
        field: 'net',
        title: this.$t('compute.text_106'),
        hideField: true,
        slotCallback: row => {
          if (!row.net) return '-'
          return [
            <side-page-trigger permission='networks_get' name='NetworkSidePage' id={row.net_id} vm={this}>{ row.net }</side-page-trigger>,
          ]
        },
      }),
      getCopyWithContentTableColumn({
        field: 'wire',
        title: this.$t('compute.text_844'),
        hideField: true,
        slotCallback: row => {
          if (!row.wire) return '-'
          return [
            <side-page-trigger permission='wires_get' name='WireSidePage' id={row.wire_id} vm={this}>{ row.wire }</side-page-trigger>,
          ]
        },
      }),
      getCopyWithContentTableColumn({ field: 'link_up', title: this.$t('compute.netif_linkup_status') }),
    ]
    if (this.hostInfo.host_type === 'baremetal') {
      cols.push({
        field: 'action',
        title: this.$t('compute.text_863'),
        slots: {
          default: ({ row }, h) => {
            const ret = []
            ret.push(
              <a-button type="link" onClick = {() => this.setWire(row)} disabled={ !!row.ip_addr || !!row.ip6_addr }>{ this.$t('compute.text_843') }</a-button>,
            )
            return ret
          },
        },
      })
    }
    return {
      list: this.$list.createList(this, {
        id: 'NetworkListForPhysicalmachineSidePage',
        resource: 'networks',
        ctx: [['hosts', this.resId]],
        getParams: this.getParams,
      }),
      columns: cols,
    }
  },
  computed: {
    nicList () {
      return (this.hostInfo.nic_info || []).filter((o) => {
        return o.nic_type !== 'ipmi'
      })
    },
    ipmiList () {
      return (this.hostInfo.nic_info || []).filter((o) => {
        return o.nic_type === 'ipmi'
      })
    },
    nicInfo () {
      return _.sortBy(this.nicList, [
        (o) => {
          return o.mac
        },
      ])
    },
  },
  methods: {
    setWire (obj) {
      obj = {
        ...obj,
        hostId: this.hostInfo.id,
      }
      this.createDialog('HostSetWireDialog', {
        data: [obj],
        columns: this.columns,
        list: this.list,
        callback: () => {
          setTimeout(() => {
            this.$bus.$emit('refresh-detail')
          }, 1000)
        },
      })
    },
  },
}
</script>
