<template>
  <a-drawer
    destroyOnClose
    placement="right"
    wrapClassName="base-drawer-wrap"
    :width="700"
    :closable="false"
    :visible="visible"
    @close="handleCancel">
    <template v-slot:title><div class="base-drawer-title">{{ title }}</div></template>
    <div class="d-flex flex-column h-100">
      <div class="base-drawer-body flex-fill position-relative">
        <div class="base-drawer-content h-100 w-100 overflow-auto flex-fill position-absolute"><slot /></div>
      </div>
      <div class="base-drawer-footer flex-grow-0 flex-shrink-0">
        <a-button type="primary" @click="handleConfirm">{{ $t('common.ok') }}</a-button>
        <a-button class="ml-2" @click="handleCancel">{{ $t('common.cancel') }}</a-button>
      </div>
    </div>
  </a-drawer>
</template>

<script>
export default {
  name: 'BaseDrawer',
  props: {
    title: String,
    visible: Boolean,
  },
  methods: {
    handleConfirm () {
      this.$emit('ok')
    },
    handleCancel () {
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="less">
.base-drawer-wrap {
  .ant-drawer-wrapper-body {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .ant-drawer-body {
      padding: 0;
      flex: 1;
    }
    .ant-drawer-header {
      flex-shrink: 0;
      flex-grow: 0;
    }
  }
}
.base-drawer-title {
  font-size: 14px;
  font-weight: normal;
}
.base-drawer-footer {
  border-top: 1px solid #eee;
  padding: 15px;
}
.base-drawer-content {
  padding: 15px;
  left: 0;
  top: 0;
}
</style>
