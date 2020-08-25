<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :nameRules="[
      { required: true, message: this.$t('bill.text_145') },
    ]"
    status-module="cloudgroup" />
</template>

<script>
import {
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudgroupDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getPublicScopeTableColumn({ vm: this, resource: 'cloudgroups' }),
        {
          field: 'cloudpolicy_count',
          title: this.$t('cloudenv.coludgroup_text005'),
          slots: {
            default: ({ row }) => {
              return [
                <a onClick={ () => this.$emit('tab-change', 'cloudpolicy-list-for-cloudgroup-sidepage') }>{row.cloudpolicy_count}</a>,
              ]
            },
          },
        },
        {
          field: 'clouduser_count',
          title: this.$t('cloudenv.coludgroup_text006'),
          slots: {
            default: ({ row }) => {
              return [
                <a onClick={ () => this.$emit('tab-change', 'clouduser-list-for-cloudgroup-sidepage') }>{row.clouduser_count}</a>,
              ]
            },
          },
        },
      ],
    }
  },
}
</script>
