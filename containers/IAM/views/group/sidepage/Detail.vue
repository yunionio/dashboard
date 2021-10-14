<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
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
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'user_count',
          title: this.$t('system.text_199', [this.$t('dictionary.group')]),
          slots: {
            default: ({ row }) => {
              if (!row.user_count) return '0'
              return [<a onClick={ () => this.$emit('tab-change', 'user-list') }>{row.user_count}</a>]
            },
          },
        },
      ],
    }
  },
}
</script>
