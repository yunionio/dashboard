<template>
  <span class="sort-wrapper">
    <template v-for="(item, index) in sortOpts">
      <div :key="index" class="sort-box">
        <div class="sort-up-wrapper" :title="$t('common.sort_asc', [index + 1])" @click="handleSortClick(item, 'asc', item.checked && item.order === 'asc')">
          <div class="sort-up-box">
            <div :class="{'sort-up': true, 'active-sort': item.checked && item.order === 'asc'}" />
          </div>
        </div>
        <div class="sort-down-wrapper" :title="$t('common.sort_desc', [index + 1])" @click="handleSortClick(item, 'desc', item.checked && item.order === 'desc')">
          <div class="sort-down-box">
            <div :class="{'sort-down': true, 'active-sort': item.checked && item.order === 'desc'}" />
          </div>
        </div>
      </div>
      <div v-if="sortOpts[index + 1]" class="split" :key="'split' + index" />
    </template>
  </span>
</template>

<script>
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'PageListMutipleSort',
  components: {},
  mixins: [WindowsMixin],
  props: {
    column: Object,
    listParams: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    sortOpts () {
      const ret = []
      // 说明 传入以下任一种类参数即可,针对 order_by+order 与 orderBy两种排序方式
      // sortFields [field1, field2]
      // sortByList [order_by_field1, order_by_field2]
      // sortFields ['', field2], sortByList [order_by_field1, '']
      let { sortFields, sortByList } = this.column
      if (!sortFields) {
        sortFields = sortByList.map(item => '')
      }
      if (!sortByList) {
        sortByList = sortFields.map(item => '')
      }
      if ((sortFields && sortByList) && sortFields.length === sortByList.length && sortFields.length !== 0) {
        sortFields.map((key, index) => {
          if (key) {
            const checked = this.listParams.hasOwnProperty('order_by') && this.listParams.order_by === key
            ret.push({
              field: key,
              checked, // 是否当前key被选中
              order: checked ? this.listParams.order : '', // 选中的排序类型
            })
          } else {
            const checked = this.listParams.hasOwnProperty(sortByList[index])
            ret.push({
              sortBy: sortByList[index],
              checked,
              order: checked ? this.listParams[sortByList[index]] : '',
            })
          }
        })
      }
      return ret
    },
  },
  methods: {
    handleSortClick (item, sortType, checked) { // checked sort改变前，是否当前排序已经被选中
      if (item.field) {
        this.$emit('doSort', { property: item.field, order: !checked ? sortType : null, column: this.column }) // 取消选中时，order传null
      } else if (item.sortBy) {
        this.$emit('doSort', { property: item.sortBy, order: !checked ? sortType : null, column: { ...this.column, sortBy: item.sortBy } })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.sort-wrapper {
  height: 21px;
  display: inline-block;
  transform: translateY(4px);
  margin-left: 7px;
  .split{
    display: inline-block;
    width: 1px;
    height: 12px;
    transform: rotate(15deg) translateY(-3px);
    margin: 0 5px 0 -1px;
    background: #c0c4cc;
  }
}
.sort-box {
  width: 10px;
  height: 21px;
  position: relative;
  display: inline-block;
  // background: red;
  margin-right: 5px;
  .sort-up-wrapper {
    width: 16px;
    height: 10.5px;
    position: absolute;
    top: 0;
    left: 0;
    .sort-up-box {
      width: 10px;
      height: 5.5px;
      position: absolute;
      left: 0;
      bottom: 1px;
      overflow: hidden;
      .sort-up {
        transform-origin: 0 0;
        width: 20px;
        height: 20px;
        background: #c0c4cc;
        position: absolute;
        left: 50%;
        top: 0px;
        transform: rotate(45deg);
        border-radius: 1.5px;
      }
      .active-sort {
        background: #409eff !important;
      }
    }
    &:hover {
      cursor: pointer;
      .sort-up-box {
        .sort-up {
          background: rgba(0,0,0,0.7);
        }
      }
    }
  }
  .sort-down-wrapper {
    width: 12px;
    height: 12px;
    position: absolute;
    bottom: 0;
    left: 0;
    .sort-down-box {
      width: 10px;
      height: 5.5px;
      position: absolute;
      left: 0;
      top: 3px;
      overflow: hidden;
      .sort-down {
        transform-origin: 0 0;
        width: 20px;
        height: 20px;
        background: #c0c4cc;
        position: absolute;
        left: 50%;
        top: 100%;
        transform: rotate(-135deg);
        border-radius: 1.5px;
      }
      .active-sort {
        background: #409eff !important;
      }
    }
    &:hover {
      cursor: pointer;
      .sort-down-box {
        .sort-down {
          background: rgba(0,0,0,0.7);
        }
      }
    }
  }
}
</style>
