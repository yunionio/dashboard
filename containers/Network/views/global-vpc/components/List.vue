<template>
  <page-list
    show-tag-column
    show-tag-filter
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getStatusFilter, getProjectDomainFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'globalVpcList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'globalvpcs',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.globalVpc).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('globalVpc'),
          project_domains: getProjectDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('network.text_232'), key: 'public_scope' },
          {
            label: this.$t('network.text_232'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('globalvpcs'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'network_globalvpcs_create',
          action: () => {
            this.$router.push({
              path: '/globalvpc/create',
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
              {
                label: this.$t('network.text_201'),
                permission: 'network_globalvpcs_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_627'),
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.globalvpc'),
                resource: 'globalvpcs',
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.globalvpc'),
                scope: 'domain',
                resource: 'globalvpcs',
              }),
              {
                label: this.$t('table.action.set_tag'),
                permission: 'network_globalvpcs_perform_set_schedtag',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'globalvpc',
                    },
                    tipName: this.$t('dictionary.globalvpc'),
                  })
                },
                meta: () => {
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    return {
                      validate: false,
                      tooltip: this.$t('network.text_627'),
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: this.$t('network.text_131'),
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    name: this.$t('dictionary.globalvpc'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('network.text_131'),
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
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length,
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return false
    },
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'globalVpcSidePage', {
        id: row.id,
        resource: 'globalvpcs',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
