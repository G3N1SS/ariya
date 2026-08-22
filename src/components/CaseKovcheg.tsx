import { Playfair_Display } from "next/font/google";
import { dict, contacts, type Locale } from "@/lib/dict";
import CasePendant from "./CasePendant";
import Reveals from "./fx/Reveals";

// голос продукта: тот же Playfair, что и в самом лендинге ковчега
const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-nk",
});

// Страница кейса «Новый Ковчег»: общая для обеих локалей, тексты из dict.
// Скоуп .cpage-nk красит страницу в палитру самого проекта: крем/чернила/шампань
export default function CaseKovcheg({ locale }: { locale: Locale }) {
  const t = dict[locale].casePageNk;
  // «Новый Ковчег» → курсивно-золотое второе слово, как в лого продукта
  const [tFirst, ...tRest] = t.title.split(" ");
  return (
    <main className={`cpage cpage-nk ${playfair.variable}`}>
      <Reveals />
      {/* бумажное зерно поверх всей страницы и водяной вензель в поле */}
      <div className="nk-grain" aria-hidden="true" />
      <svg className="nk-wm" viewBox="0 0 537 210" fill="currentColor" fillRule="evenodd" aria-hidden="true">
        {/* водяной знак: фирменный «ковчег на волне» из лендинга клиента */}
        <path d="M402.83,11.5 406.5,11.0 409.84,14.5 430.29,43.5 443.8,61.5 444.32,62.5 443.5,63.08 439.5,63.14 428.5,64.94 427.5,64.21 411.11,40.5 401.5,25.1 400.24,25.5 393.87,36.5 374.73,65.5 372.5,66.64 333.5,70.11 205.5,84.93 189.5,86.15 186.5,86.91 152.5,89.94 144.5,90.25 142.99,89.5 162.11,60.5 168.5,52.09 173.5,51.82 207.5,46.07 211.5,45.9 325.5,25.84 402.83,11.5ZM377.5,36.31 371.5,38.85 358.5,42.85 316.5,52.83 241.5,66.81 214.5,71.1 207.5,72.86 202.5,73.22 197.7,74.5 198.5,75.47 203.5,74.21 208.5,73.93 238.5,69.14 252.5,67.81 270.5,65.07 284.5,63.77 293.5,62.1 354.5,54.78 358.5,53.91 363.5,50.73 377.91,37.5 378.77,36.5 377.5,36.31ZM484.37,46.5 488.5,46.22 489.05,47.5 488.95,74.5 487.91,93.5 485.87,112.5 481.88,134.5 477.88,150.5 474.95,158.5 475.5,158.86 476.77,157.5 481.5,149.5 485.96,140.5 490.98,126.5 495.89,105.5 497.91,91.5 499.23,71.5 500.5,70.76 514.5,68.99 515.44,70.5 513.81,90.5 511.77,103.5 508.86,116.5 502.87,135.5 498.92,144.5 492.93,154.5 486.89,162.5 480.5,168.86 472.5,174.82 464.5,178.91 449.5,183.85 449.04,182.5 450.94,179.5 458.92,159.5 463.69,141.5 466.83,125.5 469.64,101.5 470.82,80.5 470.98,56.5 470.06,47.5 470.5,46.92 484.37,46.5ZM451.76,74.5 455.5,73.97 456.68,74.5 455.81,88.5 455.47,89.5 454.5,89.99 424.5,91.15 385.5,94.19 301.5,102.07 217.5,110.93 142.5,116.86 133.5,117.0 132.5,116.5 131.05,108.5 131.5,105.12 174.5,101.9 215.5,97.83 403.5,78.14 451.76,74.5ZM451.85,102.5 454.5,102.23 455.28,103.5 453.98,116.5 452.5,117.99 431.5,118.06 405.5,120.16 378.5,123.21 345.5,127.9 317.5,130.86 274.5,133.93 194.5,137.16 142.5,140.16 136.5,140.98 135.12,140.5 133.3,131.5 134.5,130.97 167.5,129.86 240.5,125.85 291.5,121.79 343.5,115.83 402.5,107.18 439.5,103.24 451.85,102.5ZM100.11,104.5 113.5,104.0 114.88,105.5 116.17,120.5 120.14,143.5 121.01,145.5 120.5,147.07 110.5,147.07 109.4,146.5 108.18,144.5 105.3,136.5 102.25,123.5 100.12,111.5 100.11,104.5ZM448.49,131.5 450.65,131.5 450.91,133.5 448.26,142.5 447.95,145.5 446.5,147.09 392.5,149.85 360.5,150.21 334.5,149.81 310.5,147.89 305.56,146.5 346.5,142.85 415.5,134.17 448.49,131.5ZM192.76,150.5 219.5,150.23 242.5,151.17 276.5,154.1 311.5,159.07 345.5,165.21 418.5,182.88 442.5,186.87 457.5,187.97 480.5,187.84 489.5,186.7 498.5,184.74 506.5,182.01 507.06,182.5 502.5,186.88 497.5,189.91 490.5,192.97 481.5,195.92 463.5,198.94 449.5,199.47 428.5,198.88 417.5,197.86 383.5,192.81 330.5,182.13 293.5,176.11 277.5,174.07 244.5,171.11 207.5,170.01 162.5,171.17 135.5,173.13 109.5,176.12 66.5,183.27 34.5,190.15 20.5,193.85 11.5,195.42ZM440.41,158.5 443.5,158.08 444.11,158.5 443.83,160.5 437.93,173.5 436.5,174.68 427.5,173.92 414.5,171.84 399.5,167.88 390.17,164.5 396.5,163.2 440.41,158.5Z" />
      </svg>
      {/* Д1: вход в зал — бархатный занавес, качающаяся люстра,
          Призма-хрусталь свисает подвеской на золотой цепочке */}
      <section className="nk-hero">
        <i className="nk-curtain l" aria-hidden="true" />
        <i className="nk-curtain r" aria-hidden="true" />
        <i className="nk-tassel tl" aria-hidden="true" />
        <i className="nk-tassel tr" aria-hidden="true" />
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
          <figure key={sh.img} data-reveal>
            <img src={sh.img} alt={sh.cap} width={500} height={693} loading="lazy" />
            <figcaption>{`— ${sh.cap}`}</figcaption>
          </figure>
        ))}
      </div>

      <section className="cp-sec" data-chapter={`${t.ch} 01`}>
        <h2 data-reveal>{t.taskH}</h2>
        <p data-reveal>{t.taskText}</p>
      </section>

      <section className="cp-sec" data-chapter={`${t.ch} 02`}>
        <h2 data-reveal>{t.builtH}</h2>
        <ul className="cp-built" data-reveal>
          {t.built.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="cp-sec" data-chapter={`${t.ch} 03`}>
        <h2 data-reveal>{t.flowH}</h2>
        <div className="cp-flow" data-reveal>
          {t.flow.map((f) => (
            <div className="cp-step" key={f.n}>
              <span className="n">{`— ${f.n}`}</span>
              <b>{f.name}</b>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cp-sec" data-chapter={`${t.ch} 04`}>
        <h2 data-reveal>{t.moreH}</h2>
        <div className="cp-eras cpk-more" data-reveal>
          {t.more.map((m) => (
            <figure key={m.img}>
              <img src={m.img} alt={m.cap} width={500} height={693} loading="lazy" />
              <figcaption>{`— ${m.cap}`}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="cp-sec" data-chapter={`${t.ch} 05`}>
        <h2 data-reveal>{t.stackH}</h2>
        <div className="cl-stack" data-reveal>
          {t.stack.map((tech) => (
            <i key={tech}>{tech}</i>
          ))}
        </div>
      </section>

      <section className="cp-sec" data-chapter={`${t.ch} 06`}>
        <h2 data-reveal>{t.stagesH}</h2>
        <div className="cpk-stages" data-reveal>
          {t.stages.map((st) => (
            <div className={`cpk-stage${st.live ? " is-live" : ""}`} key={st.name}>
              <span className="st">{st.st}</span>
              <b>{st.name}</b>
              <p>{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cp-cta" data-reveal>
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
