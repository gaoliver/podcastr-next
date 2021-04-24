import { format, parseISO } from "date-fns"
import Image from "next/image"
import Head from "next/head"
import Link from "next/link"
import ptBR from "date-fns/locale/pt-BR"
import { GetStaticProps } from "next"
import { api } from "../services/api"
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString"

import styles from "./home.module.scss"
import { usePlayer } from "../contexts/PlayerContext"

interface Episode {
  id: string,
  title: string,
  thumbnail: string,
  members: string,
  publishedAt: Date,
  duration: number,
  durationAsString: string,
  description: string,
  url: string,
}
type HomeProps = {
  latestEpisodes: Episode[],
  allEpisodes: Episode[]
}

export default function Home(props: HomeProps) {
  const { playList } = usePlayer()

  const episodeList = [...props.latestEpisodes, ...props.allEpisodes]

  return (
    <div className={styles.homePage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>

      {/* Destques */}
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {props.latestEpisodes.map((episode, index) => (
            <li key={episode.id}>
              <Image
                width={192}
                height={192}
                src={episode.thumbnail}
                alt={episode.title}
                objectFit="cover"
              />

              <div className={styles.episodeDetails}>
                <Link href={`/episodes/${episode.id}`}>
                  <a>{episode.title}</a>
                </Link>
                <p>{episode.members}</p>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
              </div>

              <button type="button" onClick={() => playList(episodeList, index)}>
                <img src="/play-green.svg" alt="Reproduzir episódio" />
              </button>
            </li>
          ))}
        </ul>
      </section>
      {/* Todos os episódios */}
      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </thead>
          <tbody>
            {props.allEpisodes.map((episode, index) => (
              <tr key={episode.id}>
                <td>
                  <Image
                    width={120}
                    height={120}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                  />
                </td>
                <td>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                </td>
                <td>{episode.members}</td>
                <td>{episode.publishedAt}</td>
                <td>{episode.durationAsString}</td>
                <td>
                  <button type="button" onClick={() => playList(episodeList, index + props.latestEpisodes.length)}>
                    <img src="/play-green.svg" alt="Reproduzir episódio" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>

  )
}

// export async function getServerSideProps() {   /// Server Side Render (SSR)
export const getStaticProps: GetStaticProps = async () => {       /// Static Site Generator
  const { data } = await api.get("episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc"
    }
  })

  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), "d MMM yy", { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url
    }
  })

  const latestEpisodes = episodes.slice(0, 2)
  const allEpisodes = episodes.slice(0, episodes.length)

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    /* For SSG - in seconds. The request will be done each 8 hours. */
    revalidate: 60 * 60 * 8
  }
}