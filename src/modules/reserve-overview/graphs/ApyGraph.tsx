import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Bar, Line, LinePath } from '@visx/shape';
import { withTooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { bisector, extent, max } from 'd3-array';
import React, { Fragment, ReactNode, useCallback, useMemo } from 'react';
import { FormattedReserveHistoryItem, ReserveRateTimeRange } from 'src/hooks/useReservesHistory';

type TooltipData = FormattedReserveHistoryItem;


// accessors
const getDate = (d: FormattedReserveHistoryItem) => new Date(d.date);
const bisectDate = bisector<FormattedReserveHistoryItem, Date>((d) => new Date(d.date)).left;
const getData = (d: FormattedReserveHistoryItem, fieldName: Field) => d[fieldName] * 100;

type Field = 'liquidityRate' | 'variableBorrowRate';

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  data: FormattedReserveHistoryItem[];
  fields: { name: Field; color: string; text: string }[];
  selectedTimeRange: ReserveRateTimeRange;
  avgFieldName?: Field;
};

export const ApyGraph = withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    margin = { top: 20, right: 10, bottom: 20, left: 40 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    data,
    fields,
    selectedTimeRange,
    avgFieldName,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    const theme = useTheme();
    const isXsm = useMediaQuery(theme.breakpoints.down('xsm'));

    // Tooltip Styles
    const accentColorDark = theme.palette.mode === 'light' ? '#383D511F' : '#a5a8b647';

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const xAxisNumTicks = selectedTimeRange !== '6m' || isXsm ? 3 : 4;
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [0, innerWidth],
          domain: extent(data, getDate) as [Date, Date],
        }),
      [innerWidth, data]
    );
    const yValueScale = useMemo(() => {
      const valueMax = Math.max(
        ...fields.map((field) => max(data, (d) => getData(d, field.name)) as number)
      );
      return scaleLinear({
        range: [innerHeight, 0],
        domain: [0, (valueMax || 0) * 1.1],
        nice: true,
      });
    }, [innerHeight, data, fields]);

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

    let avgLine: ReactNode = null;
    if (avgFieldName) {
      const avg = data.reduce((acc, cur) => acc + cur[avgFieldName], 0) / data.length;
      if (avg > 0) {
        const avgFormatted = (avg * 100).toFixed(2);
        const avgArray = data.map((d) => {
          return {
            ...d,
            [avgFieldName]: avg,
          };
        });

        const annotationX = (dateScale(getDate(avgArray[0])) ?? 0) + 70;
        const annotationY = (yValueScale(getData(avgArray[0], avgFieldName)) ?? 0) - 8;

        avgLine = (
          <>
            <LinePath
              key="avg"
              data={avgArray}
              strokeDasharray="3,5"
              stroke="#D2D4DC"
              strokeWidth={2}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => yValueScale(getData(d, avgFieldName)) ?? 0}
            />
            <Annotation x={annotationX} y={annotationY}>
              <HtmlLabel showAnchorLine={false}>
                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="center"
                  sx={{
                    mx: 2,
                    my: 0.5,
                    fontSize: 12,
                    background: theme.palette.divider,
                    borderRadius: '99px',
                  }}
                >
                  <Typography sx={{ m: 1 }} noWrap variant="secondary12">
                    Avg {avgFormatted}%
                  </Typography>
                </Stack>
              </HtmlLabel>
            </Annotation>
          </>
        );
      }
    }

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

            {/* Data Value Lines */}
            {fields.map((field) => (
              <LinePath
                key={field.name}
                stroke={field.color}
                strokeWidth={2}
                data={data}
                x={(d) => dateScale(getDate(d)) ?? 0}
                y={(d) => yValueScale(getData(d, field.name)) ?? 0}
                curve={curveMonotoneX}
              />
            ))}

            {avgLine}

            {/* X Axis */}
            <AxisBottom
              top={innerHeight - margin.bottom / 4}
              scale={dateScale}
              strokeWidth={0}
              numTicks={xAxisNumTicks}
              tickStroke={theme.palette.text.secondary}
              tickLabelProps={() => ({
                fill: theme.palette.text.muted,
                fontSize: 10,
                textAnchor: 'middle',
                dy: 4,
              })}
            />

            {/* Y Axis */}
            <AxisLeft
              left={0}
              scale={yValueScale}
              strokeWidth={0}
              numTicks={3}
              tickFormat={(value) => `${value}%`}
              tickLabelProps={() => ({
                fill: theme.palette.text.muted,
                fontSize: 10,
                dx: -margin.left + 10,
              })}
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

            {/* Tooltip */}
            {tooltipData && (
              <g>
                <Line
                  from={{ x: tooltipLeft, y: margin.top }}
                  to={{ x: tooltipLeft, y: innerHeight }}
                  stroke={accentColorDark}
                  strokeWidth={1}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                {fields.map((field) => {
                  return (
                    <Fragment key={field.name}>
                      <circle
                        cx={tooltipLeft}
                        cy={yValueScale(getData(tooltipData, field.name)) + 1}
                        r={4}
                        fillOpacity={0.1}
                        strokeOpacity={0.1}
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                      <circle
                        cx={tooltipLeft}
                        cy={yValueScale(getData(tooltipData, field.name))}
                        r={4}
                        fill={accentColorDark}
                        stroke="white"
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                    </Fragment>
                  );
                })}
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

export const PlaceholderChart = ({
  width,
  height,
  margin = { top: 20, right: 10, bottom: 20, left: 40 },
}: {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}) => {
  const theme = useTheme();

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={scaleLinear({
            range: [115, 0],
            domain: [0, 5],
            nice: true,
          })}
          width={innerWidth}
          strokeDasharray="3,3"
          stroke={theme.palette.divider}
          pointerEvents="none"
          numTicks={3}
        />

        <LinePath
          data={[
            { x: 0, y: 100 },
            { x: 100, y: 60 },
            { x: 200, y: 80 },
            { x: 300, y: 50 },
            { x: 400, y: 80 },
            { x: 500, y: 40 },
            { x: 600, y: 60 },
            { x: 700, y: 40 },
            { x: 800, y: 30 },
          ]}
          x={(d) => d.x}
          y={(d) => d.y}
          stroke={theme.palette.divider}
          strokeWidth={2}
          curve={curveMonotoneX}
        />

        <Annotation x={width / 2} y={height / 2}>
          <HtmlLabel showAnchorLine={false}>
            <Typography noWrap variant="subheader1" color="text.muted">
              No data available
            </Typography>
          </HtmlLabel>
        </Annotation>

        {/* Y Axis */}
        <AxisLeft
          left={0}
          scale={scaleLinear({
            range: [115, 0],
            domain: [0, 5],
            nice: true,
          })} // Placeholder scale
          strokeWidth={0}
          numTicks={3}
          tickFormat={(value) => `${value}%`}
          tickLabelProps={() => ({
            fill: theme.palette.text.muted,
            fontSize: 10,
            dx: -margin.left + 10,
          })}
        />

        <Bar width={innerWidth} height={innerHeight} fill="transparent" pointerEvents="none" />
      </Group>
    </svg>
  );
};
