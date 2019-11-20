<template>
  <div>
    <div class="mb-2">
      <refresh-button :loading="loading" @refresh="refresh" />
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
        {{ item.label }}：{{ item.value }}
      </a-tag>
      <a style="font-size: 12px; color: #999;" class="ml-2" @click="clearAllSearch">清除</a>
    </div>
    <div>
      <vxe-grid
        ref="grid"
        highlight-hover-row
        show-header-overflow="title"
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
    limit: {
      type: Number,
      default: 20,
    },
  },
  data () {
    return {
      data: [],
      loading: false,
      nextMarker: '',
      search: {
        label: '资源名称',
        value: 'obj_name',
      },
      searchText: '',
      searchOptions: [
        {
          label: '资源名称',
          value: 'obj_name',
        },
        {
          label: '所属项目',
          value: 'tenant',
        },
        {
          label: '发起人',
          value: 'user',
        },
        {
          label: '操作',
          value: 'action',
        },
      ],
      searched: {},
      columns: [
        {
          title: '#',
          field: 'id',
        },
        {
          title: '类型',
          field: 'obj_type',
          width: 80,
          formatter: ({ row }) => {
            return OBJ_TYPE[row.obj_type] || row.obj_type
          },
        },
        {
          title: '操作',
          field: 'action',
        },
        {
          title: '资源名称',
          field: 'obj_name',
        },
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
        {
          field: 'user',
          title: '发起人',
        },
        {
          field: 'tenant',
          title: '所属项目',
        },
        {
          field: 'notes',
          title: '备注',
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
        // this.$refs.table.setCurrentRow(this.data[this.data.length - 1])
        this.data = [ ...this.data, ...data ]
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    getParams () {
      const params = {
        limit: this.limit,
        scope: this.$scope,
      }
      if (this.nextMarker) params.paging_marker = this.nextMarker
      if (this.objId) params.obj_id = this.objId
      if (this.searched && !R.isEmpty(this.searched)) {
        for (let key in this.searched) {
          params[key] = this.searched[key]['value']
        }
      }
      return params
    },
    clickHandler (val) {
      this.createDialog('EventLogDialog', {
        data: val,
      })
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
