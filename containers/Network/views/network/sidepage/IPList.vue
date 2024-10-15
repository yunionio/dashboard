<template>
 <div>
  <vxe-toolbar>
    <template v-slot:buttons>
      <div class="ip-list-search d-flex">
        <a-button style="margin-bottom:1rem" :disable="loading" @click="refresh">
          <a-icon v-if="loading" type="sync" spin />
          <a-icon v-else type="sync" />
        </a-button>
        <a-input-search class="ml-2 w-100" v-model="filterName" :placeholder="$t('network.text_659')" />
      </div>
    </template>
  </vxe-toolbar>
  <vxe-grid
    :data="list"
    :stripe="true"
    :max-height="600"
    resizable
    :columns="columns">
    <template v-slot:empty>
      <loader :loading="loading" />
    </template>
  </vxe-grid>
    <!-- <vxe-table
      border
      highlight-hover-row
      height="400"
      :data="tableData">
      <vxe-table-column v-for="item in columns" :key="item.field" :title="item.title" :field="item.field" sortable>s</vxe-table-column>
    </vxe-table> -->
 </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows.js'
import i18n from '@/locales'
import { getCopyWithContentTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

// eslint-disable-next-line no-unused-vars
const IP_TYPES = {
  reservedips: i18n.t('network.text_651'),
  loadbalancers: i18n.t('network.text_660'),
  servers: i18n.t('network.text_661'),
  networkinterfaces: i18n.t('network.text_241'),
  hosts: i18n.t('network.host_ip'),
  instancegroups: i18n.t('network.instancegroup_ip'),
  networkaddresses: i18n.t('compute.sub_ips.title'),
}
export default {
  name: 'IPList',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    resId: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      loading: false,
      tableData: [],
      filterName: '',
      columns: [
        {
          field: 'addr',
          title: i18n.t('network.text_213'),
          width: 200,
          slots: {
            default: ({ row }, h) => {
              let text = '-'
              if (row.ip_addr) {
                text = row.ip_addr
              }
              if (row.ip6_addr) {
                text = row.ip6_addr
              }
              return [
                <list-body-cell-wrap row={{ text: text }} field="text" copy />,
              ]
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'mac_addr',
          title: this.$t('network.text_228'),
          sortable: true,
          width: 200,
        }),
        {
          field: 'owner_type',
          title: this.$t('network.text_663'),
          sortable: true,
          slots: {
            default: ({ row }) => {
              return IP_TYPES[row.owner_type]
            },
          },
        },
        {
          field: 'owner',
          title: this.$t('network.text_664'),
          formatter: ({ row }) => {
            if (row.mac_addr && !row.owner) return this.$t('common.noPermissionView')
            return row.owner
          },
        },
        getTimeTableColumn(),
        /* {
          field: 'action',
          title: this.$t('network.text_665'),
          slots: {
            default: ({ row }, h) => {
              if (IP_TYPES[row.owner_type] !== this.$t('network.text_651')) {
                return [<span>-</span>]
              }
              return [<a onClick = {() => this.freed(row)}>{this.$t('network.text_666')}</a>]
            },
          },
        }, */
      ],
    }
  },
  computed: {
    list () {
      const filterName = this.filterName.toString().trim().toLowerCase()
      if (filterName) {
        const searchProps = ['ip_addr', 'ip6_addr', 'mac_addr', 'owner_type', 'owner']
        return this.tableData.filter(item => searchProps.some(key => {
          if (item[key]) {
            return item[key].toString().toLowerCase().indexOf(filterName) > -1
          }
          return false
        }))
      }
      return this.tableData
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('networks')
    this.fetchQueryAddresses()
  },
  methods: {
    freed (obj) {
      this.createDialog('ReservedIPFreedDialog', {
        title: this.$t('network.text_666'),
        data: [obj],
        columns: this.columns,
        onManager: this.onManager,
        query: this.getParams,
        refresh: () => {
          this.refresh()
          this.$emit('updateDetail')
        },
      })
    },
    async fetchQueryAddresses () {
      this.loading = true
      try {
        const { data: { addresses = [], addresses6 = [] } } = await this.manager.getSpecific({
          id: this.resId,
          spec: 'addresses',
          params: {
            details: true,
            system: true,
            with_meta: true,
            scope: this.$store.getters.scope,
          },
        })
        this.tableData = addresses
        if (addresses6) {
          for (let i = 0; i < addresses6.length; i++) {
            this.tableData.push(addresses6[i])
          }
        }
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    refresh () {
      this.fetchQueryAddresses()
    },
  },
}
</script>
<style lang="less" scoped>
.ip-list-search {
  ::v-deep {
    .ant-input-affix-wrapper .ant-input-suffix {
      top: 35%!important;
    }
  }
}
</style>
