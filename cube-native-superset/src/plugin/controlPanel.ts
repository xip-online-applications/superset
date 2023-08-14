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
import { t } from '@superset-ui/core';
import {
  ControlPanelConfig,
  sections,
  sharedControls,
} from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  // For control input types, see: superset-frontend/src/explore/components/controls/index.js
  controlPanelSections: [
    sections.legacyRegularTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'cube_single',
            config: {
              type: 'DndCubeSelect',
              label: t('Cube Single Column'),
              description: t('Cube Column to display'),
              default: [],
              multi: false,
            }
          }
        ],
        [
          {
            name: 'cube',
            config: {
              type: 'DndCubeSelect',
              label: t('Cube Columns'),
              description: t('Cube Columns to display'),
              default: [],
            }
          }
        ],
        [
          {
            name: 'cube-filters',
            config: {
              type: 'CubeAdHocFilterControl',
              label: t('Cube Filters'),
              description: t('Cube Filters to display'),
              default: [],
            }
          }
        ],
        [
          {
            name: 'row_limit',
            config: sharedControls.row_limit,
          },
        ],
      ],
    },
  ],
};

export default config;
