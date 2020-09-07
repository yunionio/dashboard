<template>
  <transition>
    <div v-if="showError" class="errors-wrap" v-clickoutside="closeError">
      <div class="title d-flex align-items-center">
        <div class="title-text flex-fill">{{ errorTitle }}</div>
        <div><a-icon @click="closeError" type="close" /></div>
      </div>
      <div class="divider" />
      <div class="mb-2"><span>{{ $t('compute.text_1312') }}：</span><span>{{ errors.req_count }} / {{ errors.allow_count }}</span></div>
      <div>{{ $t('compute.text_1313') }}</div>
      <ul class="list list-wrapper mb-2">
        <li
          v-for="(item, idx) of errors.not_allow_reasons"
          :key="idx">
          <div>{{ item }}</div>
        </li>
      </ul>
      <div>{{ $t('compute.text_1314') }}</div>
      <ul class="list list-wrapper">
        <li
          v-for="(item, idx) of errors.errors"
          :key="idx">
          <div>{{ item.message }}</div>
          <ul class="list sec-list" v-if="item.children">
            <li v-for="(child, childIdx) of item.children" :key="`child-${childIdx}`">{{ child }}</li>
          </ul>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'SideErrors',
  props: {
    errorTitle: {
      type: String,
      required: true,
    },
    errors: {
      type: Object,
      required: true,
    },
  },
  computed: {
    showError () {
      return !R.isEmpty(this.errors)
    },
  },
  methods: {
    closeError () {
      this.$emit('update:errors', {})
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../src/styles/less/theme';

.errors-wrap {
  position: absolute;
  right: 0;
  bottom: 100px;
  width: 300px;
  padding: 15px;
  opacity: 1;
  transform: translateX(0);
  background-color: #fef0f0;
  box-shadow: -5px -5px 5px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 3px;
  color: @error-color;
  max-height: 400px;
  overflow-y: scroll;
  .title {
    color: @error-color;
    > i {
      font-size: 28px;
    }
    > .title-text {
      font-size: 13px;
      font-weight: bold;
    }
  }
  .divider {
    margin: 15px 0;
    background-color: #DCDFE6;
    height: 1px;
  }
  .list {
    padding: 0 15px;

    li {
      line-height: 1.8;
      list-style-type: disc;
    }
    &.sec-list {
      li {
        list-style-type: circle;
      }
    }
  }
}
.errors-slide-fade-enter-active {
  transition: all .3s ease;
}
.errors-slide-fade-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.errors-slide-fade-enter, .errors-slide-fade-leave-to {
  transform: translateX(300px);
  opacity: 0;
}
</style>
