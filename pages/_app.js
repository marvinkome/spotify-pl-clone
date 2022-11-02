import Head from "next/head";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    body: "'Inter', sans-serif",
    heading: "'Inter', sans-serif",
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Peetch</title>
        <meta name="description" content="Clone any spotify playlists" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
