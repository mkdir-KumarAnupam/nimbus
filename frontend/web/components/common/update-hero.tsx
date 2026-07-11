import { SearchForm } from "@/components/flight/SearchForm";
import HeroBackground from "@/components/common/hero-background";

export function Hero() {
    return (
        <section className="relative overflow-hidden">

            <HeroBackground />

            <div className="relative container mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-center px-6 py-24">

                <div className="mx-auto max-w-3xl text-center">

                    <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
                        Find your next
                        <span className="text-primary"> journey.</span>
                    </h1>

                </div>

                <div className="mt-16 w-full">
                    <SearchForm />
                </div>

            </div>
        </section>
    );
}