<template>
  <div>
    <a-form-item label="自动同步" v-bind="formLayout">
      <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.enable_auto_sync" @change="change" />
    </a-form-item>
    <a-form-item label="时间间隔" v-bind="formLayout" v-if="showSecond">
      <a-input-number style="width: 180px" :min="30" v-decorator="decorators.sync_interval_seconds" /><span class="ml-1">分钟</span>
      <div v-if="!fc.getFieldError('sync_interval_seconds')" slot="extra">最少时间间隔为 30 分钟</div>
    </a-form-item>
    <!-- <a-form-item label="是否共享" v-bind="formLayout">
      <a-switch v-decorator="decorators.is_public" />
    </a-form-item> -->
  </div>
</template>

<script>
export default {
  props: {
    fc: {
      type: Object,
      required: true,
    },
    formLayout: {
      type: Object,
    },
  },
  data () {
    return {
      showSecond: false,
      decorators: {
        enable_auto_sync: [
          'enable_auto_sync',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
        sync_interval_seconds: [
          'sync_interval_seconds',
          {
            initialValue: 60,
            normalize: v => Number(v),
            rules: [
              { type: 'integer', min: 30, message: '最少时间间隔为 30 分钟', trigger: 'blur' },
            ],
          },
        ],
        // is_public: [
        //   'is_public',
        //   {
        //     valuePropName: 'checked',
        //     initialValue: false,
        //   },
        // ],
      },
    }
  },
  methods: {
    change (val) {
      this.showSecond = val
    },
  },
}
</script>
