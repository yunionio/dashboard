<template>
 <div>
  <a-button style="margin-bottom:1rem" :disable="loading" @click="refresh">
    <a-icon v-if="loading" type="sync" spin />
    <a-icon v-else type="sync" />
  </a-button>
  <vxe-toolbar>
    <template v-slot:buttons>
       <a-input-search v-model="filterName" size="large" :placeholder="$t('network.text_659')" style="width: 500px" />
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

// eslint-disable-next-line no-unused-vars
const IP_TYPES = {
  reservedips: i18n.t('network.text_651'),
  loadbalancers: i18n.t('network.text_660'),
  servers: i18n.t('network.text_661'),
  networkinterfaces: i18n.t('network.text_241'),
  hosts: i18n.t('network.text_662'),
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
  },
  data () {
    return {
      loading: false,
      tableData: [],
      filterName: '',
      columns: [
        {
          field: 'ip_addr',
          title: this.$t('network.text_213'),
          sortable: true,
        },
        {
          field: 'mac_addr',
          title: this.$t('network.text_228'),
          sortable: true,
        },
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
        {
          field: 'action',
          title: this.$t('network.text_665'),
          slots: {
            default: ({ row }, h) => {
              if (IP_TYPES[row.owner_type] !== this.$t('network.text_651')) {
                return [<span>-</span>]
              }
              return [<a onClick = {() => this.freed(row)}>释放</a>]
            },
          },
        },
      ],
    }
  },
  computed: {
    list () {
      const filterName = this.filterName.toString().trim().toLowerCase()
      if (filterName) {
        const searchProps = ['ip_addr', 'mac_addr', 'owner_type', 'owner']
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
        refresh: () => {
          this.refresh()
          this.$emit('updateDetail')
        },
      })
    },
    async fetchQueryAddresses () {
      this.loading = true
      try {
        const { data: { addresses = [] } } = await this.manager.getSpecific({
          id: this.resId,
          // id: 'vnet222',
          spec: 'addresses',
          params: {
            details: true,
            system: true,
            with_meta: true,
            scope: this.$store.getters.scope,
          },
        })
        this.tableData = addresses
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
