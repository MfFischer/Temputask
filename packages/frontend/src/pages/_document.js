
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/icons/favicon.ico" />
          
          {/* Add preload for critical resources */}
          <link rel="preload" href="/_next/static/chunks/main.js" as="script" />
          <link rel="preload" href="/_next/static/chunks/webpack.js" as="script" />
          <link rel="preload" href="/_next/static/chunks/pages/_app.js" as="script" />
          
          {/* For static hosting, ensure essential styles are loaded */}
          <noscript>
            <style dangerouslySetInnerHTML={{ __html: 'body { opacity: 1 !important; }' }} />
          </noscript>
        </Head>
        <body>
          <Main />
          <NextScript />
          
          {/* Add a fallback for static hydration */}
          <script dangerouslySetInnerHTML={{ __html: `
            // Check if hydration failed
            setTimeout(function() {
              if (!window.__NEXT_HYDRATED) {
                console.log('Hydration may have failed. Attempting reload...');
                // Only attempt reload once
                if (!sessionStorage.getItem('attempted_reload')) {
                  sessionStorage.setItem('attempted_reload', 'true');
                  window.location.reload();
                }
              }
            }, 5000);
            
            // Mark as hydrated when Next.js initializes
            window.__NEXT_DATA__ && (window.__NEXT_HYDRATED = true);
          `}} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;