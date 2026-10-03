"use client";

import Link from "next/link";
import { useBirthPlan, useContacts, useDocuments, usePrepItems } from "@/lib/data";
import { useSession } from "@/lib/session";
import { fmtDay, fmtDayYear } from "@/lib/format";
import { weekInfo } from "@/lib/pregnancy";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-extrabold border-b border-[#ccc] pb-1 mt-5 mb-2">{children}</h2>;
}

export default function BirthPrint() {
  const { space, members } = useSession();
  const { plan } = useBirthPlan();
  const { data: contacts } = useContacts();
  const { data: docs } = useDocuments();
  const { data: prep } = usePrepItems();
  if (!space) return null;
  const wk = weekInfo(space.due_date);
  const bag = (prep ?? []).filter((p) => p.category === "birth_bag" && p.status !== "not_needed");

  return (
    <div dir="rtl" className="bg-white min-h-dvh text-[#111] print:text-black">
      <div className="max-w-[720px] mx-auto px-6 py-8 print:p-0">
        <div className="flex gap-2 mb-6 print:hidden">
          <Link href="/birth" className="btn btn-secondary">חזרה</Link>
          <button className="btn btn-primary" onClick={() => window.print()}>הדפסה / שמירה כ־PDF</button>
        </div>
        <h1 className="font-serif text-3xl">דף ללידה</h1>
        <p className="mt-1 text-[15px]">{members.map((m) => m.display_name).join(" ו")} · תאריך משוער {fmtDayYear(space.due_date)} · היום שבוע {wk.label}</p>

        <H>בית חולים</H>
        <p>{plan?.hospital_name ?? "—"}{plan?.hospital_ward ? ` · ${plan.hospital_ward}` : ""}</p>
        {plan?.hospital_phone && <p dir="ltr" className="text-right">{plan.hospital_phone}</p>}
        {plan?.hospital_address && <p>{plan.hospital_address}</p>}
        {plan?.tour_at && <p>סיור: {fmtDay(plan.tour_at)}</p>}

        <H>צוות</H>
        <p>{plan?.caregiver_name ?? "—"}{plan?.caregiver_phone ? ` · ${plan.caregiver_phone}` : ""}</p>
        {plan?.doula_status && <p>מיילדת / דולה: {plan.doula_status}</p>}

        <H>אנשי קשר</H>
        <table className="w-full text-[15px]"><tbody>
          {(contacts ?? []).slice().sort((a, b) => a.sort - b.sort).map((c) => (
            <tr key={c.id} className="border-b border-[#eee]"><td className="py-1.5 font-bold">{c.name}</td><td>{c.role}</td><td dir="ltr" className="text-left">{c.phone}</td></tr>
          ))}
        </tbody></table>

        <H>העדפות ללידה</H>
        <ul className="list-disc ps-5">{(plan?.preferences ?? []).map((p) => <li key={p}>{p}</li>)}</ul>
        {plan?.preferences_note && <p className="mt-1">{plan.preferences_note}</p>}

        <H>מסמכים חשובים</H>
        <ul className="list-disc ps-5">{(docs ?? []).filter((d) => d.pinned_for_birth).map((d) => <li key={d.id}>{d.title}</li>)}</ul>

        <H>תיק לידה</H>
        <ul className="columns-2 text-[15px]">{bag.map((b) => <li key={b.id}>☐ {b.title}</li>)}</ul>

        <H>מסלול</H>
        <p>{[plan?.travel_minutes_free ? `${plan.travel_minutes_free} דק׳ בלי פקקים` : null, plan?.travel_minutes_peak ? `${plan.travel_minutes_peak} דק׳ בעומס` : null].filter(Boolean).join(" · ") || "—"}</p>
        {plan?.parking && <p>חניה: {plan.parking}</p>}
        {plan?.route_notes && <p>{plan.route_notes}</p>}
      </div>
    </div>
  );
}
