import "../styles/globals.css";
import Head from 'next/head';
import { AuthProvider } from "../context/AuthContext";

function App({ Component, pageProps }) {
  return (
      <>
          <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap" rel="stylesheet" />
          </Head>
          <AuthProvider>
              <Component {...pageProps} />
          </AuthProvider>
      </>
  );
}

export default App;

