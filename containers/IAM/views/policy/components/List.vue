<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getProjectDomainFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import {
  getSetPublicAction,
} from '@/utils/common/tableActions'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'PolicyList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
    type: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'policies',
        apiVersion: 'v1',
        getParams: this.getParam,
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
          project_domain: getProjectDomainFilter(),
          enabled: getEnabledFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_101'), key: 'name' },
          { label: this.$t('system.text_163'), key: 'enabled' },
          { label: this.$t('dictionary.domain'), key: 'project_domain' },
          { label: this.$t('system.text_127'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('system.text_128'),
          action: () => {
            this.$router.push('/policy/create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('system.text_226'),
          action: () => {
            const ids = this.list.selected
            this.createDialog('DisableDialog', {
              title: this.$t('system.text_341', [this.$t('dictionary.policy')]),
              name: this.$t('dictionary.policy'),
              columns: this.columns,
              data: this.list.selectedItems,
              ok: async () => {
                try {
                  const response = await this.list.batchUpdate(ids, {
                    enabled: false,
                  })
                  return response
                } catch (error) {
                  throw error
                }
              },
            })
          },
          meta: () => {
            let validate = true
            if (this.list.selectedItems.length <= 0) {
              validate = false
            }
            if (this.list.selectedItems.some(item => item.enabled === false)) {
              validate = false
            }
            if (this.list.selectedItems.some(item => !this.isOwnerPublic(item))) {
              validate = false
            }
            return {
              validate,
            }
          },
        },
        {
          label: this.$t('system.text_225'),
          action: () => {
            const ids = this.list.selected
            this.createDialog('DisableDialog', {
              title: this.$t('system.text_342', [this.$t('dictionary.policy')]),
              name: this.$t('dictionary.policy'),
              columns: this.columns,
              data: this.list.selectedItems,
              ok: async () => {
                try {
                  const response = await this.list.batchUpdate(ids, {
                    enabled: true,
                  })
                  return response
                } catch (error) {
                  throw error
                }
              },
            })
          },
          meta: () => {
            let validate = true
            if (this.list.selectedItems.length <= 0) {
              validate = false
            }
            if (this.list.selectedItems.some(item => item.enabled === true)) {
              validate = false
            }
            if (this.list.selectedItems.some(item => !this.isOwnerPublic(item))) {
              validate = false
            }
            return {
              validate,
            }
          },
        },
        getSetPublicAction(this, {
          name: this.$t('res.policy'),
          scope: 'domain',
          resource: 'policies',
          apiVersion: 'v1',
          noCandidateDomains: true,
        }, {
          meta: () => {
            if (this.list.selectedItems.some(obj => obj.is_system)) {
              return {
                validate: false,
                tooltip: this.$t('policy.tooltip.system_policy'),
              }
            }
            return {
              validate: this.list.selectedItems.length,
            }
          },
        }),
        {
          label: this.$t('system.text_129'),
          permission: 'policies_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('system.text_129'),
              name: this.$t('dictionary.policy'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  computed: mapGetters(['isAdminMode', 'userInfo']),
  watch: {
    type (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('policy-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      if (this.type === 'custom') {
        ret.is_system = false
        return ret
      }
      if (this.type === 'system') {
        ret.is_system = true
        return ret
      }
      return ret
    },
    isOwnerPublic (obj) {
      // fix by http://bug.yunion.io/zentao/bug-view-2958.html 共享的权限在其他域下时应该不能做任何操作
      if (obj.is_public) {
        if (this.isAdminMode) return true
        if (obj.domain_id !== this.userInfo.domain.id) return false
      }
      return true
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'PolicySidePage', {
        id: row.id,
        resource: 'policies',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
