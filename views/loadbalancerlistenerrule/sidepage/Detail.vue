<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="lb" />
</template>

<script>
import { getCopyWithContentTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
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
          title: '配置信息',
          items: [
            getCopyWithContentTableColumn({
              field: 'loadbalancer',
              title: '负载均衡实例',
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
              title: '监听',
            },
            {
              field: 'domain',
              title: '域名',
            },
            {
              field: 'path',
              title: 'URL路径',
            },
            {
              field: 'redirect',
              title: '重定向',
              formatter: ({ row }) => {
                return row.redirect === 'raw' ? '已开启' : '未开启'
              },
            },
            {
              field: 'redirect_code',
              title: '重定向方式',
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                return this.$t('redirect_code')[row.redirect_code] ? this.$t('redirect_code')[row.redirect_code].name : '-'
              },
            },
            {
              field: 'redirect_scheme',
              title: '重定向至',
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                return [row.redirect_scheme, row.redirect_host, row.redirect_path].filter(item => !!item).join('、')
              },
            },
            getCopyWithContentTableColumn({
              field: 'backend_group',
              title: '后端服务器组',
              hideField: true,
              slotCallback: row => {
                if (!row.backend_group) return '-'
                return [
                  <side-page-trigger name='LoadbalancerbackendgroupSidePage' id={row.backend_group_id} vm={this}>{ row.backend_group }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'http_request_rate',
              title: '限定接收请求速率',
              formatter: ({ row }) => row.http_request_rate + ' 秒',
            },
            {
              field: 'http_request_rate_per_src',
              title: '限定同源IP发送请求速率',
              formatter: ({ row }) => row.http_request_rate_per_src + ' 秒',
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
}
</script>
