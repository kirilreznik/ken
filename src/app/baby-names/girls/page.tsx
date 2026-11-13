import ListPage, { listMetadata } from "@/components/babyNames/ListPage";

export const metadata = listMetadata("girls");

export default function Page() {
  return <ListPage id="girls" />;
}
