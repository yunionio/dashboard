import { getNameDescriptionTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'
import { strategyColumn, levelColumn } from '@Monitor/views/commonalert/utils'
import i18n from '@/locales'

export default {
  data () {
    return {
      extandData: {},
      expandConfig: {
        loadMethod: this.loadMethod,
        lazy: true,
      },
    }
  },
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        edit: false,
      }),
      {
        field: 'none',
        title: this.$t('common.status'),
        slots: {
          default: ({ row }, h) => {
            return [
              <div class='text-truncate'>
                <status status='alerted' statusModule='alertresource' />
              </div>,
            ]
          },
        },
      },
      getTagTableColumn({ field: 'tags', ignorePrefix: true }),
      {
        field: 'alert_table',
        title: i18n.t('monitor.text_98'),
        type: 'expand',
        slots: {
          default: ({ row }) => {
            return row.count || '0'
          },
          content: ({ row }) => {
            const columns = [
              getNameDescriptionTableColumn({
                onManager: this.onManager,
                hideField: true,
                title: i18n.t('monitor.text_99'),
                edit: false,
                showDesc: false,
                slotCallback: row => {
                  return (
                    <side-page-trigger onTrigger={() => this.handleOpenAlertSidepage(row)}>{ row.alert }</side-page-trigger>
                  )
                },
              }),
              getTagTableColumn({ field: 'data.tags', title: this.$t('monitor.text_104'), ignorePrefix: true }),
              strategyColumn(),
              levelColumn,
              {
                field: 'value_str',
                title: this.$t('monitor.text_105'),
                align: 'right',
                formatter: ({ row }) => row.data ? row.data.value_str : '-',
              },
            ]
            const data = row.childData || []
            return <vxe-grid size="mini" border columns={columns} data={data} />
          },
        },
      },
      {
        field: 'type',
        title: i18n.t('monitor.text_97'),
        formatter: ({ row }) => {
          if (row.type === 'node') return this.$t('dictionary.host')
          return row.type
        },
      },
    ]
    this.extandData = {}
  },
  methods: {
    async toggleRowExpand ({ row, expanded }) {
      if (expanded) {
        try {
          if (!this.extandData[row.id]) {
            this.extandData[row.id] = await this.getAlertdata(row.id)
            this.$refs.pagelist.$refs.table.$refs.grid.reloadExpandContent(row)
          }
        } catch (error) {
          throw error
        }
      }
    },
    loadMethod ({ row }) {
      return new Promise(resolve => {
        this.getAlertdata(row.id).then(data => {
          row.childData = data
          resolve()
        })
      })
    },
    async getAlertdata (id) {
      try {
        const { data: { data } } = await new this.$Manager('alertresources', 'v1').getSpecific({ id, spec: 'alerts' })
        return data
      } catch (error) {
        throw error
      }
    },
    handleOpenAlertSidepage (row) {
      this.sidePageTriggerHandle(this, 'CommonalertsSidePage', {
        id: row.alert_id,
        resource: 'commonalerts',
        apiVersion: 'v1',
        sourceList: this.list,
      })
    },
  },
}
