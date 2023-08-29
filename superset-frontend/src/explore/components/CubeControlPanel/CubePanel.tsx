
import React, {useMemo, useRef, useState} from 'react';
import {BaseCubeMember, Cube, TCubeMemberType} from "@cubejs-client/core";
import {css, GenericDataType, styled, t} from "@superset-ui/core";
import {DndItemType} from "../DndItemType";
import {Collapse} from "antd";
import CubeControlPanelDragOption from "./CubeControlPanelDragOption";

export interface Props {
  cube: Cube;
  shouldForceUpdate?: number;
}

const ExploreCubePanelContainer = styled.div`
  ${({ theme }) => css`
    border-top: 1px solid ${theme.colors.grayscale.light2};

    .cube-title-container {
      position: relative;
      display: flex;
      flex-direction: row;
      padding: ${theme.gridUnit * 2}px ${theme.gridUnit * 4}px;
      justify-content: space-between;
      
      .cube-title {
        line-height: 1.3;
        font-size: ${theme.typography.sizes.m}px;
      }
    }
  ` };
`;

const SectionHeader = styled.span`
  ${({ theme }) => `
    font-size: ${theme.typography.sizes.m}px;
    line-height: 1.3;
  `}
`;

const LabelWrapper = styled.div`
  ${({ theme }) => css`
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: ${theme.typography.sizes.s}px;
    background-color: ${theme.colors.grayscale.light4};
    margin: ${theme.gridUnit * 2}px 0;
    border-radius: 4px;
    padding: 0 ${theme.gridUnit}px;

    &:first-of-type {
      margin-top: 0;
    }
    &:last-of-type {
      margin-bottom: 0;
    }


      padding: 0;
      cursor: pointer;
      &:hover {
        background-color: ${theme.colors.grayscale.light3};
      }

    & > span {
      white-space: nowrap;
    }

    .option-label {
      display: inline;
    }

    .metric-option {
      & > svg {
        min-width: ${theme.gridUnit * 4}px;
      }
      & > .option-label {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  `}
`;

const LabelContainer = (props: {
  children: React.ReactElement;
  className: string;
}) => {
  const labelRef = useRef<HTMLDivElement>(null);
  const extendedProps = {
    labelRef,
  };
  return (
    <LabelWrapper className={props.className}>
      {React.cloneElement(props.children, extendedProps)}
    </LabelWrapper>
  );
};


export default function CubePanel({
                                    cube,
                                    shouldForceUpdate,
                                  }: Props) {
  const [dimentions, setDimentions] = useState(cube.dimensions);
  const [measures, setMeasures] = useState(cube.measures);

  const mainBody = useMemo(() => (
    <>
      <Collapse
        expandIconPosition="right"
        ghost
      >
        {dimentions.length && (
          <Collapse.Panel
            header={<SectionHeader>{t('Dimensions')}</SectionHeader>}
            key="dimensions"
          >
            <div className="field-length">
              {t(
                `Showing %s`,
                dimentions?.length,
              )}
            </div>
            {dimentions.map((dimension, index) => (
              <LabelContainer
                key={dimension.name + String(shouldForceUpdate)}
                className="column"
              >
                <CubeControlPanelDragOption
                  value={parseToSupersetColumn(dimension, cube)}
                  type={DndItemType.CubeDimension}
                />
              </LabelContainer>
            ))}
          </Collapse.Panel>
        )}
        {measures.length && (
          <Collapse.Panel
            header={<SectionHeader>{t('Measures')}</SectionHeader>}
            key="measures"
          >
            <div className="field-length">
              {t(
                `Showing %s`,
                measures?.length,
              )}
            </div>
            {measures.map((measure, index) => (
              <LabelContainer
                key={measure.name + String(shouldForceUpdate)}
                className="column"
              >
                <CubeControlPanelDragOption
                  value={parseToSupersetColumn(measure, cube)}
                  type={DndItemType.CubeMeasure}
                />
              </LabelContainer>
            ))}
          </Collapse.Panel>
        )}
      </Collapse>
    </>
  ), [dimentions])

  return (
    <ExploreCubePanelContainer>
      <div className="cube-title-container">
        <span className="cube-title">{cube.title}</span>
      </div>
      {mainBody}
    </ExploreCubePanelContainer>
  );
}

const parseToSupersetColumn = (cubeDimension: BaseCubeMember, cube: Cube) => {
  return {
    column_name: cubeDimension.shortTitle,
    type_generic: parseToSupersetType(cubeDimension.type),
    cube_name: cube.name,
    cube_title: cube.title,
    ...cubeDimension,
  }
};

const parseToSupersetType = (type: TCubeMemberType) => {
  switch (type) {
    case 'number':
      return GenericDataType.NUMERIC;
    case 'string':
      return GenericDataType.STRING;
    case 'boolean':
      return GenericDataType.BOOLEAN;
    case 'time':
      return GenericDataType.TEMPORAL;
    default:
      return GenericDataType.STRING;
  }
};
