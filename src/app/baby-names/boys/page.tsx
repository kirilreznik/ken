import ListPage, { listMetadata } from "@/components/babyNames/ListPage";

export const metadata = listMetadata("boys");

export default function Page() {
  return <ListPage id="boys" />;
}
