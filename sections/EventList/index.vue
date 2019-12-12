<template>
  <div>
    <div class="mb-2">
      <refresh-button :loading="loading" @refresh="refresh" />
    </div>
    <div class="d-flex mb-3">
      <div class="flex-fill d-flex">
        <a-select
          style="width: 150px;"
          :defaultValue="searchDefaultValue"
          @change="selectChange"
          label-in-value
          class="mr-2">
          <a-select-option v-for="item in searchOptions" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
        </a-select>
        <a-input class="mr-2 w-25" style="min-width: 200px;" @keyup.enter.stop="handleSearch" placeholder="请输入完整内容精准搜索" v-model="searchText" />
        <a-button @click="handleSearch" :disabled="loading" icon="search" />
      </div>
      <div>
        <a-date-picker
          v-model="dateTime"
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择终止时间进行查询"
          @change="handleDateTimeChange"
          :showTime="{ defaultValue: $moment('00:00:00', 'HH:mm:ss') }" />
      </div>
    </div>
    <div class="mb-3 d-flex align-items-center" v-if="!isEmptySearched">
      <span style="font-size: 12px;">筛选条件：</span>
      <a-tag
        v-for="(item, key) of searched"
        :key="key"
        closable
        size="small"
        class="ml-1"
        type="info"
        @close="clearSearch(key)">
        {{ item.label }}：{{ item.key }}
      </a-tag>
      <a style="font-size: 12px; color: #999;" class="ml-2" @click="clearAllSearch">清除</a>
    </div>
    <div>
      <vxe-grid
        ref="grid"
        highlight-hover-row
        :data="data"
        :columns="columns">
        <template v-slot:empty>
          <loader :loading="loading" />
        </template>
      </vxe-grid>
      <div v-if="data.length > 0 && nextMarker" class="action-wrap">
        <div class="text-center" v-if="nextMarker">
          <a-button :loading="loading" type="link" @click="fetchData">{{ loading ? '加载中' : '加载更多' }}</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { Manager } from '@/utils/manager'
import OBJ_TYPE from '@/constants/actionObjType'
import RefreshButton from '@/components/PageList/RefreshButton'
import WindowsMixin from '@/mixins/windows'
import {
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'EventList',
  components: {
    RefreshButton,
  },
  mixins: [WindowsMixin],
  props: {
    objId: {
      type: String,
    },
    objType: {
      type: String,
    },
    limit: {
      type: Number,
      default: 20,
    },
  },
  data () {
    return {
      dateTime: null,
      data: [],
      loading: false,
      nextMarker: '',
      search: {
        label: '资源名称',
        key: 'obj_name',
      },
      searchDefaultValue: {
        label: '资源名称',
        key: 'obj_name',
      },
      searchText: '',
      searchOptions: [
        {
          label: '资源名称',
          key: 'obj_name',
        },
        {
          label: '所属项目',
          key: 'tenant',
        },
        {
          label: '发起人',
          key: 'user',
        },
        {
          label: '操作',
          key: 'action',
        },
      ],
      searched: {},
      columns: [
        {
          title: '#',
          field: 'id',
          fixed: 'left',
          minWidth: 80,
          showOverflow: 'ellipsis',
        },
        getCopyWithContentTableColumn({
          title: '类型',
          field: 'obj_type',
          hideField: true,
          slotCallback: row => OBJ_TYPE[row.obj_type] || row.obj_type,
        }),
        getCopyWithContentTableColumn({
          title: '操作',
          field: 'action',
        }),
        getCopyWithContentTableColumn({
          title: '资源名称',
          field: 'obj_name',
        }),
        {
          title: '执行状态',
          field: 'success',
          width: 80,
          slots: {
            default: ({ row }) => {
              const txt = row.success ? '成功' : '失败'
              const color = row.success ? '#67C23A' : '#F56C6C'
              return [<span style={{ color }}>{ txt }</span>]
            },
          },
        },
        {
          field: 'start_time',
          title: '操作时间',
          width: 170,
          formatter: ({ row }) => {
            return this.$moment(row.start_time).format('YYYY年MM月DD日 HH:mm:ss')
          },
        },
        getCopyWithContentTableColumn({
          field: 'user',
          title: '发起人',
        }),
        getCopyWithContentTableColumn({
          field: 'tenant',
          title: '所属项目',
        }),
        {
          field: 'notes',
          title: '备注',
          width: 50,
          fixed: 'right',
          slots: {
            default: ({ row, column }) => {
              let text = ''
              try {
                text = JSON.stringify(JSON.parse(row.notes), null, 4)
              } catch (e) {
                text = row.notes
              }
              if (!row.notes) return ''
              return [<a-button size='small' type='link' onClick={ () => this.clickHandler(text) }>查看</a-button>]
            },
          },
        },
      ],
    }
  },
  computed: {
    isEmptySearched () {
      return !this.searched || R.isEmpty(this.searched)
    },
  },
  created () {
    this.manager = new Manager('actions', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const params = this.getParams()
      this.loading = true
      try {
        const {
          data: {
            data = [],
            next_marker: nextMarker,
          },
        } = await this.manager.list({ params })
        this.nextMarker = nextMarker
        this.data = [ ...this.data, ...data ]
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    selectChange (val) {
      this.search = val
    },
    getParams () {
      const params = {
        limit: this.limit,
        scope: this.$scope,
      }
      if (this.nextMarker) params.paging_marker = this.nextMarker
      if (this.objId) params.filter = `obj_id.in(${this.objId})`
      if (this.objType) params.obj_type = this.objType
      if (this.dateTime) params.until = this.$moment.utc(this.dateTime).format()
      if (this.searched && !R.isEmpty(this.searched)) {
        for (let key in this.searched) {
          params[key] = this.searched[key]['key']
        }
      }
      return params
    },
    clickHandler (val) {
      this.createDialog('EventLogDialog', {
        data: val,
      })
    },
    handleDateTimeChange () {
      // this.$nextTick(() => {
      //   this.clearAllSearch()
      // })
      this.nextMarker = ''
      this.data = []
      this.fetchData()
    },
    handleSearch () {
      if (!this.searchText) return
      const searched = {
        ...this.searched,
        [this.search.key]: {
          label: this.search.label,
          key: this.searchText,
        },
      }
      this.searched = searched
      this.searchText = ''
      this.nextMarker = ''
      this.data = []
      this.fetchData()
    },
    clearSearch (key) {
      const searched = { ...this.searched }
      delete searched[key]
      this.searched = searched
      this.nextMarker = ''
      this.data = []
      this.fetchData()
    },
    clearAllSearch () {
      this.nextMarker = ''
      this.searched = {}
      this.data = []
      this.fetchData()
    },
    refresh () {
      this.nextMarker = ''
      this.data = []
      this.fetchData()
    },
  },
}
</script>

<style lang="scss" scope>
.action-wrap {
  font-size: 14px;
  height: 30px;
}
.action-table {
  .vxe-body--row {
    &:hover {
      background-color: #f5f7fa;
    }
  }
}
.CodeMirror {
  height: 500px!important;
}
.dialog-wrapper {
  .el-dialog {
    .el-dialog__body {
      padding: 10px 20px 4px;
    }
    .el-dialog__footer {
      width: 100%;
    }
    .copy-icon {
      color: #409EFF;
      cursor: pointer;
    }
  }
}
</style>
