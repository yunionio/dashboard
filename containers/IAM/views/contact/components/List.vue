<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { getProjectDomainFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import CommonMixin from '../mixins/common'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'ContactList',
  mixins: [CommonMixin, WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
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
        resource: 'receivers',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('system.text_126'),
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          project_domain: getProjectDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_126'), key: 'name' },
          { label: this.$t('system.text_127'), key: 'created_at' },
          { label: this.$t('system.text_131'), key: 'mobile' },
          { label: this.$t('system.text_146'), key: 'email' },
          { label: this.$t('common_599'), key: 'enabled_contact_types' },
        ],
      },
      groupActions: [
        {
          label: this.$t('system.text_128'),
          permission: 'contacts_create',
          action: () => {
            this.createDialog('ContactCreateDialog', {
              success: () => {
                this.refresh()
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
          label: this.$t('system.text_166'),
          actions: () => {
            return [
              {
                label: this.$t('system.management_notify_channels'),
                permission: 'contacts_update',
                action: () => {
                  this.createDialog('SetupNotifyChannelsDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    success: () => {
                      this.list.refresh()
                    },
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const domain = this.list.selectedItems[0] ? this.list.selectedItems[0].domain_id : ''
                  if (!this.list.selectedItems.every(item => { return item.domain_id === domain })) {
                    ret.validate = false
                    ret.tooltip = this.$t('system.management_notify_channels.domain.tips')
                    return ret
                  }
                  return ret
                },
              },
              {
                label: this.$t('system.text_129'),
                permission: 'contacts_delete',
                action: (obj) => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('system.text_129'),
                    name: this.$t('dictionary.receiver'),
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            return {
              validate: !!this.list.selectedItems.length,
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('contact-detail')
    this.$bus.$on('ContactListSingleRefresh', id => {
      this.list.singleRefresh(id)
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
        with_meta: true,
      }
      return ret
    },
    parseDetail (detail) {
      const ret = {
        enabled: true,
        email: {
          enabled: false,
          verified: false,
          contact: '',
        },
        mobile: {
          enabled: false,
          verified: false,
          contact: '',
        },
      }
      if (!R.is(String, detail)) return ret
      const arr = JSON.parse(detail)
      arr.forEach(item => {
        ret[item.contact_type] = item
        if (!item.enabled) {
          ret.enabled = false
        }
      })
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ContactSidePage', {
        id: row.id,
        resource: 'receivers',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
