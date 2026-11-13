import ListPage, { listMetadata } from "@/components/babyNames/ListPage";

export const metadata = listMetadata("rising");

export default function Page() {
  return <ListPage id="rising" />;
}
