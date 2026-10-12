<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')" :extra="$t('k8s.vc_job_name_hint')">
        <a-input v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')" :extra="$t('k8s.vc_job_cluster_hint')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_23')" :extra="$t('k8s.vc_job_namespace_hint')">
        <namespace-select v-decorator="decorators.namespace" @input="setNamespace" :cluster="cluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_queue_field')" :extra="$t('k8s.vc_job_queue_hint')">
        <base-select
          v-decorator="decorators.queue"
          resource="vcqueues"
          version="v1"
          id-key="name"
          :need-params="true"
          :params="clusterListParams"
          :select-props="{ placeholder: $t('k8s.vc_queue_field') }" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_min_available')" :extra="$t('k8s.vc_min_available_hint')">
        <a-input-number v-decorator="decorators.minAvailable" :min="1" style="width: 200px" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_priority_class')" :extra="priorityClassExtra">
        <base-select
          v-decorator="decorators.priorityClassName"
          resource="priorityclasses"
          version="v1"
          id-key="name"
          option-label-prop="label"
          :label-format="priorityLabel"
          :need-params="true"
          :params="clusterListParams"
          :select-props="{ allowClear: true, placeholder: $t('k8s.vc_priority_class') }" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_restart_on_evict')" :extra="$t('k8s.vc_restart_on_evict_hint')">
        <a-switch v-decorator="decorators.restartOnEvict" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_network_topology')" :extra="$t('k8s.vc_network_topology_hint')">
        <a-select v-decorator="decorators.networkTopologyMode" @change="setTopologyMode">
          <a-select-option value="none">{{ $t('k8s.vc_topology_none') }}</a-select-option>
          <a-select-option value="hard">{{ $t('k8s.vc_topology_hard') }}</a-select-option>
          <a-select-option value="soft">{{ $t('k8s.vc_topology_soft') }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="topologyMode" :label="$t('k8s.vc_highest_tier')" :extra="$t('k8s.vc_highest_tier_hint')">
        <a-input-number v-decorator="decorators.highestTierAllowed" :min="1" style="width: 200px" />
      </a-form-item>
      <a-form-item :label="$t('k8s.vc_task')">
        <div>
          <a-card v-for="(task, taskIndex) in tasks" :key="taskIndex" class="mb-3" size="small" :title="taskTitle(taskIndex)">
            <a-button v-if="tasks.length > 1" slot="extra" type="link" @click="removeTask(taskIndex)">{{ $t('k8s.vc_remove') }}</a-button>
            <a-form-item :label="$t('k8s.text_41')" :extra="$t('k8s.vc_task_name_hint')" v-bind="nestedLayout">
              <a-input v-model="task.name" />
            </a-form-item>
            <a-form-item :label="$t('k8s.vc_replicas')" :extra="$t('k8s.vc_replicas_hint')" v-bind="nestedLayout">
              <a-input-number v-model="task.replicas" :min="1" style="width: 200px" />
            </a-form-item>
            <a-form-item :label="$t('k8s.vc_restart_policy')" :extra="$t('k8s.vc_restart_policy_hint')" v-bind="nestedLayout">
              <a-select v-model="task.restartPolicy">
                <a-select-option value="OnFailure">OnFailure</a-select-option>
                <a-select-option value="Never">Never</a-select-option>
                <a-select-option value="Always">Always</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="$t('k8s.vc_container')" v-bind="nestedLayout">
              <div>
                <a-card v-for="(container, containerIndex) in task.containers" :key="containerIndex" class="mb-2" size="small">
                  <a-button v-if="task.containers.length > 1" slot="extra" type="link" @click="removeContainer(taskIndex, containerIndex)">{{ $t('k8s.vc_remove') }}</a-button>
                  <a-form-item :label="$t('k8s.text_41')" :extra="$t('k8s.vc_container_name_hint')" v-bind="nestedLayout">
                    <a-input v-model="container.name" />
                  </a-form-item>
                  <a-form-item :label="$t('k8s.vc_image')" :extra="$t('k8s.vc_image_hint')" v-bind="nestedLayout">
                    <a-input v-model="container.image" placeholder="nginx" />
                  </a-form-item>
                  <a-form-item :label="$t('k8s.vc_image_pull_policy')" :extra="$t('k8s.vc_image_pull_policy_hint')" v-bind="nestedLayout">
                    <a-select v-model="container.imagePullPolicy">
                      <a-select-option value="IfNotPresent">IfNotPresent</a-select-option>
                      <a-select-option value="Always">Always</a-select-option>
                      <a-select-option value="Never">Never</a-select-option>
                    </a-select>
                  </a-form-item>
                  <a-form-item :label="$t('k8s.vc_command')" :extra="$t('k8s.vc_command_hint')" v-bind="nestedLayout">
                    <a-input v-model="container.command" placeholder="sleep 3600" />
                  </a-form-item>
                  <a-form-item :label="$t('k8s.vc_cpu_request')" :extra="$t('k8s.vc_cpu_request_hint')" v-bind="nestedLayout">
                    <a-input v-model="container.cpu" placeholder="1" />
                  </a-form-item>
                  <a-form-item :label="$t('k8s.vc_cpu_limit')" :extra="$t('k8s.vc_cpu_limit_hint')" v-bind="nestedLayout">
                    <a-input v-model="container.cpuLimit" :placeholder="$t('k8s.vc_limit_same_as_request')" />
                  </a-form-item>
                  <a-form-item :label="$t('k8s.vc_memory_request')" :extra="$t('k8s.vc_memory_request_hint')" v-bind="nestedLayout">
                    <a-input v-model="container.memory" type="number" addonAfter="G" placeholder="1" :min="0" />
                  </a-form-item>
                  <a-form-item :label="$t('k8s.vc_memory_limit')" :extra="$t('k8s.vc_memory_limit_hint')" v-bind="nestedLayout">
                    <a-input v-model="container.memoryLimit" type="number" addonAfter="G" :placeholder="$t('k8s.vc_limit_same_as_request')" :min="0" />
                  </a-form-item>
                </a-card>
                <a-button type="dashed" @click="addContainer(taskIndex)">{{ $t('k8s.vc_add_container') }}</a-button>
              </div>
            </a-form-item>
          </a-card>
          <a-button type="dashed" @click="addTask">{{ $t('k8s.vc_add_task') }}</a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import k8sCreateMixin from '@K8S/mixins/create'

function memoryQuantity (value) {
  const v = String(value == null ? '' : value).trim()
  if (!v) return ''
  if (/^\d+(\.\d+)?$/.test(v)) return `${v}G`
  return v
}

function newContainer () {
  return {
    name: '',
    image: '',
    imagePullPolicy: 'IfNotPresent',
    command: 'sleep 3600',
    cpu: '',
    cpuLimit: '',
    memory: '',
    memoryLimit: '',
  }
}

function newTask () {
  return {
    name: '',
    replicas: 1,
    restartPolicy: 'OnFailure',
    containers: [newContainer()],
  }
}

export default {
  name: 'K8sVcjobCreateForm',
  components: {
    ClusterSelect,
    NamespaceSelect,
  },
  mixins: [k8sCreateMixin],
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      nestedLayout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      topologyMode: '',
      tasks: [{
        name: 'worker',
        replicas: 1,
        restartPolicy: 'OnFailure',
        containers: [{
          name: 'c',
          image: 'registry.cn-beijing.aliyuncs.com/yunionio/busybox:1.35.0',
          imagePullPolicy: 'IfNotPresent',
          command: 'sleep 3600',
          cpu: '',
          cpuLimit: '',
          memory: '',
          memoryLimit: '',
        }],
      }],
      decorators: {
        name: [
          'name',
          {
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        cluster: [
          'cluster',
          {
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        namespace: [
          'namespace',
          {
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        queue: [
          'queue',
          {
            initialValue: 'default',
            rules: [{ required: true, message: this.$t('k8s.vc_required') }],
          },
        ],
        minAvailable: [
          'minAvailable',
          {
            initialValue: 1,
            rules: [{ required: true, message: this.$t('k8s.vc_min_available_invalid') }],
          },
        ],
        priorityClassName: ['priorityClassName'],
        restartOnEvict: [
          'restartOnEvict',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
        networkTopologyMode: [
          'networkTopologyMode',
          { initialValue: 'none' },
        ],
        highestTierAllowed: [
          'highestTierAllowed',
          { initialValue: 1 },
        ],
      },
    }
  },
  computed: {
    clusterListParams () {
      if (!this.cluster) return {}
      return {
        cluster: this.cluster,
        limit: 0,
      }
    },
    priorityClassExtra () {
      const hint = this.$t('k8s.vc_priority_class_hint')
      if (!this.topologyMode) return hint
      return `${hint} ${this.$t('k8s.vc_priority_no_preempt_hint')}`
    },
  },
  methods: {
    priorityLabel (item) {
      if (!item) return ''
      const name = item.name || ''
      if (item.value === undefined || item.value === null || item.value === '') return name
      return `${name} (${item.value})`
    },
    setTopologyMode (value) {
      this.topologyMode = value && value !== 'none' ? value : ''
    },
    taskTitle (index) {
      return `${this.$t('k8s.vc_task')} ${index + 1}`
    },
    addTask () {
      this.tasks.push(newTask())
    },
    removeTask (index) {
      if (this.tasks.length <= 1) return
      this.tasks.splice(index, 1)
    },
    addContainer (taskIndex) {
      this.tasks[taskIndex].containers.push(newContainer())
    },
    removeContainer (taskIndex, containerIndex) {
      const containers = this.tasks[taskIndex].containers
      if (containers.length <= 1) return
      containers.splice(containerIndex, 1)
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    fail (key) {
      const error = new Error(key)
      this.$message.error(this.$t(key))
      return error
    },
    validateTasks (minAvailable) {
      if (!this.tasks.length) {
        throw this.fail('k8s.vc_task_required')
      }
      let replicas = 0
      this.tasks.forEach(task => {
        const replicasNum = Number(task.replicas)
        if (!Number.isInteger(replicasNum) || replicasNum < 1) {
          throw this.fail('k8s.vc_replicas_invalid')
        }
        if (!(task.name || '').trim()) {
          throw this.fail('k8s.vc_task_name_required')
        }
        if (!task.containers.length) {
          throw this.fail('k8s.vc_container_required')
        }
        task.containers.forEach(container => {
          if (!(container.name || '').trim()) {
            throw this.fail('k8s.vc_container_name_required')
          }
          if (!(container.image || '').trim()) {
            throw this.fail('k8s.vc_image_required')
          }
        })
        replicas += replicasNum
      })
      if (minAvailable > replicas) {
        throw this.fail('k8s.vc_min_available_gt_replicas')
      }
    },
    buildPayload (values) {
      const minAvailable = Number(values.minAvailable)
      if (!Number.isInteger(minAvailable) || minAvailable < 1) {
        throw this.fail('k8s.vc_min_available_invalid')
      }
      this.validateTasks(minAvailable)
      const topologyMode = (values.networkTopologyMode && values.networkTopologyMode !== 'none')
        ? values.networkTopologyMode
        : this.topologyMode
      const payload = {
        name: values.name.trim(),
        cluster: values.cluster,
        namespace: values.namespace,
        queue: values.queue.trim(),
        minAvailable,
        schedulerName: 'volcano',
        priorityClassName: (values.priorityClassName || '').trim(),
        restartOnEvict: values.restartOnEvict === true,
        tasks: this.tasks.map(task => ({
          name: task.name.trim(),
          replicas: Number(task.replicas),
          restartPolicy: task.restartPolicy || 'OnFailure',
          containers: task.containers.map(container => ({
            name: container.name.trim(),
            image: container.image.trim(),
            imagePullPolicy: container.imagePullPolicy || 'IfNotPresent',
            command: (container.command || '').trim(),
            cpu: (container.cpu || '').trim(),
            cpuLimit: (container.cpuLimit || '').trim(),
            memory: memoryQuantity(container.memory),
            memoryLimit: memoryQuantity(container.memoryLimit),
          })),
        })),
      }
      if (topologyMode === 'hard' || topologyMode === 'soft') {
        const tier = Number(values.highestTierAllowed)
        if (!Number.isInteger(tier) || tier < 1) {
          throw this.fail('k8s.vc_tier_invalid')
        }
        payload.networkTopologyMode = topologyMode
        payload.highestTierAllowed = tier
      }
      return payload
    },
    async doCreate () {
      const values = await this.validateForm()
      const data = this.buildPayload(values)
      await new this.$Manager('vcjobs', 'v1').create({ data })
      this.$message.success(this.$t('k8s.text_46'))
    },
  },
}
</script>
