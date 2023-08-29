/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import memoizeOne from 'memoize-one';
import {
  getChartControlPanelRegistry,
} from '@superset-ui/core';
import {
  ControlPanelConfig,
  expandControlConfig,
  isControlPanelSectionConfig,
} from '@superset-ui/chart-controls';

import * as SECTIONS from 'src/explore/controlPanels/sections';

const getMemoizedSectionsToRender = memoizeOne(
  (controlPanelConfig: ControlPanelConfig) => {
    const {
      sectionOverrides = {},
      controlOverrides,
      controlPanelSections = [],
    } = controlPanelConfig;

    // default control panel sections
    const sections = { ...SECTIONS };

    // apply section overrides
    Object.entries(sectionOverrides).forEach(([section, overrides]) => {
      if (typeof overrides === 'object' && overrides.constructor === Object) {
        sections[section] = {
          ...sections[section],
          ...overrides,
        };
      } else {
        sections[section] = overrides;
      }
    });

    const { datasourceAndVizType } = sections;

    return [datasourceAndVizType]
      .concat(controlPanelSections.filter(isControlPanelSectionConfig))
      .map(section => {
        const { controlSetRows } = section;
        return {
          ...section,
          controlSetRows:
            controlSetRows?.map(row =>
              row.map(item => expandControlConfig(item, controlOverrides)),
            ) || [],
        };
      });
  },
);

/**
 * Get the clean and processed control panel sections
 */
export function getSectionsToRender(vizType: string) {
  const controlPanelConfig =
    (getChartControlPanelRegistry().get(vizType) as ControlPanelConfig) || {};

  return getMemoizedSectionsToRender(controlPanelConfig);
}
