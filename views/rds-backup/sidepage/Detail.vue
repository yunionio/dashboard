<template>
  <detail :base-info="baseInfo" :data="data"  statusModule="rdsBackup" :extra-info="extraInfo" />
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
    list: {
      type: Object,
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
          title: '实例信息',
          items: [
            {
              field: 'tenant',
              title: '所属项目',
            },
            {
              field: 'backup_size_mb',
              title: '大小',
              slots: {
                default: ({ row }) => {
                  return `${row.backup_size_mb}GB`
                },
              },
            },
            {
              field: 'dbinstance',
              title: '实例名称',
            },
            {
              field: 'backup_mode',
              title: '备份类型',
            },
            {
              field: 'engine',
              title: '数据库类型',
            },
            {
              field: 'account',
              title: '云账号',
            },
            {
              field: 'account',
              title: '子账号',
            },
            {
              field: 'brand',
              title: '平台',
            },
            {
              field: 'region',
              title: '区域',
            },
          ],
        },
      ],
    }
  },
}
</script>
