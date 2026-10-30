export function pathTemplateToRegex(template: string): RegExp {
  const escaped = template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = escaped.replace(/\\\{[^}]+\\\}/g, '[^/]+');
  return new RegExp(`^${pattern}$`);
}

export function matchPath(actualPath: string, templatePath: string): boolean {
  return pathTemplateToRegex(templatePath).test(actualPath);
}

export function findMatchingPath(
  actualPath: string,
  templatePaths: string[],
): string | undefined {
  return templatePaths.find((template) => matchPath(actualPath, template));
}
