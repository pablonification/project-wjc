// app/kegiatan/[slug]/payment/success/page.jsx
import { performRequest } from "../../../../../lib/datocms";
import { KEGIATAN_DETAIL_QUERY } from "../../../../../lib/queries";
import PaymentSuccessClient from "./PaymentSuccessClient";
import { notFound } from "next/navigation";
import { cookies } from "next/headers"; 

async function fetchFromAPI(endpoint) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      Cookie: cookies().toString(),
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function PaymentSuccessPage({ params }) {
  const { slug } = params;

  const [userResponse, activityResponse, waSetting] = await Promise.all([
    fetchFromAPI("/api/user/profile"),
    performRequest({ query: KEGIATAN_DETAIL_QUERY, variables: { slug } }),
    fetchFromAPI("/api/admin/settings/wa-kegiatan"),
  ]);

  const activity = activityResponse?.kegiatan;
  const user = userResponse?.user;
  const waNumber = waSetting?.number || "6281234567890";

  if (!activity || !user) {
    notFound();
  }

  const allRegistrations = await fetchFromAPI("/api/admin/activity-registrations");
  const registration = allRegistrations?.find(
    (reg) => reg.user.id === user.id && reg.activity.id === activity.id
  );
  
  if (!registration) {
      console.error(`Registrasi tidak ditemukan untuk user ${user.id} dan kegiatan ${activity.id}`);
      notFound();
  }

  return (
    <PaymentSuccessClient
      data={{ activity, registration, waNumber }}
    />
  );
}