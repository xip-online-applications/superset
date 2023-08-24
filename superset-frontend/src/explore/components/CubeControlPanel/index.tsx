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
import React, { useEffect, useState } from 'react';
import {
  css,
  QueryFormData,
  styled,
  t,
} from '@superset-ui/core';
import {ExploreActions} from "../../actions/exploreActions";
import cubejs, { Meta, Cube } from "@cubejs-client/core";
import CubePanel from "./CubePanel";
import {connect} from "react-redux";
import {CubeConfig} from "../../../types/bootstrapTypes";

export interface Props {
  actions: Partial<ExploreActions> & Pick<ExploreActions, 'setControlValue'>;
  shouldForceUpdate?: number;
  formData?: QueryFormData;
}

const CubeControlPanelContainer = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.colors.grayscale.light5};
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    .ant-collapse {
      height: auto;
    }
    .field-selections {
      padding: 0 0 ${4 * theme.gridUnit}px;
      overflow: auto;
    }
    .field-length {
      margin-bottom: ${theme.gridUnit * 2}px;
      font-size: ${theme.typography.sizes.s}px;
      color: ${theme.colors.grayscale.light1};
    }
    .form-control.input-md {
      width: calc(100% - ${theme.gridUnit * 8}px);
      height: ${theme.gridUnit * 8}px;
      margin: ${theme.gridUnit * 2}px auto;
    }
    .type-label {
      font-size: ${theme.typography.sizes.s}px;
      color: ${theme.colors.grayscale.base};
    }
    .Control {
      padding-bottom: 0;
    }
  `};
`;


function CubeControlPanel(props: CubeConfig) {
  const [cubes, setCubes] = useState([] as Array<Cube>);

  useEffect(() => {
    const options = {
      apiToken: props.api_token,
      apiUrl: props.api_url,
    };
    const cubejsApi = cubejs(options.apiToken, options);

    cubejsApi.meta()
      .then((result: Meta) => {
        setCubes(result.cubes);
      });
  }, []);

  if (cubes.length === 0) {
    return (<CubeControlPanelContainer>
      <span>Loading...</span>
    </CubeControlPanelContainer>)
  }

  return (<CubeControlPanelContainer>
    { cubes.map((cube) => {
      return <CubePanel key={cube.name}
                        cube={cube}
          ></CubePanel>
    })}
  </CubeControlPanelContainer>)
}

function mapStateToProps(state: any) {
  const { common } = state;
  return {
    ...common.cube_config
  };
}

export default connect(
    mapStateToProps,
    undefined,
)(CubeControlPanel);
