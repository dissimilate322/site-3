/** Only implemented pages belong here. Add owner-provided social URLs below. */
export const navigation = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Company", href: "/company" },
  { label: "Careers", href: "/careers" },
] as const;

export const socialLinks: { instagram: string; x: string; linkedin: string } = {
  instagram: "",
  x: "",
  linkedin: "",
};
