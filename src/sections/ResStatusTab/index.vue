<template>
  <div class="d-flex flex-row-reverse mb-3 res-status-tab">
    <ul class="res-status-list d-flex">
      <a-tooltip v-for="(obj, idx) in statusOpts" :key="idx" placement="bottom">
        <template slot="title" v-if="obj.list && obj.list.length > 0">
          <div class="status-list">
            <div v-for="(item, idxs) in obj.list" class="status-item" :key="idxs" @click="statusClickHandle(item)">
              <span>{{ item.title }}</span>: <span>{{ item.num }}</span>
            </div>
          </div>
        </template>
        <li @click="statusClickHandle(obj)" :style="{'padding-right': obj.type === 'error' ? '20px' : 0}">
          <i :class="obj.class || obj.type" />
          <span :title="obj.title" class="title">{{ obj.title }}</span>
          <data-loading v-if="loading" />
          <span v-if="!loading" class="num">{{ obj.num }}</span>
        </li>
      </a-tooltip>
    </ul>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'

export default {
  name: 'ResStatusTab',
  props: {
    statusOpts: {
      type: Array,
      default () {
        return []
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    statusClickHandle: debounce(function (obj) {
      this.$emit('click', obj)
    }, 500),
  },
}
</script>

<style lang="less" scoped>
.res-status-tab {
  height: 46px;
  .res-total {
    margin-right: -16px;
  }
  .res-status-list {
    list-style: none;
    li {
      position: relative;
      display: flex;
      flex-direction: column;
      min-width: 74px;
      cursor: pointer;
      i {
        position: absolute;
        display: block;
        width: 3px;
        height: 26px;
        left: -12px;
        top: 8px;
        &.total {
          background-color: #409eff;
        }
        &.running, &.available, &.online, &.active, &.enabled, &.success {
          background-color: #52c41a;
        }
        &.ready, &.offline, &.disabled, &.info {
          background-color: #d9d9d9;
        }
        &.error {
          background-color: #f5222d;
        }
        &.other {
          background-color: rgb(150, 152, 155);
        }
      }
      .title {
        font-size: 12px;
        color: #707275;
      }
      .num {
        line-height: 22px;
        color: #181A1D;
        font-weight: 500;
      }
    }
  }
}
.status-list {
  .status-item {
    cursor: pointer;
    &:hover {
      color: var(--antd-wave-shadow-color);
    }
  }
}
</style>
