import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'Mystique Mini',
  tagline:
    'A compact React 19 design system with an explicit styled-system core.',
  url: 'https://gabrielmnzs.github.io',
  baseUrl: '/mystique-mini/',
  trailingSlash: true,
  organizationName: 'gabrielmnzs',
  projectName: 'mystique-mini',
  deploymentBranch: 'gh-pages',
  onBrokenLinks: 'throw',
  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'icon', href: 'data:,' },
    },
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/gabrielmnzs/mystique-mini/edit/main/apps/docs/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Mystique Mini',
      items: [
        { to: '/', label: 'Docs', position: 'left' },
        { to: '/components/overview/', label: 'Components', position: 'left' },
        { to: '/reference/exports/', label: 'API', position: 'left' },
        {
          href: 'https://github.com/gabrielmnzs/mystique-mini',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            { label: 'Getting started', to: '/getting-started/' },
            { label: 'Foundations', to: '/foundations/tokens/' },
            { label: 'Concepts', to: '/concepts/factory/' },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'Exports', to: '/reference/exports/' },
            { label: 'Upstream', to: '/reference/upstream/' },
            {
              label: 'Source',
              href: 'https://github.com/gabrielmnzs/mystique-mini',
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Mystique Mini. MIT licensed.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
