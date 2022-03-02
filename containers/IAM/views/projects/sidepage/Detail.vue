<template>
  <div>
    <a-alert type="warning" class="mb-2" :showIcon="false" :message="$t('system.text_589')" banner />
    <div class="d-flex justify-content-start">
      <a-button :disabled="loading" @click="refresh">
        <a-icon v-if="loading" type="sync" spin />
        <a-icon v-else type="sync" />
      </a-button>
    </div>
    <detail
      :data="data"
      :base-info="baseInfo"
      :extra-info="extraInfo"
      :on-manager="onManager"
      :resource="resource"
      :nameRules="nameRules" />
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import VmInstanceList from '@Compute/views/vminstance/components/List'
import ServertemplateList from '@Compute/views/servertemplate/components/List'
import DiskList from '@Compute/views/disk/components/List'
import ImageList from '@Compute/views/image/components/List'
import HostImageList from '@Compute/views/host-image/components/List'
import SnapshotList from '@Compute/views/snapshot/components/List'
import InstanceSnapshotList from '@Compute/views/snapshot-instance/components/List'
import SnapshotPolicyList from '@Compute/views/snapshotpolicy/components/List'
import SecgroupList from '@Compute/views/secgroup/components/List'
import NetworkList from '@Network/views/network/components/List'
import EipList from '@Network/views/eip/components/List'
import LbList from '@Network/views/lb/components/List'
import LbaclsList from '@Network/views/lbacls/components/List'
import LbcertList from '@Network/views/lbcerts/components/List'
import ExternalprojectList from '@Cloudenv/views/externalproject/components/List'
import BucketStorageList from '@Storage/views/bucket/components/List'
import RDSList from '@DB/views/rds/components/List'
import RedisList from '@DB/views/redis/components/List'
import { transformLabel } from '../../policy/utils'
import { RESOURCES_MAP } from '../../policy/constants'

const RESOURCES_BASE = {
  servers: {},
  servertemplates: {},
  disks: {},
  images: {},
  guestimages: {},
  snapshots: {},
  instance_snapshots: {},
  snapshotpolicies: {},
  secgroups: {},
  networks: {},
  eips: {},
}
const RESOURCES_LOAD = {
  loadbalancers: {},
  loadbalanceracls: {},
  loadbalancercertificates: {},
}

const RESOURCES_OTHER = {
  externalprojects: {},
  buckets: {},
  rds: {},
  elasticcaches: {},
}

export default {
  name: 'ProjectDetail',
  components: [
    VmInstanceList,
    ServertemplateList,
    DiskList,
    ImageList,
    HostImageList,
    SnapshotList,
    InstanceSnapshotList,
    SnapshotPolicyList,
    SecgroupList,
    NetworkList,
    EipList,
    LbList,
    LbaclsList,
    LbcertList,
    ExternalprojectList,
    BucketStorageList,
    RDSList,
    RedisList,
  ],
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: String,
    columns: Array,
  },
  data () {
    return {
      loading: false,
      nameRules: [
        { required: true, message: this.$t('system.text_168') },
      ],
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'domain', columns: () => this.columns, tipName: this.$t('dictionary.project') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'domain', columns: () => this.columns, tipName: this.$t('dictionary.project') }),
        {
          field: 'group_count',
          title: this.$t('system.text_457'),
          slots: {
            default: ({ row }) => {
              if (!row.group_count) return '0'
              return [<a onClick={ () => this.$emit('tab-change', 'project-directly-under-user-list') }>{row.group_count}</a>]
            },
          },
        },
        {
          field: 'user_count',
          title: this.$t('system.text_458'),
          slots: {
            default: ({ row }) => {
              if (!row.user_count) return '0'
              return [<a onClick={ () => this.$emit('tab-change', 'project-directly-under-user-list') }>{row.user_count}</a>]
            },
          },
        },
      ],
      resourceListComponent: {
        servers: {
          component: VmInstanceList,
          params: {
            pending_delete: 'all',
          },
        },
        servertemplates: {
          component: ServertemplateList,
          params: {},
        },
        disks: {
          component: DiskList,
          params: {
            pending_delete: 'all',
          },
        },
        images: {
          component: ImageList,
          params: {
            pending_delete: 'all',
          },
        },
        guestimages: {
          component: HostImageList,
          params: {
            pending_delete: 'all',
          },
        },
        snapshots: {
          component: SnapshotList,
          params: {},
        },
        instance_snapshots: {
          component: InstanceSnapshotList,
          params: {},
        },
        snapshotpolicies: {
          component: SnapshotPolicyList,
          params: {},
        },
        secgroups: {
          component: SecgroupList,
          params: {},
        },
        networks: {
          component: NetworkList,
          params: {},
        },
        eips: {
          component: EipList,
          params: {},
        },
        loadbalancers: {
          component: LbList,
          params: {},
        },
        loadbalanceracls: {
          component: LbaclsList,
          params: {},
        },
        loadbalancercertificates: {
          component: LbcertList,
          params: {},
        },
        externalprojects: {
          component: ExternalprojectList,
          params: {},
        },
        buckets: {
          component: BucketStorageList,
          params: {},
        },
        rds: {
          component: RDSList,
          params: {},
        },
        elasticcaches: {
          component: RedisList,
          params: {},
        },
      },
    }
  },
  computed: {
    extResources () {
      return this.data.ext_resource ? this.data.ext_resource : {}
    },
    extraInfo () {
      if (!this.extResources) {
        return null
      }

      const serverRes = {
        title: this.$t('system.text_587'),
        items: Object.keys(RESOURCES_BASE).map((key) => {
          return {
            field: key,
            title: transformLabel(RESOURCES_MAP[key]) || key,
            formatter: () => {
              const txt = this.extResources[key] ? this.$t('system.text_459', [this.extResources[key]]) : this.$t('system.text_460')
              const comp = this.resourceListComponent[key] ? this.resourceListComponent[key] : null
              if (txt && comp) {
                return [
                  <a onClick={
                    () => {
                      this.createDialog('ProjectResourcesDialog',
                        {
                          component: comp.component,
                          id: key,
                          params: {
                            ...comp.params,
                            projects: [this.data.id],
                          },
                          title: transformLabel(RESOURCES_MAP[key]) || key,
                        })
                    }
                  }>{ txt }</a>,
                ]
              } else {
                return txt
              }
            },
          }
        }),
      }

      const loadRes = {
        title: this.$t('system.loadbalance_resource_statistics'),
        items: Object.keys(RESOURCES_LOAD).map((key) => {
          return {
            field: key,
            title: transformLabel(RESOURCES_MAP[key]) || key,
            formatter: () => {
              const txt = this.extResources[key] ? this.$t('system.text_459', [this.extResources[key]]) : this.$t('system.text_460')
              const comp = this.resourceListComponent[key] ? this.resourceListComponent[key] : null
              if (txt && comp) {
                return [
                  <a onClick={
                    () => {
                      this.createDialog('ProjectResourcesDialog',
                        {
                          component: comp.component,
                          id: key,
                          params: {
                            ...comp.params,
                            projects: [this.data.id],
                          },
                          title: transformLabel(RESOURCES_MAP[key]) || key,
                        })
                    }
                  }>{ txt }</a>,
                ]
              } else {
                return txt
              }
            },
          }
        }),
      }

      const otherRes = {
        title: this.$t('system.other_resource_statistics'),
        items: Object.keys(RESOURCES_OTHER).map((key) => {
          return {
            field: key,
            title: transformLabel(RESOURCES_MAP[key]) || key,
            formatter: () => {
              const txt = this.extResources[key] ? this.$t('system.text_459', [this.extResources[key]]) : this.$t('system.text_460')
              const comp = this.resourceListComponent[key] ? this.resourceListComponent[key] : null
              if (txt && comp) {
                return [
                  <a onClick={
                    () => {
                      this.createDialog('ProjectResourcesDialog',
                        {
                          component: comp.component,
                          id: key,
                          params: {
                            ...comp.params,
                            projects: [this.data.id],
                          },
                          title: transformLabel(RESOURCES_MAP[key]) || key,
                        })
                    }
                  }>{ txt }</a>,
                ]
              } else {
                return txt
              }
            },
          }
        }),
      }

      return [serverRes, loadRes, otherRes]
    },
  },
  methods: {
    refresh () {
      this.loading = true
      new this.$Manager('scope-resource', 'v1').performClassAction({
        action: 'refresh',
      }).then((res) => {
        this.loading = false
        this.$bus.$emit('SystemProjectsListRefresh', true)
      }).catch(() => {
        this.loading = false
      })
    },
  },
}
</script>
