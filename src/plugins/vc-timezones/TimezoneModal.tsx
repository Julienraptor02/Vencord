/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as DataStore from "@api/DataStore";
import { Margins } from "@utils/margins";
import { RenderModalProps } from "@vencord/discord-types";
import { Forms, Modal, SearchableSelect, useMemo, useState } from "@webpack/common";

import { DATASTORE_KEY, timezones } from ".";

export async function setUserTimezone(userId: string, timezone: string | null) {
    timezones[userId] = timezone;
    await DataStore.set(DATASTORE_KEY, timezones);
}

export function SetTimezoneModal({ userId, modalProps }: { userId: string, modalProps: RenderModalProps; }) {
    const [currentValue, setCurrentValue] = useState<string | null>(timezones[userId] ?? null);

    const options = useMemo(() => {
        return Intl.supportedValuesOf("timeZone").map(timezone => {
            const offset = new Intl.DateTimeFormat(undefined, { timeZone: timezone, timeZoneName: "short" })
                .formatToParts(new Date())
                .find(part => part.type === "timeZoneName")!.value;

            return { label: `${timezone} (${offset})`, value: timezone };
        });
    }, []);

    return (
        <Modal
            {...modalProps}
            title="Timezones"
            actions={[
                {
                    text: "Delete Timezone",
                    variant: "critical-primary",
                    onClick: async () => {
                        await setUserTimezone(userId, null);
                        modalProps.onClose();
                    }
                },
                {
                    text: "Save",
                    variant: "primary",
                    onClick: async () => {
                        await setUserTimezone(userId, currentValue!);
                        modalProps.onClose();
                    },
                    disabled: currentValue === null
                }
            ]}
        >
            <section className={Margins.bottom16}>
                <Forms.FormTitle tag="h3">
                    Select Timezone
                </Forms.FormTitle>

                <SearchableSelect
                    options={options}
                    value={options.find(o => o.value === currentValue)}
                    placeholder={"Select a Timezone"}
                    maxVisibleItems={5}
                    closeOnSelect={true}
                    onChange={v => setCurrentValue(v)}
                />
            </section>
        </Modal>
    );
}
