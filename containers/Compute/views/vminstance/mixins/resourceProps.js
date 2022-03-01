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
          resource: 'hosts',
          getParams: {
            ...this.hostsParams,
          },
          filterOptions: {
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
            width: 200,
            showOverflow: 'ellipsis',
            slots: {
              default: ({ row }) => {
                const cellWrap = []
                if (row.access_ip) {
                  cellWrap.push(
                    <div class="d-flex">
                      <list-body-cell-wrap row={row} field="access_ip" copy><span class="text-color-help">{this.$t('compute.text_1319')}</span></list-body-cell-wrap>
                    </div>,
                  )
                }
                if (row.ipmi_ip) {
                  cellWrap.push(
                    <div class="d-flex">
                      <list-body-cell-wrap row={row} field="ipmi_ip" copy><span class="text-color-help">{this.$t('compute.text_1320')}</span></list-body-cell-wrap>
                    </div>,
                  )
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
            sortable: true,
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
            sortable: true,
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
            slots: {
              default: ({ row }) => {
                if (!row.storage) return [<data-loading />]
                return row.mem_size ? `${sizestr(row.storage, 'M', 1024)}/${percentstr(row.storage_commit_rate)}` : 'N/A'
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
        for (const key in data) {
          const obj = data[key].data
          if (obj.delete_fail_reason?.code === 400) {
            // delete data[obj.id]
          }
        }
      }
    },
  },
}
