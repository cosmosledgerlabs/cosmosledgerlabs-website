// pages/demo.js
// This page immediately redirects /demo to /flow.

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/flow',
      permanent: false,
    },
  };
}

export default function Demo() {
  return null;
}
