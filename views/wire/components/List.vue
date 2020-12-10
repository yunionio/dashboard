<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { BAND_WIDTH_OPTION } from '../../../constants'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import { getNameFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'

export default {
  name: 'WireList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'wires',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          bandwidth: {
            label: this.$t('network.text_694'),
            dropdown: true,
            multiple: true,
            items: BAND_WIDTH_OPTION.map(({ label, value }) => {
              return { label, key: value }
            }),
          },
          vpc: {
            label: 'VPC',
          },
          region: {
            label: this.$t('network.text_199'),
          },
          project_domains: getProjectDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_195'), key: 'bandwidth' },
          { label: 'VPC', key: 'vpc' },
          { label: this.$t('network.text_695'), key: 'networks' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('network.text_198'), key: 'provider' },
          { label: this.$t('network.text_196'), key: 'manager' },
          {
            label: this.$t('common_101'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('wires'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
          { label: this.$t('common_715'), key: 'user_tags' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'wires_create',
          action: () => {
            this.createDialog('WireCreateDialog', {
              title: this.$t('network.text_26'),
              onManager: this.onManager,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.wire'),
                resource: 'wires',
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.wire'),
                scope: 'domain',
                resource: 'wires',
              }, {
                permission: 'wires_perform_public',
              }),
              {
                label: this.$t('table.action.set_tag'),
                permission: 'wires_perform_set_schedtag',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'wire',
                    },
                    tipName: this.$t('dictionary.hostwire'),
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
                permission: 'wires_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('network.text_131'),
                    name: this.$t('dictionary.hostwire'),
                    onManager: this.onManager,
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
  created () {
    this.initSidePageTab('wire-detail')
    this.list.fetchData()
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
    getParam () {
      const ret = {
        details: true,
        show_emulated: false,
        ...this.getParams,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'WireSidePage', {
        id: row.id,
        resource: 'wires',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
