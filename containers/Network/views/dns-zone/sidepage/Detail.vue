<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    resource="dns_zones"
    statusModule="dnszone"
    :hidden-keys="['status']"
    :nameProps="{edit: false}" />
</template>

<script>
import {
  getZoneTypeTableColumns,
} from '../utils/columns'

export default {
  name: 'DnsZoneDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'custom_status',
          title: this.$t('common.status') + ' ',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  <div class="d-flex align-items-center">
                    <status status={row.status} statusModule={'dnszone'}>
                      {
                        row.status === 'pending' ? <a-popover slot="icon">
                          <template slot="content">
                            {row.registrar ? <div class="d-flex"><span style="flex: 0 0 150px">{this.$t('network.dnszone.registrar')}:</span><span>{row.registrar}<copy class="ml-1" message={row.registrar} /></span></div> : null}
                            {row.name_servers && row.name_servers.length > 0
                              ? <div class="d-flex">
                                <span style="flex: 0 0 150px">{this.$t('network.dnszone.add_name_servers')}:</span>
                                <span style="flex: 1">
                                  {row.name_servers.map((server, index) => (
                                    <div key={index}>
                                      {server}<copy class="ml-1" message={server} />
                                    </div>
                                  ))}
                                </span>
                              </div>
                              : null}
                            {row.original_name_servers && row.original_name_servers.length > 0
                              ? <div class="d-flex">
                                <span style="flex: 0 0 150px">{this.$t('network.dnszone.del_name_servers')}:</span>
                                <span style="flex: 1">
                                  {row.original_name_servers.map((server, index) => (
                                    <div key={index}>
                                      {server}<copy class="ml-1" message={server} />
                                    </div>
                                  ))}
                                </span>
                              </div>
                              : null}
                          </template>
                          <icon type="dashboard-alert-sum" class="ml-1" style={{ color: 'red' }} />
                        </a-popover> : null
                      }
                    </status>
                  </div>
                </div>,
              ]
            },
          },
          formatter: ({ row }) => {
            return this.$te(`status.dnszone.${row.status}`) ? this.$t(`status.dnszone.${row.status}`) : row.status
          },
        },
        getZoneTypeTableColumns(),
        {
          field: 'dns_record_count',
          title: this.$t('network.text_718'),
          formatter: ({ row }) => {
            return <a onClick={ () => this.$emit('tab-change', 'dns-recordset-list-for-dns-zone-sidepage') }>{row.dns_record_count}</a>
          },
        },
        {
          field: 'vpc_count',
          title: this.$t('network.text_719'),
          formatter: ({ row }) => {
            if (row.zone_type === 'PublicZone' || row.cloud_env === 'onpremise') return row.vpc_count
            return <a onClick={ () => this.$emit('tab-change', 'dns-associate-vpc-list') }>{row.vpc_count}</a>
          },
        },
      ],
    }
  },
}
</script>
