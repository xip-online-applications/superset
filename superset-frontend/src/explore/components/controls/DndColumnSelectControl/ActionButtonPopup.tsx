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
import React, {createRef} from 'react';
import ControlPopover from "../ControlPopover/ControlPopover";
import {ExplorePopoverContent} from "../../ExploreContentPopover";
import {styled} from "@superset-ui/core";
import {ActionOption} from "./ActionButtonControl";
import ActionButtonForm from "./ActionButtonForm";

const FilterPopoverContentContainer = styled.div`
  .adhoc-filter-edit-tabs > .nav-tabs {
    margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;

    & > li > a {
      padding: ${({ theme }) => theme.gridUnit}px;
    }
  }

  #filter-edit-popover {
    max-width: none;
  }

  .filter-edit-clause-info {
    font-size: ${({ theme }) => theme.typography.sizes.xs}px;
    padding-left: ${({ theme }) => theme.gridUnit}px;
  }

  .filter-edit-clause-section {
    display: inline-flex;
  }

  .adhoc-filter-simple-column-dropdown {
    margin-top: ${({ theme }) => theme.gridUnit * 5}px;
  }
`;

export type ActionButtonPopupProps = {
  visible: boolean;
  togglePopover: (visible: boolean) => void;
  closePopover: () => void;
  submitFilter: (filter: ActionOption) => void;
}

function ActionButtonPopup(props: ActionButtonPopupProps) {
  const {
    visible,
    togglePopover,
    closePopover,
  } = props;

  const rootElem = createRef<HTMLDivElement>();

  const overlayContent = (
    <ExplorePopoverContent>
      <FilterPopoverContentContainer
        id="filter-edit-popover"
        data-test="filter-edit-popover"
        ref={rootElem}
      >
        <ActionButtonForm
          closePopover={closePopover}
          submitFilter={props.submitFilter}
        />
      </FilterPopoverContentContainer>
    </ExplorePopoverContent>
  );

  return (
    <ControlPopover
      trigger="click"
      content={overlayContent}
      defaultVisible={visible}
      visible={visible}
      onVisibleChange={togglePopover}
      destroyTooltipOnHide
    >
    </ControlPopover>
  );
}

export default ActionButtonPopup;
