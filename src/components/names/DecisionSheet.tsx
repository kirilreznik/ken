"use client";

import { Suspense } from "react";
import { createPortal } from "react-dom";
import NestCard from "@/components/names/NestCard";
import MomentSheet from "@/components/names/MomentSheet";
import { Button } from "@/components/names/ui";
import { closeSheet, useLayerOpen } from "@/components/names/ui/layers";
import { usePortalHost } from "@/components/names/ui/useModal";
import { useNameStats } from "@/components/names/useCards";
import { clearChoiceLabel, decisionTitle } from "@/lib/names/launch";
import { countLine } from "@/lib/names/popularity";

type DecisionSheetProps = {
  /** The chosen name in this space; null when none. */
  name: string | null;
  shared: boolean;
  /** "לשנות את הבחירה": takes the choice back. */
  onClear: () => void;
};

/**
 * The "בחרנו שם" moment (?sheet=decision, product review step 4): the chosen name on the
 * match sheet's look, a way back, then the Nest app card. Ink and a clay dot like the match
 * sheet; no confetti.
 */
export default function DecisionSheet(props: DecisionSheetProps) {
  return (
    <Suspense fallback={null}>
      <Gate {...props} />
    </Suspense>
  );
}

function Gate(props: DecisionSheetProps) {
  const open = useLayerOpen("sheet", "decision");
  const host = usePortalHost();
  if (!open || !props.name || !host) return null;
  return createPortal(<Panel {...props} name={props.name} />, host);
}

function Panel({ name, shared, onClear }: DecisionSheetProps & { name: string }) {
  const { names } = useNameStats();
  const close = () => closeSheet("decision");
  const stats = names?.get(name);

  return (
    <MomentSheet
      label={`${decisionTitle(shared)}: ${name}`}
      eyebrow={decisionTitle(shared)}
      name={name}
      line="מזל טוב. השם נשמר כאן, ואפשר לשנות אותו בכל רגע."
      meta={stats ? countLine(stats) : null}
      onClose={close}
      actions={
        <>
          <Button onClick={close}>חזרה לרשימה</Button>
          <Button
            variant="link"
            className="self-center"
            onClick={() => {
              onClear();
              close();
            }}
          >
            {clearChoiceLabel(name)}
          </Button>
        </>
      }
    >
      {/* The side offer comes after the sheet's own actions, so they stay above the fold. */}
      <NestCard placement="decision" />
    </MomentSheet>
  );
}
