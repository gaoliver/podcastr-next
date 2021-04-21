export default function Home(props) {
  console.log(props.episodes)
  return (
    <h1>Index</h1>
  )
}

export async function getServerSideProps() {
  const response = await fetch('http://localhost:3001/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data
    }
  }
}