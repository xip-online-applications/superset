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
import {t, validateNonEmpty} from '@superset-ui/core';
import {
  ControlPanelConfig,
} from '@superset-ui/chart-controls';
import { handlebarsDataTemplateControlSetItem, handlebarsEmptyTemplateControlSetItem } from './controls/handlebarTemplate';
import { styleControlSetItem } from './controls/style';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Data'),
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
      ],
    },
    {
      label: t('Setup display!'),
      expanded: true,
      controlSetRows: [
        [handlebarsDataTemplateControlSetItem],
        [handlebarsEmptyTemplateControlSetItem],
        [styleControlSetItem],
      ],
    },
  ],
};

export default config;
