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
import {t} from '@superset-ui/core';
import {
  ControlPanelConfig,
} from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Data'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'total_value',
            config: {
              type: 'DndCubeSelect',
              label: t('Total Column'),
              description: t('The column where the progressbar get its total value from'),
              default: [],
              multi: false,
            }
          }
        ],
        [
          {
            name: 'values',
            config: {
              type: 'DndCubeSelect',
              label: t('Columns'),
              description: t('The progress columns'),
              default: [],
              //TODO: add enum type
              acceptType: 'cubeMeasure',
            }
          }
        ],
        [
          {
            name: 'cube_filters',
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
            name: 'cube_cross_filters',
            config: {
              type: 'CubeCrossFilterControl',
              label: t('Cube Cross Filters'),
              description: t('Cube Filters that match across cubes'),
              default: [],
            }
          }
        ],
      ],
    },
    {
      label: t('Display settings'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'progress_type',
            config: {
              type: 'SelectControl',
              label: t('Progress Type'),
              default: 'line',
              choices: [
                ['line', 'Lijn'],
                ['circle', 'Cirkel'],
                ['dashboard', 'Dashboard'],
              ],
              renderTrigger: true,
              description: t('The type of progressbar'),
            },
          },
        ],
        [
          {
            name: 'layout',
            config: {
              type: 'SelectControl',
              label: t('Layout'),
              default: 'vertical',
              choices: [
                ['vertical', 'Verticaal'],
                ['horizontal', 'Horizontaal'],
              ],
              renderTrigger: true,
              description: t('Alightment of the progressbars'),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
