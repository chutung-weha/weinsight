import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/weha-logo.png?v=2"
        alt="WE INSIGHT logo"
        width={40}
        height={40}
        className="h-9 w-auto"
      />
      <span className="font-logo text-lg font-black tracking-wider text-cyan-300" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        WE INSIGHT
      </span>
    </Link>
  );
}
