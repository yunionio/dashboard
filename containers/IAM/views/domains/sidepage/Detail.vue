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
import { sizestrWithUnit } from '@/utils/utils'
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
      domainUsageMap: {},
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'domain', columns: () => this.columns, tipName: this.$t('dictionary.domain') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'domain', columns: () => this.columns, tipName: this.$t('dictionary.domain') }),
        {
          field: 'idp',
          title: this.$t('system.text_165'),
        },
        getEnabledTableColumn(),
      ],
      usageColumns: [
        {
          title: 'CPU',
          field: 'cpu',
          formatter: ({ row }) => {
            return this.$t('IAM.text_4', [row.cpu])
          },
        },
        {
          title: this.$t('system.text_86'),
          field: 'mem',
          formatter: ({ row }) => {
            return sizestrWithUnit(row.mem, 'M', 1024)
          },
        },
        {
          title: this.$t('system.text_87'),
          field: 'diskList',
          slots: {
            default: ({ row }) => {
              if (!row.diskList.length) return '-'
              return row.diskList.map(item => {
                return <div>{sizestrWithUnit(item.value, 'M', 1024)}{this.$t('IAM.text_8', [this.$te(`common.storage.${item.medium_type}`) ? this.$t(`common.storage.${item.medium_type}`) : item.medium_type])}</div>
              })
            },
          },
        },
        {
          title: 'GPU',
          field: 'gpu',
          slots: {
            default: ({ row }) => {
              return [<div>
                <div>{this.$t('IAM.text_5', [row.gpu.gpu])}{this.$t('IAM.text_8', [this.$t('IAM.text_9')])}</div>
                <div>{this.$t('IAM.text_5', [row.gpu.gpu_server])}{this.$t('IAM.text_8', [this.$t('system.text_30')])}</div>
              </div>]
            },
          },
        },
        {
          title: this.$t('system.text_30'),
          field: 'vm',
          formatter: ({ row }) => {
            return this.$t('IAM.text_6', [row.vm])
          },
        },
        {
          title: 'EIP',
          field: 'eip',
          formatter: ({ row }) => {
            return this.$t('IAM.text_7', [row.eip])
          },
        },
        {
          title: this.$t('IAM.text_2'),
          field: 'mb',
          formatter: ({ row }) => {
            return sizestrWithUnit(row.mb, 'M', 1024)
          },
        },
      ],
    }
  },
  computed: {
    extResources () {
      return this.data.ext_resource ? this.data.ext_resource : {}
    },
    usageData () {
      return [{
        cpu: this.domainUsageMap['domain.servers.cpu'] || 0,
        mem: this.domainUsageMap['domain.servers.memory'] || 0,
        diskList: this.genDiskTypeList(this.domainUsageMap),
        gpu: {
          gpu: this.domainUsageMap.isolated_devices || 0,
          gpu_server: this.domainUsageMap['domain.servers.isolated_devices'] || 0,
        },
        vm: this.domainUsageMap['domain.servers'] || 0,
        eip: this.domainUsageMap['domain.eip'] || 0,
        mb: (this.domainUsageMap['domain.eip.floating_ip.bandwidth.mb'] || 0) + (this.domainUsageMap['domain.eip.public_ip.bandwidth.mb'] || 0),
      }]
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
      const usageRes = {
        title: this.$t('IAM.text_3'),
        field: 'usage',
        slots: {
          default: ({ row }, h) => {
            return [
              <vxe-grid class="mb-2" data={ this.usageData } columns={ this.usageColumns } />,
            ]
          },
        },
      }
      return [usageRes, serverRes, multiCloudRes]
    },
  },
  created () {
    this.fetchUsage()
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
    async fetchUsage () {
      const res = await new this.$Manager('rpc', 'v2').get({
        resource: 'rpc',
        id: 'usages/general-usage',
        params: {
          scope: 'domain',
          domain_id: this.data.id,
        },
      })
      this.domainUsageMap = res.data || {}
    },
    genDiskTypeList (map) {
      const list = []
      const keys = Object.keys(map)
      keys.map(key => {
        if (key.indexOf('domain.disks.medium_type') === 0 && key !== 'domain.disks.medium_type') {
          console.log('ey', key)
          const newKey = key.replace('domain.disks.medium_type.', '')
          if (newKey) {
            list.push({ medium_type: newKey, value: map[key] })
          }
        }
      })
      return list
    },
  },
}
</script>
