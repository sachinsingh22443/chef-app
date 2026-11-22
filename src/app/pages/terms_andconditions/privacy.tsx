
import {
  ShieldCheck,
  LockKeyhole,
  UserRound,
  Database,
  MapPin,
  Bell,
  CreditCard,
  Share2,
  Trash2,
  Eye,
  FileText,
  Mail,
  ChevronRight,
  Utensils,
  Globe,
} from "lucide-react";

const sections = [
  {
    id: "information",
    icon: UserRound,
    title: "1. Information We Collect",
    content: [
      "Account Information: Name, mobile number, email address and profile details provided during registration.",
      "Business Information: Chef or restaurant details, business address, menu information and subscription details.",
      "Order Information: Customer orders, order status, delivery information and transaction references.",
      "Location Information: Location data when you grant location permission for address or location-related features.",
      "Device Information: Device type, operating system, app version and diagnostic information where collected.",
    ],
  },
  {
    id: "usage",
    icon: Database,
    title: "2. How We Use Your Information",
    content: [
      "To create and manage your Chef App account.",
      "To receive, process and manage customer orders.",
      "To manage menus, subscriptions and business operations.",
      "To send important notifications about orders and account activities.",
      "To provide customer support and improve app performance.",
      "To protect the platform against fraud, misuse and unauthorized access.",
    ],
  },
  {
    id: "location",
    icon: MapPin,
    title: "3. Location Permissions",
    content: [
      "The app may request location permission to support location-related features and address services.",
      "Location access depends on the permission granted by your device.",
      "You can manage or revoke location permission through your device settings.",
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "4. Payments and Transactions",
    content: [
      "Payments may be processed through third-party payment service providers.",
      "Payment details may be processed by the relevant payment provider according to its privacy policy.",
      "We may retain transaction references and payment status for order management and accounting purposes.",
    ],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "5. Information Sharing",
    content: [
      "We may share necessary information with service providers who help us operate the app, such as hosting, notifications, maps and payment services.",
      "Order-related information may be shared with relevant customers to fulfil their orders.",
      "Information may be disclosed when required by applicable law or valid legal requests.",
      "We do not sell personal information as a business practice.",
    ],
  },
  {
    id: "security",
    icon: LockKeyhole,
    title: "6. Data Security",
    content: [
      "We use appropriate technical and organizational measures to protect personal information.",
      "Access to information is restricted according to operational requirements.",
      "However, no internet transmission or electronic storage method can be guaranteed to be completely secure.",
    ],
  },
  {
    id: "retention",
    icon: Eye,
    title: "7. Data Retention",
    content: [
      "We retain information for as long as necessary to provide services, maintain business records and meet applicable legal obligations.",
      "When information is no longer required, we take appropriate steps to delete or anonymize it, subject to legal requirements.",
    ],
  },
  {
    id: "deletion",
    icon: Trash2,
    title: "8. Account and Data Deletion",
    content: [
      "You can request deletion of your Chef App account and associated personal information.",
      "Certain records may need to be retained where required by law or for legitimate business purposes.",
      "For account deletion assistance, contact us using the details provided below.",
    ],
  },
  {
    id: "thirdparty",
    icon: Globe,
    title: "9. Third-Party Services",
    content: [
      "The app may use third-party services for hosting, maps, notifications, payment processing and other operational functions.",
      "These services may process relevant information under their own privacy policies and terms.",
      "Users should review the applicable third-party privacy policies where relevant.",
    ],
  },
  {
    id: "changes",
    icon: FileText,
    title: "10. Changes to This Privacy Policy",
    content: [
      "We may update this Privacy Policy from time to time.",
      "Any updated version will be published on this page with a revised Last Updated date.",
      "Continued use of the app after an update is subject to the applicable updated policy.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">

          <a
            href="/"
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            <Utensils size={16} />
            Chef App
          </a>

          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
            <ShieldCheck size={36} />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
            Your Privacy Matters
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Your trust matters to us. This Privacy Policy explains how
            Chef App collects, uses, stores and protects your information
            when you use our services.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-slate-200">
              Last Updated: 22 November 2026
            </span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-300">
              <ShieldCheck className="mr-1 inline" size={13} />
              Privacy & Security
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">

        {/* Introduction */}
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-3 text-xl font-bold text-slate-900">
            Welcome to Chef App
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            This Privacy Policy applies to users of Chef App, including
            chefs and restaurant partners. It describes our practices
            regarding personal information and explains your choices
            concerning that information.
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 sm:p-8"
              >
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon size={21} />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-3 pl-1">
                  {section.content.map((item, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm leading-7 text-slate-600"
                    >
                      <ChevronRight
                        size={17}
                        className="mt-1 shrink-0 text-emerald-600"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Contact */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 p-7 text-white shadow-lg sm:p-10">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
            <Mail size={25} />
          </div>

          <h2 className="text-2xl font-bold">
            11. Contact Us
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            If you have questions, concerns or requests regarding
            this Privacy Policy or your personal information,
            please contact our support team.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">
              Privacy Support Email
            </p>

            <a
              href="mailto:REPLACE_WITH_SUPPORT_EMAIL"
              className="mt-2 inline-block break-all text-base font-semibold text-emerald-400 hover:text-emerald-300"
            >
              sachinsingh22443@gmail.com
            </a>
          </div>

          <p className="mt-6 text-xs leading-6 text-slate-400">
            Please replace the placeholder email with your official
            support email before publishing this Privacy Policy.
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-7 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-slate-700">
            <ShieldCheck size={19} className="text-emerald-600" />
            <span className="font-bold">Chef App</span>
          </div>

          <p className="text-xs text-slate-500">
            We respect your privacy and are committed to protecting
            your information.
          </p>

          <p className="mt-3 text-xs text-slate-400">
            © 2026 Chef App. All rights reserved.
          </p>
        </footer>

      </main>
    </div>
  );
}
