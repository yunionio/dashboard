import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
} from '@/utils/common/tableFilter'
import { sizestr, percentstr } from '@/utils/utils'

export default {
  computed: {
    resourceProps () {
      return {
        list: this.$list.createList(this, {
          id: 'VmHostsListForTransferDialog',
          resource: 'hosts',
          getParams: {
            ...this.hostsParams,
          },
          filterOptions: {
            id: {
              label: this.$t('table.title.id'),
            },
            name: getNameFilter(),
            any_ip: {
              label: 'IP',
            },
          },
          fetchDataCb: this.fetchDataCb,
        }),
        columns: [
          getNameDescriptionTableColumn({
            hideField: true,
            addLock: true,
            addBackup: true,
            edit: false,
            editDesc: false,
            minWidth: 120,
            slotCallback: row => {
              return [
                <list-body-cell-wrap field='name' row={row} />,
              ]
            },
          }),
          getStatusTableColumn({
            statusModule: 'host',
            minWidth: 100,
          }),
          {
            field: 'custom_ip',
            title: 'IP',
            minWidth: 200,
            showOverflow: 'ellipsis',
            slots: {
              default: ({ row }) => {
                const cellWrap = []
                if (row.access_ip) {
                  if (row.ipmi_ip) {
                    cellWrap.push(
                      <div class="d-flex">
                        <list-body-cell-wrap row={row} field="access_ip" copy><span class="text-color-help">{this.$t('compute.text_1319')}</span></list-body-cell-wrap>
                      </div>,
                    )
                  } else {
                    cellWrap.push(
                      <div class="d-flex">
                        <list-body-cell-wrap row={row} field="access_ip" copy></list-body-cell-wrap>
                      </div>,
                    )
                  }
                }
                if (row.ipmi_ip) {
                  if (row.access_ip) {
                    cellWrap.push(
                      <div class="d-flex">
                        <list-body-cell-wrap row={row} field="ipmi_ip" copy><span class="text-color-help">{this.$t('compute.text_1320')}</span></list-body-cell-wrap>
                      </div>,
                    )
                  } else {
                    cellWrap.push(
                      <div class="d-flex">
                        <list-body-cell-wrap row={row} field="ipmi_ip" copy></list-body-cell-wrap>
                      </div>,
                    )
                  }
                }
                return cellWrap
              },
            },
          },
          {
            field: 'cpu_count',
            title: this.$t('compute.text_563'),
            minWidth: 100,
            showOverflow: 'title',
            sortFields: ['cpu_count', ''],
            sortByList: ['', 'order_by_cpu_commit_rate'],
            slots: {
              default: ({ row }) => {
                if (!row.cpu_commit_rate) return [<data-loading />]
                return row.cpu_count ? `${row.cpu_count}/${percentstr(row.cpu_commit_rate)}` : 'N/A'
              },
            },
          },
          {
            field: 'mem_size',
            title: this.$t('compute.text_564'),
            minWidth: 100,
            sortFields: ['mem_size', ''],
            sortByList: ['', 'order_by_mem_commit_rate'],
            slots: {
              default: ({ row }) => {
                if (!row.mem_commit_rate) return [<data-loading />]
                return row.mem_size ? `${sizestr(row.mem_size, 'M', 1024)}/${percentstr(row.mem_commit_rate)}` : 'N/A'
              },
            },
          },
          {
            field: 'storage',
            title: this.$t('compute.text_565'),
            minWidth: 80,
            sortByList: ['order_by_storage', 'order_by_storage_commit_rate'],
            slots: {
              default: ({ row }) => {
                if (!row.storage) return [<data-loading />]
                return row.mem_size ? `${sizestr(row.storage, 'M', 1024)}/${percentstr(row.storage_commit_rate)}` : 'N/A'
              },
            },
          },
          {
            field: 'model',
            title: this.$t('compute.text_580'),
            minWidth: 100,
            formatter: ({ cellValue, row }) => {
              return ((row.sys_info || {}).model) || '-'
            },
          },
          {
            field: 'nonsystem_guests',
            sortBy: 'order_by_server_count',
            title: '#VM',
            minWidth: 80,
            sortable: true,
            slots: {
              default: ({ row }, h) => {
                if (row.nonsystem_guests === undefined) return [<data-loading />]
                return `${row.nonsystem_guests}`
              },
            },
          },
        ],
      }
    },
  },
  methods: {
    fetchDataCb () {
      const { total, data } = this.resourceProps.list
      if (total > 0) {
        const hostIds = this.forcastData?.filtered_candidates?.map(v => v.id) || []
        if (this.forcastData?.can_create === false) {
          this.resourceProps.list.data = []
        }
        for (const key in data) {
          const obj = data[key].data
          if (hostIds.includes(obj.id)) {
            delete data[obj.id]
            this.resourceProps.list.total--
          }
        }
      }
    },
  },
}
