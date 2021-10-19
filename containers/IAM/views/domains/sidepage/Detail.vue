<template>
  <div>
    <a-alert type="warning" class="mb-2" :showIcon="false" :message="$t('system.text_586')" banner />
    <div class="d-flex justify-content-start">
      <a-button :disabled="loading" @click="refresh">
        <a-icon v-if="loading" type="sync" spin />
        <a-icon v-else type="sync" />
      </a-button>
    </div>
    <detail
      :data="data"
      :base-info="baseInfo"
      :extra-info="extraInfo"
      :on-manager="onManager"
      :resource="resource" />
  </div>
</template>

<script>
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'

export default {
  name: 'GroupDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: String,
    columns: Array,
  },
  data () {
    return {
      loading: false,
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'domain', columns: () => this.columns, tipName: this.$t('dictionary.domain') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'domain', columns: () => this.columns, tipName: this.$t('dictionary.domain') }),
        {
          field: 'idp',
          title: this.$t('system.text_165'),
        },
        getEnabledTableColumn(),
      ],
    }
  },
  computed: {
    extResources () {
      return this.data.ext_resource ? this.data.ext_resource : {}
    },
    extraInfo () {
      const serverRes = {
        title: this.$t('system.text_173'),
        items: [
          {
            field: 'vpcs',
            title: 'VPC',
            formatter: ({ row }) => {
              return this.$t('system.text_459', [this.extResources.vpcs || 0])
            },
          },
          {
            field: 'dns_zones',
            title: this.$t('dictionary.dns_zone'),
            formatter: ({ row }) => {
              return this.$t('system.text_459', [this.extResources.dns_zones || 0])
            },
          },
          {
            field: 'idp_count',
            title: this.$t('dictionary.identity_provider'),
            formatter: ({ row }) => {
              return this.$t('system.text_459', [row.idp_count || 0])
            },
          },
          {
            field: 'project_count',
            title: this.$t('dictionary.project'),
            slots: {
              default: ({ row }, h) => {
                const ret = [
                  <a onClick={ () => this.$emit('tab-change', 'project-list') }>{this.$t('system.text_459', [row.project_count || 0])}</a>,
                ]
                return ret
              },
            },
          },
          {
            field: 'group_count',
            title: this.$t('dictionary.group'),
            formatter: ({ row }) => {
              return this.$t('system.text_459', [row.group_count || 0])
            },
          },
          {
            field: 'user_count',
            title: this.$t('dictionary.user'),
            slots: {
              default: ({ row }, h) => {
                const ret = [
                  <a onClick={ () => this.$emit('tab-change', 'user-list') }>{this.$t('system.text_459', [row.user_count || 0])}</a>,
                ]
                return ret
              },
            },
          },
          {
            field: 'policy_count',
            title: this.$t('dictionary.policy'),
            formatter: ({ row }) => {
              return this.$t('system.text_459', [row.policy_count || 0])
            },
          },
          {
            field: 'role_count',
            title: this.$t('dictionary.role'),
            slots: {
              default: ({ row }, h) => {
                const ret = [
                  <a onClick={ () => this.$emit('tab-change', 'role-list') }>{this.$t('system.text_459', [row.role_count || 0])}</a>,
                ]
                return ret
              },
            },
          },
        ],
      }
      const multiCloudRes = {
        title: this.$t('system.multicloud_resource_statistics'),
        items: [
          {
            field: 'cloudaccounts',
            title: this.$t('dictionary.cloudaccount'),
            slots: {
              default: ({ row }, h) => {
                const ret = [
                  <a onClick={ () => this.$emit('tab-change', 'cloudaccount-list') }>{this.$t('system.text_459', [this.extResources.cloudaccounts || 0])}</a>,
                ]
                return ret
              },
            },
          },
          {
            field: 'cloudusers',
            title: this.$t('dictionary.clouduser'),
            formatter: ({ row }) => {
              return this.$t('system.text_459', [this.extResources.cloudusers || 0])
            },
          },
          {
            field: 'cloudgroups',
            title: this.$t('dictionary.cloudgroup'),
            formatter: ({ row }) => {
              return this.$t('system.text_459', [this.extResources.cloudgroups || 0])
            },
          },
          {
            field: 'proxysettings',
            title: this.$t('dictionary.proxysetting'),
            formatter: ({ row }) => {
              return this.$t('system.text_459', [this.extResources.proxysettings || 0])
            },
          },
        ],
      }
      return [serverRes, multiCloudRes]
    },
  },
  methods: {
    refresh () {
      this.loading = true
      new this.$Manager('scope-resource', 'v1').performClassAction({
        action: 'refresh',
      }).then((res) => {
        this.loading = false
        this.$bus.$emit('SystemDomainsListRefresh', true)
      }).catch(() => {
        this.loading = false
      })
    },
  },
}
</script>
