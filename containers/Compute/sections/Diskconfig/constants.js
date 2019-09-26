export const driverLimiations = {
  Linux: [
    {
      value: 'none',
      label: '不做Raid',
      min: 1,
      step: 1,
    },
  ],
  PCIE: [
    {
      value: 'none',
      label: '不做Raid',
      min: 1,
      step: 1,
    },
  ],
  MPT2SAS: [
    {
      value: 'none',
      label: '不做Raid',
      min: 1,
      step: 1,
    },
    {
      value: 'raid0',
      label: 'Raid0',
      min: 2,
      step: 1,
    },
    {
      value: 'raid1',
      label: 'Raid1',
      min: 2,
      max: 2,
      step: 2,
    },
    {
      value: 'raid10',
      label: 'Raid10',
      min: 4,
      max: 10,
      step: 2,
    },
  ],
  MPT3SAS: [
    {
      value: 'none',
      label: '不做Raid',
      min: 1,
      step: 1,
    },
    {
      value: 'raid0',
      label: 'Raid0',
      min: 2,
      step: 1,
    },
    {
      value: 'raid1',
      label: 'Raid1',
      min: 2,
      max: 2,
      step: 2,
    },
    {
      value: 'raid10',
      label: 'Raid10',
      min: 4,
      max: 10,
      step: 2,
    },
  ],
  MegaRaid: [
    {
      value: 'none',
      label: '不做Raid',
      min: 1,
      step: 1,
    },
    {
      value: 'raid0',
      label: 'Raid0',
      min: 1,
      step: 1,
    },
    {
      value: 'raid1',
      label: 'Raid1',
      min: 2,
      max: 2,
      step: 2,
    },
    {
      value: 'raid5',
      label: 'Raid5',
      min: 3,
      step: 1,
    },
    {
      value: 'raid10',
      label: 'Raid10',
      min: 4,
      step: 2,
    },
  ],
  HPSARaid: [
    {
      value: 'none',
      label: '不做Raid',
      min: 1,
      step: 1,
    },
    {
      value: 'raid0',
      label: 'Raid0',
      min: 1,
      step: 1,
    },
    {
      value: 'raid1',
      label: 'Raid1',
      min: 2,
      step: 2,
    },
    {
      value: 'raid5',
      label: 'Raid5',
      min: 3,
      step: 1,
    },
    {
      value: 'raid10',
      label: 'Raid10',
      min: 4,
      step: 2,
    },
  ],
  MarvelRaid: [
    {
      value: 'none',
      label: '不做Raid',
      min: 1,
      step: 1,
    },
    {
      value: 'raid0',
      label: 'Raid0',
      min: 1,
      step: 1,
    },
    {
      value: 'raid1',
      label: 'Raid1',
      min: 2,
      step: 2,
    },
    {
      value: 'raid10',
      label: 'Raid10',
      min: 4,
      step: 2,
    },
  ],
}
