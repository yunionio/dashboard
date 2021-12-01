<template>
  <div class="draggable-transfer d-flex">
    <!-- 左侧源数据 -->
    <div class="transfer-left">
      <div class="transfer-list-header">
        <div class="d-flex justify-content-between">
          <a-checkbox
          :indeterminate="resourceCheckedCount && resourceCheckedCount !== resourceCount"
          :checked="resourceCheckedCount && resourceCheckedCount === resourceCount"
          @change="handleCheckAllChange('left')">
            {{resourceCount?$t('common_734',[resourceCheckedCount,resourceCount]):$t('common_735',[resourceCount])}}
          </a-checkbox>
          <div>{{$t('common_739')}}</div>
        </div>
      </div>
      <div class="transfer-list-body">
        <draggable v-if="!loading && resourceDataList.length" v-model="resourceDataList" handle=".handle">
          <template v-for="(item, index) in resourceDataList">
            <div class="transfer-list-item d-flex" :key="item[idKey] || idx">
              <a-checkbox class="mr-2" :checked="item.checked" @change="handleItemCheckChange('left', index)" />
              <div class="transfer-list-item-label" @click="handleItemCheckChange('left', index)">{{item.label}}</div>
              <a-icon v-if="draggable.left" class="ml-2 handle" type="drag" />
            </div>
          </template>
        </draggable>
        <div v-else class="empty-container">
          <data-empty  />
        </div>
      </div>
    </div>
    <!-- 中间操作按钮 -->
    <div class="actions d-flex">
      <a-button
        class="action"
        :disabled="!resourceCheckedCount"
        @click="handleActionClick('right')">
        <a-icon type="right" />
      </a-button>
      <a-button
        class="action mt-2"
        :disabled="!targetCheckedCount"
        @click="handleActionClick('left')">
        <a-icon type="left" />
      </a-button>
    </div>
    <!-- 右侧选中数据 -->
    <div class="transfer-right">
      <div class="transfer-list-header">
        <div class="d-flex justify-content-between">
          <a-checkbox
          :indeterminate="targetCheckedCount && targetCheckedCount !== targetCount"
          :checked="targetCheckedCount && targetCheckedCount === targetCount"
          @change="handleCheckAllChange('right')">
            {{targetCount?$t('common_734',[targetCheckedCount,targetCount]):$t('common_735',[targetCount])}}
          </a-checkbox>
          <div>{{$t('common_740')}}</div>
        </div>
      </div>
      <div class="transfer-list-body">
        <draggable v-if="!loading && targetDataList.length" v-model="targetDataList" handle=".handle" style="height:100%">
          <template v-for="(item, index) in targetDataList">
            <div class="transfer-list-item d-flex" :key="item[idKey] || index">
              <a-checkbox class="mr-2" :checked="item.checked" @change="handleItemCheckChange('right', index)" />
              <div class="transfer-list-item-label" @click="handleItemCheckChange('right', index)">{{item.label}}</div>
              <a-icon v-if="draggable.right" class="ml-2 handle" type="drag" />
            </div>
          </template>
        </draggable>
        <div v-else class="empty-container">
          <data-empty  />
        </div>
      </div>
    </div>
    <!-- loading -->
    <div v-if="loading" class="loading">
      <a-spin :spinning="loading" />
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import draggable from 'vuedraggable'

export default {
  name: 'DraggableTransfer',
  components: { draggable },
  mixins: [],
  props: {
    loading: {
      type: Boolean,
    },
    dataList: {
      type: Array,
      require: true,
    },
    defaultList: {
      type: Array,
    },
    idKey: {
      type: String,
      require: true,
    },
    draggable: {
      type: Object,
      default: () => { return { left: false, right: false } },
    },
  },
  data () {
    return {
      resourceDataList: [],
      targetDataList: [],
    }
  },
  computed: {
    resourceCount () {
      return this.resourceDataList.length
    },
    resourceCheckedCount () {
      let len = 0
      this.resourceDataList.map(item => {
        if (item.checked) {
          len += 1
        }
      })
      return len
    },
    targetCount () {
      return this.targetDataList.length
    },
    targetCheckedCount () {
      let len = 0
      this.targetDataList.map(item => {
        if (item.checked) {
          len += 1
        }
      })
      return len
    },
  },
  watch: {
    dataList: {
      handler: function (val) {
        this.initDataList()
      },
      immediate: true,
      deep: true,
    },
    targetDataList: {
      handler: function (val) {
        this.$emit('change', val)
      },
      deep: true,
    },
  },
  created () {},
  methods: {
    initDataList () {
      if (!this.defaultList) {
        this.resourceDataList = R.clone(this.dataList)
      } else { // 默认选中中有时，从源数据中删除
        const resourceDataList = []
        const targetDataList = []
        this.dataList.map(item => {
          if (!(this.defaultList.some(data => data[this.idKey] === item[this.idKey]))) {
            resourceDataList.push(R.clone(item))
          } else {
            targetDataList.push(R.clone(item))
          }
        })
        const sortTargetDataList = []
        this.defaultList.map(item => {
          const index = targetDataList.findIndex(data => data[this.idKey] === item[this.idKey])
          if (index !== -1) {
            sortTargetDataList.push(R.clone(targetDataList[index]))
          }
        })
        this.targetDataList = sortTargetDataList
        this.resourceDataList = resourceDataList
      }
    },
    handleItemCheckChange (direction, idx) {
      if (direction === 'left') {
        const item = R.clone(this.resourceDataList[idx])
        item.checked = !item.checked
        this.$set(this.resourceDataList, idx, item)
      } else if (direction === 'right') {
        const item = R.clone(this.targetDataList[idx])
        item.checked = !item.checked
        this.$set(this.targetDataList, idx, item)
      }
    },
    handleCheckAllChange (direction) {
      if (direction === 'left') {
        const isAllChecked = this.resourceCount === this.resourceCheckedCount
        // 没全选中时全选中，全选中时取消全选
        this.resourceDataList = this.resourceDataList.map(item => {
          item.checked = !isAllChecked
          return item
        })
      } else if (direction === 'right') {
        const isAllChecked = this.targetCount === this.targetCheckedCount
        this.targetDataList = this.targetDataList.map(item => {
          item.checked = !isAllChecked
          return item
        })
      }
    },
    handleActionClick (actionType) {
      let resourceList = 'resourceDataList'
      let targetList = 'targetDataList'
      if (actionType === 'right') {
      } else if (actionType === 'left') {
        resourceList = 'targetDataList'
        targetList = 'resourceDataList'
      }
      const leftList = []
      this[resourceList].map(item => {
        if (item.checked) {
          item.checked = false
          this[targetList].push(item)
        } else {
          leftList.push(item)
        }
      })
      this[resourceList] = leftList
    },
  },
}
</script>
<style scoped lang="less">
.draggable-transfer {
  width: 100%;
  height: 100%!important;
  position: relative;
  .transfer-left, .transfer-right{
    flex: 1;
    height: 100%;
    box-sizing: border-box;
    border: solid 1px #E9E9E9;
    border-radius: 3px;
    flex-direction: column;
    flex-flow: column;
    .transfer-list-header {
      border-bottom: solid 1px #E9E9E9;
      height: 38px;
      box-sizing: border-box;
      padding: 8px;
    }
    .transfer-list-body{
      flex: 1 1 auto;
      overflow-y: auto;
      height: calc(100% - 38px);
      .transfer-list-item{
        align-items: center;
        padding: 3px 8px;
        &:hover{
          background: rgba(0,0,0,0.1);
        }
        .transfer-list-item-label{
          flex: 1 1 auto;
          &:hover{
            cursor: pointer;
          }
        }
        .handle:hover{
          cursor: move;
        }
      }
      .empty-container{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

    }
    .transfer-list-footer{
      border-top: solid 1px #E9E9E9;
      padding: 8px;
    }
  }
  .actions{
    flex: 0 0 50px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .action{
      display: inline-block;
      padding: 0 10px;
    }
  }
  .loading{
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.5);
  }
}

</style>
