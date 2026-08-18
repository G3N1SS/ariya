import Mark from "./Mark";
import HeroVisual from "./HeroVisual";
import LeadForm from "./LeadForm";
import PrismaGuide from "./PrismaGuide";
import Preloader from "./fx/Preloader";
import SmoothScroll from "./fx/SmoothScroll";
import Cursor from "./fx/Cursor";
import Reveals from "./fx/Reveals";
import ConsoleEgg from "./fx/ConsoleEgg";
import CommandK from "./fx/CommandK";
import HeroTypo from "./fx/HeroTypo";
import Greeting from "./fx/Greeting";
import ThemeToggle from "./fx/ThemeToggle";
import Ticker from "./art/Ticker";
import ServiceDemo from "./art/LiveDemos";
import ProcessRail from "./art/ProcessRail";
import FooterWordmark from "./art/FooterWordmark";
import { dict, contacts, type Locale } from "@/lib/dict";

const SVC_DEMOS = ["phone", "tg", "web"] as const;

export default function Site({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const tgHref = contacts.tg;
  const mailHref = contacts.email ? `mailto:${contacts.email}` : "#";

  return (
    <>
      <Preloader />
      <SmoothScroll />
      <Cursor />
      <Reveals />
      <ConsoleEgg locale={locale} />
      <PrismaGuide t={t.guide} />
      <HeroTypo />
      <header className="site-header">
        <div className="container bar">
          <a href="#top" className="brandlink" aria-label={t.brand}>
            <Mark size={26} />
            <span>{t.brand}</span>
          </a>
          <nav className="mainnav" aria-label="Main">
            {t.nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="header-right">
            <ThemeToggle label={t.themeToggle} />
            <CommandK t={t.ck} />
            <a className="locale-switch" href={t.localeSwitch.href}>
              {t.localeSwitch.label}
            </a>
            <a
              className="btn btn-primary btn-sm"
              href={tgHref}
              target="_blank"
              rel="noopener"
              data-magnetic
            >
              {t.headerCta}
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* хиро */}
        <section className="container hero" aria-labelledby="hero-h1">
          <div className="hero-copy">
            <div className="eyebrow">
              {t.hero.eyebrow}
              <Greeting t={t.greet} />
            </div>
            <h1 id="hero-h1">
              {t.hero.h1[0]}
              <span className="l2">{t.hero.h1[1]}</span>
            </h1>
            <p className="hero-sub">{t.hero.sub}</p>
            <div className="hero-cta">
              <a
                className="btn btn-primary"
                href={tgHref}
                target="_blank"
                rel="noopener"
                data-magnetic
              >
                {t.hero.ctaPrimary}
              </a>
              <a className="btn btn-ghost" href="#work" data-magnetic>
                {t.hero.ctaSecondary}
              </a>
            </div>
          </div>
          {/* 3D-сцена /// на способных десктопах, статичный знак — фолбэк */}
          <HeroVisual />
          <Ticker text={t.hero.ticker} className="hero-ticker" />
        </section>

        {/* услуги */}
        <section id="services" className="container" aria-labelledby="svc-h2">
          <div className="s-head" data-reveal>
            <span className="idx">{t.services.idx}</span>
            <h2 id="svc-h2">{t.services.title}</h2>
          </div>
          <p className="intro" data-reveal>
            {t.services.intro}
          </p>
          <div className="svc-grid">
            {t.services.items.map((s, i) => (
              <article className="svc live" key={s.name} data-reveal>
                <div className="svc-top">
                  <div className="n">{`// 0${i + 1}`}</div>
                </div>
                {/* услуга не описана — она работает: живое микродемо вместо иконки */}
                <div className="svc-demo">
                  <ServiceDemo variant={SVC_DEMOS[i]} t={t.services.demo} />
                </div>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
          <div className="svc-plus" data-reveal>
            {t.services.plus}
          </div>
        </section>

        {/* кейсы */}
        <section id="work" className="container" aria-labelledby="work-h2">
          <div className="s-head" data-reveal>
            <span className="idx">{t.cases.idx}</span>
            <h2 id="work-h2">{t.cases.title}</h2>
          </div>
          <p className="intro" data-reveal>
            {t.cases.intro}
          </p>
          {[1, 2].map((n) => (
            <div className="case-poster" key={n} data-reveal>
              <span className="tag">{`// case-0${n}`}</span>
              <span className="tickmark tm-tl"></span>
              <span className="tickmark tm-tr"></span>
              <span className="tickmark tm-bl"></span>
              <span className="tickmark tm-br"></span>
              <div className="case-empty">
                <b>{t.cases.placeholderTitle}</b>
                <span>{t.cases.placeholderNote}</span>
              </div>
              <div className="dim">1440 × 900</div>
              <div className="stamp">
                <div>
                  {`case-0${n} `}
                  <i>{"//"}</i> {t.cases.stampSoon}
                </div>
                <div>2026 · ariya</div>
              </div>
            </div>
          ))}
          <p className="case-closing" data-reveal>
            {t.cases.closing}
          </p>
        </section>

        {/* почему */}
        <section id="why" className="container" aria-labelledby="why-h2">
          <div className="s-head" data-reveal>
            <span className="idx">{t.why.idx}</span>
            <h2 id="why-h2">{t.why.title}</h2>
          </div>
          <p className="why-lead" data-reveal>
            {t.why.lead}
          </p>
          <div className="why-grid">
            {t.why.bullets.map((b) => (
              <div className="why-item" key={b.name} data-reveal>
                <b>{b.name}</b>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* процесс */}
        <section id="process" className="container" aria-labelledby="proc-h2">
          <div className="s-head" data-reveal>
            <span className="idx">{t.process.idx}</span>
            <h2 id="proc-h2">{t.process.title}</h2>
          </div>
          <div className="steps-wrap">
            <ProcessRail />
            <div className="steps">
              {t.process.steps.map((s, i) => (
                <div className="step" key={s.name} data-reveal>
                  <span className="n">{`// 0${i + 1}`}</span>
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="cta-wrap" aria-labelledby="cta-h2">
          <div className="container">
            <div className="s-head" data-reveal>
              <span className="idx">{t.cta.idx}</span>
            </div>
            <h2 className="cta-title" id="cta-h2" data-reveal>
              {t.cta.title}
            </h2>
            <p className="cta-sub" data-reveal>
              {t.cta.sub}
            </p>
            <div className="cta-actions" data-reveal>
              <a
                className="btn btn-primary"
                href={tgHref}
                target="_blank"
                rel="noopener"
                data-magnetic
              >
                {t.cta.btnTg}
              </a>
              {/* почтовая кнопка появится вместе с почтой — мёртвых ссылок не держим */}
              {contacts.email && (
                <a className="btn btn-ghost" href={mailHref} data-magnetic>
                  {t.cta.btnMail}
                </a>
              )}
            </div>
            <div data-reveal>
              <LeadForm t={t.cta.form} />
            </div>
            <p className="cta-pricing" data-reveal>
              {t.cta.pricing}
            </p>
          </div>
          <Ticker text={t.cta.ticker} className="cta-ticker" />
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <FooterWordmark />
        </div>
        {/* открытые метрики: кто ещё из студий не боится показать цифры */}
        <div className="container row foot-meta">
          <div className="foot-badges">
            <span className="fb">
              <i className="fb-dot" />
              lighthouse 98
            </span>
            <span className="fb">next 16</span>
            <span className="fb">build {process.env.NEXT_PUBLIC_BUILD_DATE}</span>
          </div>
          <a className="foot-log" href={t.footer.logHref}>
            {t.footer.logLink}
          </a>
        </div>
        <div className="container row">
          <span>{t.footer.brand}</span>
          <span>{t.footer.rights}</span>
        </div>
      </footer>
    </>
  );
}
