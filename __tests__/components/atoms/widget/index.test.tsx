import { render, fireEvent } from '@testing-library/react-native';
import { articleViewedMixpanel } from '@/helpers';
import Widget from '@/components/atoms/widget';

jest.mock('@/helpers', () => ({
  articleViewedMixpanel: jest.fn()
}));

const mockProps = {
  id: 123,
  title: 'Sample Widget Title',
  image: 'https://example.com/sample.jpg',
  widgetHeight: 100,
  widgetWidth: 120,
  onPress: jest.fn()
};

describe('Widget component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and image', () => {
    const { getByText, getByTestId } = render(<Widget {...mockProps} />);
    expect(getByText('Sample Widget Title')).toBeTruthy();
    expect(getByTestId('widget-image')).toBeTruthy();
  });

  it('calls onPress and mixpanel when pressed', () => {
    const { getByTestId } = render(<Widget {...mockProps} />);
    fireEvent.press(getByTestId('widget-touchable'));

    expect(mockProps.onPress).toHaveBeenCalledWith(123);
    expect(articleViewedMixpanel).toHaveBeenCalledWith({
      contentCategory: 'Market pulse',
      contentID: 123,
      contentTitle: 'Sample Widget Title'
    });
  });

  it('does not crash if onPress is undefined', () => {
    const { getByTestId } = render(<Widget {...mockProps} onPress={undefined} />);
    fireEvent.press(getByTestId('widget-touchable'));
    expect(articleViewedMixpanel).toHaveBeenCalled();
  });

  it('renders with animation if index is defined', () => {
    const { getByTestId } = render(<Widget {...mockProps} index={2} />);
    expect(getByTestId('widget-touchable')).toBeTruthy();
  });

  it('skips animation if disabled or index is undefined', () => {
    const { getByTestId: getById1 } = render(<Widget {...mockProps} disableAnimation />);
    const { getByTestId: getById2 } = render(<Widget {...mockProps} index={undefined} />);

    expect(getById1('widget-touchable')).toBeTruthy();
    expect(getById2('widget-touchable')).toBeTruthy();
  });
});
