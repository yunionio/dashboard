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
      extraInfo: [
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
                return [row.redirect_scheme, row.redirect_host, row.redirect_path].filter(item => !!item).join('、')
              },
            },
            getCopyWithContentTableColumn({
              field: 'backend_group',
              title: this.$t('network.text_139'),
              hideField: true,
              slotCallback: row => {
                if (this.isRedirect) return '-'
                if (!row.backend_group) return '-'
                return [
                  <side-page-trigger name='LoadbalancerbackendgroupSidePage' id={row.backend_group_id} vm={this}>{ row.backend_group }</side-page-trigger>,
                ]
              },
            }),
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
      ],
    }
  },
  computed: {
    isRedirect () {
      return this.data.redirect === 'raw'
    },
  },
}
</script>
