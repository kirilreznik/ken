import ListPage, { listMetadata } from "@/components/babyNames/ListPage";

export const metadata = listMetadata("unisex");

export default function Page() {
  return <ListPage id="unisex" />;
}
