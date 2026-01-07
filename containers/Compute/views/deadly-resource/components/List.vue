<template>
  <page-list
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :showSingleActions="isTemplate ? false : showActions"
    :showGroupActions="showActions && showGroupActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :show-page="!isTemplate" />
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getNameFilter,
  getDomainFilter,
  getTenantFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'DeadlyResourceList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, ResTemplateListMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    hiddenColumns: {
      type: Array,
      default: () => ([]),
    },
    hiddenFilterOptions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    const filterOptions = {
      id: {
        label: this.$t('table.title.id'),
      },
      name: getNameFilter(),
      projects: getTenantFilter(),
      project_domains: getDomainFilter(),
    }
    for (let i = 0, len = this.hiddenFilterOptions.length; i < len; i++) {
      delete filterOptions[this.hiddenFilterOptions[i]]
    }
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'billing_resource_checks',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions,
        hiddenColumns: this.hiddenColumns,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
      }),
      groupActions: [
        {
          label: this.$t('compute.check_deadly_resource'),
          permission: 'billing_resource_checks_perform_check',
          action: async () => {
            await new this.$Manager('billing_resource_checks/check', 'v1').create()
            this.list.fetchData()
            this.$message.success(this.$t('common_360'))
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isProjectMode']),
    showActions () {
      return true
    },
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('compute.deadly_resource'),
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.initSidePageTab('deadly-resource-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = { ...(typeof this.getParams === 'function' ? this.getParams() : this.getParams) }
      if (this.isTemplate) {
        ret.order_by = 'release_at'
        ret.order = 'asc'
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      // 根据资源类型打开对应的 sidepage
      const resourceTypeMap = {
        server: {
          sidePageName: 'VmInstanceSidePage',
          resource: 'servers',
          initTab: 'vm-instance-detail',
        },
        dbinstance: {
          sidePageName: 'RDSSidePage',
          resource: 'dbinstances',
          initTab: 'detail',
        },
        elasticcache: {
          sidePageName: 'RedisSidePage',
          resource: 'elasticcaches',
          initTab: 'redis-detail',
        },
      }
      const resourceInfo = resourceTypeMap[row.resource_type]
      if (resourceInfo && row.id) {
        // 打开对应资源的 sidepage
        this.initSidePageTab(resourceInfo.initTab)
        this.sidePageTriggerHandle(this, resourceInfo.sidePageName, {
          id: row.id,
          resource: resourceInfo.resource,
          getParams: this.getParam,
        }, {
          list: this.list,
          hiddenColumns: this.hiddenColumns,
          tab,
        })
      } else {
        // 如果没有匹配的资源类型或没有 resource_id，打开默认的 deadly-resource sidepage
        this.initSidePageTab('deadly-resource-detail')
        this.sidePageTriggerHandle(this, 'DeadlyResourceSidePage', {
          id: row.id,
          resource: 'billing_resource_checks',
          getParams: this.getParam,
        }, {
          list: this.list,
          hiddenColumns: this.hiddenColumns,
          tab,
        })
      }
    },
  },
}
</script>
