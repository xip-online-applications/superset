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
import React, {useCallback, useMemo, useState, useEffect, createRef} from 'react';
import {CubeControlPanelDndItem} from "../../CubeControlPanel/types";
import { Button, Form, Input, Select } from 'antd';
import {Cube, Meta, TCubeDimension} from "@cubejs-client/core";
const { Option } = Select;
import cubejs, { Meta, Cube } from "@cubejs-client/core";
import {CubeFilterSelectOption} from "./CubeAdHocFilterControl";

export type CubeAdHocFilterPopupProps = {
  closePopover: () => void;
  item: CubeControlPanelDndItem | null;
  submitFilter: (filter: CubeFilterSelectOption) => void;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

function CubeFilterForm(props: CubeAdHocFilterPopupProps) {
  const {
    item,
    closePopover,
  } = props;

  const [cubes, setCubes] = useState([] as Array<Cube>);
  const [selectedCube, setSelectedCube] = useState(null as Cube | null);
  const [dimension, setDimension] = useState(null as TCubeDimension | null);

  const options = {
    apiToken: 'd60cb603dde98ba3037f2de9eda44938',
    apiUrl: 'https://odtest.xip.nl/cubejs-api/v1',
  };
  const cubejsApi = cubejs(options.apiToken, options);

  useEffect(() => {
    cubejsApi.meta()
      .then((result: Meta) => {
        setCubes(result.cubes);

        if (item) {
          const cube = result.cubes.find((cube) => cube.name === item.value.cube_name) ?? null;
          setSelectedCube(cube);

          if (cube) {
            const dimension = cube.dimensions.find((dimension) => dimension.name === item.value.name) ?? null;
            setDimension(dimension);
            form.setFieldsValue({
              cube: cube?.name,
              dimension: dimension?.name,
            });
          }
        }

      });
  }, []);

  const [form] = Form.useForm();

  const onCubeChange = (value: string) => {
    const cube = cubes.find((cube) => cube.name === value) ?? null;
    setDimension(null);
    setSelectedCube(cube);
    form.resetFields(['dimension', 'value', 'operator']);
  };

  const onDimensionChange = (value: string) => {
    const dimension = selectedCube?.dimensions.find((dimension) => dimension.name === value) ?? null;
    setDimension(dimension);
  }

  const onFinish = useCallback((values: any) => {
    const filter: CubeFilterSelectOption = {
      cube: selectedCube?.name ?? '',
      col: dimension?.name ?? '',
      op: values.operator,
      val: values.value,
    }

    props.submitFilter(filter);
    closePopover();
  }, [selectedCube, dimension]);

  const onReset = () => {
    closePopover();
  };

  const rootElem = createRef<HTMLDivElement>();

  if (cubes.length === 0) {
    return (<span>Loading...</span>);
  }

  return (
    <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
      <Form.Item name="cube" label="Cube" rules={[{ required: true }]}>
        <Select
          placeholder="Select a cube"
          onChange={onCubeChange}
          allowClear
        >
          { cubes.map((cube) => {
            return (<Option value={cube.name}>{cube.title}</Option>);
          })}
        </Select>
      </Form.Item>

      <Form.Item
        name="dimension" label="Dimension" rules={[{ required: true }]}
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.cube !== currentValues.cube}
      >
        {selectedCube != null ? (
            <Select
              placeholder="Select a column"
              onChange={onDimensionChange}
              allowClear
            >
              { selectedCube.dimensions.map((d) => {
                return (<Option value={d.name}>{d.shortTitle}</Option>);
              })}
            </Select>
          ) : null
        }
      </Form.Item>

      { dimension
      != null ? (
          <>
            <Form.Item
              name="operator" label="Operator" rules={[{ required: true }]}
              noStyle
            >
              <Select
                placeholder="Select an operator"
                allowClear
              >
                <Option value="equals">Equals</Option>
                <Option value="notEquals">notEquals</Option>
                <Option value="contains">contains</Option>
                <Option value="notContains">notContains</Option>
                <Option value="startsWith">startsWith</Option>
                <Option value="endsWith">endsWith</Option>
                <Option value="gt">gt</Option>
                <Option value="gte">gte</Option>
                <Option value="lt">lt</Option>
                <Option value="lte">lte</Option>
                <Option value="set">set</Option>
                <Option value="notSet">notSet</Option>
                <Option value="beforeDate">beforeDate</Option>
                <Option value="afterDate">afterDate</Option>
              </Select>
            </Form.Item>

            <Form.Item name="value" label="Value" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </>
        ) : null
      }

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
        <Button htmlType="button" onClick={onReset}>
          Close
        </Button>
      </Form.Item>
    </Form>
  );
}

export default CubeFilterForm;
