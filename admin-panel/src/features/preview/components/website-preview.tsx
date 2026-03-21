"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PhoneCall, ShieldCheck, Star, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RatingStars } from "@/components/shared/rating-stars";
import type { PreviewSection, WebsitePreviewSnapshot } from "@/features/preview/types";

function PreviewHero({ snapshot }: { snapshot: WebsitePreviewSnapshot }) {
  const { hero, cms } = snapshot;
  const overlayHex = `${hero.overlayColor}${Math.round(Math.max(0.3, Math.min(0.7, hero.overlayOpacity)) * 255)
    .toString(16)
    .padStart(2, "0")}`;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]">
      <div
        className="relative overflow-hidden px-6 py-7 sm:px-8 lg:px-10"
        style={{
          backgroundImage: `linear-gradient(135deg, ${overlayHex}, ${hero.overlayColor}cc), url(${hero.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/75">
              {cms.heroEyebrow || "Advanced diagnostics"}
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">{hero.heading}</h1>
            <p className="max-w-xl text-sm leading-7 text-white/82 sm:text-base">{hero.subheading}</p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900">
                {hero.primaryButtonText}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur">
                {hero.secondaryButtonText}
              </span>
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <Card className="rounded-2xl border-white/15 bg-white/10 p-4 text-white shadow-none backdrop-blur">
                <p className="text-sm font-semibold">{cms.heroStatOneTitle}</p>
                <p className="mt-2 text-xs text-white/75">{cms.heroStatOneText}</p>
              </Card>
              <Card className="rounded-2xl border-white/15 bg-white/10 p-4 text-white shadow-none backdrop-blur">
                <p className="text-sm font-semibold">{cms.heroStatTwoTitle}</p>
                <p className="mt-2 text-xs text-white/75">{cms.heroStatTwoText}</p>
              </Card>
              <Card className="rounded-2xl border-white/15 bg-white/10 p-4 text-white shadow-none backdrop-blur">
                <p className="text-sm font-semibold">{cms.heroStatThreeTitle}</p>
                <p className="mt-2 text-xs text-white/75">{cms.heroStatThreeText}</p>
              </Card>
            </div>
          </div>

          <motion.div
            className="mx-auto w-full max-w-[420px]"
            initial={{ opacity: 0.86, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="overflow-hidden rounded-[30px] border border-white/15 bg-white/10 p-3 backdrop-blur">
              <div className="relative aspect-[4/4.5] overflow-hidden rounded-[24px] bg-slate-100">
                <img
                  src={hero.imageUrl}
                  alt="Hero preview"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = "/images/hospital-front.jpg";
                  }}
                />
              </div>
              <div className="space-y-2 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                  {cms.heroPanelEyebrow}
                </p>
                <p className="text-lg font-semibold">{cms.heroPanelHeading}</p>
                <div className="grid gap-2 text-sm text-white/78">
                  <p>{cms.heroFeatureOne}</p>
                  <p>{cms.heroFeatureTwo}</p>
                  <p>{cms.heroFeatureThree}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PreviewAbout({ snapshot }: { snapshot: WebsitePreviewSnapshot }) {
  const { cms } = snapshot;
  const whyCards = [
    { title: cms.whyChooseCardOneTitle, text: cms.whyChooseCardOneText },
    { title: cms.whyChooseCardTwoTitle, text: cms.whyChooseCardTwoText },
    { title: cms.whyChooseCardThreeTitle, text: cms.whyChooseCardThreeText },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[28px] border-slate-200 p-7 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{cms.aboutEyebrow}</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{cms.aboutHeading}</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
          <p>{cms.aboutDescription}</p>
          <p>{cms.aboutParagraphTwo}</p>
          <p>{cms.aboutParagraphThree}</p>
        </div>
      </Card>

      <div className="grid gap-4">
        {whyCards.map((card, index) => (
          <motion.div
            key={`${card.title}-${index}`}
            initial={{ opacity: 0.85, x: index % 2 === 0 ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <Card className="rounded-[24px] border-slate-200 p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.3)]">
              <p className="text-lg font-semibold text-slate-950">{card.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PreviewServices({ snapshot }: { snapshot: WebsitePreviewSnapshot }) {
  const services = snapshot.services.slice(0, 6);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{snapshot.cms.servicesEyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{snapshot.cms.servicesHeading}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{snapshot.cms.servicesNote}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0.78, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.04 }}
          >
            <Card className="group h-full rounded-[24px] border-slate-200 p-5 shadow-[0_20px_46px_-36px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_62px_-34px_rgba(37,99,235,0.35)]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-700">
                {(service.icon || service.title).slice(0, 2).toUpperCase()}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                {service.category}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PreviewDoctors({ snapshot }: { snapshot: WebsitePreviewSnapshot }) {
  const doctors = snapshot.doctors.slice(0, 6);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{snapshot.cms.doctorsEyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{snapshot.cms.doctorsHeading}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0.8, x: index % 2 === 0 ? -18 : 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
          >
            <Card className="group h-full rounded-[24px] border-slate-200 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_62px_-34px_rgba(59,130,246,0.32)]">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-[22px] bg-slate-100 ring-1 ring-slate-200">
                  {doctor.imageUrl ? (
                    <Image src={doctor.imageUrl} alt={doctor.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary">
                      <Stethoscope className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Badge>{doctor.department}</Badge>
                  <h3 className="text-lg font-semibold text-slate-950">{doctor.name}</h3>
                  <p className="text-sm text-slate-600">{doctor.specialization}</p>
                  <p className="text-xs text-slate-500">{doctor.qualification}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{doctor.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {doctor.availability.slice(0, 2).map((slot) => (
                  <span key={slot} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                    {slot}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PreviewReviews({ snapshot }: { snapshot: WebsitePreviewSnapshot }) {
  const reviews = snapshot.reviews.filter((review) => review.status === "approved").slice(0, 6);
  const average =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{snapshot.cms.reviewsEyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{snapshot.cms.reviewsHeading}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{snapshot.cms.reviewsSubtitle}</p>
        </div>
        <Card className="min-w-[210px] rounded-[22px] border-slate-200 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.28)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Average rating</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl font-semibold text-slate-950">{average}</span>
            <RatingStars value={Math.round(Number(average))} readOnly />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reviews.length ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0.82, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
            >
              <Card className="h-full rounded-[24px] border-slate-200 p-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.26)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-950">{review.name || "Anonymous patient"}</h3>
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div className="mt-3">
                  <RatingStars value={review.rating} readOnly />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{review.message}</p>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="rounded-[24px] border-dashed border-slate-300 p-6 md:col-span-2 xl:col-span-3">
            <p className="font-semibold text-slate-950">No approved reviews yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Approved patient feedback will appear here as soon as moderation is completed.
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}

function PreviewFooter({ snapshot }: { snapshot: WebsitePreviewSnapshot }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
      <Card className="rounded-[24px] border-slate-200 p-6 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{snapshot.cms.appointmentEyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{snapshot.cms.appointmentHeading}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{snapshot.cms.appointmentDescription}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            {snapshot.cms.appointmentButtonLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            <PhoneCall className="h-4 w-4" />
            {snapshot.cms.contactPhone}
          </span>
        </div>
      </Card>

      <Card className="rounded-[24px] border-slate-200 p-6 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{snapshot.cms.contactEyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{snapshot.cms.contactHeading}</h2>
        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
          <p>{snapshot.cms.contactDescription}</p>
          <p>{snapshot.cms.contactAddress}</p>
          <p>{snapshot.cms.contactEmail}</p>
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          {snapshot.cms.footerHighlightDescription}
        </div>
      </Card>
    </section>
  );
}

export function WebsitePreview({
  section,
  snapshot,
}: {
  section: PreviewSection;
  snapshot: WebsitePreviewSnapshot;
}) {
  return (
    <div className="space-y-6 bg-slate-50 p-4 sm:p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24 }}
          className="space-y-6"
        >
          {section === "homepage" ? (
            <>
              <PreviewHero snapshot={snapshot} />
              <PreviewAbout snapshot={snapshot} />
              <PreviewServices snapshot={snapshot} />
              <PreviewDoctors snapshot={snapshot} />
              <PreviewReviews snapshot={snapshot} />
              <PreviewFooter snapshot={snapshot} />
            </>
          ) : null}
          {section === "hero" ? <PreviewHero snapshot={snapshot} /> : null}
          {section === "services" ? <PreviewServices snapshot={snapshot} /> : null}
          {section === "doctors" ? <PreviewDoctors snapshot={snapshot} /> : null}
          {section === "reviews" ? <PreviewReviews snapshot={snapshot} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
