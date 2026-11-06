import Image from "next/image";

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  portrait: string;
};

export default function TestimonialCard({ quote, name, location, portrait }: Testimonial) {
  return (
    <figure className="tm-quote">
      <span aria-hidden className="tm-quote-mark">
        “
      </span>
      <blockquote>“{quote}”</blockquote>
      <figcaption>
        <span className="tm-quote-portrait">
          <Image loading="eager" src={portrait} alt="" fill sizes="96px" />
        </span>
        <span>
          <span className="tm-quote-name">{name}</span>
          <span className="tm-quote-location">{location}</span>
        </span>
      </figcaption>
    </figure>
  );
}
