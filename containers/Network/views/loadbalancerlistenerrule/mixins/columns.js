import LbListCell from '@Network/views/lb/components/LbListCell'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  components: {
    LbListCell,
  },
  computed: {
    columns () {
      let arr = [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          title: i18n.t('network.text_21'),
          edit: false,
          editDesc: false,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ minWidth: 50, statusModule: 'lb' }),
        // getStatusTableColumn({ minWidth: 100, statusModule: 'lbRedirect', field: 'redirect', title: i18n.t('network.text_368') }),
        getProjectDomainTableColumn(),
        {
          field: 'domain',
          title: i18n.t('network.text_156'),
          minWidth: 100,
        },
        {
          field: 'path',
          title: 'URL',
          minWidth: 200,
        },
        {
          field: 'backend_group',
          title: i18n.t('network.default_backend_server_group'),
          minWidth: 150,
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger onTrigger={ () => this.handleOpenLbbgSidepage(row) }>{ row.backend_group }</side-page-trigger>,
              ]
            },
          },
        },
        getStatusTableColumn({ minWidth: 100, statusModule: 'lbRedirect', field: 'redirect', title: i18n.t('network.text_368') }),
      ]
      if (this.data.provider && this.data.provider.toLowerCase() !== 'onecloud') arr.splice(2, 1)
      if (this.data.provider && this.data.provider.toLowerCase() === 'cloudflare') {
        arr = arr.filter(item => item.field !== 'redirect')
      }
      return arr
    },
  },
  methods: {
    handleOpenLbbgSidepage (row) {
      this.sidePageTriggerHandle(this, 'LoadbalancerbackendgroupSidePage', {
        id: row.backend_group_id,
        resource: 'loadbalancerbackendgroups',
        lbData: this.lbData, // this.data 就是 list.vue 里面接收的prop
      }, {
        list: this.list,
      })
    },
  },
}
