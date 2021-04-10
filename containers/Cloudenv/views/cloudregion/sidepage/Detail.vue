<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :nameRules="[{ required: true, message: '请输入名称' }]" />
</template>

<script>
import {
  getEnabledTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'CloudregionDetail',
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
        getEnabledTableColumn({ title: this.$t('cloudenv.text_97') }),
        getBrandTableColumn({ field: 'provider' }),
        {
          field: 'zone_count',
          title: this.$t('cloudenv.text_370'),
          slots: {
            default: ({ row }) => {
              return row.zone_count > 0 ? [<a onClick={ () => this.$emit('tab-change', 'zone-list') }>{ row.zone_count }</a>] : 0
            },
          },
        },
        {
          field: 'vpc_count',
          title: this.$t('cloudenv.text_371'),
          slots: {
            default: ({ row }) => {
              return row.vpc_count > 0 ? [<a onClick={ () => this.$emit('tab-change', 'v-p-c-list') }>{ row.vpc_count }</a>] : 0
            },
          },
        },
        {
          field: 'network_count',
          title: this.$t('cloudenv.text_372'),
          slots: {
            default: ({ row }) => {
              return row.network_count > 0 ? [<a onClick={ () => this.$emit('tab-change', 'network-list') }>{ row.network_count }</a>] : 0
            },
          },
        },
        {
          field: 'guest_count',
          title: this.$t('cloudenv.text_373', [this.$t('dictionary.server')]),
        },
      ],
      extraInfo: [
        {
          title: this.$t('cloudenv.text_359'),
          items: [
            {
              field: 'location',
              title: this.$t('cloudenv.text_374'),
            },
          ],
        },
      ],
    }
  },
}
</script>
