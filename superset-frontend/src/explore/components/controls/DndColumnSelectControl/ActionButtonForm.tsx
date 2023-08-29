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
import React, {useCallback} from 'react';
import {Button, Form, Input} from 'antd';
import {ActionOption} from "./ActionButtonControl";

export type ActionButtonPopupProps = {
  closePopover: () => void;
  submitFilter: (filter: ActionOption) => void;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

function ActionButtonForm(props: ActionButtonPopupProps) {
  const {
    closePopover,
  } = props;

  const [form] = Form.useForm();

  const onFinish = useCallback((values: any) => {
    props.submitFilter(values);
    closePopover();
  }, []);

  const onReset = () => {
    closePopover();
  };

  return (
    <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} layout="vertical">
      <Form.Item
          name="actionType"
          label="Action Type"
          rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
          name="actionLabel"
          label="Action Label"
          rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
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

export default ActionButtonForm;
