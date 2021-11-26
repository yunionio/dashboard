<template>
  <div>
    <a-alert type="info" class="mb-2">
      <template #message>
        <div>{{ $t('system.text_565') }}</div>
        <div><span class="text-color-help mr-2">* entity_id:</span>{{ serverUrl }}<copy class="ml-1" :message="serverUrl" /></div>
        <div><span class="text-color-help mr-2">* redirect_uri:</span>{{ serverUrl }}/api/v1/auth/ssologin<copy class="ml-1" :message="`${serverUrl}/api/v1/auth/ssologin`" /></div>
        <div>{{ $t('system.text_566') }}</div>
        <div><span class="text-color-help mr-2">* redirect_uri:</span>{{ serverUrl }}/api/v1/auth/ssologin<copy class="ml-1" :message="`${serverUrl}/api/v1/auth/ssologin`" /></div>
      </template>
    </a-alert>
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions"
      :showSearchbox="showSearchbox"
      :showGroupActions="showGroupActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import jumper from '@/mixins/jumper'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import { getEnabledFilter, getStatusFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import { getRequestT } from '@/utils/utils'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'IDPList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, jumper],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      serverUrl: '',
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'identity_providers',
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
          description: getDescriptionFilter(),
          enabled: getEnabledFilter(),
          status: getStatusFilter('idp'),
          auto_create_user: getEnabledFilter({
            label: this.$t('common_501'),
          }),
          // driver: {
          //   label: this.$t('system.text_204'),
          //   dropdown: true,
          //   multiple: true,
          //   items: Object.keys(this.$t('idpDrivers')).map(k => {
          //     return { label: k, key: k.toLocaleLowerCase() }
          //   }),
          // },
          template: {
            label: this.$t('common_550'),
            dropdown: true,
            multiple: true,
            items: Object.keys(this.$t('idpDrivers')).flatMap(k => {
              const templs = this.$t(`idpDrivers.${k}`)
              return Object.values(templs).map(v => {
                return {
                  label: this.$t(`idpTmplTitles.${v}`),
                  key: v.toLocaleLowerCase(),
                }
              })
            }),
          },
        },
        steadyStatus: {
          status: Object.values(expectStatus.idp).flat(),
          sync_status: Object.values(expectStatus.sync).flat(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_101'), key: 'name' },
          { label: this.$t('system.text_158'), key: 'enabled' },
          { label: this.$t('system.text_164'), key: 'status' },
          { label: this.$t('system.text_203'), key: 'sync_status' },
          { label: this.$t('system.text_204'), key: 'driver' },
        ],
      },
      groupActions: [
        {
          label: this.$t('system.text_128'),
          action: () => {
            this.jumpTo('create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('storage.text_33'),
          actions: () => {
            return [
              ...getEnabledSwitchActions(this),
              {
                label: this.$t('common.delete'),
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    title: this.$t('common.delete'),
                    name: this.$t('dictionary.identity_provider'),
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
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
  created () {
    this.initSidePageTab('idp-detail')
    this.list.fetchData()
    this.getServerUrl()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'IDPSidePage', {
        id: row.id,
        resource: 'identity_providers',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
    async getServerUrl () {
      let manager = new this.$Manager('services', 'v1')
      try {
        const response = await manager.list({
          params: {
            type: ['common'],
            $t: getRequestT(),
          },
        })
        const id = (response.data.data && response.data.data.length && response.data.data[0].id) || ''
        if (id) {
          const configResponse = await manager.getSpecific({
            id,
            spec: 'config',
            params: {
              $t: getRequestT(),
            },
          })
          const config = (configResponse.data.config && configResponse.data.config.default) || {}
          const apiServer = config.api_server || ''
          this.serverUrl = apiServer
        }
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
  },
}
</script>
