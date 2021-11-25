<template>
  <div>
    <a-alert :message="alertMessage" class="mb-2" type="info" />
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter, getEnabledFilter, getStatusFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  name: 'ProjectMappingList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      alertMessage: this.$t('cloudenv.text_581'),
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'project_mappings',
        getParams: { details: true },
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
          enabled: getEnabledFilter(),
          status: getStatusFilter({ statusModule: 'projectMapping' }),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
        ],
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          permission: 'projectmappings_create',
          action: () => {
            this.createDialog('ProjectMappingCreateDialog', {
              success: () => {
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              ...getEnabledSwitchActions(this, undefined, ['projectmappings_perform_enable', 'projectmappings_perform_disable'], {
                resourceName: this.$t('cloudenv.text_580'),
                metas: [
                  () => {
                    const isEnable = !!this.list.selectedItems.find(item => item.enabled)
                    return {
                      validate: this.list.selectedItems.length && !isEnable,
                    }
                  },
                  () => {
                    const isDisable = !!this.list.selectedItems.find(item => !item.enabled)
                    return {
                      validate: this.list.selectedItems.length && !isDisable,
                    }
                  },
                ],
              }),
              {
                label: this.$t('cloudenv.text_108'),
                permission: 'projectmappings_delete',
                action: () => {
                  this.createDialog('DeleteProjectMappingDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('resourceowner_delete'),
                    name: this.$t('cloudenv.text_580'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const deleteResult = this.$getDeleteResult(this.list.selectedItems)
                  if (!deleteResult.validate) {
                    return deleteResult
                  }
                  return {
                    validate: true,
                  }
                },
              },
            ]
          },
          meta: () => {
            const ownerDomain = this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
            if (!ownerDomain) {
              return {
                validate: false,
                tooltip: this.$t('cloudenv.text_597'),
              }
            }
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('ProjectMappingRuleUpdate', (res) => {
      this.list.fetchData()
    })
  },
  methods: {
    refresh () {
      this.list.fetchData()
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ProjectMappingSidePage', {
        id: row.id,
        resource: 'project_mappings',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
        hiddenActions: this.hiddenActions,
      })
      this.initSidePageTab('')
    },
    openSidePageRuleList (row) {
      this.sidePageTriggerHandle(this, 'ProjectMappingSidePage', {
        id: row.id,
        resource: 'project_mappings',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
        hiddenActions: this.hiddenActions,
      })
      this.initSidePageTab('rule-list')
    },
    checkEnable (list) {
      const ret = {
        validate: true,
      }
      list.map(item => {
        if (item.enabled) {
          ret.validate = false
          ret.tooltip = this.$t('cloudenv.text_595')
        }
      })
      return ret
    },
  },
}
</script>
