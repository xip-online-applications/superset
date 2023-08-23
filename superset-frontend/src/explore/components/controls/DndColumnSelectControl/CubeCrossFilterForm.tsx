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
import React, {useCallback, useState, useEffect} from 'react';
import {CubeControlPanelDndItem} from "../../CubeControlPanel/types";
import { Button, Form, Select, Col, Row } from 'antd';
const { Option } = Select;
import cubejs, { Cube, Meta, TCubeDimension } from "@cubejs-client/core";
import {CubeCrossFilterSelectOption} from "./CubeCrossFilterControl";

export type CubeCrossFilterPopupProps = {
  closePopover: () => void;
  item: CubeControlPanelDndItem | null;
  submitFilter: (filter: CubeCrossFilterSelectOption) => void;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

function CubeCrossFilterForm(props: CubeCrossFilterPopupProps) {
  const {
    item,
    closePopover,
  } = props;

  const [cubes, setCubes] = useState([] as Array<Cube>);
  const [selectedCubeLeft, setSelectedCubeLeft] = useState(null as Cube | null);
  const [dimensionLeft, setDimensionLeft] = useState(null as TCubeDimension | null);

  const [selectedCubeRight, setSelectedCubeRight] = useState(null as Cube | null);
  const [dimensionRight, setDimensionRight] = useState(null as TCubeDimension | null);

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
          setSelectedCubeLeft(cube);

          if (cube) {
            const dimension = cube.dimensions.find((dimension) => dimension.name === item.value.name) ?? null;
            setDimensionLeft(dimension);
            form.setFieldsValue({
              cubeLeft: cube?.name,
              dimensionLeft: dimension?.name,
            });
          }
        }

      });
  }, []);

  const [form] = Form.useForm();

  const onCubeLeftChange = useCallback((value: string) => {
    const cube = cubes.find((cube) => cube.name === value) ?? null;
    setDimensionLeft(null);
    setSelectedCubeLeft(cube);
    form.resetFields(['dimension', 'value', 'operator']);
  }, [cubes]);

  const onCubeRightChange = useCallback((value: string) => {
    const cube = cubes.find((cube) => cube.name === value) ?? null;
    setDimensionRight(null);
    setSelectedCubeRight(cube);
    form.resetFields(['dimension', 'value', 'operator']);
  }, [cubes]);

  const onDimensionLeftChange = useCallback((value: string) => {
    const dimension = selectedCubeLeft?.dimensions.find((dimension) => dimension.name === value) ?? null;
    setDimensionLeft(dimension);
  }, [selectedCubeLeft]);

  const onDimensionRightChange = useCallback((value: string) => {
    const dimension = selectedCubeRight?.dimensions.find((dimension) => dimension.name === value) ?? null;
    setDimensionRight(dimension);
  }, [selectedCubeRight]);

  const onFinish = useCallback((values: any) => {
    const filter: CubeCrossFilterSelectOption = {
      cubeLeft: selectedCubeLeft?.name ?? '',
      colLeft: dimensionLeft?.name ?? '',
      cubeRight: selectedCubeRight?.name ?? '',
      colRight: dimensionRight?.name ?? '',
    }

    props.submitFilter(filter);
    closePopover();
  }, [selectedCubeLeft, dimensionLeft, selectedCubeRight, dimensionRight]);

  const onReset = () => {
    closePopover();
  };

  if (cubes.length === 0) {
    return (<span>Loading...</span>);
  }

  return (
    <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} layout="vertical">
      <Row style={{width: '500px'}}>
        <Col span={12}>
          <Form.Item
              name="cubeLeft"
              label="Cube Left"
              rules={[{ required: true }]}
          >
            <Select
              placeholder="Select a cube"
              onChange={onCubeLeftChange}
              allowClear
            >
              { cubes.map((cube) => {
                return (<Option value={cube.name}>{cube.title}</Option>);
              })}
            </Select>
          </Form.Item>


            <Form.Item
              name="dimensionLeft" label="Dimension Left" rules={[{ required: true }]}
              shouldUpdate={(prevValues, currentValues) => prevValues.cubeLeft !== currentValues.cubeLeft}
            >
              {selectedCubeLeft != null ? (
                  <Select
                    placeholder="Select a column"
                    onChange={onDimensionLeftChange}
                    allowClear
                  >
                    { selectedCubeLeft.dimensions.map((d) => {
                      return (<Option value={d.name}>{d.shortTitle}</Option>);
                    })}
                  </Select>
              ) : null
              }
            </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
              name="cubeRight"
              label="Cube Right"
              rules={[{ required: true }]}
          >
            <Select
              placeholder="Select a cube"
              onChange={onCubeRightChange}
              allowClear
            >
              { cubes.map((cube) => {
                return (<Option value={cube.name}>{cube.title}</Option>);
              })}
            </Select>
          </Form.Item>


            <Form.Item
              name="dimensionRight" label="Dimension Right" rules={[{ required: true }]}
              shouldUpdate={(prevValues, currentValues) => prevValues.cubeRight !== currentValues.cubeRight}
            >
              {selectedCubeRight != null ? (
                <Select
                  placeholder="Select a column"
                  onChange={onDimensionRightChange}
                  allowClear
                >
                  { selectedCubeRight.dimensions.map((d) => {
                    return (<Option value={d.name}>{d.shortTitle}</Option>);
                  })}
                </Select>
              ) : null
              }
            </Form.Item>

        </Col>
      </Row>
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

export default CubeCrossFilterForm;
