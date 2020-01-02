<template>
  <vc-dialog
    visible
    prefix-cls="side-page"
    :class="{ 'first-side-page': isFirstSidePage }"
    :mask="false"
    :closable="false">
    <div class="side-page-header">
      <!-- close button -->
      <div class="side-page-close">
        <div class="side-page-close-inner" @click="cancel">
          <a-icon :type="iconType" />
        </div>
      </div>
      <!-- header info -->
      <div class="side-page-header-info d-flex align-items-center">
        <div class="side-page-header-icon d-flex align-items-center justify-content-center flex-grow-0 flex-shrink-0">
          <icon :type="icon" style="font-size: 40px; color: #888;" />
        </div>
        <div class="w-100">
          <div class="ml-4">
            <div class="text-color-help">{{ title }}</div>
            <div class="d-flex mt-2 w-100 align-items-center">
              <h5 class="text-truncate mb-0" style="min-width: 0;">{{ resName }}</h5>
              <div class="ml-3 flex-shrink-0 flex-shrink-0 d-flex pr-2">
                <div class="pr-4"><slot name="actions" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- header tabs -->
      <div class="side-page-header-tabs">
        <a-tabs :active-key="currentTab" @change="handleTabChange" :tab-bar-style="{ padding: '0 30px', marginBottom: 0 }">
          <a-tab-pane
            v-for="item of tabs"
            :key="item.key"
            :tab="item.label" />
        </a-tabs>
      </div>
    </div>
    <div class="side-page-inner-content">
      <slot />
    </div>
  </vc-dialog>
</template>

<script>
import VcDialog from 'ant-design-vue/lib/vc-dialog'
import Clickoutside from '@/directives/clickoutside'

export default {
  name: 'BaseSidePage',
  directives: {
    Clickoutside,
  },
  components: {
    VcDialog,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    resName: {
      type: String,
      required: true,
    },
    currentTab: {
      type: String,
      required: true,
    },
    tabs: {
      type: Array,
      required: true,
    },
  },
  computed: {
    windowId () {
      return this.$parent.windowId
    },
    sidePageIds () {
      return this.$store.state.sidePage.sidePageIds
    },
    isFirstSidePage () {
      return this.sidePageIds[0] === this.windowId
    },
    iconType () {
      return this.isFirstSidePage ? 'close' : 'left'
    },
  },
  mounted () {
    this.$nextTick(() => {
      document.body.style.overflow = ''
    })
  },
  methods: {
    cancel () {
      this.$emit('cancel')
    },
    handleTabChange (key) {
      this.$emit('tab-change', key)
    },
  },
}
</script>

<style lang="scss">
@import "../../styles/variables";

.side-page-wrap {
  position: fixed;
  z-index: 1000;
  background-color: #fff;
  left: 500px;
  right: 0;
  bottom: 0;
  top: 60px;
  .first-side-page {
    box-shadow: -5px 0 3px rgba(197, 219, 232, .4);
  }
}
.side-page {
  height: 100%;
}
.side-page-content {
  height: 100%;
}
.side-page-body {
  height: 100%;
  position: relative;
}
.side-page-header {
  background-color: #F8F8F9;
  height: 124px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}
.side-page-close {
  position: absolute;
  left: 0;
  top: 0;
  overflow: hidden;
  width: 70px;
  height: 70px;
  .side-page-close-inner {
    background-color: $primary-color;
    position: absolute;
    left: -35px;
    top: -35px;
    width: 100%;
    height: 100%;
    cursor: pointer;
    transform: rotate(45deg);
    .anticon {
      transform: rotate(-45deg);
      position: absolute;
      right: 5px;
      top: 28px;
      color: #fff;
      font-size: 18px;
    }
  }
}
.side-page-header-info {
  height: 80px;
  padding: 0 30px;
  border-bottom: 1px solid #e5e7e9;
}
.side-page-header-icon {
  width: 60px;
  height: 60px;
  border: 1px solid #ccc;
  border-radius: 40%;
}
.side-page-inner-content {
  position: absolute;
  top: 124px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-x: hidden;
  padding: 20px 30px;
}
.side-page-header-tabs {
  height: 44px;
  overflow: hidden;
}
</style>
