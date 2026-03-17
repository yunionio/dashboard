<template>
  <div>
    <a-alert type="info" class="mb-2">
      <template #message>
        <div>{{ $t('scope.text_956') }}</div>
        <div><span class="text-color-help mr-2">* Endpoint/Issuer:</span>{{ serverUrl }}/api/v1/auth/oidc<copy class="ml-1" :message="`${serverUrl}/api/v1/auth/oidc`" /></div>
        <div><span class="text-color-help mr-2">* AuthURL:</span>{{ serverUrl }}/api/v1/auth/oidc/auth<copy class="ml-1" :message="`${serverUrl}/api/v1/auth/oidc/auth`" /></div>
        <div><span class="text-color-help mr-2">* TokenURL:</span>{{ serverUrl }}/api/v1/auth/oidc/token<copy class="ml-1" :message="`${serverUrl}/api/v1/auth/oidc/token`" /></div>
        <div><span class="text-color-help mr-2">* UserInfoURL:</span>{{ serverUrl }}/api/v1/auth/oidc/user<copy class="ml-1" :message="`${serverUrl}/api/v1/auth/oidc/user`" /></div>
        <div><span class="text-color-help mr-2">* Scopes:</span>user profile<copy class="ml-1" message="user profile" /></div>
      </template>
    </a-alert>
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :singleActions="singleActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import windows from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
export default {
  name: 'CredentialList',
  components: {
  },
  mixins: [windows, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      serverUrl: '',
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'credentials',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: 'ID',
            filter: true,
            formatter: val => {
              return `id.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ClientID', key: 'id' },
          { label: this.$t('scope.text_15'), key: 'enabled' },
          { label: this.$t('dictionary.domain'), key: 'domain' },
          { label: this.$t('scope.text_16'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('scope.text_17'),
          action: () => {
            this.createDialog('CredentialOpendIdCreate', {
              title: this.$t('common_632'),
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('scope.text_18'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('scope.text_18'),
              name: this.$t('common_631'),
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
  computed: mapGetters(['userInfo']),
  created () {
    this.list.fetchData()
    this.getServerUrl()
  },
  methods: {
    refresh () {
      this.list.refresh()
    },
    getParam () {
      const ret = {
        type: 'oidc',
        project_id: this.userInfo.projectId,
        scope: undefined,
      }
      return ret
    },
    async getServerUrl () {
      let manager = new this.$Manager('services', 'v1')
      try {
        const response = await manager.list({
          params: {
            type: ['common'],
          },
        })
        const id = (response.data.data && response.data.data.length && response.data.data[0].id) || ''
        if (id) {
          const configResponse = await manager.getSpecific({
            id,
            spec: 'config',
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
