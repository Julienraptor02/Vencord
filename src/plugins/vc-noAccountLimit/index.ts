/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "NoAccountLimit",
    description: "Allows you to add as many accounts as you want",
    authors: [Devs.HAHALOSAH],
    patches: [
        {
            find: '"switch-accounts-modal"',
            replacement: {
                match: "=5",
                replace: "=Infinity"
            },
        },
    ],
});
