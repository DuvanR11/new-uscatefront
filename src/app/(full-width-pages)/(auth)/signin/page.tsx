import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Uscategui Panel",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function SignIn() {
  return <SignInForm />;
}
