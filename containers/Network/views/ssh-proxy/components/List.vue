<template>
  <div>
    <a-alert :message="alertMessage" class="mb-2" type="info" />
    <page-list
      :list="list"
      :columns="columns"
      :single-actions="singleActions"
      :group-actions="groupActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SshProxyList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      alertMessage: this.$t('network.ssh-proxy.endpoints.list.tips'),
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'proxy_endpoints',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          ip_addr: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `intranet_ip_addr.contains(${val})`
            },
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
          label: this.$t('network.text_26'),
          permission: 'sshproxy_endpoint_create',
          action: () => {
            this.$router.push({
              path: '/ssh-proxy/create',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !this.cloudEnvEmpty,
              tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
            }
          },
          hidden: () => this.hiddenActions.includes('create'),
        },
        {
          label: this.$t('network.text_200'),
          actions: () => {
            return [
              {
                label: this.$t('network.text_349'),
                permission: 'proxy_endpoints_update',
                action: () => {
                  this.createDialog('UpdateSSHPortDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('network.text_349'),
                    name: this.$t('network.ssh-proxy.endpoints'),
                    onManager: this.onManager,
                  })
                },
              },
              {
                label: this.$t('network.text_131'),
                permission: 'proxy_endpoints_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('network.text_131'),
                    name: this.$t('network.ssh-proxy.endpoints'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
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
    this.initSidePageTab('SshProxy-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {}
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SshProxySidePage', {
        id: row.id,
        resource: 'proxy_endpoints',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
