import { render } from '@testing-library/react-native';
import { BaseDivider } from '@/components';

describe('BaseDivider', () => {
  it('renders correctly with top and bottom views', () => {
    const { getAllByTestId } = render(
      <BaseDivider />
    );

    const segments = getAllByTestId('BaseDividerSegment');
    expect(segments.length).toBe(2);
  });
});
