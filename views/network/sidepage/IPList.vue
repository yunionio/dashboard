<template>
 <div>
  <a-button style="margin-bottom:1rem" :disable="loading" @click="refresh">
    <a-icon v-if="loading" type="sync" spin />
    <a-icon v-else type="sync" />
  </a-button>
  <vxe-toolbar>
    <template v-slot:buttons>
       <a-input-search v-model="filterName" size="large" placeholder="全文搜索" style="width: 500px" />
    </template>
  </vxe-toolbar>
  <vxe-grid
    :data="list"
    :stripe="true"
    :max-height="600"
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

// eslint-disable-next-line no-unused-vars
const IP_TYPES = {
  reservedips: '预留IP',
  loadbalancers: '负载均衡IP',
  servers: '虚拟机IP',
  networkinterfaces: '弹性网卡',
  hosts: '宿主机IP',
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
          title: 'IP地址',
          sortable: true,
        },
        {
          field: 'mac_addr',
          title: 'MAC地址',
          sortable: true,
        },
        {
          field: 'owner_type',
          title: '资源类型',
          sortable: true,
          slots: {
            default: ({ row }) => {
              return IP_TYPES[row.owner_type]
            },
          },
        },
        {
          field: 'owner',
          title: '资源名称',
        },
        {
          field: 'action',
          title: '操作',
          slots: {
            default: ({ row }, h) => {
              if (IP_TYPES[row.owner_type] !== '预留IP') {
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
  created () {
    this.fetchQueryAddresses()
  },
  methods: {
    freed (obj) {
      this.createDialog('ReservedIPFreedDialog', {
        title: '释放',
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
        const manager = new this.$Manager('networks')
        const { data: { addresses } } = await manager.getSpecific({
          id: this.resId,
          // id: 'vnet222',
          spec: 'addresses',
          params: {
            details: true,
            system: true,
            with_meta: true,
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
