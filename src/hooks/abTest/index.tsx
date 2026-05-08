import { useLayoutEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { usePostHog } from "posthog-react-native";
import { ab_test_mobile_strict_funnel } from "@/constants/static";
import { actions } from "@/store";
import { ABTEST } from "@/store/slices/application/types";

const {
    application: { setABTest },
} = actions;

const useABTest = () => {
    const [flag, setFlag] = useState<ABTEST | undefined>('strict-funnel');

    const dispatch = useAppDispatch();

    const posthog = usePostHog();

    const stateAB = useAppSelector(store => store.application.abTest);

    useLayoutEffect(() => {

        const unsubscribe = posthog.onFeatureFlag(ab_test_mobile_strict_funnel, (value) => {
            if (value) {
                setFlag(value as ABTEST);
                dispatch(setABTest(value));
            }
        });

        posthog.reloadFeatureFlags((error, flags) => {
            if (error) {
                console.error('postHog reloadFeatureFlags error:', error);
            } else {
                let flagValue = flags?.[ab_test_mobile_strict_funnel] as ABTEST
                setFlag(flagValue)
                dispatch(setABTest(flagValue));
                console.log('postHog reloadFeatureFlags flags:', flags);
            }
        });

        return unsubscribe;

    }, [posthog]);


    const value = useMemo((): ABTEST => flag || stateAB, [flag, stateAB]);

    return {
        flag: value,
        isControl: value === 'control' || value === undefined,
        isStrictFunnel: value === 'strict-funnel',
    };
};

export default useABTest;