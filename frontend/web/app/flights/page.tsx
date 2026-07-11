import FlightsClient from "./FlightsClient";

interface FlightsPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    passengers?: string;
    cabin?: string;
  }>;
}

export default async function FlightsPage({
  searchParams,
}: FlightsPageProps) {
  const params = await searchParams;

  return <FlightsClient searchParams={params} />;
}
