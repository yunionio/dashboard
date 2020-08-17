<template>
  <div>
    <a-tabs v-model="currentResource">
      <a-tab-pane
        v-for="item of resourceCounts"
        :tab="getTab(item)"
        :key="item.resource" />
    </a-tabs>
    <page-list
      :key="currentResource"
      :list="list"
      :columns="columns"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'BindResource',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: {
      type: String,
    },
    data: {
      type: Object,
      required: true,
    },
    cloudEnv: String,
  },
  data () {
    const resourceCounts = []
    R.forEachObjIndexed((value, key) => {
      if (key.endsWith('_count')) {
        resourceCounts.push({ resource: key.replace('_count', ''), count: value })
      }
    }, this.data)
    const currentResource = resourceCounts[0].resource
    return {
      resources: {
        disk: this.$t('dictionary.disk'),
        server: this.$t('dictionary.server'),
        eip: this.$t('dictionary.eip'),
        snapshot: this.$t('dictionary.snapshot'),
        dbinstance: 'RDS',
        host: this.$t('dictionary.host'),
        dbinstancebackup: this.$t('dictionary.dbinstancebackups'),
        loadbalancerclusters: '负载均衡集群',
      },
      resourceSidePageTriggerOptions: {
        disk: {
          name: 'DiskSidePage',
          permission: 'disks_get',
        },
        server: {
          name: 'VmInstanceSidePage',
          permission: 'server_get',
        },
        eip: {
          name: 'EipSidePage',
          permission: 'eips_get',
        },
        snapshot: {
          name: 'SnapshotSidePage',
          permission: 'snapshots_get',
        },
        dbinstance: {
          name: 'RDSSidePage',
          permission: 'rds_dbinstances_get',
        },
        host: {
          name: 'HostSidePage',
          permission: 'hosts_get',
        },
      },
      resourceCounts,
      currentResource,
      list: {},
      singleActions: [
        {
          label: this.$t('cloudenv.text_452'),
          action: obj => {
            this.createDialog('TagUnbindDialog', {
              columns: this.columns,
              data: [obj],
              onManager: this.onManager,
              tagData: this.data,
              refresh: this.refresh,
            })
          },
        },
      ],
    }
  },
  computed: {
    getParams () {
      const ret = {
        details: true,
        with_meta: true,
        'tags.0.key': this.data.key,
      }
      if (this.data.value) {
        ret['tags.0.value'] = this.data.value
      }
      return ret
    },
    columns () {
      return [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          addLock: true,
          addBackup: true,
          formRules: [
            { required: true, message: this.$t('cloudenv.text_190') },
            { validator: this.$validate('serverCreateName') },
          ],
          slotCallback: row => {
            const sidePageTriggerOpt = this.resourceSidePageTriggerOptions[this.currentResource]
            if (sidePageTriggerOpt) {
              return this.$createElement('side-page-trigger', {
                props: {
                  ...sidePageTriggerOpt,
                  id: row.id,
                  vm: this,
                },
              }, row.name)
            } else {
              return row.name
            }
          },
        }),
      ]
    },
  },
  watch: {
    currentResource: {
      handler (val) {
        const filterOptions = {
          name: {
            label: this.$t('cloudenv.text_95'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        }
        this.list = this.$list.createList(this, {
          resource: `${val}s`,
          apiVersion: this.cloudEnv === 'local_image' ? 'v1' : 'v2',
          getParams: this.getParams,
          filterOptions,
        })
        this.list.fetchData(0)
      },
      immediate: true,
    },
  },
  methods: {
    getTab (item) {
      const resourceName = this.resources[item.resource] || this.$t('dictionary')[item.resource] || item.resource
      return `${resourceName}(${item.count})`
    },
  },
}
</script>
