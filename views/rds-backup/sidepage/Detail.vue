<template>
  <detail :base-info="baseInfo" :data="data"  statusModule="rdsBackup" :extra-info="extraInfo" :onManager="onManager" />
</template>
<script>
// import { sizestr } from '@/utils/utils'
// const BACKUP_TYPE = {
//   automated: '自动',
//   manual: '手动'
// }
export default {
  name: 'RdsBackupSidepageDetail',
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
      ],
      extraInfo: [
        {
          title: this.$t('db.text_225'),
          items: [
            {
              field: 'tenant',
              title: this.$t('db.text_226', [this.$t('dictionary.project')]),
            },
            {
              field: 'backup_size_mb',
              title: this.$t('db.text_38'),
              slots: {
                default: ({ row }) => {
                  return `${row.backup_size_mb}GB`
                },
              },
            },
            {
              field: 'dbinstance',
              title: this.$t('db.text_35'),
            },
            {
              field: 'backup_mode',
              title: this.$t('db.text_36'),
            },
            {
              field: 'engine',
              title: this.$t('db.text_37'),
            },
            {
              field: 'account',
              title: this.$t('db.text_67'),
            },
            {
              field: 'account',
              title: this.$t('db.text_227'),
            },
            {
              field: 'brand',
              title: this.$t('db.text_51'),
            },
            {
              field: 'region',
              title: this.$t('db.text_40'),
            },
          ],
        },
      ],
    }
  },
}
</script>
