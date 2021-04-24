import { format, parseISO } from "date-fns"
import ptBR from "date-fns/locale/pt-BR"
import { api } from "../../services/api"
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { GetStaticPaths, GetStaticProps } from "next"

import styles from "./episode.module.scss"
import { usePlayer } from "../../contexts/PlayerContext"

type Episode = {
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
type EpisodeProps = {
    episode: Episode;
}

export default function Episode(props: EpisodeProps) {
    const { play } = usePlayer()

    return (
        <div className={styles.container}>
            <div className={styles.episode}>
                <div className={styles.thumbnailContainer}>
                    <Link href="/">
                        <button type="button">
                            <img src="/arrow-left.svg" alt="Voltar" />
                        </button>
                    </Link>
                    <Image width={700} height={160} src={props.episode.thumbnail} objectFit="cover" />
                    <button type="button" onClick={() => play(props.episode)}>
                        <img src="/play.svg" alt="Reproduzir episódio" />
                    </button>
                </div>

                <header>
                    <h1>{props.episode.title}</h1>
                    <span>{props.episode.members}</span>
                    <span>{props.episode.publishedAt}</span>
                    <span>{props.episode.durationAsString}</span>
                </header>

                <div className={styles.description} dangerouslySetInnerHTML={{ __html: props.episode.description }} />
            </div>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get("episodes", {
        params: {
            _limit: 2,
            _sort: "published_at",
            _order: "desc"
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: "blocking"
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params;
    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), "d MMM yy", { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url
    }

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24,
    }
}