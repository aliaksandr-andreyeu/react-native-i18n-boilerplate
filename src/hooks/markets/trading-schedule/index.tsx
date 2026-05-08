import React, { useEffect, useLayoutEffect, useState, useMemo, useRef } from 'react';
import moment from 'moment';
import { getFormattedTime } from '@/helpers';

interface TradingSession {
  open: string;
  close: string;
}

interface TradingSessionSchedule {
  dayOfWeek: string;
  tradingSessions: TradingSession[];
}

export interface TradingScheduleProps {
  schedule: TradingSessionSchedule[] | undefined;
}

export interface TradingScheduleData {
  timeToOpen: string | undefined;
  timeToClose: string | undefined;
}

const useTradingSchedule = ({ schedule }: TradingScheduleProps): TradingScheduleData | null => {
  const [timer, setTimer] = useState<number | undefined>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const setInitialState = () => {
    setTimer(undefined);
  };

  useEffect(() => {
    setInitialState();
    return () => {
      setInitialState();
    };
  }, []);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const startTimer = () => {
    stopTimer();

    intervalRef.current = setInterval(() => {
      const currentTime = moment().utc().valueOf();
      setTimer(currentTime);
    }, 1000);
  };

  useLayoutEffect(() => {
    startTimer();
    return () => {
      stopTimer();
      setInitialState();
    };
  }, []);

  const tradingSchedule = useMemo(() => {
    if (!(timer && schedule && schedule.length > 0)) {
      return null;
    }

    const anyTradingSessions = schedule?.filter((el) => el?.tradingSessions?.length > 0) || [];
    const isAnyTradingSessions = Boolean(anyTradingSessions?.length > 0);

    if (!isAnyTradingSessions) {
      return null;
    }

    const todayDay = moment().utc().locale('en').format('dddd').toLowerCase();

    const todaySessionIndex = schedule.findIndex((el) => el.dayOfWeek?.toLowerCase() === todayDay);

    if (todaySessionIndex === -1) {
      return null;
    }

    let nextSessionIndex = todaySessionIndex;

    const getSession = (index: number): TradingScheduleData | undefined => {
      if (index === undefined) {
        return;
      }
      const data = schedule[index];

      const { tradingSessions } = data || {};

      const isTradingSessions = tradingSessions && Array.isArray(tradingSessions);

      if (!isTradingSessions) {
        return;
      }

      if (tradingSessions.length === 0) {
        nextSessionIndex = nextSessionIndex + 1;
        if (nextSessionIndex === schedule.length) {
          nextSessionIndex = 0;
        }

        return getSession(nextSessionIndex);
      }

      let diffInDays = 0;

      if (todaySessionIndex < nextSessionIndex) {
        diffInDays = nextSessionIndex - todaySessionIndex;
      } else if (todaySessionIndex > nextSessionIndex) {
        diffInDays = schedule.length - todaySessionIndex + nextSessionIndex;
      }

      let timeToClose = undefined;
      let timeToOpen = undefined;

      let findNext = false;

      tradingSessions.every(({ open, close }, index) => {
        const openHoursData = open?.split(':') || [];
        const openHours = Number(openHoursData[0]);
        const openMinutes = Number(openHoursData[1]);
        const openDate = new Date();
        openDate.setUTCDate(openDate.getUTCDate() + diffInDays);
        openDate.setUTCHours(openHours);
        openDate.setUTCMinutes(openMinutes);
        openDate.setUTCSeconds(0);

        const openTS = moment(openDate).utc().valueOf();

        const closeHoursData = close?.split(':') || [];
        const closeHours = Number(closeHoursData[0]);
        const closeMinutes = Number(closeHoursData[1]);
        const closeDate = new Date();
        closeDate.setUTCDate(closeDate.getUTCDate() + diffInDays);
        closeDate.setUTCHours(closeHours);
        closeDate.setUTCMinutes(closeMinutes);
        closeDate.setUTCSeconds(0);

        const closeTS = moment(closeDate).utc().valueOf();

        const diffToClose = moment(closeTS).diff(timer);
        const durationToClose = moment.duration(diffToClose);
        const hoursToClose = durationToClose.asHours();
        const marketCloseSoon = hoursToClose <= 2;

        const isOpenBefore = moment(openTS).isBefore(timer);
        const isOpenTimeAfter = moment(openTS).isAfter(timer);
        const isCloseTimeBefore = moment(closeTS).isBefore(timer);
        const isCloseTimeAfter = moment(closeTS).isAfter(timer);

        const tsToOpen = openTS - timer;
        const tsToClose = closeTS - timer;

        if (isOpenTimeAfter && isCloseTimeAfter) {
          timeToOpen = getFormattedTime(tsToOpen);
          timeToClose = undefined;
          return false;
        } else if (isOpenBefore && isCloseTimeAfter && close !== '24:00') {
          if (marketCloseSoon) {
            timeToOpen = undefined;
            timeToClose = getFormattedTime(tsToClose);
          } else {
            timeToOpen = undefined;
            timeToClose = undefined;
          }
          return false;
        } else if (isOpenBefore && isCloseTimeBefore) {
          if (index === tradingSessions.length - 1) {
            findNext = true;
            return false;
          } else {
            return true;
          }
        }
      });

      if (findNext) {
        nextSessionIndex = nextSessionIndex + 1;
        if (nextSessionIndex === schedule.length) {
          nextSessionIndex = 0;
        }

        return getSession(nextSessionIndex);
      }

      return { timeToClose, timeToOpen };
    };

    const todaySessionData = getSession(todaySessionIndex);
    const { timeToClose, timeToOpen } = todaySessionData || {};

    if (todaySessionData === undefined) {
      return null;
    }

    return { timeToClose, timeToOpen };
  }, [timer, schedule]);

  return tradingSchedule;
};

export default useTradingSchedule;
