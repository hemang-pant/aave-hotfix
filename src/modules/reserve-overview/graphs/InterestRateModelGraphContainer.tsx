import { Box } from '@mui/material';
import { GraphLegend } from './GraphLegend';


export type Field = 'variableBorrowRate' | 'utilizationRate';

export type Fields = { name: Field; color: string; text: string }[];

// This graph takes in its data via props, thus having no loading/error states
export const InterestRateModelGraphContainer = (): JSX.Element => {
  const fields: Fields = [
    { name: 'variableBorrowRate', text: 'Borrow APR, variable', color: '#B6509E' },
  ];

  return (
    <Box sx={{ mt: 8, mb: 10 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
        }}
      >
        <GraphLegend labels={[...fields, { text: 'Utilization Rate', color: '#0062D2' }]} />
      </Box>
      {/* <ParentSize>
        {({ width }) => (
          <InterestRateModelGraph
            width={width}
            height={CHART_HEIGHT}
            fields={fields}
            reserve={{
              baseVariableBorrowRate: reserve.baseVariableBorrowRate,
              optimalUsageRatio: reserve.optimalUsageRatio,
              utilizationRate: reserve.borrowUsageRatio,
              variableRateSlope1: reserve.variableRateSlope1,
              variableRateSlope2: reserve.variableRateSlope2,
              totalLiquidityUSD: reserve.totalLiquidityUSD,
              totalDebtUSD: reserve.totalDebtUSD,
            }}
          />
        )}
      </ParentSize> */}
    </Box>
  );
};
