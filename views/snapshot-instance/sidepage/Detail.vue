<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="instance_snapshots"
    status-module="snapshot" />
</template>

<script>
import { CREATE_METHODS } from '../constants'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SnapshotDetail',
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
        {
          field: 'size',
          title: this.$t('compute.text_422'),
          formatter: ({ cellValue, row }) => {
            const size = row.snapshots.reduce((a, b) => a + b.size, 0)
            return sizestr(size, 'M', 1024)
          },
        },
        {
          field: 'created_by',
          title: this.$t('compute.text_1070'),
          formatter: ({ cellValue }) => {
            return CREATE_METHODS[cellValue]
          },
        },
        {
          field: 'resource',
          title: this.$t('compute.text_1071'),
          formatter: ({ cellValue }) => {
            return this.$t('compute.text_102')
          },
        },
        {
          field: 'rules',
          title: this.$t('table.title.sub_snapshot'),
          slots: {
            default: ({ row }) => {
              const len = (row.snapshots && row.snapshots.length) || 0
              return <a onClick={ () => this.$emit('tab-change', 'sub-snapshot-detail') }>{len}个</a>
            },
          },
        },
        {
          field: 'guest',
          title: this.$t('dictionary.server'),
          slots: {
            default: ({ row }, h) => {
              if (row.guest) {
                return [
                  <div>
                    <side-page-trigger permission="server_get" name="VmInstanceSidePage" id={row.guest_id} vm={this}>{row.guest}</side-page-trigger>
                    {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
                  </div>,
                ]
              }
              return [<div>-</div>]
            },
          },
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
