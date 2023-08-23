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
import {
  QueryFormData,
  supersetTheme,
  TimeseriesDataRecord,
} from '@superset-ui/core';

export interface SupersetXipStylesProps {
  height: number;
  width: number;
  headerFontSize: keyof typeof supersetTheme.typography.sizes;
}

export interface FormObject {
  field_id: string;
  field_label: string;
  field_mandatory: string;
  field_filter: string;
  field_dataset: string;
  field_placeholder: string;
  field_type: string;
  field_value: string;
  field_options: string;
  field_template_source: string;
}

interface SupersetXipCustomizeProps {
  buttonText: string;
  actionIdentifier: string;
  blockingAction: boolean;
  formObject: Array<FormObject>;
  filters: Array<any>;
  setDataMask: Function;
}

export type SupersetXipQueryFormData = QueryFormData &
  SupersetXipStylesProps &
  SupersetXipCustomizeProps;

export type SupersetXipProps = SupersetXipStylesProps &
  SupersetXipCustomizeProps & {
    data: TimeseriesDataRecord[];
    // add typing here for the props you pass in from transformProps.ts!
  };