import * as allure from 'allure-js-commons';

const TAG_PREFIXES = {
  epic: '@epic:',
  feature: '@feature:',
  story: '@story:',
  severity: '@severity:',
} as const;

export function mapTagsToAllure(tags: string[]): void {
  for (const tag of tags) {
    if (tag.startsWith(TAG_PREFIXES.epic)) {
      void allure.epic(tag.slice(TAG_PREFIXES.epic.length));
    } else if (tag.startsWith(TAG_PREFIXES.feature)) {
      void allure.feature(tag.slice(TAG_PREFIXES.feature.length));
    } else if (tag.startsWith(TAG_PREFIXES.story)) {
      void allure.story(tag.slice(TAG_PREFIXES.story.length));
    } else if (tag.startsWith(TAG_PREFIXES.severity)) {
      const severity = tag.slice(TAG_PREFIXES.severity.length) as
        | 'blocker'
        | 'critical'
        | 'normal'
        | 'minor'
        | 'trivial';
      void allure.severity(severity);
    }
  }
}
