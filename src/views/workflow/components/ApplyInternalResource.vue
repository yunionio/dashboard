<template>
  <div style="position: relative;">
    <!-- 1 -->
    <div class="mt-2">基础信息</div>
    <template v-for="(item, index) in unitInfoList">
      <div :key="'unit_info_' + item.key + index" class="detail-item mt-2">
        <div class="detail-item-title">{{item.title}}</div>
        <div class="detail-item-value">{{item.value}}</div>
      </div>
    </template>
    <!-- 2 -->
    <template v-for="(item, index) in projectInfoList">
      <div :key="'project_info_' + item.key + index" class="detail-item mt-2">
        <div class="detail-item-title">{{item.title}}</div>
        <div class="detail-item-value">{{item.value}}</div>
      </div>
    </template>
    <!-- 3 -->
    <template v-for="(item, index) in contractorInfoList">
      <div :key="'contractor_info_' + item.key + index" class="detail-item mt-2">
        <div class="detail-item-title">{{item.title}}</div>
        <div class="detail-item-value">{{item.value}}</div>
      </div>
    </template>
    <!-- 申请单 -->
    <template v-if="processType === '1'">
      <!-- 4 -->
      <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.ecs')}}</div>
      <vxe-grid
        ref="ecsTable"
        size="mini"
        border
        :columns="COLUMNS_MAP.ecs"
        :data="[...listData.ecs, ...listData.eip]" />
      <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.rds')}}</div>
      <vxe-grid
        ref="rdsTable"
        size="mini"
        border
        :columns="COLUMNS_MAP.rds"
        :data="listData.rds" />
      <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.server')}}</div>
      <vxe-grid
        ref="serverTable"
        size="mini"
        border
        :columns="COLUMNS_MAP.server"
        :data="listData.server" />
      <!-- 5 -->
      <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.basic_security_services')}}</div>
      <vxe-grid
        ref="bssTable"
        size="mini"
        border
        :columns="COLUMNS_MAP.basicSecurityServices"
        :data="listData.basicSecurityServices" />
      <div class="mt-4 mb-2">{{$t('wz_workflow_form.titles.cloud_security_table')}}</div>
      <vxe-grid
        ref="cstTable"
        size="mini"
        border
        :columns="COLUMNS_MAP.cloudSecurityTable"
        :data="listData.cloudSecurityTable" />
      <template v-if="listData.openResources.length">
        <div class="mt-4 mb-2">
          {{$t('wz_workflow_form.open_resource_list')}}
          <a-button v-if="resourceSelected.length" type="link" @click="handleSendEmailClick">{{$t('scope.notify_user')}}</a-button>
          <a-popover v-else placement="top">
            <template slot="content">{{$t('wz_workflow_form.tips.send_email_tip')}}</template>
            <a-button type="link" :disabled="true" @click="handleSendEmailClick">{{$t('scope.notify_user')}}</a-button>
          </a-popover>
        </div>
        <vxe-grid
          ref="opTable"
          size="mini"
          border
          :columns="COLUMNS_MAP.openResource"
          :data="listData.openResources"
          @checkbox-change="handleResourceCheckedChange"
          @checkbox-all="handleResourceCheckedChange" />
      </template>
    </template>
    <!-- 升降配 -->
    <template v-else-if="processType === '11'">
      <div class="mt-4 mb-2">{{$t('wz_workflow_form.change_resource_list')}}</div>
      <vxe-grid
        ref="chTable"
        size="mini"
        border
        :columns="COLUMNS_MAP.changeResource"
        :data="listData.changeResources" />
    </template>
    <!-- 释放 -->
    <template v-else-if="processType === '21'">
      <div class="mt-4 mb-2">{{$t('wz_workflow_form.delete_resource_list')}}</div>
      <vxe-grid
        ref="delTable"
        size="mini"
        border
        :columns="COLUMNS_MAP.deleteResource"
        :data="listData.deleteResources" />
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { getWorkflowParamter } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ApplyInternalResourceInfo',
  mixins: [WindowsMixin],
  props: {
    variables: Object,
    local_variables: Object,
  },
  data () {
    return {
      WORKFLOW_ITEM_MAP: {},
      INIT_UNIT_INFO: {},
      INIT_PROJECT_INFO: {},
      INIT_CONTRACTOR_INFO: {},
      COLUMNS_MAP: {},
      ALL_SELECT_OPTIONS: {},
      resourceSelected: [],
    }
  },
  computed: {
    resourceData () {
      if (this.local_variables) {
        return getWorkflowParamter(this.local_variables)
      }
      return getWorkflowParamter(this.variables)
    },
    processType () {
      const { process_type } = this.resourceData
      return process_type.id
    },
    unitInfoList () {
      const ret = []
      if (R.isEmpty(this.INIT_UNIT_INFO)) return []
      const keys = Object.keys(this.INIT_UNIT_INFO)
      const { unitInfo, process_id, process_type } = this.resourceData
      ret.push({
        field: 'process_type',
        title: this.WORKFLOW_ITEM_MAP.process_type.label,
        value: process_id ? process_id + '-' + process_type.name : process_type.name,
      })
      keys.map(key => {
        const item = { field: key }
        item.title = this.WORKFLOW_ITEM_MAP[key]?.label
        if (this.WORKFLOW_ITEM_MAP[key] && this.WORKFLOW_ITEM_MAP[key].valueFormatter) {
          item.value = this.WORKFLOW_ITEM_MAP[key].valueFormatter(unitInfo[key])
        } else {
          item.value = unitInfo[key]?.name || unitInfo[key]?.id || unitInfo[key] || '-'
        }
        if (item.title) ret.push(item)
      })
      return ret
    },
    projectInfoList () {
      const ret = []
      if (R.isEmpty(this.INIT_UNIT_INFO)) return []
      const keys = Object.keys(this.INIT_PROJECT_INFO)
      const { projectInfo } = this.resourceData
      keys.map(key => {
        const item = { field: key }
        item.title = this.WORKFLOW_ITEM_MAP[key].label
        if (this.WORKFLOW_ITEM_MAP[key] && this.WORKFLOW_ITEM_MAP[key].valueFormatter) {
          item.value = this.WORKFLOW_ITEM_MAP[key].valueFormatter(projectInfo[key])
        } else {
          item.value = projectInfo[key]?.name || projectInfo[key] || '-'
        }
        if (this.ALL_SELECT_OPTIONS.hasOwnProperty(key) && !(this.WORKFLOW_ITEM_MAP[key] && this.WORKFLOW_ITEM_MAP[key].valueFormatter)) {
          if (this.WORKFLOW_ITEM_MAP && this.WORKFLOW_ITEM_MAP[key] && this.WORKFLOW_ITEM_MAP[key].multiple) { // 多选
            const originList = R.is(Array, projectInfo[key]) ? projectInfo[key] : [projectInfo[key]]
            originList.map((o, idx) => {
              const targetList = this.ALL_SELECT_OPTIONS[key].filter(l => l.id === o.id)
              if (targetList[0]) {
                item.value = (idx === 0 || item.value === '-') ? targetList[0].name : (item.value + ', ' + targetList[0].name)
              }
            })
          } else {
            const targetList = this.ALL_SELECT_OPTIONS[key].filter(l => l.id === item.value)
            if (targetList[0]) {
              item.value = targetList[0].name
            }
          }
        }
        ret.push(item)
      })
      return ret
    },
    contractorInfoList () {
      const ret = []
      if (R.isEmpty(this.INIT_UNIT_INFO)) return []
      const keys = Object.keys(this.INIT_CONTRACTOR_INFO)
      const { contractorInfo } = this.resourceData
      keys.map(key => {
        const item = { field: key }
        item.title = this.WORKFLOW_ITEM_MAP[key].label
        item.value = contractorInfo[key]?.name || contractorInfo[key] || '-'
        ret.push(item)
      })
      return ret
    },
    listData () {
      const { cloudResourceInfo = {}, cloudSecurityInfo = {}, openResourceInfo = {}, changeResourceInfo = {}, deleteResourceInfo = {} } = this.resourceData
      const { ecs = [], rds = [], server = [], eip = [] } = cloudResourceInfo
      const { basicSecurityServices = [], cloudSecurityTable = [] } = cloudSecurityInfo
      const { resources: openResources = [] } = openResourceInfo
      const { resources: changeResources = [] } = changeResourceInfo
      const { resources: deleteResources = [] } = deleteResourceInfo
      return {
        ecs,
        eip,
        rds,
        server,
        basicSecurityServices,
        cloudSecurityTable,
        openResources: openResources.map((item, index) => {
          return {
            ...item,
            index,
          }
        }),
        changeResources,
        deleteResources,
      }
    },
  },
  created () {
    try {
      if (!this.$store.getters.workflow.enableApplyInternalResource) return
      const requireComponent = require.context('@scope', true, /constants\.(js)$/)
      const keys = requireComponent.keys().filter(item => {
        const arr = item.split('/')
        return arr.includes('workflow-apply-internal-resource') && arr.includes('constants.js')
      })
      keys.forEach(fileName => {
        // 获取组件配置
        const componentConfig = requireComponent(fileName)
        const { WORKFLOW_ITEM_MAP = {}, INIT_UNIT_INFO = {}, INIT_PROJECT_INFO = {}, INIT_CONTRACTOR_INFO = {}, COLUMNS_MAP = {}, ALL_SELECT_OPTIONS = {} } = componentConfig
        if (!R.isEmpty(WORKFLOW_ITEM_MAP)) {
          this.WORKFLOW_ITEM_MAP = WORKFLOW_ITEM_MAP
          this.INIT_UNIT_INFO = INIT_UNIT_INFO
          this.INIT_PROJECT_INFO = INIT_PROJECT_INFO
          this.INIT_CONTRACTOR_INFO = INIT_CONTRACTOR_INFO
          this.COLUMNS_MAP = COLUMNS_MAP
          this.ALL_SELECT_OPTIONS = ALL_SELECT_OPTIONS
        }
      })
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    handleResourceCheckedChange (e) {
      this.resourceSelected = e.selection.map(item => item.index)
    },
    handleSendEmailClick () {
      this.createDialog('WorkflowEmailSendDialog', {
        resourceList: this.listData.openResources.filter(item => this.resourceSelected.includes(item.index)),
        email: this.resourceData?.unitInfo?.email,
        project_name: this.resourceData?.projectInfo?.project_name,
      })
    },
  },
}
</script>
<style lang="less" scoped>
.tag-list {
  min-height: 65px;
  border: 1px solid #ddd;
  padding: 8px;
}
.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
}
</style>
