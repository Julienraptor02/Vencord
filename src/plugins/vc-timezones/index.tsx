/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { addContextMenuPatch, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import * as DataStore from "@api/DataStore";
import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import { openModal } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { i18n, Menu, Tooltip, useEffect, useState } from "@webpack/common";
import { Message, User } from "discord-types/general";

import { SetTimezoneModal } from "./TimezoneModal";

export const DATASTORE_KEY = "vencord-timezones";

export let timezones: Record<string, string | null> = {};
(async () => {
    timezones = await DataStore.get<Record<string, string>>(DATASTORE_KEY) || {};
})();

const classes = findByPropsLazy("timestamp", "compact", "contentOnly");

export const settings = definePluginSettings({
    "24h Time": {
        type: OptionType.BOOLEAN,
        description: "Show time in 24h format",
        default: true
    },

    showMessageHeaderTime: {
        type: OptionType.BOOLEAN,
        description: "Show time in message headers",
        default: true
    },

    showProfileTime: {
        type: OptionType.BOOLEAN,
        description: "Show time in profiles",
        default: true
    }
});

function getTime(timezone: string, timestamp: string | number, props: Intl.DateTimeFormatOptions = {}) {
    const date = new Date(timestamp);


    const formattedParts = Object.keys(props).reduce((acc: string[], key) => {
        const option = key as keyof Intl.DateTimeFormatOptions;

        const formatter = new Intl.DateTimeFormat((i18n?.getLocale?.() ?? "en-US"), {
            hour12: !settings.store["24h Time"],
            timeZone: timezone,
            [option]: props[option],
        });

        acc.push(formatter.format(date));
        return acc;
    }, []);

    return formattedParts.join(" ");
}

interface Props {
    userId: string;
    timestamp?: string;
    type: "message" | "profile";
}
const TimestampComponent = ErrorBoundary.wrap(({ userId, timestamp, type }: Props) => {
    const [currentTime, setCurrentTime] = useState(timestamp || Date.now());
    const timezone = timezones[userId];

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (type === "profile") {
            setCurrentTime(Date.now());

            const now = new Date();
            const delay = (60 - now.getSeconds()) * 1000 + 1000 - now.getMilliseconds();

            timer = setTimeout(() => {
                setCurrentTime(Date.now());
            }, delay);
        }

        return () => timer && clearTimeout(timer);
    }, [type, currentTime]);

    if (!timezone) return null;

    const shortTime = getTime(timezone, currentTime, {
        dateStyle: "short",
        timeStyle: "short"
    });
    const mediumTime = getTime(timezone, currentTime, {
        dateStyle: "short",
        timeStyle: "short"
    });
    const longTime = getTime(timezone, currentTime, {
        dateStyle: "full",
        timeStyle: "short"
    });
    return (
        <Tooltip
            position="top"
            // @ts-ignore
            delay={750}
            allowOverflow={false}
            spacing={8}
            hideOnClick={true}
            tooltipClassName="timezone-tooltip"
            text={longTime}
        >
            {toolTipProps => {
                return (
                    <span
                        {...toolTipProps}
                        className={type === "message" ? `timezone-message-item ${classes.timestamp}` : "timezone-profile-item"}
                    >
                        {
                            type === "message" ? `(${shortTime})` : mediumTime
                        }
                    </span>
                );
            }}
        </Tooltip>
    );
}, { noop: true });


export default definePlugin({
    name: "Timezone",
    authors: [Devs.Aria],
    description: "Shows the local time of users in profiles and message headers",

    patches: [
        // stolen from ViewIcons
        ...[".NITRO_BANNER,", "=!1,canUsePremiumCustomization:"].map(find => ({
            find,
            replacement: {
                match: /(?<=hasProfileEffect.+?)children:\[/,
                replace: "$&$self.renderProfileTimezone(arguments[0]),"
            }
        })),
        {
            find: '"Message Username"',
            replacement: {
                // thanks https://github.com/Syncxv/vc-timezones/pull/4
                match: /(?<=isVisibleOnlyOnHover.+?)id:.{1,11},timestamp.{1,50}}\),/,
                replace: "$&,$self.renderMessageTimezone(arguments[0]),"
            }
        }
    ],
    settings,
    getTime,


    renderProfileTimezone: (props?: { user?: User; }) => {
        if (!settings.store.showProfileTime || !props?.user?.id) return null;

        return <TimestampComponent
            userId={props.user.id}
            type="profile"
        />;
    },

    renderMessageTimezone: (props?: { message?: Message; }) => {
        if (!settings.store.showMessageHeaderTime || !props?.message) return null;

        return <TimestampComponent
            userId={props.message.author.id}
            timestamp={props.message.timestamp.toISOString()}
            type="message"
        />;
    },

    start() {
        addContextMenuPatch("user-context", userContextMenuPatch);
    },

    stop() {
        removeContextMenuPatch("user-context", userContextMenuPatch);
    }

});


const userContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: { user: User; }) => {
    if (user?.id == null) return;

    const setTimezoneItem = (
        <Menu.MenuItem
            label="Set Timezone"
            id="set-timezone"
            action={() => openModal(modalProps => <SetTimezoneModal userId={user.id} modalProps={modalProps} />)}
        />
    );

    children.push(<Menu.MenuSeparator />, setTimezoneItem);

};