import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'index',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: [
        'getting-started/index',
        'getting-started/provider',
        'getting-started/styling',
        'getting-started/next',
        'getting-started/typegen',
        'getting-started/migration',
      ],
    },
    {
      type: 'category',
      label: 'Foundations',
      items: [
        'foundations/tokens',
        'foundations/semantic-tokens',
        'foundations/responsive',
        'foundations/conditions',
        'foundations/utilities',
        'foundations/css-layers',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/factory',
        'concepts/polymorphism',
        'concepts/css',
        'concepts/cva',
        'concepts/sva',
        'concepts/recipes',
        'concepts/slot-recipes',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        'components/overview',
        'components/box',
        'components/flex',
        'components/center',
        'components/square',
        'components/circle',
        'components/span',
        'components/text',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/exports',
        'reference/accessibility',
        'reference/upstream',
      ],
    },
  ],
};

export default sidebars;
