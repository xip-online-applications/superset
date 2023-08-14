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
import { t, validateNonEmpty } from '@superset-ui/core';
import {
  ControlPanelConfig,
  sections,
  sharedControls,
} from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyRegularTime,
    {
      label: t('DATA'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'cube',
            config: {
              type: 'DndCubeSelect',
              label: t('Cube Columns'),
              description: t('Cube Columns to display'),
              default: [validateNonEmpty],
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
    {
      label: t('Actie knoppen!'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'action_config',
            config: {
              type: 'TextControl',
              default: '',
              renderTrigger: true,
              label: t('Action Configuration'),
              description: t('Action Configuration in JSON format'),
            },
          },
        ],
        [
          {
            name: 'blocking_action',
            config: {
              type: 'CheckboxControl',
              label: t('Blocking action'),
              renderTrigger: true,
              default: true,
              description: t(
                'Makes the dashboard wait for a response from the form'
              ),
            },
          },
        ],
      ],
    },
  ],
};

export default config;
