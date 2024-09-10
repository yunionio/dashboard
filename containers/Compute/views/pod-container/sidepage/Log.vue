<template>
  <div>
    <a-form-model :model="form" layout="inline">
      <a-form-model-item :label="$t('k8s.text_1')">
        <a-select style="min-width: 200px;" v-model="form.activeContainer">
          <a-select-option v-for="item in containers" :value="item.id" :key="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item :label="$t('k8s.text_320')">
        <a-row>
          <a-col :span="12">
            <a-form-model-item>
              <a-select style="min-width: 240px;" v-model="form.time">
                <a-select-option v-for="item in timeOptions" :value="item.value" :key="item.name">{{ item.name }}</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12" v-show="isCustomTime">
            <a-form-model-item>
              <duration-second-input v-model="form.customTime" :durationOptions="durationOptions" />
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" style="margin-left: -20px;" @click="fetchUrl">{{$t('common.ok')}}</a-button>
      </a-form-model-item>
    </a-form-model>
    <xterm :connectParams="connectParams" />
  </div>
</template>

<script>
export default {
  name: 'Log',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      containers: [],
      form: {
        activeContainer: '',
        time: 'all',
        customTime: 3600,
      },
      connectParams: '',
      durationOptions: [
        { label: this.$t('k8s.text_321'), key: 'hours' },
        { label: this.$t('k8s.text_322'), key: 'minutes' },
        { label: this.$t('k8s.text_323'), key: 'days' },
      ],
      timeOptions: [
        { name: this.$t('common_95'), value: 'all' },
        { name: this.$t('common_nearly_num_minutes', [5]), value: 5 * 60 },
        { name: this.$t('common_nearly_num_minutes', [30]), value: 30 * 60 },
        { name: this.$t('common_nearly_num_hours', [1]), value: 60 * 60 },
        { name: this.$t('common_nearly_num_hours', [6]), value: 6 * 60 * 60 },
        { name: this.$t('common_nearly_num_hours', [12]), value: 12 * 60 * 60 },
        { name: this.$t('common_nearly_num_days', [1]), value: 24 * 60 * 60 },
        { name: this.$t('common.date_time.custom'), value: 'custom' },
      ],
    }
  },
  computed: {
    isAllTime () {
      return this.form.time === 'all'
    },
    isCustomTime () {
      return this.form.time === 'custom'
    },
  },
  created () {
    this.manager = new this.$Manager('containers')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const { data } = await this.manager.list({
        params: {
          guest_id: this.data.guest_id,
          scope: this.$store.getters.scope,
        },
      })
      this.containers = data.data
      const firstContainer = data.data?.[0]
      this.form.activeContainer = firstContainer.id
      this.fetchUrl()
    },
    async fetchUrl () {
      const params = {
        container_id: this.form.activeContainer,
        follow: true,
      }
      if (!this.isAllTime) {
        if (this.isCustomTime) {
          params.since = `${this.form.customTime}s`
        } else {
          params.since = `${this.form.time}s`
        }
      }
      const { data } = await new this.$Manager('webconsole', 'v1').objectRpc({
        methodname: 'DoContainerLog',
        params,
      })
      this.connectParams = data.connect_params
    },
  },
}
</script>
