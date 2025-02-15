/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'

export const convertByteSecondsToTerabyteHours = (
  usageAmount: number,
): number => {
  // This function converts byte-seconds into terabyte hours by first converting bytes to terabytes, then seconds to hours.
  return usageAmount / 1099511627776 / 3600
}

export const convertBytesToGigabytes = (usageAmount: number): number => {
  return usageAmount / 1073741824
}

export const convertByteSecondsToGigabyteHours = (
  usageAmount: number,
): number => {
  return usageAmount / 1073741824 / 3600
}

export const convertBytesToTerabytes = (usageAmount: number): number => {
  return usageAmount / 1099511627776
}

export const convertGigabyteHoursToTerabyteHours = (
  usageAmount: number,
): number => {
  return usageAmount / 1000
}

export const convertGigabyteMonthsToTerabyteHours = (
  usageAmount: number,
  timestamp: Date,
): number => {
  const daysInMonth = moment(timestamp).utc().daysInMonth()
  return (usageAmount / 1000) * (24 * daysInMonth)
}

export const convertTerabytesToGigabytes = (usageAmount: number): number => {
  return usageAmount * 1000
}

export const convertGigaBytesToTerabyteHours = (
  usageAmount: number,
): number => {
  return (usageAmount / 1000) * 24
}
