<template>
  <a-modal
    wrap-class-name="base-dialog-wrap"
    :visible="true"
    :destroy-on-close="true"
    :keyboard="false"
    :width="width"
    :mask-closable="false"
    @cancel="cancel"
    v-bind="modalProps">
    <template v-slot:title>
      <div class="base-dialog-header">
        <slot name="header">Dialog default header</slot>
      </div>
    </template>
    <div class="base-dialog-body">
      <slot name="body">
        Dialog default body
      </slot>
    </div>
    <template v-slot:footer>
      <div class="base-dialog-footer">
        <slot name="footer">Dialog default footer</slot>
      </div>
    </template>
  </a-modal>
</template>

<script>
export default {
  name: 'BaseDialog',
  props: {
    width: {
      type: [Number, String],
      default: 800,
    },
    modalProps: {
      type: Object,
      default: () => ({}),
    },
  },
  provide: {
    inBaseDialog: true,
  },
  methods: {
    cancel () {
      this.$emit('cancel')
    },
  },
}
</script>
