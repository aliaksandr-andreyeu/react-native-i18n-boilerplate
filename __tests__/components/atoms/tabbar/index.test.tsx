import { fireEvent, render } from '@testing-library/react-native'
import { testIDs } from '@/constants'
import { BaseTabBar } from '@/components'
import { withStoreProvider } from '../../../../__mocks__/utils/mockStore'
import { portfolioSlice } from '@/store/slices'
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';



const mockNavigate = jest.fn();


const mockNavigation: MaterialTopTabBarProps['navigation'] = {
    navigate: mockNavigate,
    dispatch: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    canGoBack: jest.fn(),
    isFocused: jest.fn(),
    getState: jest.fn(),
    setParams: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    emit: jest.fn(),
};



const baseProps = {
    navigation: mockNavigation,
    descriptors: {
        overview: { options: { tabBarLabel: 'overview' } },
        positions: { options: { tabBarLabel: 'positions' } },
        orders: { options: { tabBarLabel: 'orders' } },
        history: { options: { tabBarLabel: 'history' } },
    } as any,
    state: {
        index: 0,
        routes: [
            { key: 'overview', name: 'overview' },
            { key: 'positions', name: 'positions' },
            { key: 'orders', name: 'orders' },
            { key: 'history', name: 'history' },
        ],
    } as any,
};


const mockDispatch = jest.fn();


jest.mock('@/hooks', () => {
    return {
        useAppDispatch: () => mockDispatch,
        useCommonStyles: () => ({ shadow6Style: {} }),
        useAppSelector: () => 0
    };
});

describe('BaseTabBar', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all tabs with correct testIDs', () => {
        const { getByTestId } = render(withStoreProvider(<BaseTabBar {...baseProps} />))

        expect(getByTestId(testIDs.portfolio.tabs.overview)).toBeTruthy()
        expect(getByTestId(testIDs.portfolio.tabs.positions)).toBeTruthy()
        expect(getByTestId(testIDs.portfolio.tabs.orders)).toBeTruthy()
        expect(getByTestId(testIDs.portfolio.tabs.history)).toBeTruthy()
    })

    it('dispatches setActiveTab and navigates when a different tab is pressed', () => {
        const { getByTestId } = render(withStoreProvider(<BaseTabBar {...baseProps} />))

        fireEvent.press(getByTestId(testIDs.portfolio.tabs.positions))

        expect(mockDispatch).toHaveBeenCalledWith(portfolioSlice.actions.setActiveTab(1))
        expect(mockNavigate).toHaveBeenCalledWith('positions')
    })

    it('does not dispatch or navigate if the same tab is pressed', () => {
        const { getByTestId } = render(withStoreProvider(<BaseTabBar {...baseProps} />))

        fireEvent.press(getByTestId(testIDs.portfolio.tabs.overview))

        expect(mockDispatch).not.toHaveBeenCalled()
        expect(mockNavigate).not.toHaveBeenCalled()
    })
})
