import { useRouter } from "next/router";

export default function handleRedirect(href) {
  const router = useRouter();
  router.push(href);
}
