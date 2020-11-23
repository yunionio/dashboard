import i18n from '@/locales'

export const timeOpts = {
  [`${1}h`]: {
    key: `${1}h`,
    label: i18n.t('monitor.text00001'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: i18n.t('monitor.text00007') },
      { key: '5m', label: i18n.t('monitor.text00008') },
    ],
  },
  [`${3}h`]: {
    key: `${3}h`,
    label: i18n.t('monitor.text00002'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: i18n.t('monitor.text00007') },
      { key: '5m', label: i18n.t('monitor.text00008') },
    ],
  },
  [`${6}h`]: {
    key: `${6}h`,
    label: i18n.t('monitor.text00003'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '1m', label: i18n.t('monitor.text00007') },
      { key: '5m', label: i18n.t('monitor.text00008') },
      { key: '10m', label: i18n.t('monitor.text00009') },
    ],
  },
  [`${24}h`]: {
    key: `${24}h`,
    label: i18n.t('monitor.text00004'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: i18n.t('monitor.text00008') },
      { key: '10m', label: i18n.t('monitor.text00009') },
      { key: '30m', label: i18n.t('monitor.text00010') },
      { key: '1h', label: i18n.t('monitor.text00011') },
    ],
  },
  [`${3 * 24}h`]: {
    key: `${3 * 24}h`,
    label: i18n.t('monitor.text00005'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: i18n.t('monitor.text00008') },
      { key: '10m', label: i18n.t('monitor.text00009') },
      { key: '30m', label: i18n.t('monitor.text00010') },
      { key: '1h', label: i18n.t('monitor.text00011') },
    ],
  },
  custom: {
    key: 'custom',
    hidden: true,
    label: i18n.t('monitor.text00006'),
    timeFormat: 'YYYY-MM-DD HH:mm',
    timeGroupOpts: [
      { key: '5m', label: i18n.t('monitor.text00008') },
      { key: '10m', label: i18n.t('monitor.text00009') },
      { key: '30m', label: i18n.t('monitor.text00010') },
      { key: '1h', label: i18n.t('monitor.text00011') },
      { key: '6h', label: i18n.t('monitor.text00012') },
      { key: '24h', label: i18n.t('monitor.text00013') },
    ],
  },
}
