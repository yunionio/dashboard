<template>
  <div>
    <a-form-item :label="$t('cloudenv.text_83')" v-bind="formLayout">
      <a-switch :checkedChildren="$t('cloudenv.text_84')" :unCheckedChildren="$t('cloudenv.text_85')" v-decorator="decorators.enable_auto_sync" @change="change" />
    </a-form-item>
    <a-form-item :label="$t('cloudenv.text_86')" v-bind="formLayout" v-if="showSecond">
      <a-input-number style="width: 180px" :min="30" v-decorator="decorators.sync_interval_seconds" /><span class="ml-1">{{ $t('cloudenv.text_87') }}</span>
      <div v-if="!fc.getFieldError('sync_interval_seconds')" slot="extra">{{$t('cloudenv.text_88')}}</div>
    </a-form-item>
    <!-- <a-form-item :label="$t('cloudenv.text_89')" v-bind="formLayout">
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
              { type: 'integer', min: 30, message: this.$t('cloudenv.text_88'), trigger: 'blur' },
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
