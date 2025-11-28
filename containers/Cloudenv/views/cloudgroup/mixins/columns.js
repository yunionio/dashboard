import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getProjectDomainTableColumn,
  getPublicScopeTableColumn,
  getAccountTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        formRules: [
          { required: true, message: i18n.t('common.text00042') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger permission='cloudgroup_get' name='CloudgroupSidePage' id={row.id} list={this.list} vm={this}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'cloudgroup' }),
      {
        field: 'cloudpolicies',
        title: i18n.t('cloudenv.text_329'),
        slots: {
          default: ({ row }) => {
            const handleVisibleChange = async (visible) => {
              if (visible && !row.feCloudpolicies && row.cloudpolicies && row.cloudpolicies.length > 0) {
                await this.loadPolicy({ row })
              }
            }
            if (R.isNil(row.cloudpolicies) || R.isEmpty(row.cloudpolicies)) {
              return i18n.t('cloudenv.text_330')
            }
            const columns = [
              {
                field: 'name',
                title: this.$t('common.name'),
              },
              {
                field: 'description',
                title: this.$t('table.title.desc'),
                formatter: ({ cellValue }) => cellValue || '-',
              },
            ]
            return [<a-popover trigger="hover" onVisibleChange={handleVisibleChange} key={`popover-${row.id}-${row.feCloudpolicies ? row.feCloudpolicies.length : 0}`}>
              <div slot="content" style={row.feCloudpolicies && row.feCloudpolicies.length > 0 ? { minWidth: '600px' } : {}}>
                {row.feCloudpolicies && row.feCloudpolicies.length > 0 ? (
                  <vxe-grid
                    showOverflow={false}
                    row-config={{ isHover: true }}
                    column-config={{ resizable: false }}
                    data={ row.feCloudpolicies }
                    columns={ columns } />
                ) : (
                  <data-loading />
                )}
              </div>
              <span style="color: var(--antd-wave-shadow-color)">{i18n.t('cloudenv.text_245', [row.cloudpolicies.length])}</span>
            </a-popover>]
          },
        },
        formatter: ({ row }) => {
          return [i18n.t('cloudenv.text_245', [(row.cloudpolicies && row.cloudpolicies.length) || 0])]
        },
      },
      getBrandTableColumn({ field: 'provider' }),
      getAccountTableColumn({ field: 'cloudaccount', title: this.$t('common.text00108') }),
      getPublicScopeTableColumn({ vm: this, resource: 'cloudgroups' }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
  methods: {
    async loadPolicy ({ row }) {
      let manager = new this.$Manager('cloudpolicies', 'v1')
      try {
        const response = await manager.list({
          params: {
            cloudgroup_id: row.id,
            scope: this.$store.getters.scope,
          },
        })
        this.$set(row, 'feCloudpolicies', response.data.data || [])
        return response
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
  },
}
