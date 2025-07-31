<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="lb" />
</template>

<script>
import { getCopyWithContentTableColumn, getBrandTableColumn, getProjectDomainTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { REGIONS, COUNTRYS } from '../constants'

export default {
  name: 'LoadbalancerlistenerruleDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
      ],
    }
  },
  computed: {
    isRedirect () {
      return this.data.redirect === 'raw'
    },
    extraInfo () {
      const ret = [
        {
          title: this.$t('network.text_308'),
          items: [
            getCopyWithContentTableColumn({
              field: 'loadbalancer',
              title: this.$t('network.text_137'),
              hideField: true,
              slotCallback: row => {
                if (!row.loadbalancer) return '-'
                return [
                  <side-page-trigger permission='lb_loadbalancers_get' name='LbSidePage' id={row.loadbalancer_id} vm={this}>{ row.loadbalancer }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'listener',
              title: this.$t('network.text_138'),
            },
            getProjectDomainTableColumn(),
            {
              field: 'domain',
              title: this.$t('network.text_156'),
            },
            {
              field: 'path',
              title: this.$t('network.text_524'),
            },
            {
              field: 'redirect',
              title: this.$t('network.text_368'),
              formatter: ({ row }) => {
                return row.redirect === 'raw' ? this.$t('network.text_481') : this.$t('network.text_480')
              },
            },
            {
              field: 'redirect_code',
              title: this.$t('network.text_369'),
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                return this.$t('redirect_code')[row.redirect_code] ? this.$t('redirect_code')[row.redirect_code].name : '-'
              },
            },
            {
              field: 'redirect_scheme',
              title: this.$t('network.text_370'),
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                const ret = [row.redirect_scheme, row.redirect_host].filter(item => !!item).join('://')
                return [ret, row.redirect_path].filter(item => !!item).join('')
              },
            },
            {
              field: 'http_request_rate',
              title: this.$t('network.text_437'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.http_request_rate + this.$t('network.text_76')
              },
            },
            {
              field: 'http_request_rate_per_src',
              title: this.$t('network.text_440'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.http_request_rate_per_src + this.$t('network.text_76')
              },
            },
            getCopyWithContentTableColumn({
              field: 'backend_group',
              title: this.$t('network.default_backend_server_group'),
              hideField: true,
              slotCallback: row => {
                if (this.isRedirect) return '-'
                if (!row.backend_group) return '-'
                return [
                  <side-page-trigger name='LoadbalancerbackendgroupSidePage' id={row.backend_group_id} vm={this}>{ row.backend_group }</side-page-trigger>,
                ]
              },
            }),
            // {
            //   field: 'vpc',
            //   title: 'VPC',
            // },
            // {
            //   field: 'region',
            //   title: '区域',
            // },
            // {
            //   field: 'zone',
            //   title: '可用区',
            // },
          ],
        },
      ]
      if (this.data.provider === 'Cloudflare') {
        ret[0].items = ret[0].items.filter(item => !['redirect', 'redirect_code', 'redirect_scheme', 'http_request_rate', 'http_request_rate_per_src'].includes(item.field))
        ret[0].items.push({
          field: 'backend_groups',
          title: this.$t('network.text_139'),
          formatter: ({ row }) => {
            if (!row.backend_groups) return '-'
            return row.backend_groups.map(item => {
              return <side-page-trigger class="mr-2" name='LoadbalancerbackendgroupSidePage' id={item.id} vm={this}>{ item.name }</side-page-trigger>
            })
          },
        })
        ret[0].items.push({
          field: 'redirect_pool',
          title: this.$t('network.rule_redirect'),
          slots: {
            default: ({ row }, h) => {
              if (!row.redirect_pool) return this.$t('network.rule_redirect_type_off')
              const data = []
              Object.keys(row.redirect_pool).forEach(type => {
                Object.keys(row.redirect_pool[type]).forEach(key => {
                  data.push({
                    type: type === 'region_pools' ? this.$t('network.text_199') : this.$t('network.cdn.clear_cache_country'),
                    value: this.getRegionName(key, type),
                    backend_groups: row.redirect_pool[type][key],
                  })
                })
              })
              const columns = [
                {
                  field: 'type',
                  title: this.$t('network.rule_redirect_type'),
                },
                {
                  field: 'value',
                  title: this.$t('network.text_199'),
                },
                {
                  field: 'backend_groups',
                  title: this.$t('network.text_139'),
                  slots: {
                    default: ({ row }) => {
                      if (!row.backend_groups) return '-'
                      const list = row.backend_groups.map(item => {
                        return <side-page-trigger class="mr-2" name='LoadbalancerbackendgroupSidePage' id={item.id} vm={this}>{ item.name }</side-page-trigger>
                      })
                      return list
                    },
                  },
                },
              ]
              return [
                <vxe-grid class="mb-2" data={ data } columns={ columns } />,
              ]
            },
          },
        })
      }
      return ret
    },
  },
  methods: {
    getRegionName (key, type) {
      if (type === 'region_pools') {
        return REGIONS.find(item => item.key === key)?.label || '-'
      }
      return COUNTRYS.find(item => item.key === key)?.label || '-'
    },
  },
}
</script>
