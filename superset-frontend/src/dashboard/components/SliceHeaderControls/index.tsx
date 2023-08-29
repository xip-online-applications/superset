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
import React, {
  MouseEvent,
  Key,
} from 'react';
import {
  Link,
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';
import {
  Behavior,
  css,
  FeatureFlag,
  getChartMetadataRegistry,
  QueryFormData,
  styled,
  t,
} from '@superset-ui/core';
import { useSelector } from 'react-redux';
import { Menu } from 'src/components/Menu';
import { NoAnimationDropdown } from 'src/components/Dropdown';
import downloadAsImage from 'src/utils/downloadAsImage';
import { isFeatureEnabled } from 'src/featureFlags';
import { getSliceHeaderTooltip } from 'src/dashboard/util/getSliceHeaderTooltip';
import { Tooltip } from 'src/components/Tooltip';
import Icons from 'src/components/Icons';
import { LOG_ACTIONS_CHART_DOWNLOAD_AS_IMAGE } from 'src/logger/LogUtils';
import { RootState } from 'src/dashboard/types';
import { useCrossFiltersScopingModal } from '../nativeFilters/FilterBar/CrossFilters/ScopingModal/useCrossFiltersScopingModal';

const MENU_KEYS = {
  DOWNLOAD_AS_IMAGE: 'download_as_image',
  EXPLORE_CHART: 'explore_chart',
  EXPORT_CSV: 'export_csv',
  EXPORT_FULL_CSV: 'export_full_csv',
  EXPORT_XLSX: 'export_xlsx',
  EXPORT_FULL_XLSX: 'export_full_xlsx',
  FORCE_REFRESH: 'force_refresh',
  FULLSCREEN: 'fullscreen',
  TOGGLE_CHART_DESCRIPTION: 'toggle_chart_description',
  VIEW_QUERY: 'view_query',
  VIEW_RESULTS: 'view_results',
  DRILL_TO_DETAIL: 'drill_to_detail',
  CROSS_FILTER_SCOPING: 'cross_filter_scoping',
};

// TODO: replace 3 dots with an icon
const VerticalDotsContainer = styled.div`
  padding: ${({ theme }) => theme.gridUnit / 4}px
    ${({ theme }) => theme.gridUnit * 1.5}px;

  .dot {
    display: block;

    height: ${({ theme }) => theme.gridUnit}px;
    width: ${({ theme }) => theme.gridUnit}px;
    border-radius: 50%;
    margin: ${({ theme }) => theme.gridUnit / 2}px 0;

    background-color: ${({ theme }) => theme.colors.text.label};
  }

  &:hover {
    cursor: pointer;
  }
`;

const getScreenshotNodeSelector = (chartId: string | number) =>
  `.dashboard-chart-id-${chartId}`;

const VerticalDotsTrigger = () => (
  <VerticalDotsContainer>
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </VerticalDotsContainer>
);

export interface SliceHeaderControlsProps {
  slice: {
    description: string;
    viz_type: string;
    slice_name: string;
    slice_id: number;
    slice_description: string;
    datasource: string;
  };

  componentId: string;
  dashboardId: number;
  chartStatus: string;
  isCached: boolean[];
  cachedDttm: string[] | null;
  isExpanded?: boolean;
  updatedDttm: number | null;
  isFullSize?: boolean;
  isDescriptionExpanded?: boolean;
  formData: QueryFormData;
  exploreUrl: string;

  logExploreChart?: (sliceId: number) => void;
  logEvent?: (eventName: string, eventData?: object) => void;
  toggleExpandSlice?: (sliceId: number) => void;
  handleToggleFullSize: () => void;

  addDangerToast: (message: string) => void;
  addSuccessToast: (message: string) => void;

  supersetCanExplore?: boolean;
  supersetCanShare?: boolean;
  supersetCanCSV?: boolean;

  crossFiltersEnabled?: boolean;
}
type SliceHeaderControlsPropsWithRouter = SliceHeaderControlsProps &
  RouteComponentProps;

const dropdownIconsStyles = css`
  &&.anticon > .anticon:first-child {
    margin-right: 0;
    vertical-align: 0;
  }
`;

const SliceHeaderControls = (props: SliceHeaderControlsPropsWithRouter) => {
  const [openScopingModal, scopingModal] = useCrossFiltersScopingModal(
    props.slice.slice_id,
  );

  const canEditCrossFilters =
    useSelector<RootState, boolean>(
      ({ dashboardInfo }) => dashboardInfo.dash_edit_perm,
    ) &&
    isFeatureEnabled(FeatureFlag.DASHBOARD_CROSS_FILTERS) &&
    getChartMetadataRegistry()
      .get(props.slice.viz_type)
      ?.behaviors?.includes(Behavior.INTERACTIVE_CHART);

  const handleMenuClick = ({
    key,
    domEvent,
  }: {
    key: Key;
    domEvent: MouseEvent<HTMLElement>;
  }) => {
    switch (key) {
      case MENU_KEYS.TOGGLE_CHART_DESCRIPTION:
        // eslint-disable-next-line no-unused-expressions
        props.toggleExpandSlice?.(props.slice.slice_id);
        break;
      case MENU_KEYS.EXPLORE_CHART:
        // eslint-disable-next-line no-unused-expressions
        props.logExploreChart?.(props.slice.slice_id);
        break;
      case MENU_KEYS.FULLSCREEN:
        props.handleToggleFullSize();
        break;
      case MENU_KEYS.DOWNLOAD_AS_IMAGE: {
        // menu closes with a delay, we need to hide it manually,
        // so that we don't capture it on the screenshot
        const menu = document.querySelector(
          '.ant-dropdown:not(.ant-dropdown-hidden)',
        ) as HTMLElement;
        menu.style.visibility = 'hidden';
        downloadAsImage(
          getScreenshotNodeSelector(props.slice.slice_id),
          props.slice.slice_name,
          true,
          // @ts-ignore
        )(domEvent).then(() => {
          menu.style.visibility = 'visible';
        });
        props.logEvent?.(LOG_ACTIONS_CHART_DOWNLOAD_AS_IMAGE, {
          chartId: props.slice.slice_id,
        });
        break;
      }
      case MENU_KEYS.CROSS_FILTER_SCOPING: {
        openScopingModal();
        break;
      }
      default:
        break;
    }
  };

  const {
    slice,
    isFullSize,
  } = props;
  const fullscreenLabel = isFullSize
    ? t('Exit fullscreen')
    : t('Enter fullscreen');

  const menu = (
    <Menu
      onClick={handleMenuClick}
      selectable={false}
      data-test={`slice_${slice.slice_id}-menu`}
    >
      <Menu.Item key={MENU_KEYS.FULLSCREEN}>{fullscreenLabel}</Menu.Item>

      {slice.description && (
        <Menu.Item key={MENU_KEYS.TOGGLE_CHART_DESCRIPTION}>
          {props.isDescriptionExpanded
            ? t('Hide chart description')
            : t('Show chart description')}
        </Menu.Item>
      )}

      {props.supersetCanExplore && (
        <Menu.Item key={MENU_KEYS.EXPLORE_CHART}>
          <Link to={props.exploreUrl}>
            <Tooltip title={getSliceHeaderTooltip(props.slice.slice_name)}>
              {t('Edit chart')}
            </Tooltip>
          </Link>
        </Menu.Item>
      )}

      {canEditCrossFilters && (
        <>
          <Menu.Item key={MENU_KEYS.CROSS_FILTER_SCOPING}>
            {t('Cross-filtering scoping')}
          </Menu.Item>
          <Menu.Divider />
        </>
      )}
      {props.slice.viz_type !== 'filter_box' && props.supersetCanCSV && (
        <Menu.SubMenu title={t('Download')}>
          <Menu.Item
            key={MENU_KEYS.DOWNLOAD_AS_IMAGE}
            icon={<Icons.FileImageOutlined css={dropdownIconsStyles} />}
          >
            {t('Download as image')}
          </Menu.Item>
        </Menu.SubMenu>
      )}
    </Menu>
  );

  return (
    <>
      {isFullSize && (
        <Icons.FullscreenExitOutlined
          style={{ fontSize: 22 }}
          onClick={() => {
            props.handleToggleFullSize();
          }}
        />
      )}
      <NoAnimationDropdown
        overlay={menu}
        trigger={['click']}
        placement="bottomRight"
      >
        <span
          css={css`
            display: flex;
            align-items: center;
          `}
          id={`slice_${slice.slice_id}-controls`}
          role="button"
          aria-label="More Options"
        >
          <VerticalDotsTrigger />
        </span>
      </NoAnimationDropdown>
      {canEditCrossFilters && scopingModal}
    </>
  );
};

export default withRouter(SliceHeaderControls);
