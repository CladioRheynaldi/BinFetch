import Link from "next/link";

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
}

export default function ActionCard({
  title,
 description,
  href,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className="
      group
      block
      rounded-3xl
      border
      border-green-100
      bg-white/90
      p-8
      shadow-md
      transition-all
      duration-300
      hover:-translate-y-2
      hover:shadow-2xl
      hover:border-green-300
      "
    >
      <h2 className="mb-2 text-2xl font-bold text-green-900 no-underline">
        {title}
      </h2>

      <p className="text-gray-600 no-underline">
        {description}
      </p>
    </Link>
  );
}