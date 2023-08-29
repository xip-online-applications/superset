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
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  tn,
  QueryFormColumn, ensureIsArray,
} from '@superset-ui/core';
import DndSelectLabel from 'src/explore/components/controls/DndColumnSelectControl/DndSelectLabel';
import { DndItemType } from 'src/explore/components/DndItemType';
import { DndControlProps } from './types';
import OptionWrapper from "./OptionWrapper";
import {CubeControlPanelDndItem} from "../../CubeControlPanel/types";
import CubeCrossFilterPopup from "./CubeCrossFilterPopup";
import ActionButtonPopup from "./ActionButtonPopup";

export type DndCubeSelectProps = DndControlProps<QueryFormColumn> & {
};

export type ActionOption = {
  actionType: string;
  actionLabel: string;
}

export function isActionOption(option: any): option is ActionOption {
  return option && option.actionType && option.actionLabel;
}

function ActionButtonControl(props: DndCubeSelectProps) {
  const {
    value,
    multi = true,
    onChange,
    canDelete = true,
    ghostButtonText,
    name,
    label,
  } = props;

  const [newColumnPopoverVisible, setNewColumnPopoverVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Array<ActionOption>>(ensureIsArray(value)
    .map(value => {
      if (isActionOption(value)) {
        return value;
      }
      return null;
    })
    .filter((option: any) => option !== null) as Array<ActionOption>
  );

  useEffect(() => {
    onChange(selectedFilters);
  }, [onChange, selectedFilters]);

  const onClickClose = useCallback(
    (index: number) => {
      const newOptions = [...selectedFilters];
      newOptions.splice(index, 1);
      setSelectedFilters(newOptions);
    },
    [onChange, selectedFilters],
  );

  const onShiftOptions = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newOptions = [...selectedFilters];
      [newOptions[dragIndex], newOptions[hoverIndex]] = [newOptions[hoverIndex], newOptions[dragIndex]];
      setSelectedFilters(newOptions);
    },
    [onChange, selectedFilters],
  );

  const valuesRenderer = useCallback(
    () =>
      selectedFilters.map((column, idx) => {
        return (
          <OptionWrapper
            key={idx}
            label={column.actionLabel}
            index={idx}
            clickClose={onClickClose}
            onShiftOptions={onShiftOptions}
            type={`${DndItemType.CubeDimension}_${name}_${label}`}
            canDelete={canDelete}
            column={column}
            withCaret
          />
        );
      }),
    [
      selectedFilters
    ],
  );

  const submitNewFilter = useCallback(
    (newColumn: ActionOption) => {
      const newOptions = [...selectedFilters];
      newOptions.push(newColumn);
      setSelectedFilters(newOptions);
    },
    [selectedFilters],
  );

  const togglePopover = useCallback((visible: boolean) => {
    setNewColumnPopoverVisible(visible);
  }, []);

  const closePopover = useCallback(() => {
    togglePopover(false);
  }, [togglePopover]);

  const openPopover = useCallback(() => {
    togglePopover(true);
  }, [togglePopover]);

  const labelGhostButtonText = useMemo(
    () =>
      ghostButtonText ??
      tn(
        'Click here',
        'Click here',
        multi ? 2 : 1,
      ),
    [ghostButtonText, multi],
  );

  return (
    <div>
      <DndSelectLabel
        onDrop={() => false}
        canDrop={() => false}
        valuesRenderer={valuesRenderer}
        accept={DndItemType.CubeDimension}
        displayGhostButton={multi || selectedFilters.length === 0}
        ghostButtonText={labelGhostButtonText}
        onClickGhostButton={openPopover}
        {...props}
      />
      <ActionButtonPopup
        visible={newColumnPopoverVisible}
        togglePopover={togglePopover}
        closePopover={closePopover}
        submitFilter={submitNewFilter}
      />
    </div>
  );
}

export default ActionButtonControl;
