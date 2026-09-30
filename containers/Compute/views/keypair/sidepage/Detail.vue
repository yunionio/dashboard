<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { getCopyWithContentTableColumn, getPublicScopeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'KeyPairDetail',
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
        getPublicScopeTableColumn({
          vm: this,
          resource: 'keypairs',
        }),
        getCopyWithContentTableColumn({
          field: 'fingerprint',
          title: this.$t('compute.text_726'),
        }),
        {
          field: 'scheme',
          title: this.$t('compute.text_175'),
        },
        {
          field: 'linked_guest_count',
          title: this.$t('compute.associated_instance_count'),
          slots: {
            default: ({ row }) => {
              if (!row.linked_guest_count) return row.linked_guest_count ?? 0
              return [
                <a onClick={() => this.$emit('tab-change', 'associated-instances')}>{ row.linked_guest_count }</a>,
              ]
            },
          },
        },
      ],
    }
  },
}
</script>
