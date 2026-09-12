import { Children, type ComponentType } from 'react';
import type { AppProps } from 'next/app';
import Document, {
  type DocumentContext,
  type DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';

import { createMystiqueCache } from '../src/emotion-cache';
import type { FixtureAppProps } from './_app';

export default class FixtureDocument extends Document {
  static async getInitialProps(
    context: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const originalRenderPage = context.renderPage;
    const cache = createMystiqueCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);

    context.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => {
          const EmotionApp = App as ComponentType<FixtureAppProps>;
          const EnhancedApp = (props: AppProps) => (
            <EmotionApp {...props} emotionCache={cache} />
          );
          return EnhancedApp as typeof App;
        },
      });

    const initialProps = await Document.getInitialProps(context);
    const critical = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = critical.styles.map((style) => (
      <style
        key={`${style.key}-${style.ids.join('-') || 'global'}`}
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    return {
      ...initialProps,
      styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags],
    };
  }

  render() {
    return (
      <Html lang="en" data-fixture="next16-smoke" data-smoke="pages-document">
        <Head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <meta name="mystique-pages-ssr" content="emotion-extracted" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
