<template>
  <transition>
    <div v-if="showError" class="errors-wrap" v-clickoutside="closeError">
      <div class="title d-flex align-items-center">
        <div class="title-text flex-fill">{{ errorTitle }}</div>
        <div><a-icon @click="closeError" type="close" /></div>
      </div>
      <div class="divider" />
      <ul class="list">
        <li
          v-for="(item, idx) of errors"
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
export default {
  name: 'SideErrors',
  props: {
    errorTitle: {
      type: String,
      required: true,
    },
    errors: {
      type: Array,
      required: true,
    },
  },
  computed: {
    showError () {
      return this.errors.length > 0
    },
  },
  methods: {
    closeError () {
      this.$emit('update:errors', [])
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../src/styles/_variables.scss';

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
  .title {
    color: $error-color;
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
    color: $error-color;
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
