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
import { ColumnMeta, Metric } from '@superset-ui/chart-controls';
import { DndItemType } from '../DndItemType';

export type DndItemValue = ColumnMeta | Metric;

export interface CubeControlPanelDndItem {
  value: CubeControlItemValue;
  type: DndItemType;
}

export type CubeControlItemValue = DndItemValue & {
  cube_name?: string;
  cube_title?: string;
  name?: string;
};

export function isDatasourcePanelDndItem(
  item: any,
): item is CubeControlPanelDndItem {
  return item?.value && item?.type;
}

export function isSavedMetric(item: any): item is Metric {
  return item?.metric_name;
}
