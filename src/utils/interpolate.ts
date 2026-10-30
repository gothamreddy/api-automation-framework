export function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    if (!(name in variables)) {
      throw new Error(`Missing variable "{${name}}" for interpolation in: ${template}`);
    }
    return variables[name];
  });
}
