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
import { Preset } from '@superset-ui/core';
import { SupersetXip } from 'superset-xip';
import { DisplayContext } from 'display-context';
import { CubeTable } from 'cube-table';
import { LoggedInDashboardCard } from 'logged-in-dashboard-card';
import { MediaViewer } from 'media-viewer';
import { CubeProgress } from 'cube-progress';
import { CubeBurndownChart } from 'cube-burndown-chart';
import { CubeNativeSuperset } from 'cube-native-superset';

export default class XipPreset extends Preset {
  constructor() {
    super({
      name: 'XIP Cube Charts',
      plugins: [
        new SupersetXip().configure({ key: 'xip-form-builder' }),
        new DisplayContext().configure({ key: 'display-context' }),
        new CubeTable().configure({ key: 'cube-table' }),
        new LoggedInDashboardCard().configure({ key: 'logged-in-dashboard-card' }),
        new MediaViewer().configure({ key: 'media-viewer' }),
        new CubeProgress().configure({ key: 'cube-progress' }),
        // new CubeBurndownChart().configure({ key: 'cube-burndown-chart' }),
        new CubeNativeSuperset().configure({ key: 'cube-native-superset' }),
      ],
    });
  }
}
