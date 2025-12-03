import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <main className="mx-auto max-w-2xl px-6 py-24 md:py-32">
        {/* Logo */}
        <div className="mb-20">
          <img
            src="/vesperiongate1.svg"
            alt="VesperionGate"
            width="80"
            height="80"
            className="invert"
          />
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-white md:text-5xl">
          Vesperion Gate Inc.
        </h1>
        <p className="mb-20 text-xl text-neutral-400">Manifesto</p>

        {/* Section: We stand at the threshold */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-medium text-white">
            We stand at the threshold.
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-neutral-300">
            There is a place beyond the edge of the known, a coordinate whispered
            in the language of stars, a waypoint where the familiar ends and the
            infinite begins. We call it <strong className="text-white">Vesperion Gate</strong>.
          </p>
          <p className="text-lg leading-relaxed text-neutral-300">
            We are not building software. We are building passage.
          </p>
        </section>

        <hr className="mb-16 border-neutral-800" />

        {/* Section: At the Edge of Evening */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-medium text-white">
            At the Edge of Evening
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-neutral-300">
            The name carries the light of the evening star, that luminous moment
            when day yields to night, when certainty dissolves into possibility.
            This is where we operate: in the liminal space between what is and
            what could be.
          </p>
          <p className="text-lg leading-relaxed text-neutral-300">
            We believe the most important work happens at boundaries. Where
            disciplines meet. Where assumptions falter. Where new futures
            crystallize from the void.
          </p>
        </section>

        <hr className="mb-16 border-neutral-800" />

        {/* Section: Ancient and Uncharted */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-medium text-white">
            Ancient and Uncharted
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-neutral-300">
            Our name echoes the languages of forgotten civilizations yet names
            no place that has ever existed. It is a coordinate invented for a
            destination not yet reached.
          </p>
          <p className="mb-6 text-lg leading-relaxed text-neutral-300">
            This is intentional.
          </p>
          <p className="text-lg leading-relaxed text-neutral-300">
            We are cartographers of the unmapped. We name the territories we
            intend to claim. We build the gates through which others will pass.
          </p>
        </section>

        <hr className="mb-16 border-neutral-800" />

        {/* Section: Our Principles */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-medium text-white">
            Our Principles
          </h2>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-neutral-300">
              <strong className="text-white">Cross the threshold.</strong> Every
              meaningful advance requires leaving safe ground. We embrace the
              frontier, not because it is comfortable, but because it is
              necessary.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300">
              <strong className="text-white">Build gates, not walls.</strong>{" "}
              Technology should open passages, not close them. We create tools
              that expand human capability, connect isolated knowledge, and
              reveal hidden paths.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300">
              <strong className="text-white">Honor the weight of deep time.</strong>{" "}
              We build with the patience of those who think in centuries. Quick
              wins matter less than lasting foundations.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300">
              <strong className="text-white">Remain at the edge.</strong> Success
              is not arrival, it is the perpetual pursuit of the next horizon.
              When we reach one gate, we seek the next.
            </p>
          </div>
        </section>

        <hr className="mb-16 border-neutral-800" />

        {/* Section: What We Believe */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-medium text-white">
            What We Believe
          </h2>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-neutral-300">
              We believe artificial intelligence is not a destination but a
              threshold, one of many that humanity must cross.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300">
              We believe civilization scale tools require civilization scale
              thinking.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300">
              We believe the evening star rises every night, and every night
              offers another chance to begin again.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300">
              We believe the unknown is not to be feared. It is to be named,
              mapped, and made navigable for those who follow.
            </p>
          </div>
        </section>

        <hr className="mb-16 border-neutral-800" />

        {/* Section: The Gate Awaits */}
        <section className="mb-20">
          <h2 className="mb-6 text-2xl font-medium text-white">
            The Gate Awaits
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-neutral-300">
            We are Vesperion Gate.
          </p>
          <p className="mb-4 text-lg leading-relaxed text-neutral-300">
            We are the waypoint at the edge of the known.
          </p>
          <p className="text-lg leading-relaxed text-neutral-300">
            We are the passage into what comes next.
          </p>
        </section>

        <hr className="mb-16 border-neutral-800" />

        {/* Section: Opinionated Views */}
        <section className="mb-16">
          <h2 className="mb-12 text-3xl font-medium text-white">
            Opinionated Views
          </h2>

          <div className="space-y-10">
            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">01. AI should vanish into usefulness.</strong>{" "}
                The best tool disappears into the work. If users are thinking
                about the AI, the AI has failed. Intelligence in service of
                action, never on display for its own sake.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">02. Local first is survival.</strong>{" "}
                Cloud dependency is a single point of failure dressed as
                convenience. Data that lives only on distant servers is data
                held hostage. Build for the disconnected case first.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">03. The terminal will outlive every GUI.</strong>{" "}
                Graphical interfaces chase trends. Command lines endure. Text
                in, text out, the most durable interface pattern in computing
                history. We do not abandon what works.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">04. Defaults are decisions.</strong>{" "}
                Most users never change settings. The default configuration is
                the product for ninety percent of people. Agonize over defaults.
                They are the only choice most will ever make.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">05. Dependencies are future liabilities.</strong>{" "}
                Every external library is a bet that strangers will maintain
                code you cannot live without. Fewer dependencies, fewer failure
                modes. Vendoring is not paranoia, it is prudence.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">06. Open formats are the only formats.</strong>{" "}
                Proprietary file types are cages. Data locked in undocumented
                structures is data under someone else&apos;s control. Plain text,
                open standards, documented schemas. Always.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">07. Speed is respect.</strong>{" "}
                Every millisecond of latency is a small theft of human time.
                Fast software says: your attention matters. Slow software says:
                wait for us. We do not make people wait.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">08. Errors should teach.</strong>{" "}
                A cryptic error message is a door slammed shut. A good error
                message is a map. Tell people what went wrong, why, and how to
                fix it. Failure is instruction.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">09. Keyboard first acknowledges expertise.</strong>{" "}
                Point and click is for discovery. Keyboard shortcuts are for
                mastery. Software that only offers the mouse has decided its
                users will never become experts.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">10. Documentation is product.</strong>{" "}
                Undocumented features do not exist. The manual is not an
                afterthought, it is part of the build. If you cannot explain it
                clearly, you have not finished building it.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">11. Logs are messages to your future self.</strong>{" "}
                When the system fails at 3 AM, logs are the only witness. Write
                them as if you are the one who will be reading them, exhausted
                and confused, six months from now.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">12. Names carry weight.</strong>{" "}
                Variables, functions, products, and companies. Naming is the first
                design decision and it echoes through everything that follows.
                Bad names create permanent confusion. Choose with care.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">13. Backwards compatibility is a promise.</strong>{" "}
                Breaking changes break trust. When people build on your work,
                you inherit an obligation to them. Stability is not stagnation, it
                is reliability.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">14. Data export is non-negotiable.</strong>{" "}
                Users must be able to leave with everything they brought and
                everything they created. Lock-in is a confession that you cannot
                compete on merit. Let people go.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">15. The best features are removals.</strong>{" "}
                Addition is easy. Subtraction requires courage. Every feature
                carries maintenance cost forever. Sometimes the bravest choice
                is to delete.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">16. Complexity compounds.</strong>{" "}
                Simple systems grow complex slowly. Complex systems collapse
                suddenly. Every unnecessary abstraction is debt with interest.
                Refuse complexity until you cannot.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">17. Offline is the real test.</strong>{" "}
                If the network disappears, what still works? That is your actual
                product. Everything else is a service dependency. Build the core
                to function in silence.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">18. Browser tabs are a symptom.</strong>{" "}
                When users keep twenty tabs open to use your product, you have
                not built a tool. You have built a scavenger hunt. Consolidate
                context. Reduce cognitive load.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">19. Dark patterns are engineering failures.</strong>{" "}
                Tricking users into clicks is not growth, it is erosion of trust.
                Deceptive design is a confession that you could not earn
                attention honestly. We do not deceive.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">20. Subscriptions should be escapable.</strong>{" "}
                If cancellation requires a phone call, you are holding users
                hostage. The exit door should be as visible as the entrance.
                Confidence keeps customers, not friction.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">21. Notifications are interruptions.</strong>{" "}
                Every alert pulls someone out of focus. Default to silence. Earn
                the right to interrupt. Most things can wait, and most
                notifications should never have been sent.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">22. Privacy is architecture, not policy.</strong>{" "}
                Privacy policies describe intentions. Architecture determines
                reality. If the data does not exist, it cannot be breached.
                Collect less. Store less. The safest data is data you never had.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">23. Readable beats clever.</strong>{" "}
                Code is read far more often than it is written. Clever solutions
                that obscure intent are net negatives. Write for the next
                person. They will probably be you.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">24. Tests are specifications.</strong>{" "}
                A test suite is not a chore, it is a contract. Tests document
                what the system actually does, not what someone intended.
                Untested behavior is undefined behavior.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">25. Incremental change survives.</strong>{" "}
                Revolutionary rewrites fail far more often than incremental
                improvements. Small steps compound. Grand visions collapse under
                their own weight. Ship constantly.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">26. Version everything.</strong>{" "}
                Code, configuration, documentation, and infrastructure. If it can
                change, it should be tracked. History is debugging information.
                Snapshots are time travel.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">27. APIs are contracts.</strong>{" "}
                Every public interface is a promise to everyone who builds on
                it. Breaking an API is breaking every downstream system that
                trusted you. Treat it as law.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">28. Monoliths are underrated.</strong>{" "}
                Microservices have their place, but distributed systems multiply
                failure modes. A well-structured monolith is easier to
                understand, deploy, and debug. Do not distribute complexity
                prematurely.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">29. Caching is prophecy.</strong>{" "}
                Every cache is a bet about the future: this data will be needed
                again, unchanged. Most performance gains come from correct
                predictions. Understand what repeats.
              </p>
            </article>

            <article>
              <p className="text-lg leading-relaxed text-neutral-300">
                <strong className="text-white">30. Software should become invisible.</strong>{" "}
                The ultimate goal is not engagement, it is completion. Users
                should accomplish their purpose and leave. Attention retained
                beyond necessity is attention stolen.
              </p>
            </article>
          </div>
        </section>

        <hr className="mb-16 border-neutral-800" />

        {/* Footer */}
        <footer className="text-center">
          <p className="mb-4 text-lg italic text-neutral-400">
            At the threshold between light and dark, where new futures begin.
          </p>
          <p className="text-lg font-medium text-white">Vesperion Gate Inc.</p>
        </footer>

        {/* Policies Link */}
        <div className="mt-16 text-center">
          <Link href="/policies" className="text-neutral-500 hover:text-neutral-300 transition-colors">
            Policies
          </Link>
        </div>
      </main>
    </div>
  );
}
