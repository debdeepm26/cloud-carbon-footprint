/*
 * © 2021 Thoughtworks, Inc.
 */

import { BigQuery } from '@google-cloud/bigquery'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import {
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
} from '@cloud-carbon-footprint/core'

import { GCP_CLOUD_CONSTANTS } from '../domain'
import BillingExportTable from '../lib/BillingExportTable'
import {
  mockQueryResultsAppEngineSSDStorage,
  mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD,
  mockQueryResultsUnknownUsages,
  mockQueryResultsUnknownAndCloudSQLCompute,
  mockQueryAppEngineComputeUnknownRegion,
  mockQueryNetworkingIgnoreIngress,
  mockQueryComputeWithDifferentMachineTypes,
  mockQueryResultsComputeEngineRam,
  mockQueryCloudStorageWithReplicationFactors,
  mockQueryComputeEngineCloudFilestoreCloudSQLWithReplicationFactors,
  mockQueryMemoryStoreWithReplicationFactors,
} from './fixtures/bigQuery.fixtures'

const mockJob = { getQueryResults: jest.fn() }
const mockCreateQueryJob = jest.fn().mockResolvedValue([mockJob, 'test-job-id'])

jest.mock('@google-cloud/bigquery', () => {
  return {
    BigQuery: jest.fn().mockImplementation(() => {
      return {
        createQueryJob: mockCreateQueryJob,
      }
    }),
  }
})

describe('GCP BillingExportTable Service', () => {
  const startDate = new Date('2020-10-01')
  const endDate = new Date('2020-11-03')
  const accountId = 'test-account-id'
  const accountName = 'test-account-name'

  it('Returns estimation results for App Engine SSD Storage & GCS Storage accumulated', async () => {
    // given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsAppEngineSSDStorage,
    )

    // when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 0.005190060141275502,
            co2e: 0.000002595030070637751,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'App Engine',
            cost: 15,
            region: 'us-east1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for Cloud SQL SSD Storage, Compute Engine and Cloud Dataflow HDD', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsCloudSQLSSDComputeEngineDataFlowHDD,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 1.4232136891223488,
            co2e: 0.0007116068445611744,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 7,
            region: 'us-east1',
          },
          {
            kilowattHours: 0.06489555555555557,
            co2e: 0.00003244777777777779,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 7,
            region: 'us-east1',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 0.1402554516971577,
            co2e: 0.00001640988784856745,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Dataflow',
            cost: 12,
            region: 'us-west1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for Cloud Storage based on replication factors', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryCloudStorageWithReplicationFactors,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 3.551443417867025e-13,
            co2e: 1.7384315530459089e-16,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Storage',
            cost: 10,
            region: 'nam4',
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 2.0489133847375458e-8,
            cost: 120,
            kilowattHours: 0.000042774809702245215,
            region: 'us-central1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
          },
        ],
      },
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 2.274785001820419e-13,
            cost: 220,
            kilowattHours: 5.585721305881937e-10,
            region: 'us',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for ComputeEngine, CloudFileStore and CloudSQL based on replication factors', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryComputeEngineCloudFilestoreCloudSQLWithReplicationFactors,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 0.00028446168676757815,
            co2e: 1.4223084338378908e-7,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            region: 'us-east1',
          },
          {
            kilowattHours: 8.234108336182544e-11,
            co2e: 4.3146727681596535e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            region: 'asia-northeast1',
          },
          {
            kilowattHours: 1.3380426046296634e-10,
            co2e: 8.129946865729836e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            region: 'asia',
          },
          {
            kilowattHours: 4.4601420154322116e-11,
            co2e: 3.224682677157489e-14,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 150,
            region: 'asia-south1',
          },
          {
            kilowattHours: 0.034632,
            co2e: 0.000016588728000000003,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Filestore',
            cost: 70,
            region: 'us-central1',
          },
          {
            kilowattHours: 0.00023740234375,
            co2e: 9.092509765625e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 80,
            region: 'us-east4',
          },
          {
            kilowattHours: 6.587286728972686e-10,
            co2e: 4.762608305047252e-13,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 80,
            region: 'asia-south1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for Cloud Memorystore for Redis based on replication factors', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryMemoryStoreWithReplicationFactors,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 0.00001691015625,
            co2e: 8.099964843750001e-9,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Memorystore for Redis',
            cost: 170,
            region: 'us-central1',
          },
          {
            kilowattHours: 0.00003412500000000001,
            co2e: 1.6345875000000003e-8,
            usesAverageCPUConstant: false,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud Memorystore for Redis',
            cost: 170,
            region: 'us-central2',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results for Compute with different machine types', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryComputeWithDifferentMachineTypes,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            kilowattHours: 14.205883714222226,
            co2e: 0.007102941857111114,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 10,
            region: 'us-east1',
          },
          {
            kilowattHours: 0.06983666666666666,
            co2e: 0.00000817089,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 7,
            region: 'us-west1',
          },
        ],
      },
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 7.49136852652778,
            co2e: 0.0037456842632638903,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Compute Engine',
            cost: 10,
            region: 'us-east1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('Returns estimation results Unknown Usage Types', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsUnknownUsages)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = []
    expect(result).toEqual(expectedResult)
  })

  it('Returns null estimates for networking and CLoud SQL Compute usage accumulated', async () => {
    //given
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryResultsUnknownAndCloudSQLCompute,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    // then
    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            kilowattHours: 97.93244464113891,
            co2e: 0.04896622232056946,
            usesAverageCPUConstant: true,
            cloudProvider: 'GCP',
            accountId: accountId,
            accountName: accountName,
            serviceName: 'Cloud SQL',
            cost: 36,
            region: 'us-east1',
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })
  it('estimation for unknown App Engine Compute and Cloud DataFlow Compute', async () => {
    mockJob.getQueryResults.mockResolvedValue(
      mockQueryAppEngineComputeUnknownRegion,
    )
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0004631762094861113,
            cost: 190,
            region: 'us-east1',
            serviceName: 'Cloud Dataflow',
            usesAverageCPUConstant: true,
            kilowattHours: 0.9263524189722225,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.000002100469896289623,
            cost: 5,
            region: 'Unknown',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.005111991817506756,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Networking', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryNetworkingIgnoreIngress)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-11-02'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.9688080284730532e-8,
            cost: 10,
            region: 'us-west1',
            serviceName: 'App Engine',
            usesAverageCPUConstant: false,
            kilowattHours: 0.00016827419046778233,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000013329019970018418,
            cost: 10,
            region: 'us-east1',
            serviceName: 'Cloud Storage',
            usesAverageCPUConstant: false,
            kilowattHours: 0.0026658039940036836,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 0.0000010933661307394432,
            cost: 10,
            kilowattHours: 0.0026609658742323523,
            region: 'europe-central2',
            serviceName: 'Cloud Pub/Sub',
            usesAverageCPUConstant: false,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('estimation for Memory', async () => {
    mockJob.getQueryResults.mockResolvedValue(mockQueryResultsComputeEngineRam)
    //when
    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    const result = await billingExportTableService.getEstimates(
      startDate,
      endDate,
    )

    const expectedResult: EstimationResult[] = [
      {
        timestamp: new Date('2020-10-28'),
        serviceEstimates: [
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 1.5590675175189971e-18,
            cost: 10,
            region: 'us-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 1.3325363397598266e-14,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 5.581319332122802e-18,
            cost: 8,
            region: 'europe-west1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 2.847611904144287e-14,
          },
          {
            accountId: accountId,
            accountName: accountName,
            cloudProvider: 'GCP',
            co2e: 2.0489236960808437e-17,
            cost: 5,
            region: 'us-central1',
            serviceName: 'Compute engine',
            usesAverageCPUConstant: false,
            kilowattHours: 4.277502497037252e-14,
          },
        ],
      },
    ]
    expect(result).toEqual(expectedResult)
  })

  it('throws an error when get query results fails', async () => {
    const mockErrorDetails = {
      message: 'Not found: Job',
      domain: 'global',
      reason: 'notFound',
    }
    const apiError: any = new Error('Test message')
    apiError.errors = [mockErrorDetails]

    mockJob.getQueryResults.mockRejectedValue(apiError)

    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    await expect(() =>
      billingExportTableService.getEstimates(startDate, endDate),
    ).rejects.toThrow(
      `BigQuery get Query Results failed. Reason: ${mockErrorDetails.reason}, Domain: ${mockErrorDetails.domain}, Message: ${mockErrorDetails.message}`,
    )
  })

  it('throws an error when create query job fails', async () => {
    const mockErrorDetails = {
      reason: 'Invalid Query',
      location: 'query',
      message: 'Test message',
    }
    const apiError: any = new Error('Test message')
    apiError.errors = [mockErrorDetails]

    mockCreateQueryJob.mockRejectedValue(apiError)

    const billingExportTableService = new BillingExportTable(
      new ComputeEstimator(),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.SSDCOEFFICIENT),
      new StorageEstimator(GCP_CLOUD_CONSTANTS.HDDCOEFFICIENT),
      new NetworkingEstimator(GCP_CLOUD_CONSTANTS.NETWORKING_COEFFICIENT),
      new MemoryEstimator(GCP_CLOUD_CONSTANTS.MEMORY_COEFFICIENT),
      new BigQuery(),
    )

    await expect(() =>
      billingExportTableService.getEstimates(startDate, endDate),
    ).rejects.toThrow(
      `BigQuery create Query Job failed. Reason: ${mockErrorDetails.reason}, Location: ${mockErrorDetails.location}, Message: ${mockErrorDetails.message}`,
    )
  })
})
