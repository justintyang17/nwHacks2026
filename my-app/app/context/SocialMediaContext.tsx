"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

/* ----------------------------- Types ----------------------------- */

export type Platform = "instagram" | "twitter" | "tiktok" | "youtube";

export type SocialAccount = {
    username: string;
    accessToken: string;      // OAuth access token
    expiresAt?: number;       // optional expiration timestamp
};

type SocialMediaContextType = {
    accounts: Partial<Record<Platform, SocialAccount>>;
    setAccount: (platform: Platform, account: SocialAccount | null) => void;
    clearAll: () => void;
};


const SocialMediaContext = createContext<SocialMediaContextType | undefined>(undefined);


export const SocialMediaContextProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [accounts, setAccounts] = useState<
        Partial<Record<Platform, SocialAccount>>
    >({});

    const setAccount = (
        platform: Platform,
        account: SocialAccount | null
    ) => {
        setAccounts((prev) => {
            const next = { ...prev };

            if (account === null) {
                delete next[platform];
            } else {
                next[platform] = account;
            }

            return next;
        });
    };

    const clearAll = () => setAccounts({});

    return (
        <SocialMediaContext.Provider
            value={{ accounts, setAccount, clearAll }}
        >
            {children}
        </SocialMediaContext.Provider>
    );
};

/* ---------------------------- Hook ------------------------------- */

export const useSocialMediaContext = () => {
    const context = useContext(SocialMediaContext);
    if (!context) {
        throw new Error(
            "useSocialMediaContext must be used within SocialMediaContextProvider"
        );
    }
    return context;
};
