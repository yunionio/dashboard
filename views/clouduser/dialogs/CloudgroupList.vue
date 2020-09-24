<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common_322')}}</div>
    <div slot="body">
      <page-list
        :list="list"
        :columns="columns"
        :expand-config="{ lazy: true, loadMethod: loadPolicy, visibleMethod: visbleLoadPolicy }" />
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
          type: 'expand',
          slots: {
            default: ({ row }) => {
              return [this.$t('common_323', [(row.cloudpolicies && row.cloudpolicies.length) || 0])]
            },
            content: ({ row }) => {
              if (R.isNil(row.feCloudpolicies) || R.isEmpty(row.feCloudpolicies)) return this.$t('common_324')
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
                      title: this.$t('table.title.desc'),
                      formatter: ({ cellValue }) => cellValue || '-',
                    },
                  ]} />,
              ]
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
    visbleLoadPolicy ({ row }) {
      return row.cloudpolicies && row.cloudpolicies.length > 0
    },
  },
}
</script>
