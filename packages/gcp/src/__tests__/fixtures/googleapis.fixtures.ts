/*
 * © 2021 Thoughtworks, Inc.
 */
import { compute_v1 } from 'googleapis'
import Schema$Instance = compute_v1.Schema$Instance
import Schema$MachineType = compute_v1.Schema$MachineType
import Schema$Image = compute_v1.Schema$Image
import Schema$InstanceAggregatedList = compute_v1.Schema$InstanceAggregatedList
import Schema$Disk = compute_v1.Schema$Disk
import Schema$DiskAggregatedList = compute_v1.Schema$DiskAggregatedList
import Schema$AddressAggregatedList = compute_v1.Schema$AddressAggregatedList

export type InstanceData = {
  data: Schema$Instance
}

type MachineTypeData = {
  data: Schema$MachineType
}

type ImageDetails = {
  data: Schema$Image
}

type DiskData = {
  data: Schema$Disk
}

type InstanceAggregatedList = {
  data: Schema$InstanceAggregatedList
}

type DiskAggregatedList = {
  data: Schema$DiskAggregatedList
}

type AddressAggregatedList = {
  data: Schema$AddressAggregatedList
}

export const mockedInstanceResultItems: InstanceAggregatedList = {
  data: {
    items: {
      'zones/us-west1-a': {
        instances: [{ id: 'test-instance' }],
      },
      'zones/us-west1-b': { warning: { code: 'NO_RESULTS_ON_PAGE' } },
    },
  },
}

export const mockedInstanceRegionsResultItems: InstanceAggregatedList = {
  data: {
    items: {
      'regions/us-west1': {
        instances: [{ id: 'test-instance' }],
      },
    },
  },
}

export const mockedInstanceGlobalResultItems: InstanceAggregatedList = {
  data: {
    items: {
      global: {
        instances: [{ id: 'test-instance-global' }],
      },
    },
  },
}

export const mockedAddressesResultItems: AddressAggregatedList = {
  data: { items: {} },
}

export const mockedDisksResultItems: DiskAggregatedList = {
  data: { items: {} },
}

export const mockedDisksGetSSDDetails: DiskData = {
  data: {
    sizeGb: '20',
    type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard-ssd',
  },
}

export const mockedDisksGetHDDDetails: DiskData = {
  data: {
    sizeGb: '20',
    type: 'https://www.googleapis.com/compute/v1/projects/techops-events/zones/us-central1-b/diskTypes/pd-standard',
  },
}

export const mockedInstanceGetItems: InstanceData = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [],
  },
}

export const mockedInstanceGetItemsCurrent: InstanceData = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/e2-medium',
    disks: [],
  },
}

export const mockedInstanceGetItemsNew: InstanceData = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/e2-small',
    disks: [],
  },
}

export const mockedInstanceGetItemsWithHDDDisks: InstanceData = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [
      {
        source:
          'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/disks/test-disk-id',
        diskSizeGb: '20',
      },
    ],
  },
}

export const mockedInstanceGetItemsWithBothDisks: InstanceData = {
  data: {
    machineType:
      'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/machineTypes/n2-standard-32',
    disks: [
      {
        source:
          'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/disks/test-disk-1',
        diskSizeGb: '20',
      },
      {
        source:
          'https://www.googleapis.com/compute/v1/projects/test-project/zones/us-west1-b/disks/test-disk-2',
        diskSizeGb: '20',
      },
    ],
  },
}

export const mockedMachineTypesGetItems: MachineTypeData = {
  data: {
    guestCpus: 32,
  },
}

export const mockedMachineTypesGetItemsCurrent: MachineTypeData = {
  data: {
    guestCpus: 2,
  },
}

export const mockedMachineTypesGetItemsNew: MachineTypeData = {
  data: {
    guestCpus: 1,
  },
}

export const mockedImageGetDetails: ImageDetails = {
  data: {
    archiveSizeBytes: '580709696',
  },
}
