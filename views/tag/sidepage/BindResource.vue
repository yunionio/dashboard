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
import { getStatusTableColumn, getBrandTableColumn, getNameDescriptionTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { getBrandItems, mapperStatusToItems } from '@/utils/common/tableFilter'
import ListMixin from '@/mixins/list'

const expectStatusAlias = {
  guestimage: 'image',
  instance_snapshot: 'snapshot',
  elasticcache: 'redis',
  dbinstance: 'rds',
  loadbalancer: 'lb',
}

const noStatusRes = ['loadbalanceragent', 'loadbalancercluster']

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
        host: this.$t('dictionary.physicalmachine'),
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
          name: 'PhysicalmachineSidePage',
          permission: 'hosts_get',
        },
      },
      resourceCounts,
      currentResource,
      list: {},
      singleActions: [
        {
          label: '解绑',
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
      const statusAlias = expectStatusAlias[this.currentResource] || this.currentResource
      let ret = [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          addLock: true,
          addBackup: true,
          formRules: [
            { required: true, message: '请输入名称' },
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
        getProjectTableColumn(),
      ]
      if (this.cloudEnv !== 'local_image') {
        ret = R.insert(2, getBrandTableColumn(), ret)
      }
      if (!noStatusRes.includes(this.currentResource)) {
        ret = R.insert(1, getStatusTableColumn({ statusModule: statusAlias }), ret)
      }
      return ret
    },
  },
  watch: {
    currentResource: {
      handler (val) {
        const statusAlias = expectStatusAlias[val] || val
        const filterOptions = {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          brand: {
            label: '平台',
            dropdown: true,
            multiple: true,
            items: getBrandItems('brands'),
          },
          status: {
            label: '状态',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'status',
            },
            mapper: data => {
              return mapperStatusToItems(data, statusAlias)
            },
            filter: true,
            formatter: val => {
              return `status.in(${val.join(',')})`
            },
          },
          tenant: {
            label: this.$t('dictionary.project'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'extra_field',
              key: 'tenant',
            },
          },
        }
        if (noStatusRes.includes(val)) {
          delete filterOptions.status
        }
        this.list = this.$list.createList(this, {
          resource: `${val}s`,
          apiVersion: this.cloudEnv === 'local_image' ? 'v1' : 'v2',
          getParams: this.getParams,
          steadyStatus: expectStatus[statusAlias] && Object.values(expectStatus[statusAlias]) && Object.values(expectStatus[statusAlias]).flat(),
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
