import React from 'react';
import { render } from '@testing-library/react-native';
import InfoTable from '@/components/molecules/info-table';
import { testIDs } from '@/constants';

const mockData = [
  {
    id: 'row-1',
    primaryText: 'Label 1',
    secondaryText: 'Value 1'
  },
  {
    id: 'row-2',
    primaryText: 'Label 2',
    secondaryText: 'Value 2'
  }
] as any[];

describe('InfoTable', () => {
  it('renders title and rows correctly', () => {
    const { getByTestId, getByText } = render(<InfoTable title='Test Info Table' infoTableRow={mockData} />);

    // Container
    expect(getByTestId(testIDs.components.molecules.infoTable.container)).toBeTruthy();

    // Title
    expect(getByText('Test Info Table')).toBeTruthy();

    // Rows
    mockData.forEach((row, index) => {
      expect(getByTestId(testIDs.components.molecules.infoTable.row(index))).toBeTruthy();
      expect(getByTestId(testIDs.components.molecules.infoTable.primaryText(index)).props.children).toBe(
        row.primaryText
      );
      expect(getByTestId(testIDs.components.molecules.infoTable.secondaryText(index)).props.children).toBe(
        row.secondaryText
      );
    });
  });

  it('does not render title when empty', () => {
    const { queryByText } = render(<InfoTable title='' infoTableRow={mockData} />);
    expect(queryByText('Test Info Table')).toBeNull();
  });

  it('renders no rows when infoTableRow is empty', () => {
    const { queryByTestId } = render(<InfoTable title='Empty Table' infoTableRow={[]} />);
    expect(queryByTestId(testIDs.components.molecules.infoTable.row(0))).toBeNull();
  });
});
