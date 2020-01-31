import Layout from "../components/Layout";
import Link from "next/link";
const PostLink = props => (
  <li>
    <Link as={`/p/${props.id}`} href={`/post?title=${props.title}`}>
      <a>{props.title}</a>
    </Link>
  </li>
);
const Index = () => (
  <Layout>
    <h1>My blog</h1>
    <ul>
      <PostLink id="hello-nextjs" title="Hello Next.js" />
      <PostLink id="learn-nextjs" title="Learn Next.js Magic !" />
      <PostLink id="build-nextjs" title="Build" />
      <PostLink id="deploy-nextjs" title="Deploy With Zeit" />
    </ul>
  </Layout>
);
export default Index;
