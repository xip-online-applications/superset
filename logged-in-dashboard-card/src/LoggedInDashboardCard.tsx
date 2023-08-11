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
import React, {useEffect, useState} from 'react';
import { t, makeApi, styled } from '@superset-ui/core';
import { LoggedInDashboardCardProps, LoggedInDashboardCardStylesProps } from './types';
import { Button, Col, Row, Avatar, Divider, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const Styles = styled.div<LoggedInDashboardCardStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`;

type UserRequest = {
  result: User
}

type User = {
  createdOn?: string;
  email?: string;
  first_name: string;
  isActive: boolean;
  isAnonymous: boolean;
  last_name: string;
  userId?: number; // optional because guest user doesn't have a user id
  username: string;
};


export default function LoggedInDashboardCard(props: LoggedInDashboardCardProps) {
  const { height, width } = props;
  const [user, setUser] = useState<User | null>(null);

  const getMe = makeApi<void, UserRequest>({
    method: 'GET',
    endpoint: '/api/v1/me/',
  });


  useEffect(() => {
    getMe(undefined, undefined).then((user) => setUser(user.result));
  }, []);

  return (
    <Styles
      height={height}
      width={width}
    >
      <Row>
        <Col flex="84px">
          <Badge count={8}>
             <Avatar size={64} shape="square" icon={<UserOutlined />} />
          </Badge>
        </Col>
        <Col flex={"auto"}>
          <h3 style={{marginTop: "8px"}}>{user?.first_name} {user?.last_name}</h3>
          <p>{user?.email}</p>
          <Divider />
          <Button
            type="primary"
            size="large"
            key="link"
            href="/logout"
          >{t('Uitloggen')}</Button>
        </Col>
      </Row>
    </Styles>
  );
}
