import { dict, contacts, type Locale } from "@/lib/dict";
import CaseGuide from "./CaseGuide";
import CaseStrip from "./CaseStrip";

// Страница кейса «Новый уровень»: общая для обеих локалей, тексты из dict
export default function CaseNovy({ locale }: { locale: Locale }) {
  const t = dict[locale].casePage;
  return (
    <main className="cpage">
      {/* якорь большого Призмы в шапке: гид меряет его и стартует отсюда */}
      <div className="cp-pr-anchor" aria-hidden="true" />
      <CaseGuide t={t.guide} />
      <a className="cp-back" href={t.backHref}>
        {t.back}
      </a>
      <div className="cp-head">
        <span className="cp-tag">{t.tag}</span>
        <span className="cp-client">{t.client}</span>
      </div>
      <h1>{t.title}</h1>
      <p className="cp-lead">{t.lead}</p>
      <a
        className="btn btn-primary"
        href={t.link}
        target="_blank"
        rel="noopener"
        data-magnetic
      >
        {t.play}
      </a>

      <div className="cp-shots" data-cg="shots">
        {t.shots.map((sh) => (
          <figure key={sh.img}>
            <img src={sh.img} alt={sh.cap} width={500} height={693} loading="lazy" />
            <figcaption>{`// ${sh.cap}`}</figcaption>
          </figure>
        ))}
      </div>

      <section className="cp-sec" data-cg="task">
        <h2>{t.taskH}</h2>
        <p>{t.taskText}</p>
      </section>

      <section className="cp-sec" data-cg="built">
        <h2>{t.builtH}</h2>
        <ul className="cp-built">
          {t.built.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="cp-sec" data-cg="flow">
        <h2>{t.flowH}</h2>
        <div className="cp-flow">
          {t.flow.map((f) => (
            <div className="cp-step" key={f.n}>
              <span className="n">{`// ${f.n}`}</span>
              <b>{f.name}</b>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <CaseStrip t={t.strip} />

      <section className="cp-sec" data-cg="eras">
        <h2>{t.erasH}</h2>
        <p>{t.erasNote}</p>
        <div className="cp-eras">
          {t.eras.map((e) => (
            <figure key={e.img}>
              <img src={e.img} alt={e.cap} width={500} height={693} loading="lazy" />
              <figcaption>{`// ${e.cap}`}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="cp-sec" data-cg="stack">
        <h2>{t.stackH}</h2>
        <div className="cl-stack">
          {t.stack.map((tech) => (
            <i key={tech}>{tech}</i>
          ))}
        </div>
      </section>

      <section className="cp-cta" data-cg="cta">
        <b>{t.ctaH}</b>
        <a
          className="btn btn-primary"
          href={contacts.tg}
          target="_blank"
          rel="noopener"
          data-magnetic
        >
          {t.ctaBtn}
        </a>
      </section>
    </main>
  );
}
