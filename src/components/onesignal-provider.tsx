"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export function OneSignalProvider() {
    useEffect(() => {
        const initOneSignal = async () => {
            if (typeof window !== "undefined") {
                try {
                    await OneSignal.init({
                        appId: "c57035d0-80b5-4adc-b112-76adc39bd124",
                        allowLocalhostAsSecureOrigin: true,
                    });
                    console.log("OneSignal initialized successfully");
                } catch (error) {
                    console.error("OneSignal initialization failed:", error);
                }
            }
        };

        initOneSignal();
    }, []);

    return null;
}
