export function formatSwaggerRef(ref: any) {
  return { $ref: `#/components/schemas/${ref}` };
}
