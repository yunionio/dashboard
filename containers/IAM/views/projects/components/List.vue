<template>
  <page-list
    show-tag-columns
    show-tag-filter
    show-tag-config
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :showSingleActions="showSingleActions"
    :export-data-options="exportDataOptions"
    :tag-config-params="tagConfigParams" />
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getProjectDomainFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'ProjectList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    isAllowCreate: {
      type: Boolean,
      default: true,
    },
    showSingleActions: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        getParams: this.getParams,
        resource: 'projects',
        apiVersion: 'v1',
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('system.text_101'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          description: getDescriptionFilter(),
          project_domain: getProjectDomainFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_101'), key: 'name' },
          { label: this.$t('dictionary.domain'), key: 'project_domain' },
        ],
      },
      tagConfigParams: {
        id: this.id,
        title: this.$t('common.text00124'),
        resource: 'projects',
        queryTreeId: 'tag-value-tree',
        tagFilterKey: 'tags',
      },
    }
  },
  computed: {
    ...mapGetters(['globalConfig']),
    groupActions () {
      const actions = [
        {
          label: this.$t('system.text_128'),
          permission: 'projects_create',
          action: () => {
            this.$router.push('/project/create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('table.action.set_tag'),
          permission: 'projects_perform_set_user_metadata',
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              params: {
                resources: 'project',
              },
              mode: 'add',
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
        {
          label: this.$t('system.text_129'),
          permission: 'projects_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: this.$t('system.text_129'),
              name: this.$t('dictionary.project'),
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ]
      if (!this.isAllowCreate) actions.shift()
      return actions
    },
  },
  created () {
    this.initSidePageTab('project-detail')
    this.list.fetchData()
    this.$bus.$on('SystemProjectsListRefresh', args => {
      this.list.refresh()
    }, this)
  },
  methods: {
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'ProjectSidePage', {
        id: row.id,
        resource: 'projects',
        apiVersion: 'v1',
        getParams: this.getParams,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
