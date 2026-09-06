import { getDonationMethods } from "@ciszunetwork/payments";
import { Heart } from "lucide-react";
import DonateButtons from "./DonateButtons";
import QuickDocks from "@/components/molecules/QuickDocks";

export default function DonatePage() {
  const methods = getDonationMethods();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Donar
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Apoya el ecosistema de Ciszu Network
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-sm leading-relaxed">
            Tus donaciones ayudan a mantener las webs, el bot de Discord, MuzicMania y la
            comunidad CiszuGamens funcionando. Cualquier aporte, por pequeño que sea, se
            agradece de corazón.
          </p>
        </div>

        <DonateButtons methods={methods} />

        {/* Widget Ko-fi real */}
        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-4 mb-12">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">Ko-fi embebido</h3>
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/ciszukoantony/?hidefeed=true&widget=true&embed=true&preview=true"
            style={{ border: "none", width: "100%", padding: 4, background: "#f9f9f9" }}
            height="712"
            title="Apoya a CiszukoAntony en Ko-fi"
          />
        </div>

        {/* Widget NOWPayments real */}
        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-4">
          <h3 className="text-white font-bold font-header text-sm mb-3 text-center">Cripto (NOWPayments)</h3>
          <iframe
            src={`https://nowpayments.io/embeds/donation-widget?api_key=739f2096-6c64-40d6-a2a1-635784185dfb`}
            width="100%"
            height="623"
            frameBorder="0"
            scrolling="no"
            style={{ overflowY: "hidden", border: "none" }}
          />
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-xs">
            ¿Prefieres apoyar de otra forma? Escríbenos a{" "}
            <a href="mailto:ciszunetwork@gmail.com" className="text-brand-light underline">ciszunetwork@gmail.com</a>
          </p>
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}