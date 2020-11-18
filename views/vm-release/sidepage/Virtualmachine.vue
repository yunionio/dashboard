<template>
  <vxe-grid :data="responseData.data || []" :columns="columns" />
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmReleaseVirtualmachineSidepage',
  mixins: [WindowsMixin],
  props: {
    responseData: {
      type: Object,
      default: () => ({ data: [] }),
    },
  },
  data () {
    return {
      columns: [
        {
          field: 'name',
          title: this.$t('helm.text_16'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              const text = row.name || '-'
              return [
                <list-body-cell-wrap copy hideField={true} field='name' row={row} message={text}>
                  <side-page-trigger name='VmInstanceSidePage' id={row.externalInfo.id} vm={this}>{text}</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        {
          field: 'status',
          title: this.$t('k8s.text_35'),
          width: 100,
          slots: {
            default: ({ row }, h) => {
              const warning = row.reason
              let warnTooltip = null
              if (warning && row.status === 'Invalid') {
                warnTooltip = (
                  <a-tooltip placement="top">
                    <template slot="title">
                      { warning }
                    </template>
                    <div class='text-truncate'>
                      <a-icon type="bulb" theme="twoTone" twoToneColor="#f5222d" class="mr-2" />
                      <span>{ this.$t('k8s.text_402') }</span>
                    </div>
                  </a-tooltip>
                )
              }
              return [
                <div class='text-truncate'>
                  <status status={ row.status } statusModule='vmReleaseVirtualmachine'>
                    { warnTooltip }
                  </status>
                </div>,
              ]
            },
          },
        },
        {
          field: 'tryTimes',
          title: this.$t('helm.text_105'),
          formatter: ({ row }) => {
            if (R.is(Number, +row.tryTimes) && !Number.isNaN(+row.tryTimes)) return row.tryTimes
            return '-'
          },
        },
        {
          field: 'ips',
          title: 'IP',
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              if (!row.externalInfo || !row.externalInfo.ips) return '-'
              return row.externalInfo.ips.map(val => <list-body-cell-wrap copy hideField={true} message={val}>{val}</list-body-cell-wrap>)
            },
          },
        },
        {
          field: 'eip',
          title: this.$t('dictionary.eip'),
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              if (!row.externalInfo || !row.externalInfo.eip) return '-'
              const val = row.externalInfo.eip
              return [<list-body-cell-wrap copy hideField={true} message={val}>{val}</list-body-cell-wrap>]
            },
          },
        },
        {
          field: 'instanceType',
          title: this.$t('helm.text_99'),
        },
      ],
    }
  },
}
</script>
