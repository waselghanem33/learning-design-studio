# UCL Learning Designer LDJ export — beta

Based on the user-provided `test1.ldj` sample, with root fields `name,type,author,exportedOn,topic,learningTime,groupSize,description,modeOfDelivery,aims,outcomes,activities,designedTime,user_generated_charts`. Each activity contains `title,resources,notes,teachingMethod,slas,isCustom`; each SLA contains `type,assessmentType,groupSize,groupSizeSameAsSession,duration,tutorAvailable,onlineActivity,syncActivity,resources,description`.

The Design Laboratory has an **Export UCL LDJ (beta)** button. The generator serializes these observed fields, and validates module name, activity titles, types, and positive durations.

**Compatibility status:** structural mapping based on one genuine LDJ sample; not yet verified by a round-trip import into the live UCL tool. Keep the branch unmerged until tested.

**Known lossy mappings:** Acquisition becomes `Read` (not necessarily Watch/Listen); each Studio activity becomes one UCL activity containing one SLA; Before/During/After is stored in activity notes; assessment text goes into assessmentType (may require controlled vocabulary); group size defaults to 1 if not numeric; teacher presence and online/synchronous flags are heuristically inferred; outcomes are plain strings (sample had an empty outcomes array); course/problem map to topic/description/aims; resource URLs are not separated into LDJ resource objects. Session-level group size defaults to 1.

**Acceptance test:** Export a six-type design, import it into UCL Learning Designer, inspect all fields, export again, compare semantic equivalence. Correct any differences before production release. Preserve Studio JSON export for lossless backups.
