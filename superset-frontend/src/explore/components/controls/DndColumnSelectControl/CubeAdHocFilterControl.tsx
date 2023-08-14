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
import CubeAdHocFilterPopup from "./CubeAdHocFilterPopup";

export type DndCubeSelectProps = DndControlProps<QueryFormColumn> & {
};

export type CubeFilterSelectOption = {
  cube: string;
  col: string;
  op: string;
  val: string;
}

export function isCubeFilterSelectOption(option: any): option is CubeFilterSelectOption {
  return option && option.cube && option.column && option.operator && option.value;
}

function CubeAdHocFilterControl(props: DndCubeSelectProps) {
  const {
    value,
    multi = true,
    onChange,
    canDelete = true,
    ghostButtonText,
    name,
    label,
  } = props;

  const [droppedItem, setDroppedItem] = useState<CubeControlPanelDndItem | null>(null);
  const [newColumnPopoverVisible, setNewColumnPopoverVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Array<CubeFilterSelectOption>>(ensureIsArray(value)
    .map(value => {
      if (isCubeFilterSelectOption(value)) {
        return value;
      }
      return null;
    })
    .filter((option: any) => option !== null) as Array<CubeFilterSelectOption>
  );

  const onDrop = useCallback(
    (item: CubeControlPanelDndItem) => {
      console.log("onDrop", item);
      setDroppedItem(item);
      setNewColumnPopoverVisible(true);
    },
    [selectedFilters],
  );

  useEffect(() => {
    console.log("selectedOptions", selectedFilters);
    onChange(selectedFilters);
  }, [onChange, selectedFilters]);

  const canDrop = useCallback(
    (item: CubeControlPanelDndItem) => {
      if (selectedFilters.length === 0) {
        return true;
      }

      return multi;
    },
    [selectedFilters],
  );

  const onClickClose = useCallback(
    (index: number) => {
      const newOptions = [...selectedFilters];
      newOptions.splice(index, 1);
      setSelectedFilters(newOptions);
      // onChange(newOptions)
    },
    [onChange, selectedFilters],
  );

  const onShiftOptions = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newOptions = [...selectedFilters];
      [newOptions[dragIndex], newOptions[hoverIndex]] = [newOptions[hoverIndex], newOptions[dragIndex]];
      setSelectedFilters(newOptions);
      //onChange(newOptions)
    },
    [onChange, selectedFilters],
  );

  const valuesRenderer = useCallback(
    () =>
      selectedFilters.map((column, idx) => {
        return (
          <OptionWrapper
            key={idx}
            label={column.col + " " + column.op + " " + column.val}
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
    (newColumn: CubeFilterSelectOption) => {
      const newOptions = [...selectedFilters];
      newOptions.push(newColumn);
      setSelectedFilters(newOptions);
    },
    [selectedFilters],
  );

  const togglePopover = useCallback((visible: boolean) => {
    if (!visible) {
      setDroppedItem(null);
    }
    setNewColumnPopoverVisible(visible);
  }, []);

  const closePopover = useCallback(() => {
    setDroppedItem(null);
    togglePopover(false);
  }, [togglePopover]);

  const openPopover = useCallback(() => {
    togglePopover(true);
  }, [togglePopover]);

  const labelGhostButtonText = useMemo(
    () =>
      ghostButtonText ??
      tn(
        'Click or drop a cube column here',
        'Click or cube columns here',
        multi ? 2 : 1,
      ),
    [ghostButtonText, multi],
  );

  return (
    <div>
      <DndSelectLabel
        onDrop={onDrop}
        canDrop={canDrop}
        valuesRenderer={valuesRenderer}
        accept={DndItemType.CubeDimension}
        displayGhostButton={multi || selectedFilters.length === 0}
        ghostButtonText={labelGhostButtonText}
        onClickGhostButton={openPopover}
        {...props}
      />
      <CubeAdHocFilterPopup
        visible={newColumnPopoverVisible}
        togglePopover={togglePopover}
        closePopover={closePopover}
        item={droppedItem}
        submitFilter={submitNewFilter}
      />
    </div>
  );
}

export default CubeAdHocFilterControl;
