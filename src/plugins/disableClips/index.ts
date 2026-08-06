/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "DisableClips",
    description: "Disables the clips feature completely",
    authors: [Devs.Nuckyz],

    patches: [
        {
            find: '"ClipsStore"',
            replacement: [
                {
                    match: /initialize\(\i\){/,
                    replace: "$&return;"
                },
                {
                    match: /(class (\i) extends.{0,100}?"ClipsStore".+?(\i)=new \2\(\i\.\i,{).+?(}\),\i=\3)/,
                    replace: (_, beforeFluxListeners, _classVariableName, _instanceVariableName, afterFluxListeners) => beforeFluxListeners + afterFluxListeners
                }
            ]
        }
    ]
});
