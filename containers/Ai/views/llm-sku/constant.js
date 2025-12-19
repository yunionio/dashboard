import i18n from '@/locales'

export const dict = {
  protocolArr: [
    { id: 'tcp', name: 'TCP' },
    { id: 'udp', name: 'UDP' },
  ],
  diskTypeArr: [
    { id: 'local', name: i18n.t('aice.local_disk') },
  ],
}

export const portMappings = [
  {
    container_port: -1,
    envs: [
      {
        key: 'WOLF_HTTPS_PORT',
        value_from: 'port',
      },
    ],
    first_port_offset: 0,
    protocol: 'tcp',
  },
  {
    container_port: -1,
    envs: [
      {
        key: 'WOLF_HTTP_PORT',
        value_from: 'port',
      },
    ],
    first_port_offset: 5,
    protocol: 'tcp',
  },
  {
    container_port: -1,
    envs: [
      {
        key: 'WOLF_CONTROL_PORT',
        value_from: 'port',
      },
    ],
    first_port_offset: 15,
    protocol: 'udp',
  },
  {
    container_port: -1,
    envs: [
      {
        key: 'WOLF_VIDEO_PING_PORT',
        value_from: 'port',
      },
    ],
    first_port_offset: 116,
    protocol: 'udp',
  },
  {
    container_port: -1,
    envs: [
      {
        key: 'WOLF_AUDIO_PING_PORT',
        value_from: 'port',
      },
    ],
    first_port_offset: 216,
    protocol: 'udp',
  },
  {
    container_port: -1,
    envs: [
      {
        key: 'WOLF_RTSP_SETUP_PORT',
        value_from: 'port',
      },
    ],
    first_port_offset: 26,
    protocol: 'tcp',
  },
]
