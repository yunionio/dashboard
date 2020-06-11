<template>
  <div class="h-desc-bg mb-2">
    <h5 class="h-title">以下<em>{{params.data.length}}个</em>云账号将进行更新账单文件</h5>
    <div class="pl-4 pr-4 pb-2">
      <a-row>
        <a-col :span="24">
          <dialog-table :data="params.data" :columns="columns" />
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
import {
  getAccessUrlTableColumn,
  getBalanceTableColumn,
  getGuestCountTableColumn,
  getHostCountTableColumn,
} from '@Cloudenv/views/cloudaccount/utils/columns'
import {
  getBrandTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'ContentInfo',
  props: {
    params: {
      type: Object,
    },
  },
  computed: {
    columns () {
      return [
        getNameDescriptionTableColumn({
          hideField: true,
          edit: false,
          editDesc: false,
          slotCallback: row => {
            return (
              <side-page-trigger>{ row.name }</side-page-trigger>
            )
          },
        }),
        getAccessUrlTableColumn(),
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'cloudaccount' }),
        getStatusTableColumn({ statusModule: 'cloudaccountHealthStatus', title: '健康状态', field: 'health_status', minWidth: 90 }),
        getGuestCountTableColumn(),
        getBalanceTableColumn(),
        getHostCountTableColumn(),
        getCopyWithContentTableColumn({ field: 'account', title: '账号' }),
        getBrandTableColumn(),
      ]
    },
  },
}
</script>

<style lang="scss" scoped>
.h-title{
  font-size: 16px;
  padding: 10px 0;
  margin-left: 21px;
  font-weight: normal;
}
.h-title em{
  font-style: normal;
  color: #1890ff;
}
.h-desc-bg{
  background: rgba(245, 245, 243, 0.4)
}
</style>
