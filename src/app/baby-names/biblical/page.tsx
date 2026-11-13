import ListPage, { listMetadata } from "@/components/babyNames/ListPage";

export const metadata = listMetadata("biblical");

export default function Page() {
  return <ListPage id="biblical" />;
}
