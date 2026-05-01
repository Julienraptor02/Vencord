/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "NoPreviewFileLimit",
    description: "Allows you to fully preview files in chat",
    authors: [Devs.Julienraptor01],
    patches: [
        {
            find: 'Range:"bytes=0-50000",',
            replacement:
            {
                match: /50000/,
                replace: "",
            },
        },
    ],
});
