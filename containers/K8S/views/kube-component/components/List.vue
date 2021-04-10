<template>
  <div>
    <div class="mb-2">
      <span>{{$t('k8s.text_28')}}</span>
      <cluster-select
        :value="cluster"
        @input="setCluster"
        style="width: 140px;" />
    </div>
    <page-card-list
      v-if="responseData.length"
      :list="list"
      :showPageer="false"
      :isRefreshed="false"
      :card-fields="cardFields"
      :group-actions="groupActions"
      :single-actions="singleActions" />
    <a-alert v-else :message="$t('k8s.text_265')" banner />
  </div>
</template>

<script>
import ClusterSelect from '@K8S/sections/ClusterSelect'
import k8sCreateMixin from '@K8S/mixins/create'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'KubeComponentList',
  components: {
    ClusterSelect,
  },
  mixins: [WindowsMixin, k8sCreateMixin],
  props: {
    id: {
      type: String,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        idKey: 'name',
      }),
      cardFields: {
        url: {
          formatter: (data) => {
            return require(`../assets/images/${data.name.toLowerCase()}${data.name.toLowerCase() === 'cephcsi' ? '.svg' : '.png'}`)
          },
        },
        title: 'name',
        content: [{
          title: this.$t('k8s.text_266'),
          field: 'enabled',
          slots: (data) => {
            return (<div class='status'>
              <status status={ data.enabled } statusModule='enabled' />
            </div>)
          },
        },
        {
          title: this.$t('k8s.text_35'),
          field: 'status',
          slots: (data) => {
            if (!data.status) {
              return (<span>-</span>)
            }
            return (<div class='status'>
              <status status={ data.status } statusModule='kubecomponent' />
            </div>)
          },
        }],
      },
      groupActions: [],
      singleActions: [
        {
          label: this.$t('k8s.text_49'),
          action: obj => {
            this.$router.push({
              path: '/k8s-kubecomponent/create',
              query: {
                kubeComponent: obj.name,
                cluster: this.cluster,
              },
            })
          },
          meta: (obj) => ({
            buttonType: 'primary',
            validate: !obj.created,
          }),
        },
        {
          label: this.$t('k8s.text_95'),
          action: obj => {
            this.$router.push({
              path: '/k8s-kubecomponent/update',
              query: {
                kubeComponent: obj.name,
                cluster: this.cluster,
              },
            })
          },
          meta: (obj) => ({
            validate: obj.created,
          }),
        },
        {
          label: this.$t('k8s.text_267'),
          action: obj => {
            return new this.$Manager('kubeclusters', 'v1').performAction({
              id: this.cluster,
              action: 'disable-component',
              data: {
                type: obj.name,
              },
            }).then(() => {
              this.fetchData()
            }).catch(error => {
              throw error
            })
          },
          meta: (obj) => ({
            validate: obj.enabled && obj.created,
          }),
        },
        {
          label: this.$t('k8s.text_268'),
          action: obj => {
            return new this.$Manager('kubeclusters', 'v1').performAction({
              id: this.cluster,
              action: 'enable-component',
              data: {
                type: obj.name,
              },
            }).then(() => {
              this.fetchData()
            }).catch(error => {
              throw error
            })
          },
          meta: (obj) => ({
            validate: !obj.enabled && obj.created,
          }),
        },
        {
          label: this.$t('k8s.text_201'),
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              title: this.$t('k8s.text_201'),
              name: obj.name,
              ok: (ids, data) => {
                return new this.$Manager('kubeclusters', 'v1').performAction({
                  id: this.cluster,
                  action: 'delete-component',
                  data: {
                    type: obj.name,
                  },
                }).then(() => {
                  this.fetchData()
                  return true
                }).catch(error => {
                  throw error
                })
              },
            })
          },
          meta: obj => ({
            validate: obj.created,
          }),
        },
      ],
      responseData: [],
      timer: null,
    }
  },
  watch: {
    cluster () {
      this.fetchData()
    },
  },
  created () {
    this.manager = new this.$Manager('kubeclusters', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      if (this.cluster) {
        const { data } = await this.manager.getSpecific({
          id: this.cluster,
          spec: 'components-status',
        })
        this.list.responseData = {
          data: [],
        }
        for (const key in data) {
          data[key].name = key
          // if (key === 'cephCSI') this.list.responseData.data.push(data[key])
          this.list.responseData.data.push(data[key])
          this.responseData = this.list.responseData.data
        }
        this.list.fetchData()
        this.getStableStatus(data)
      }
    },
    getStableStatus (data) {
      const kubeComponentStatus = ['deployed', 'deploy_fail', 'update_fail', 'delete_fail', 'init']
      const statusArr = Object.values(data).map(val => val.status).filter(v => v)
      const flatStableStatus = Object.values(kubeComponentStatus)
      const notStable = statusArr.some(val => !flatStableStatus.includes(val))
      if (notStable) {
        this.timer = setTimeout(() => {
          this.fetchData()
        }, 5000)
      } else {
        this.timer = null
      }
    },
  },
}
</script>

<style lang="less" scoped>
.status {
  display: inline-block;
  vertical-align: bottom;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
