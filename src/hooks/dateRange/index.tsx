import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import isEqual from 'lodash/isEqual';

dayjs.extend(isBetween);



const useDateRange = <T extends any>() => {
    const addedData = useRef<Record<string, T[]>>({});
    const [newData, setNewData] = useState<Record<string, T[]>>({});

    const getByPathSkippingFirst = (obj: any, path: string): any => {
        const [, ...parts] = path.split('.');
        return parts.reduce((acc, part) => acc?.[part], obj);
    };

    const checkIsBetween = (item: any, key: string) => {
        const now = dayjs();
        const ref = getByPathSkippingFirst(item, key);

        const beginOn = ref?.beginOn ? dayjs(ref.beginOn) : null;
        const endOn = ref?.endOn ? dayjs(ref.endOn) : null;

        const hasBegin = !!beginOn;
        const hasEnd = !!endOn;

        if (hasBegin && hasEnd) {
            return now.isBetween(beginOn, endOn, null, '[)');
        }
        if (hasBegin) {
            return now.isAfter(beginOn) || now.isSame(beginOn);
        }
        if (hasEnd) {
            return now.isBefore(endOn);
        }
        return true;
    };



    const handleData = (data: Record<string, T[]>) => {
        const keys = Object.keys(data);
        if (!keys.length) return;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = data[key];
            if (!value?.length) continue;
            const change = value.filter(item => checkIsBetween(item, key))
            setNewData(prev => {
                if (isEqual(prev[key], change)) return prev;
                return { ...prev, [key]: change }
            });
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            handleData(addedData.current);
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);


    const addData = (data: T[], key: string) => {
        addedData.current[key] = data;
        handleData({ ...addedData.current, [key]: data });
    };


    return {
        newData,
        addData
    }

};

export default useDateRange