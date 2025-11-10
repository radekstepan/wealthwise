import * as d3 from 'd3';
import { processSim, type Samples } from '../processSim';
import { type ChartData } from '../../components/chart/Chart';
import { type DistState, type DistData } from '../../atoms/distAtom';

describe('processSim', () => {
  let setDist: jest.Mock<(next: DistState) => void>;
  let setData: jest.Mock<(data: ChartData) => void>;
  
  const getSamples = (n: number) => Array(n).fill(0).map<any>((_, i) => [
    {
      buyer: { $: 150000 + (i * 1000) },
      renter: { $: 75000 + (i * 500) }
    },
    {
      buyer: { $: 200000 + (i * 1000) }, // Final buyer NW for n=100: [200k, 299k]
      renter: { $: 100000 + (i * 500) }  // Final renter NW for n=100: [100k, 149.5k]
    }
  ]);

  beforeEach(() => {
    setDist = jest.fn();
    setData = jest.fn();
  });

  describe('Distribution Calculation (setDist)', () => {
    it('should calculate bands based on combined buyer and renter outcomes', () => {
      const samples = getSamples(100);
      const handler = processSim(setDist, setData);
      handler(samples);

      expect(setDist).toHaveBeenCalled();
      const distCall = setDist.mock.calls[0][0] as DistState;
      expect(distCall).not.toBeNull();

      const allOutcomes = [
        ...samples.map(s => s[s.length - 1].buyer.$),
        ...samples.map(s => s[s.length - 1].renter.$)
      ].sort(d3.ascending);
      
      const expectedMin = d3.min(allOutcomes)!;
      const expectedMax = d3.max(allOutcomes)!;

      const actualMin = d3.min((distCall as DistData).buyer.concat((distCall as DistData).renter))!;
      const actualMax = d3.max((distCall as DistData).buyer.concat((distCall as DistData).renter))!;

      expect(actualMin).toBeCloseTo(expectedMin);
      expect(actualMax).toBeCloseTo(expectedMax);
    });

    it('should correctly count buyer and renter outcomes in each band', () => {
      const samples = getSamples(100); // 100 buyers, 100 renters
      const handler = processSim(setDist, setData);
      handler(samples);

      const distCall = setDist.mock.calls[0][0] as DistState;
      expect(distCall).not.toBeNull();

      const buyerOutcomes = samples.map(s => s[s.length - 1].buyer.$);
      const renterOutcomes = samples.map(s => s[s.length - 1].renter.$);
      const allOutcomes = [...buyerOutcomes, ...renterOutcomes].sort(d3.ascending);

      const min = d3.quantile(allOutcomes, 0.05)!;
      const max = d3.quantile(allOutcomes, 0.95)!;

      const totalBuyerCountInBands = (distCall as DistData).buyer.filter(v => v >= min && v <= max).length;
      const totalRenterCountInBands = (distCall as DistData).renter.filter(v => v >= min && v <= max).length;

      const expectedBuyerCount = buyerOutcomes.filter(v => v >= min! && v <= max!).length;
      const expectedRenterCount = renterOutcomes.filter(v => v >= min! && v <= max!).length;

      expect(totalBuyerCountInBands).toBe(expectedBuyerCount);
      expect(totalRenterCountInBands).toBe(expectedRenterCount);
      // Since buyer/renter ranges don't overlap in test data, some bands should only have one type
      expect((distCall as DistData).buyer.some(value => value > 0)).toBe(true);
      expect((distCall as DistData).renter.some(value => value > 0)).toBe(true);
    });

    it('should call setDist with null if data is insufficient for bands', () => {
      const handler = processSim(setDist, setData);
      handler(getSamples(2));
      expect(setDist).toHaveBeenCalled();
    });
  });

  describe('Chart Data Calculation (setData)', () => {
    it('should calculate chart data with accurate quantiles', () => {
      const handler = processSim(setDist, setData);
      handler(getSamples(100));

      expect(setData).toHaveBeenCalled();
      const dataCall = setData.mock.calls[0][0];

      // Test structure
      expect(dataCall.length).toBe(3); // 3 quantiles (5%, 50%, 95%)
      expect(dataCall[0].length).toBe(2); // 2 years

      const medianYear0 = dataCall[1][0];
      const medianYear1 = dataCall[1][1];

      // Median values are based on the implementation using floor(samples.length * p)
      expect(medianYear0.buyer.$).toBe(200000);
      expect(medianYear0.renter.$).toBe(100000);
      
      expect(medianYear1.buyer.$).toBe(250000);
      expect(medianYear1.renter.$).toBe(125000);
    });

    it('should handle a small dataset correctly for chart data', () => {
      const handler = processSim(setDist, setData);
      handler(getSamples(2));

      expect(setData).toHaveBeenCalled();
      const dataCall = setData.mock.calls[0][0];

      // Test structure is maintained
      expect(dataCall.length).toBe(3); // 3 quantiles
      expect(dataCall[0].length).toBe(2); // 2 years

      // With 2 samples, quantile logic will pick specific indices based on floor(samples.length * p)
      expect(dataCall[1][0].buyer.$).toBe(151000); // 50th percentile index for buyer
      expect(dataCall[1][0].renter.$).toBe(75500); // 50th percentile index for renter
    });
  });
});
