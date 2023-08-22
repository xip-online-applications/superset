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
import React, {useCallback, useEffect, useState} from 'react';
import cubejs from "@cubejs-client/core";
import { styled } from '@superset-ui/core';
import {
  CubeCrossFilterSelectOptionDuplicate,
  CubeFilterSelectOptionDuplicate,
  CubeTableProps,
  CubeTableStylesProps
} from './types';
import { Table, Dropdown, Space, Button, Menu, Modal } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { socket } from './socket';
import {interval} from "rxjs";
import axios, {AxiosResponse} from "axios";

const Styles = styled.div<CubeTableStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
`;

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


const onUpdateAction = (actionId: string, blockingAction: boolean, setSubmitted: (success: boolean) => void) => (value: any) => {
    if (value.actionId !== actionId) {
        return;
    }

    Modal.destroyAll();

    if (value.status === 'failed') {
        setSubmitted(false);
        showErrorModal('Iets ging verkeerd helaas');
    }

    if (value.status === 'rejected') {
        setSubmitted(false);
        showErrorModal('Uw actie is gewijgerd. Controleer alle ingevoerde velden of neem contact op met de beheerder.');
    }

    if (value.status === 'completed') {
        setSubmitted(false);

        if (blockingAction) {
            showSuccessModal('Uw actie is succesvol uitgevoerd.');
        }
    }

    if (value.status === 'accepted') {
        setSubmitted(blockingAction);

        if (blockingAction) {
            showAcceptedModal();
        }
    }
}



const showAcceptedModal = () => {
    Modal.info({
        title: 'Bezig met verwerken van de actie',
        content: (
            <div>
                <p>Moment geduld aub...</p>
            </div>
        ),
        onOk() {},
        okButtonProps: {
            disabled: true,
            className: 'hidden'
        },
    });
};

const showErrorModal = (message: string) => {
    Modal.error({
        title: 'Er is een fout opgetreden',
        content: (
            <div>
                <p>{message}</p>
            </div>
        ),
        onOk() {},
    });
};

const showSuccessModal = (message: string) => {
    Modal.success({
        title: 'Gelukt!',
        content: (
            <div>
                <p>{message}</p>
            </div>
        ),
        onOk() {},
    });
};


const options = {
    apiToken: 'd60cb603dde98ba3037f2de9eda44938',
    apiUrl: 'https://odtest.xip.nl/cubejs-api/v1',
};
const cubejsApi = cubejs(options.apiToken, options);


export default function CubeTable(props: CubeTableProps) {
  const {
    height,
    width,
    filters,
    cube,
    blockingAction,
    cubeFilters,
    rowLimit,
    cubeCrossFilters,
    tableSize,
    cubeDetailsCrossFilters,
    cubeDetails,
    actionButtons,
    actionButtonsDetails
  } = props;
  const [data, setData] = React.useState([]);
  const [detailData, setDetailData] = React.useState({});
  const [isLoading, setIsLoading] = useState({});

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [submitted, setSubmitted] = useState(false);
  const [actionId, setActionId] = useState('Initial value');

  const [subscription, setSubscription] = useState<any>(null);
  const [expandable, setExpandable] = useState<any>({});

  const [cols, setCols] = React.useState([]);

  const onConnect = useCallback(() => {
    setIsConnected(true);

    if (subscription !== null) {
      subscription.unsubscribe();
      setSubscription(null);
    }
  }, []);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (subscription === null && !isConnected) {
      setSubscription(interval(1000).subscribe(() => {
        console.log('trying to reconnect');
        socket.connect();
      }));
    }

    if (subscription !== null && isConnected) {
      subscription.unsubscribe();
      setSubscription(null);
    }
  }, [isConnected, subscription]);

  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('updateAction', onUpdateAction(actionId, blockingAction, setSubmitted));

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('updateAction', onUpdateAction(actionId, blockingAction, setSubmitted));
    };
  }, [actionId]);

  const detailsMenu = (row: object, filters: Array<any>) => {
    return (
        <Menu onClick={onClick(row, filters)} >
          { actionButtonsDetails?.map((action: any) => {
            return <Menu.Item key={action.actionType}>{action.actionLabel}</Menu.Item>
          })}
        </Menu>);
  };


  const onExpand = useCallback((expanded: boolean, record: any) => {
    if (!expanded) {
      return;
    }

    const dimensions = cubeDetails.map((c) => c.value.name);

    const filterKey = Object.keys(record).filter((key) => cubeDetailsCrossFilters[0].colLeft === key || cubeDetailsCrossFilters[0].colRight === key)[0];
    const filterVal = record[filterKey];
    const filterMember = [cubeDetailsCrossFilters[0].colRight, cubeDetailsCrossFilters[0].colLeft].filter((val) => val !== filterKey)[0];

    setIsLoading((curState) => {
      return {
        ...curState,
        [filterVal]: true
      }
    });

    const filter = {
      member: filterMember,
      operator: 'equals',
      values: [ filterVal ]
    };

    const query = {
      dimensions,
      limit: rowLimit,
      filters: [filter]
    };

    cubejsApi
        .load(query)
        .then((result) => {
          setIsLoading((curState) => {
            return {
              ...curState,
              [filterVal]: false
            }
          });

          setDetailData(state=> {
            return {
                ...state,
                [filterVal]: result.loadResponse.results[0].data
            }
          });
        });
  }, [cubeDetails, cubeDetailsCrossFilters]);

  const expandedRowRender = useCallback((record, index, indent, expanded) => {
    if (!expanded) {
      return;
    }

    const filterKey = Object.keys(record).filter((key) => cubeDetailsCrossFilters[0].colLeft === key || cubeDetailsCrossFilters[0].colRight === key)[0];
    const filterVal = record[filterKey];
    const data = detailData[filterVal];

    const columns = [
      ...cubeDetails.map((c: string) => {
        return {
          title: c.value.shortTitle,
          dataIndex: c.value.name,
          key: c.value.name,
        }
      })
    ];

    if (actionButtonsDetails?.length > 0) {
      columns.push(
          {
            title: "Acties",
            key: "actions",
            dataIndex: "button",
            render: (text: string, record: object, index: number) => {
              return (<Dropdown overlay={detailsMenu(record, filters)}>
                <Button>
                  <Space>
                    Acties
                    <DownOutlined/>
                  </Space>
                </Button>
              </Dropdown>)
            }
          },
      )
    }

    return (
        <Table
            loading={isLoading[filterVal] && !data}
            columns={columns}
            dataSource={data}
            pagination={false}
            size={'small'}
        />
    );
  }, [detailData, isLoading]);

  useEffect(() => {
    if (cubeDetails.length === 0 || cubeDetailsCrossFilters.length === 0) {
      return;
    }

    setExpandable({
      expandedRowRender,
      onExpand,
    });

  }, [cubeDetailsCrossFilters, cubeDetails, onExpand, expandedRowRender]);

  const onClick: (data: any, filters: Array<any>, setSubmitted: (success: boolean) => void) => ((e: any) => void) = useCallback((data, filters) => {
    return (e) => {
      const payload = {
        filters,
        data
      }

      setSubmitted(true);

      axios.post('https://odtest.xip.nl/actions-api/actions', {
        actionType: e.key,
        payload: payload
      })
        .then((response: AxiosResponse<any,any>) => {
          if (response.status === 400) {
            showErrorModal('Er is een fout opgetreden bij het uitvoeren van uw actie.');
            return;
          }

          console.log(response);

          setActionId(response.data.actionId);
          setSubmitted(false);

          if (blockingAction) {
            showAcceptedModal();
          }

        })
        .catch(function (error) {
          console.log(error);
          showErrorModal('Er is een fout opgetreden bij het uitvoeren van uw actie.');
        });
    };
  }, [blockingAction]);

  const menu = useCallback((row: object, filters: Array<any>) => {
    return (
      <Menu onClick={onClick(row, filters)} >
        { actionButtons?.map((action: any) => {
          return <Menu.Item key={action.actionType}>{action.actionLabel}</Menu.Item>
        })}
      </Menu>);
  }, [onClick, actionButtons]);

  useEffect(() => {
    const dimensions = cube.map((c) => c.value.name);
    const cubeName = cube.map((item) => item.value.cube_name)[0];
    const combinedFilters = transformFilters([...filters, ...cubeFilters], cubeCrossFilters);

    let keyField: string;

    if (cubeDetailsCrossFilters.length > 0 && dimensions.length > 0) {
      keyField = Object.values(cubeDetailsCrossFilters.filter((item) => dimensions.includes(item.colLeft) || dimensions.includes(item.colRight))[0]).filter((item) => dimensions.includes(item))[0];
    }

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
      filters: applicableFilters.length > 0 ? applicableFilters : undefined
    };

    cubejsApi
      .load(query)
      .then((result) => {
        setData(result.loadResponse.results[0].data.map(item => {

          if (keyField == undefined) {
            return item;
          }

          return {
              ...item,
              key: item[keyField]
          }
        }));
      });
  }, [cube, cubeFilters, rowLimit, filters, cubeDetailsCrossFilters]);

  useEffect(() => {
    const newCols = [
      ...cube.map((c: string) => {
        return {
          title: c.value.shortTitle,
          dataIndex: c.value.name,
          key: c.value.name,
        }
      })
    ];

    if (actionButtons?.length > 0) {
      newCols.push(
        {
          title: "Acties",
          key: "actions",
          dataIndex: "button",
          render: (text: string, record: object, index: number) => {
            return (
              <Dropdown overlay={menu(record, filters)}>
                <Button>
                  <Space>
                    Acties
                    <DownOutlined/>
                  </Space>
                </Button>
              </Dropdown>
            )
          }
        },
      )
    }

    setCols(newCols)
  }, [filters, actionButtons]);


    return (
    <Styles
      height={height}
      width={width}
    >
      <Table
          size={tableSize}
          dataSource={data}
          columns={cols}
          expandable={expandable}
      />
    </Styles>
  );
}
