<template>
  <a-modal
    wrap-class-name="base-dialog-wrap"
    :visible="true"
    :destroy-on-close="true"
    :keyboard="false"
    :width="800"
    :mask-closable="false"
    @cancel="cancel">
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
  methods: {
    cancel () {
      this.$emit('cancel')
    },
  },
}
</script>
