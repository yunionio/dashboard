import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getBrandFilter,
} from '@/utils/common/tableFilter'

export default {
  data () {
    return {
      accountsProps: {
        list: this.$list.createList(this, {
          resource: 'cloudaccounts',
          getParams: {},
          filterOptions: {
            name: getNameFilter(),
            brand: getBrandFilter(),
          },
        }),
        columns: [
          getNameDescriptionTableColumn({
            onManager: this.onManager,
            hideField: true,
            slotCallback: row => {
              return (
                <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
              )
            },
          }),
          {
            field: 'access_url',
            title: this.$t('cloudenv.text_96'),
            minWidth: 100,
            showOverflow: 'ellipsis',
            slots: {
              default: ({ row }, h) => {
                if (!row.access_url) return '-'
                let txt
                Object.keys(this.$t('cloudAccountAccessType')).forEach(k => {
                  if (row.access_url.indexOf(k) > -1) {
                    let _k = k
                    if (row.brand !== 'Aliyun' && k === 'InternationalCloud') {
                      _k = 'Internation'
                    }
                    txt = this.$t('cloudAccountAccessType')[_k]
                  }
                })
                return txt ||
                [
                  <a class="link-color" target="_blank" href={ row.access_url }>{ row.access_url }</a>,
                ]
              },
            },
          },
          getBrandTableColumn(),
          getProjectDomainTableColumn(),
          {
            field: 'tenant',
            title: this.$t('scope.text_573', [this.$t('dictionary.project')]),
            minWidth: 120,
            showOverflow: 'title',
            slots: {
              default: ({ row }) => {
                if (row.auto_create_project) {
                  return [
                    <span class='mr-2'>{ this.$t('cloudenv.text_493') }</span>,
                    <help-tooltip name='cloudaccountAutoCreateProject' />,
                  ]
                }
                return [
                  <list-body-cell-wrap copy field='tenant' row={row} />,
                ]
              },
            },
          },
        ],
      },
    }
  },
}
