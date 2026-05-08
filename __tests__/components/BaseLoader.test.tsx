import React from 'react';
import { useTheme } from '@react-navigation/native';
import { BaseLoader } from '@/components';
import { render } from '@testing-library/react-native';

describe('BaseLoader Component', () => {

  it('renders correctly with default props', () => {
    const { queryByTestId } = render(<BaseLoader />);
    const modalElement = queryByTestId('base-loader-modal');
    expect(modalElement).toBeNull();
  });

  it('renders correctly when active is true', () => {
    const { getByTestId } = render(<BaseLoader active={true} />);
    const modalElement = getByTestId('base-loader-modal');
    expect(modalElement).toBeTruthy();
  });

  it('renders correctly with a custom color', () => {
    const customColor = 'red';
    const { getByTestId } = render(<BaseLoader active={true} color={customColor} />);
    const activityIndicator = getByTestId('base-loader-activity-indicator');
    expect(activityIndicator.props.color).toBe(customColor);
  });

  it('renders correctly with isSmall prop', () => {
    const { getByTestId } = render(<BaseLoader active={true} isSmall={true} />);
    const activityIndicator = getByTestId('base-loader-activity-indicator');
    expect(activityIndicator.props.size).toBe('small');
  });

  it('applies additional styles passed via the style prop', () => {
    const additionalStyle = { backgroundColor: 'blue' };
    const { getByTestId } = render(<BaseLoader active={true} style={additionalStyle} />);
    const containerElement = getByTestId('base-loader-container');
    expect(containerElement.props.style).toContainEqual(additionalStyle);
  });
});
