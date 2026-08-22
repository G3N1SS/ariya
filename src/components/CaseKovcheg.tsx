import { dict, contacts, type Locale } from "@/lib/dict";
import CasePendant from "./CasePendant";

// Страница кейса «Новый Ковчег»: общая для обеих локалей, тексты из dict.
// Скоуп .cpage-nk красит страницу в палитру самого проекта: крем/чернила/шампань
export default function CaseKovcheg({ locale }: { locale: Locale }) {
  const t = dict[locale].casePageNk;
  // «Новый Ковчег» → курсивно-золотое второе слово, как в лого продукта
  const [tFirst, ...tRest] = t.title.split(" ");
  return (
    <main className="cpage cpage-nk">
      {/* Д1: вход в зал — бархатный занавес, качающаяся люстра,
          Призма-хрусталь свисает подвеской на золотой цепочке */}
      <section className="nk-hero">
        <i className="nk-curtain l" aria-hidden="true" />
        <i className="nk-curtain r" aria-hidden="true" />
        <svg className="nk-chand" viewBox="0 0 170 96" aria-hidden="true">
          <line x1="85" y1="0" x2="85" y2="16" stroke="#c8a96a" strokeWidth="2.4" />
          <rect x="25" y="16" width="120" height="4.6" rx="2.3" fill="#c8a96a" />
          {[36, 60, 85, 110, 134].map((x, i) => (
            <ellipse key={x} className={`dr d${i}`} cx={x} cy={27.5} rx={3.1} ry={6} fill="#fff6e2" />
          ))}
          <rect x="53" y="40" width="64" height="4" rx="2" fill="#c8a96a" />
          {[64, 85, 106].map((x, i) => (
            <ellipse key={x} className={`dr d${i + 1}`} cx={x} cy={51} rx={2.8} ry={5.4} fill="#fff6e2" />
          ))}
          <circle cx="85" cy="18" r="2.6" fill="#e9d9ae" />
        </svg>
        <CasePendant />
        <div className="nk-hero-in">
          <a className="cp-back" href={t.backHref}>
            {t.back}
          </a>
          <div className="cp-head">
            <span className="cp-tag">{t.tag}</span>
            <span className="cp-client">{t.client}</span>
          </div>
          <h1>
            {tFirst} <em>{tRest.join(" ")}</em>
          </h1>
          <p className="cp-lead">{t.lead}</p>
          <a
            className="btn btn-primary"
            href={t.link}
            target="_blank"
            rel="noopener"
            data-magnetic
          >
            {t.play} ↗
          </a>
        </div>
      </section>

      <div className="cp-shots">
        {t.shots.map((sh) => (
          <figure key={sh.img}>
            <img src={sh.img} alt={sh.cap} width={500} height={693} loading="lazy" />
            <figcaption>{`— ${sh.cap}`}</figcaption>
          </figure>
        ))}
      </div>

      <section className="cp-sec">
        <h2>{t.taskH}</h2>
        <p>{t.taskText}</p>
      </section>

      <section className="cp-sec">
        <h2>{t.builtH}</h2>
        <ul className="cp-built">
          {t.built.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="cp-sec">
        <h2>{t.flowH}</h2>
        <div className="cp-flow">
          {t.flow.map((f) => (
            <div className="cp-step" key={f.n}>
              <span className="n">{`— ${f.n}`}</span>
              <b>{f.name}</b>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cp-sec">
        <h2>{t.moreH}</h2>
        <div className="cp-eras cpk-more">
          {t.more.map((m) => (
            <figure key={m.img}>
              <img src={m.img} alt={m.cap} width={500} height={693} loading="lazy" />
              <figcaption>{`— ${m.cap}`}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="cp-sec">
        <h2>{t.stackH}</h2>
        <div className="cl-stack">
          {t.stack.map((tech) => (
            <i key={tech}>{tech}</i>
          ))}
        </div>
      </section>

      <section className="cp-sec">
        <h2>{t.stagesH}</h2>
        <div className="cpk-stages">
          {t.stages.map((st) => (
            <div className={`cpk-stage${st.live ? " is-live" : ""}`} key={st.name}>
              <span className="st">{st.st}</span>
              <b>{st.name}</b>
              <p>{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cp-cta">
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
