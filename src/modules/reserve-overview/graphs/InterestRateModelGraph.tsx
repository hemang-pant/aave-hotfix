import { normalizeBN, RAY, rayDiv, rayMul } from '@aave/math-utils';
import { useTheme } from '@mui/material';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Bar, Line, LinePath } from '@visx/shape';
import { Text } from '@visx/text';
import { withTooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { BigNumber } from 'bignumber.js';
import { bisector, max } from 'd3-array';
import React, { useCallback, useMemo } from 'react';

import type { Fields } from './InterestRateModelGraphContainer';

type TooltipData = Rate;

type InterestRateModelType = {
  variableRateSlope1: string;
  variableRateSlope2: string;
  optimalUsageRatio: string;
  utilizationRate: string;
  baseVariableBorrowRate: string;
  totalLiquidityUSD: string;
  totalDebtUSD: string;
};

type Rate = {
  variableRate: number;
  utilization: number;
};

// accessors
const getDate = (d: Rate) => d.utilization;
const bisectDate = bisector<Rate, number>((d) => d.utilization).center;
const getVariableBorrowRate = (d: Rate) => d.variableRate * 100;

const resolution = 200;
const step = 100 / resolution;

// const getAPY = (rate: BigNumber) =>
//   rayPow(valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR).plus(RAY), SECONDS_PER_YEAR).minus(
//     RAY
//   );

function getRates({
  variableRateSlope1,
  variableRateSlope2,
  optimalUsageRatio,
  baseVariableBorrowRate,
}: InterestRateModelType): Rate[] {
  const rates: Rate[] = [];
  const formattedOptimalUtilizationRate = normalizeBN(optimalUsageRatio, 25).toNumber();

  for (let i = 0; i <= resolution; i++) {
    const utilization = i * step;
    // When zero
    if (utilization === 0) {
      rates.push({
        variableRate: 0,
        utilization,
      });
    }
    // When hovering below optimal utilization rate, actual data
    else if (utilization < formattedOptimalUtilizationRate) {
      const theoreticalVariableAPY = normalizeBN(
        new BigNumber(baseVariableBorrowRate).plus(
          rayDiv(rayMul(variableRateSlope1, normalizeBN(utilization, -25)), optimalUsageRatio)
        ),
        27
      ).toNumber();
      rates.push({
        variableRate: theoreticalVariableAPY,
        utilization,
      });
    }
    // When hovering above optimal utilization rate, hypothetical predictions
    else {
      const excess = rayDiv(
        normalizeBN(utilization, -25).minus(optimalUsageRatio),
        RAY.minus(optimalUsageRatio)
      );
      const theoreticalVariableAPY = normalizeBN(
        new BigNumber(baseVariableBorrowRate)
          .plus(variableRateSlope1)
          .plus(rayMul(variableRateSlope2, excess)),
        27
      ).toNumber();
      rates.push({
        variableRate: theoreticalVariableAPY,
        utilization,
      });
    }
  }
  return rates;
}

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  fields: Fields;
  reserve: InterestRateModelType;
};

export const InterestRateModelGraph = withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    margin = { top: 20, right: 10, bottom: 20, left: 40 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    reserve,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    const theme = useTheme();

    // Formatting
    const formattedCurrentUtilizationRate = (parseFloat(reserve.utilizationRate) * 100).toFixed(2);
    const formattedOptimalUtilizationRate = normalizeBN(reserve.optimalUsageRatio, 25).toNumber();

    // Tooltip Styles
    const accentColorDark = theme.palette.mode === 'light' ? '#383D511F' : '#a5a8b647';

    const data = useMemo(() => getRates(reserve), [JSON.stringify(reserve)]);

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const dateScale = useMemo(
      () =>
        scaleLinear({
          range: [0, innerWidth],
          domain: [0, 100],
          nice: true,
        }),
      [innerWidth]
    );
    const yValueScale = useMemo(() => {
      const maxY = max(data, (d) => getVariableBorrowRate(d)) as number;
      return scaleLinear({
        range: [innerHeight, 0],
        domain: [0, (maxY || 0) * 1.1],
        nice: true,
      });
    }, [innerHeight, data, reserve]);

    // tooltip handler
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x: _x } = localPoint(event) || { x: 0 };
        const x = _x - margin.left;
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
        });
      },
      [showTooltip, dateScale, data, margin]
    );

    const ticks = [
      {
        value: normalizeBN(reserve.optimalUsageRatio, 27).multipliedBy(100).toNumber(),
        label: 'optimal',
      },
      {
        value: new BigNumber(reserve.utilizationRate).multipliedBy(100).toNumber(),
        label: 'current',
      },
    ];


    return (
      <>
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            {/* Horizontal Background Lines */}
            <GridRows
              scale={yValueScale}
              width={innerWidth}
              strokeDasharray="3,3"
              stroke={theme.palette.divider}
              pointerEvents="none"
              numTicks={3}
            />

            {/* Variable Borrow APR Line */}
            <LinePath
              stroke="#B6509E"
              strokeWidth={2}
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => yValueScale(getVariableBorrowRate(d)) ?? 0}
              curve={curveMonotoneX}
            />

            {/* X Axis */}
            <AxisBottom
              top={innerHeight}
              scale={dateScale}
              tickValues={[0, 25, 50, 75, 100]}
              strokeWidth={0}
              tickStroke={theme.palette.text.secondary}
              tickLabelProps={() => ({
                fill: theme.palette.text.muted,
                fontSize: 10,
                textAnchor: 'middle',
              })}
              tickFormat={(n) => `${n}%`}
            />

            {/* Y Axis */}
            <AxisLeft
              scale={yValueScale}
              strokeWidth={0}
              tickLabelProps={() => ({
                fill: theme.palette.text.muted,
                fontSize: 8,
                dx: -margin.left + 10,
              })}
              numTicks={2}
              tickFormat={(value) => `${value}%`}
            />

            {/* Background */}
            <Bar
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={() => hideTooltip()}
            />

            {/* Current Utilization Line */}
            <Line
              from={{ x: dateScale(ticks[1].value), y: margin.top + 24 }}
              to={{ x: dateScale(ticks[1].value), y: innerHeight }}
              stroke="#0062D2"
              strokeWidth={1}
              pointerEvents="none"
              strokeDasharray="5,2"
            />
            <Text
              x={dateScale(ticks[1].value)}
              y={margin.top + 16}
              width={360}
              textAnchor="middle"
              verticalAnchor="middle"
              fontSize="10px"
              fill="#62677B"
            >
              {`Current ${formattedCurrentUtilizationRate}%`}
            </Text>

            {/* Optimal Utilization Line */}
            <Line
              from={{ x: dateScale(ticks[0].value), y: margin.top + 8 }}
              to={{ x: dateScale(ticks[0].value), y: innerHeight }}
              stroke="#0062D2"
              strokeWidth={1}
              pointerEvents="none"
              strokeDasharray="5,2"
            />
            <Text
              x={dateScale(ticks[0].value)}
              y={margin.top}
              width={360}
              textAnchor="middle"
              verticalAnchor="middle"
              fontSize="10px"
              fill="#62677B"
            >
              {`Optimal ${formattedOptimalUtilizationRate}%`}
            </Text>

            {/* Tooltip */}
            {tooltipData && (
              <g>
                {/* Vertical line */}
                <Line
                  from={{ x: tooltipLeft, y: margin.top }}
                  to={{ x: tooltipLeft, y: innerHeight }}
                  stroke={accentColorDark}
                  strokeWidth={1}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                {/* Variable borrow rate circle */}
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(getVariableBorrowRate(tooltipData)) + 1}
                  r={4}
                  fill="black"
                  fillOpacity={0.1}
                  stroke="black"
                  strokeOpacity={0.1}
                  strokeWidth={2}
                  pointerEvents="none"
                />
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(getVariableBorrowRate(tooltipData))}
                  r={4}
                  fill={accentColorDark}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </g>
            )}
          </Group>
        </svg>

        {/* Tooltip Info */}
        {tooltipData && (
          <div>
            
          </div>
        )}
      </>
    );
  }
);
