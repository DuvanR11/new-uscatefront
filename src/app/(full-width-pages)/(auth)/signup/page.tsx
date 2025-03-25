import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Uscategui Panel",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function SignUp() {
  return <SignUpForm />;
}
