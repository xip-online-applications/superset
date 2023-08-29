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
import {
  CubeCrossFilterSelectOptionDuplicate,
  CubeFilterSelectOptionDuplicate,
  CubeNativeSupersetProps,
  CubeNativeSupersetStylesProps
} from './types';
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
  const { cubeConfig, height, width , cube, rowLimit, cubeFilters, cubeSingle, filters, cubeCrossFilters, cubeMeasures} = props;
  const rootElem = createRef<HTMLDivElement>();

  const [data, setData] = React.useState([]);
  const [singleData, setSingleData] = React.useState([]);
  const [measureData, setMeasureData] = React.useState([]);


  const options = {
    apiToken: cubeConfig.api_token,
    apiUrl: cubeConfig.api_url,
  };
  const cubejsApi = cubejs(options.apiToken, options);

  const transformFilters = (nativeFilters: Array<CubeFilterSelectOptionDuplicate>, crossFilters: Array<CubeCrossFilterSelectOptionDuplicate>): Array<CubeFilterSelectOptionDuplicate> => {
    const filters = [...nativeFilters];

    crossFilters.forEach((item) => {
      const filterLeft = filters.find((filter) => filter.cube === item.cubeLeft && filter.col === item.colLeft);
      const filterRight = filters.find((filter) => filter.cube === item.cubeRight && filter.col === item.colRight);

      if (filterLeft) {
        filters.push({
          cube: item.cubeRight,
          col: item.colRight,
          op: filterLeft.op,
          val: filterLeft.val
        });
      }

      if (filterRight) {
        filters.push({
          cube: item.cubeLeft,
          col: item.colLeft,
          op: filterRight.op,
          val: filterRight.val
        });
      }
    });

    return filters;
  }


  useEffect(() => {
    const dimensions = cube.map((item) => item.value.name);
    const cubeName = cube.map((item) => item.value.cube_name)[0];
    const combinedFilters = transformFilters([...filters, ...cubeFilters], cubeCrossFilters);

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

  }, [cube, cubeFilters, rowLimit, filters, cubeCrossFilters]);

  useEffect(() => {
    const dimensions = cubeSingle.map((item) => item.value.name);
    const cubeName = cubeSingle.map((item) => item.value.cube_name)[0];
    const combinedFilters = transformFilters([...filters, ...cubeFilters], cubeCrossFilters);

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

  }, [cubeSingle, cubeFilters, rowLimit, filters, cubeCrossFilters]);


  useEffect(() => {
    const measures = cubeMeasures.map((item) => item.value.name);
    const cubeName = cubeMeasures.map((item) => item.value.cube_name)[0];
    const combinedFilters = transformFilters([...filters, ...cubeFilters], cubeCrossFilters);

    const applicableFilters = combinedFilters.filter((item) => item.cube === cubeName)
        .map((item) => {
          return {
            member: item.col,
            operator: item.op,
            values: Array.isArray(item.val) ? item.val : [ item.val ]
          }
        });

    const query = {
      measures,
      limit: rowLimit,
      filters: applicableFilters
    };

    cubejsApi
        .load(query)
        .then((result: any) => {
          setMeasureData(result.loadResponse.results[0].data);
        });

  }, [cubeMeasures, cubeFilters, rowLimit, filters, cubeCrossFilters]);


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
      <br/>
      <div>
        <span>Measure data example</span>
        <hr/>
        <br/>
        <span>${JSON.stringify(measureData, null, 2)}</span>
      </div>
    </Styles>
  );
}
