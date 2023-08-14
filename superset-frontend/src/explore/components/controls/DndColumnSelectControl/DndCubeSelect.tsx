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
  AdhocColumn,
  tn,
  QueryFormColumn, ensureIsArray,
} from '@superset-ui/core';
import {
  ColumnMeta,
  withDndFallback,
} from '@superset-ui/chart-controls';
import DndSelectLabel from 'src/explore/components/controls/DndColumnSelectControl/DndSelectLabel';
import { DndItemType } from 'src/explore/components/DndItemType';
import { DndControlProps } from './types';
import SelectControl from '../SelectControl';
import OptionWrapper from "./OptionWrapper";
import {CubeControlPanelDndItem} from "../../CubeControlPanel/types";

export type DndCubeSelectProps = DndControlProps<QueryFormColumn> & {
};

function DndCubeSelect(props: DndCubeSelectProps) {
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
  const [selectedOptions, setSelectedOptions] = useState<Array<any>>(ensureIsArray(value)
    .map(value => {
      if (typeof value === 'object') {
        return value;
      }
      return null;
    })
    .filter((option: any) => option !== null)
    );

  const onDrop = useCallback(
    (item: CubeControlPanelDndItem) => {
      setSelectedOptions([...selectedOptions, item]);
    },
    [selectedOptions],
  );

  useEffect(() => {
    console.log("selectedOptions", selectedOptions);
    onChange(selectedOptions);
  }, [onChange, selectedOptions]);

  const canDrop = useCallback(
    (item: CubeControlPanelDndItem) => {
      if (selectedOptions.length === 0) {
        return true;
      }

      const alreadyInArray = selectedOptions.findIndex((option) => option.value.column_name === item.value.column_name) === -1;
      const sameCube = selectedOptions[0].value.cube_title === item.value.cube_title;

      return multi && alreadyInArray && sameCube;
    },
    [selectedOptions],
  );

  const onClickClose = useCallback(
    (index: number) => {
      const newOptions = [...selectedOptions];
      newOptions.splice(index, 1);
      setSelectedOptions(newOptions);
      onChange(newOptions)
    },
    [onChange, selectedOptions],
  );

  const onShiftOptions = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newOptions = [...selectedOptions];
      [newOptions[dragIndex], newOptions[hoverIndex]] = [newOptions[hoverIndex], newOptions[dragIndex]];
      setSelectedOptions(newOptions);
      onChange(newOptions)
    },
    [onChange, selectedOptions],
  );

  const valuesRenderer = useCallback(
    () =>
      selectedOptions.map((column, idx) => {
        return (
          <OptionWrapper
            key={idx}
            label={column.value.column_name}
            index={idx}
            clickClose={onClickClose}
            onShiftOptions={onShiftOptions}
            type={`${DndItemType.CubeDimension}_${name}_${label}`}
            canDelete={canDelete}
            column={column}
          />
        );
      }),
    [
      selectedOptions
    ],
  );

  const addNewColumnWithPopover = useCallback(
    (newColumn: ColumnMeta | AdhocColumn) => {
    },
    [onChange],
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
        'Drop a cube column here',
        'Drop cube columns here',
        multi ? 2 : 1,
      ),
    [ghostButtonText, multi],
  );

  return (
    <div>
      {
        selectedOptions.length > 0 && (
          <div>
            <span>
              Selected cube = { selectedOptions[0].value.cube_title }
            </span>
          </div>
        )
      }
      <DndSelectLabel
        onDrop={onDrop}
        canDrop={canDrop}
        valuesRenderer={valuesRenderer}
        accept={DndItemType.CubeDimension}
        displayGhostButton={multi || selectedOptions.length === 0}
        ghostButtonText={labelGhostButtonText}
        onClickGhostButton={openPopover}
        {...props}
      />
    </div>
  );
}

const DndCubeSelectWithFallback = withDndFallback(
  DndCubeSelect,
  SelectControl,
);

export { DndCubeSelectWithFallback as DndCubeSelect };
