<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common_322')}}</div>
    <div slot="body">
      <page-list
        :list="list"
        :columns="columns"
        :enableVirtualScroll="false" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudgroupListForClouduserForUserDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'CloudgroupListForClouduserForUser',
        resource: 'cloudgroups',
        apiVersion: 'v1',
        getParams: {
          clouduser_id: this.params.data[0].id,
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('dictionary.cloudgroup'),
        },
        {
          field: 'cloudpolicies',
          title: this.$t('common_309'),
          slots: {
            default: ({ row }) => {
              const handleVisibleChange = async (visible) => {
                if (visible && !row.feCloudpolicies && row.cloudpolicies && row.cloudpolicies.length > 0) {
                  await this.loadPolicy({ row })
                }
              }
              if (R.isNil(row.cloudpolicies) || R.isEmpty(row.cloudpolicies)) return this.$t('common_324')
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
              const hasData = row.feCloudpolicies && row.feCloudpolicies.length > 0
              return [<a-popover trigger="hover" onVisibleChange={handleVisibleChange} key={`popover-${row.id}-${row.feCloudpolicies ? row.feCloudpolicies.length : 0}`}>
                <div slot="content" style={hasData ? { minWidth: '600px' } : {}}>
                  {hasData ? (
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
                <span style="color: var(--antd-wave-shadow-color)">{this.$t('common_323', [row.cloudpolicies.length])}</span>
              </a-popover>]
            },
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
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
</script>
