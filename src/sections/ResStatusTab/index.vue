<template>
  <div class="d-flex flex-row-reverse mb-3 res-status-tab">
    <ul class="res-status-list d-flex">
      <li><i class="running" /><span>运行中</span><span>3</span></li>
      <li><i class="stopping" /><span>关机</span><span>3</span></li>
      <li><i class="other" /><span>操作失败</span><span>3</span></li>
      <li><i class="recycle" /><span>其它</span><span>3</span></li>
    </ul>
    <div class="d-flex res-total">
      <div class="circle">
        <div class="inner-circle" />
      </div>
      <div class="d-flex flex-column"><span>总数</span><span>3</span></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResStatusTab',
}
</script>

<style lang="less" scoped>
.res-status-tab {
  height: 46px;
  .res-total {
    margin-right: -16px;

    .circle {
      position: relative;
      right: 4px;
      width: 40px;
      height: 40px;
      background-color: #9eeb47;
      border-radius: 50%;
    }
    .inner-circle {
      position: absolute;
      margin: auto;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      width: 20px;
      height: 20px;
      background-color: #fff;
      border-radius: 50%;
    }
  }
  .res-status-list {
    list-style: none;
    li {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 0 16px;
      i {
        position: absolute;
        display: block;
        width: 3px;
        height: 26px;
        left: 4px;
        top: 8px;
        &.running {
          background-color: #52c41a;
        }
        &.stopping {
          background-color: #d9d9d9;
        }
        &.other {
          background-color: #f5222d;
        }
        &.recycle {
          background-color: #d9d9d9;
        }
      }
    }
  }
}
</style>
