import CardSexBar from "@/components/names/card/CardSexBar";
import type { CardDerived } from "@/lib/names/types";
import Section from "./Section";

/**
 * FR-D14 (board 14): "בנים ובנות, מאז 1949" over the card's boys/girls bar, which already
 * spans the sheet's width and reads as one image with barLabel().
 */
export default function SexSection(props: Pick<CardDerived, "boysShare" | "boysLabel" | "girlsLabel">) {
  return (
    <Section label="בנים ובנות, מאז 1949">
      <CardSexBar {...props} />
    </Section>
  );
}
