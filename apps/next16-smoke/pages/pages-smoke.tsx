import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { PagesRouterSurface } from '../src/smoke-ui'

export const getServerSideProps = (async () => ({
  props: { ssrMarker: 'pages-server-rendered' },
})) satisfies GetServerSideProps<{ ssrMarker: string }>

export default function PagesSmokePage({
  ssrMarker,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <PagesRouterSurface fixture="next16" ssrMarker={ssrMarker} />
}
