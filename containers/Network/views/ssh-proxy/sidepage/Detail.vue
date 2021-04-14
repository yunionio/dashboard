<template>
  <detail
      :on-manager="onManager"
      :data="data"
      :base-info="baseInfo"
      :extra-info="extraInfo" />
</template>

<script>
export default {
  name: 'SshProxyDetail',
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
        {
          field: 'intranet_ip_addr',
          title: this.$t('network.ssh-proxy.intranet_ip_addr'),
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              return [<div>
                <list-body-cell-wrap hide-field copy field='intranet_ip_addr' row={row}>
                  <span style={{ color: '#53627C' }}>{ row.intranet_ip_addr || '-' }</span>
                </list-body-cell-wrap>
              </div>]
            },
          },
        },
        {
          field: 'host',
          title: this.$t('network.ssh-proxy.host'),
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              return [<div>
                <list-body-cell-wrap hide-field copy field='host' row={row}>
                  <span style={{ color: '#53627C' }}>{ row.host || '-' }</span>
                </list-body-cell-wrap>
              </div>]
            },
          },
        },
        { field: 'port', title: this.$t('network.ssh-proxy.port') },
      ],
      extraInfo: [],
    }
  },
}
</script>
