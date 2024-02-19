import { z } from "zod";

import { AvailabilityEnum } from "~/constants";

export const NewRuleSchema = z
    .object({
        name: z.string().trim().min(1).max(19),
        availabilityChoice: z.nativeEnum(AvailabilityEnum),
        rule: z.string().trim(),
        startDate: z.string().datetime().pipe(z.coerce.date()),
        userId: z.number().min(1),
    })
    .strict();

export const EditedRuleSchema = z
    .object({
        name: z.string().trim().min(1).max(19),
        availabilityChoice: z.nativeEnum(AvailabilityEnum),
        rule: z.string().trim(),
        userId: z.number().min(1),
    })
    .strict();

export const parsedRuleSchema = z
    .object({
        FREQ: z.string().optional(),
        INTERVAL: z.string().optional(),
        BYDAY: z.string().optional(),
    })
    .strict();
