import Link from "next/link";

interface LandingPageProps {
  coupleName: string;
  templateImageUrl: string;
  slug: string;
}

export function LandingPage({ coupleName, templateImageUrl, slug }: LandingPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={templateImageUrl}
        alt={`${coupleName} wedding invitation`}
        className="w-full h-full object-contain"
      />
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex justify-center">
          <Link
            href={`/w/${slug}/rsvp`}
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg px-8 py-6 font-medium hover:bg-primary/80 transition-colors"
          >
            RSVP Now
          </Link>
        </div>
      </div>
    </div>
  );
}
