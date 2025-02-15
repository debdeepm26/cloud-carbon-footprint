/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { CLOUD_PROVIDER_OPTIONS } from '../../utils/DropdownConstants'
import { FilterProps } from '../../utils/Filters'
import DropdownFilter from '../DropdownFilter'
import { DropdownOption } from 'Types'

const CloudProviderFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  return (
    <DropdownFilter
      id="cloud-provider-filter"
      displayValue={filters.cloudProviderLabel()}
      options={CLOUD_PROVIDER_OPTIONS}
      selections={filters.cloudProviders}
      selectionToOption={(cloudProvider: DropdownOption) => cloudProvider}
      updateSelections={(selections: DropdownOption[]) =>
        setFilters(filters.withCloudProviders(selections, options))
      }
    />
  )
}

export default CloudProviderFilter
