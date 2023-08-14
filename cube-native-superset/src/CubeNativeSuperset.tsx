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
import React, {  createRef, useEffect } from 'react';
import { styled } from '@superset-ui/core';
import { CubeNativeSupersetProps, CubeNativeSupersetStylesProps } from './types';
import cubejs from "@cubejs-client/core";

const Styles = styled.div<CubeNativeSupersetStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  }
`;

export default function CubeNativeSuperset(props: CubeNativeSupersetProps) {
  const { height, width , cube, rowLimit, cubeFilters, cubeSingle, filters} = props;
  const rootElem = createRef<HTMLDivElement>();

  const [data, setData] = React.useState([]);
  const [singleData, setSingleData] = React.useState([]);

  const options = {
    apiToken: 'd60cb603dde98ba3037f2de9eda44938',
    apiUrl: 'https://odtest.xip.nl/cubejs-api/v1',
  };

  const cubejsApi = cubejs(options.apiToken, options);

  useEffect(() => {
    const dimensions = cube.map((item) => item.value.name);
    const cubeName = cube.map((item) => item.value.cube_name)[0];
    const combinedFilters = [...filters, ...cubeFilters];

    const applicableFilters = combinedFilters.filter((item) => item.cube === cubeName)
      .map((item) => {
        return {
          member: item.col,
          operator: item.op,
          values: Array.isArray(item.val) ? item.val : [ item.val ]
        }
      });

    const query = {
      dimensions,
      limit: rowLimit,
      filters: applicableFilters
    };

    cubejsApi
      .load(query)
      .then((result: any) => {
        setData(result.loadResponse.results[0].data);
      });

  }, [cube, cubeFilters, rowLimit, filters]);

  useEffect(() => {
    const dimensions = cubeSingle.map((item) => item.value.name);
    const cubeName = cubeSingle.map((item) => item.value.cube_name)[0];
    const combinedFilters = [...filters, ...cubeFilters];

    const applicableFilters = combinedFilters.filter((item) => item.cube === cubeName)
      .map((item) => {
        return {
          member: item.col,
          operator: item.op,
          values: Array.isArray(item.val) ? item.val : [ item.val ]
        }
      });

    const query = {
      dimensions,
      limit: rowLimit,
      filters: applicableFilters
    };

    cubejsApi
      .load(query)
      .then((result: any) => {
        setSingleData(result.loadResponse.results[0].data);
      });

  }, [cubeSingle, cubeFilters, rowLimit, filters]);

  return (
    <Styles
      ref={rootElem}
      height={height}
      width={width}
    >
      <h3>Cube Native Superset</h3>
      <hr/>
      <br/>
      <div>
        <span>Single column example</span>
        <hr/>
        <br/>
        <span>${JSON.stringify(singleData, null, 2)}</span>
      </div>
      <br/>
      <div>
        <span>More data example</span>
        <hr/>
        <br/>
        <span>${JSON.stringify(data, null, 2)}</span>
      </div>
    </Styles>
  );
}
