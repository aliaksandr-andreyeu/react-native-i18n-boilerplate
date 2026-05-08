import React from 'react';
import { render } from '@testing-library/react-native';
import { CalendarWeekNames } from '@/components';
import { testIDs } from '@/constants';

jest.mock('moment', () => {
    const actualMoment = jest.requireActual('moment');
    return {
        ...actualMoment,
        localeData: () => ({
            weekdaysShort: () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        }),
    };
});

type WeekDayKey = keyof typeof testIDs.components.molecules.calendarWeekNames;

const getTestId = (weekDay: WeekDayKey) => {
    return testIDs.components.molecules.calendarWeekNames[`${weekDay}`]
}

describe('CalendarWeekNames', () => {
    it('renders 7 capitalized weekday names with proper testIDs', () => {
        const { getByTestId } = render(<CalendarWeekNames />);

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



        weekdays.forEach((day) => {
            expect(getByTestId(getTestId(day?.toLowerCase?.() as WeekDayKey))).toBeTruthy();
        });
    });
});
