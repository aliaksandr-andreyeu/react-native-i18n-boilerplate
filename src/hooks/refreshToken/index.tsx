import { getStoredRefreshToken } from "@/helpers";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { actions } from "@/store";

const {
    auth: { logOut, useRefreshToken }
} = actions;



let interval: number | undefined;
const useAppRefreshToken = () => {

    const [refreshToken] = useRefreshToken();
    const tokenTimeRemaining = useRef<number>(0);
    const isFirstTime = useRef<boolean>(true);

    const userId = useAppSelector(state => state.portfolio.userInfo.id);

    const dispatch = useAppDispatch()

    const hasStoredRefreshToken = async () => {
        try {
            const token = await getStoredRefreshToken();
            if (!token) {
                dispatch(logOut());
                return { hasToken: false, token: '' };
            }
            return { hasToken: true, token };
        } catch (error) {
            return { hasToken: false, token: '' };
        };
    };

    const getAccToken = async () => {
        try {
            const storedToken = await hasStoredRefreshToken();

            if (!storedToken.hasToken) return storedToken;

            const res = await refreshToken({
                token: storedToken.token
            }).unwrap() as { accessToken: string; refreshToken: string };

            if (!res.accessToken) return { hasToken: false, token: '' };

            return { hasToken: true, token: res.accessToken };

        } catch (error) {
            console.error(error)
            return { hasToken: false, token: '' };
        }
    };


    const createInterval = () => {
        tokenTimeRemaining.current = 55;
        interval && clearInterval(interval)
        interval = setInterval(async () => {
            const remainingMinute = tokenTimeRemaining.current;
            if (remainingMinute <= 7) {
                const accTokenData = await getAccToken()
                if (!accTokenData.hasToken) interval && clearInterval(interval);
                else createInterval();
            } else {
                const hasStoredToken = await hasStoredRefreshToken()
                if (!hasStoredToken.hasToken) interval && clearInterval(interval);
            };
            tokenTimeRemaining.current -= 5

        }, 5 * 60 * 1000);

        return interval;
    };


    const refreshAccessToken = async () => {
        try {
            if (isFirstTime.current) {
                const accTokenData = await getAccToken();
                if (!accTokenData.hasToken) return;
            } else {
                const storedToken = await hasStoredRefreshToken();
                if (!storedToken.hasToken) return;
            }
            createInterval()

        } catch (error: unknown) {
            console.error(error);
        } finally {
            isFirstTime.current = false
        }
    };


    useEffect(() => {
        refreshAccessToken();
        return () => { interval && clearInterval(interval) }
    }, [userId]);
};


export default useAppRefreshToken