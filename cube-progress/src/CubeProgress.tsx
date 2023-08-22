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
import React, { createRef, useEffect } from 'react';
import cubejs from '@cubejs-client/core';
import { styled } from '@superset-ui/core';
import {
  CubeCrossFilterSelectOptionDuplicate,
  CubeFilterSelectOptionDuplicate,
  CubeProgressProps,
  CubeProgressStylesProps,
} from './types';
import { Progress, Space } from 'antd';

const Styles = styled.div<CubeProgressStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`;

export default function CubeProgress(props: CubeProgressProps) {
  const {
    height,
    width,
    filters,
    cubeFilters,
    values,
    progressType,
    totalValue,
    cubeCrossFilters,
    layout,
  } = props;

  const [total, setTotal] = React.useState(0);
  const [data, setData] = React.useState(values.map(() => 0));
  const [percentage, setPercentage] = React.useState(values.map(() => 0));

  const rootElem = createRef<HTMLDivElement>();

  const options = {
    apiToken: 'd60cb603dde98ba3037f2de9eda44938',
    apiUrl: 'https://odtest.xip.nl/cubejs-api/v1',
  };

  const cubejsApi = cubejs(options.apiToken, options);

  const transformFilters = (
    nativeFilters: Array<CubeFilterSelectOptionDuplicate>,
    crossFilters: Array<CubeCrossFilterSelectOptionDuplicate>
  ): Array<CubeFilterSelectOptionDuplicate> => {
    const filters = [...nativeFilters];

    crossFilters.forEach((item) => {
      const filterLeft = filters.find(
        (filter) => filter.cube === item.cubeLeft && filter.col === item.colLeft
      );
      const filterRight = filters.find(
        (filter) =>
          filter.cube === item.cubeRight && filter.col === item.colRight
      );

      if (filterLeft) {
        filters.push({
          cube: item.cubeRight,
          col: item.colRight,
          op: filterLeft.op,
          val: filterLeft.val,
        });
      }

      if (filterRight) {
        filters.push({
          cube: item.cubeLeft,
          col: item.colLeft,
          op: filterRight.op,
          val: filterRight.val,
        });
      }
    });

    return filters;
  };

  useEffect(() => {
    if (values.length === 0) {
      return;
    }

    const measures = values.map((item) => item.value.name);
    const cubeName = values.map((item) => item.value.cube_name)[0];
    const combinedFilters = transformFilters(
      [...filters, ...cubeFilters],
      cubeCrossFilters
    );

    const applicableFilters = combinedFilters
      .filter((item) => item.cube === cubeName)
      .map((item) => {
        return {
          member: item.col,
          operator: item.op,
          values: Array.isArray(item.val) ? item.val : [item.val],
        };
      });

    if (applicableFilters.length === 0) {
      setData(values.map(() => 0));
      return;
    }

    const query = {
      measures,
      filters: applicableFilters,
    };

    cubejsApi.load(query).then((result: any) => {
      setData(result.loadResponse.results[0].data[0]);
    });
  }, [values, cubeFilters, filters, cubeCrossFilters]);

  useEffect(() => {
    if (totalValue.length === 0) {
      return;
    }

    const dimensions = totalValue.map((item) => item.value.name);
    const cubeName = totalValue.map((item) => item.value.cube_name)[0];
    const combinedFilters = transformFilters(
      [...filters, ...cubeFilters],
      cubeCrossFilters
    );

    const applicableFilters = combinedFilters
      .filter((item) => item.cube === cubeName)
      .map((item) => {
        return {
          member: item.col,
          operator: item.op,
          values: Array.isArray(item.val) ? item.val : [item.val],
        };
      });

    if (applicableFilters.length === 0) {
      setTotal(0);
      return;
    }

    const query = {
      dimensions,
      limit: 1,
      filters: applicableFilters,
    };

    cubejsApi.load(query).then((result: any) => {
      setTotal(result.loadResponse.results[0].data[0]);
    });
  }, [totalValue, cubeFilters, filters, cubeCrossFilters]);

  useEffect(() => {
    if (data == undefined || total == undefined) {
      setPercentage(values.map(() => 0));
      return;
    }
    const tempPercentage = {};

    values.forEach((item) => {
      tempPercentage[item?.value?.name] =
        Math.round(
          ((data[item.value.name] ?? 0) / Object.values(total)[0]) * 10000
        ) / 100;
    });

    setPercentage(tempPercentage);
  }, [total, data]);

  const itemStyle = {
    width:
        progressType === 'line' ? '100%' : undefined,
  };

  const spaceStyle = {
    display: "flex",
    gap: "8px",
    flexDirection:"column",
    width:
      layout === 'vertical' ? '100%' : Math.round(100 / values.length) + '%',
    alignItems: progressType === 'line' ? 'flex-start' : 'center',
  };

  const parentStyle = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    gap: '8px',
  }

  return (
    <Styles ref={rootElem} height={height} width={width}>
      <div style={parentStyle}>
        {values.map((measure, index) => {
          return (
            <div style={spaceStyle}>
              <span style={itemStyle}>{measure.value.shortTitle}</span>
              <Progress
                style={itemStyle}
                key={index}
                type={progressType}
                percent={percentage[measure.value.name]}
              />
            </div>
          );
        })}
      </div>
    </Styles>
  );
}
