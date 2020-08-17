import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
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
        type: 'expand',
        slots: {
          default: ({ row }) => {
            return [i18n.t('cloudenv.text_245', [(row.cloudpolicies && row.cloudpolicies.length) || 0])]
          },
          content: ({ row }) => {
            if (R.isNil(row.feCloudpolicies) || R.isEmpty(row.feCloudpolicies)) return i18n.t('cloudenv.text_330')
            return [
              <vxe-grid
                showOverflow='title'
                data={ row.feCloudpolicies }
                columns={[
                  {
                    field: 'name',
                    title: this.$t('common.name'),
                  },
                  {
                    field: 'description',
                    title: this.$t('table.column.title.desc'),
                    formatter: ({ cellValue }) => cellValue || '-',
                  },
                ]} />,
            ]
          },
        },
      },
      getBrandTableColumn({ field: 'provider' }),
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
        row.feCloudpolicies = response.data.data || []
        return response
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
  },
}
