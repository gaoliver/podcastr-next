import { format, parseISO } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import ptBR from "date-fns/locale/pt-BR"
import { GetStaticProps } from "next"
import { api } from "../services/api"
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString"

import styles from "./home.module.scss"

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
  return (
    <div className={styles.homePage}>
      {/* Destques */}
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {props.latestEpisodes.map(ep => (
            <li key={ep.id}>
              <Image
                width={192}
                height={192}
                src={ep.thumbnail}
                alt={ep.title}
                objectFit="cover"
              />

              <div className={styles.episodeDetails}>
                <Link href={`/episodes/${ep.id}`}>
                  <a>{ep.title}</a>
                </Link>
                <p>{ep.members}</p>
                <span>{ep.publishedAt}</span>
                <span>{ep.durationAsString}</span>
              </div>

              <button type="button">
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
            {props.allEpisodes.map(ep => (
              <tr key={ep.id}>
                <td>
                  <Image
                    width={120}
                    height={120}
                    src={ep.thumbnail}
                    alt={ep.title}
                    objectFit="cover"
                  />
                </td>
                <td>
                  <Link href={`/episodes/${ep.id}`}>
                    <a>{ep.title}</a>
                  </Link>
                </td>
                <td>{ep.members}</td>
                <td>{ep.publishedAt}</td>
                <td>{ep.durationAsString}</td>
                <td>
                  <button type="button">
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

  const episodes = data.map((ep) => {
    return {
      id: ep.id,
      title: ep.title,
      thumbnail: ep.thumbnail,
      members: ep.members,
      publishedAt: format(parseISO(ep.published_at), "d MMM yy", { locale: ptBR }),
      duration: Number(ep.file.duration),
      durationAsString: convertDurationToTimeString(Number(ep.file.duration)),
      description: ep.description,
      url: ep.file.url
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