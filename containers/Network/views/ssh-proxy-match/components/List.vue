<template>
  <page-list
      :list="list"
      :columns="columns"
      :single-actions="singleActions"
      :group-actions="groupActions"
      :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SshProxyMatchList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    proxyEndpointId: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'proxy_matches',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
        extraDataFecther: {
          vpcs: async (listData, params) => {
            const vpcIds = listData.filter((row) => { if (row.match_scope === 'vpc') { return row.match_value } })
            if (vpcIds.length > 0) {
              try {
                const { data: { data = [] } } = await new this.$Manager('vpcs').list({ params: { 'filter.0': `id.in(${vpcIds.join(',')})` } })
                data.map((row) => { row.vpc = row.name })
              } catch (e) {
                throw e
              }
            }
            return {}
          },
          networks: async (listData, params) => {
            const networkIds = listData.filter((row) => { if (row.match_scope === 'network') { return row.match_value } })
            if (networkIds.length > 0) {
              try {
                const { data: { data = [] } } = await new this.$Manager('networks').list({ params: { 'filter.0': `id.in(${networkIds.join(',')})` } })
                data.map((row) => { row.network = row.name })
              } catch (e) {
                throw e
              }
            }
            return {}
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.ssh-proxy-match.link'),
          permission: 'sshproxy_match_link',
          action: () => {
            this.createDialog('SshProxyMatchLinkDialog', {
              proxy_endpoint_id: this.proxyEndpointId,
              list: this.list,
            })
          },
          meta: () => {
            const ret = {
              validate: true,
              tooltip: null,
              buttonType: 'primary',
            }
            return ret
          },
        },
        {
          label: this.$t('network.ssh-proxy-match.unlink'),
          permission: 'sshproxy_match_unlink',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('network.ssh-proxy-match.unlink'),
              name: this.$t('network.ssh-proxy.match'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  created () {
    this.initSidePageTab('SshProxyMatch-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return { ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams) }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SshProxyMatchSidePage', {
        id: row.id,
        resource: 'proxy_matches',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
