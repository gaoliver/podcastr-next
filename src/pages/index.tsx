export default function Home(props) {
  return (
    <>
      <h1>Página principal (em desenvolvimento)</h1>
      <br />
      <ul>
        {props.episodes.map((ep) => (
          <li key={ep.id} style={{ marginTop: '15px' }}>{ep.title}</li>
        ))}
      </ul>
    </>

  )
}

// export async function getServerSideProps() {   /// Server Side Render (SSR)
export async function getStaticProps() {          /// Static Site Generator
  const response = await fetch('http://localhost:3001/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data
    },
    /* For SSG - in seconds. The request will be done each 8 hours. */
    revalidate: 60 * 60 * 8
  }
}