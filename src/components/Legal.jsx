// ============================================================================
// Legal.jsx — Sapphire Spins legal policies, rendered as in-app views.
// Plain-language texts grounded in how the app actually works: data lives
// only in the visitor's browser localStorage, payments run through PayPal,
// play credits have no cash value. Business: Se Fire Tech. Contact:
// stevenfire92@yahoo.com. Effective date: November 19, 2026.
// ============================================================================

const EFFECTIVE = 'November 19, 2026';
const CONTACT = 'stevenfire92@yahoo.com';

const DOCS = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        h: 'The short version',
        paras: [
          'Sapphire Spins does not have accounts, sign-ups, or tracking. Almost everything the app remembers is stored only on your own device, in your browser. The only outside service involved is PayPal, and only if you choose to buy a Pro upgrade.',
        ],
      },
      {
        h: 'What is stored on your device',
        paras: [
          'The app stores the following in your browser\u2019s local storage, on your device only: your play-credit balance, your game statistics, your preferences (such as the music on/off setting), and a record of any Pro purchase so the app can keep your upgrade unlocked.',
          'This information never leaves your device and is not sent to Se Fire Tech. You can erase it at any time by clearing the site data for this app in your browser settings. Erasing it resets your balance and statistics.',
        ],
      },
      {
        h: 'No accounts, no tracking',
        paras: [
          'There is no sign-up and no user account. We do not run analytics, advertising trackers, or behavioural profiling, and we do not collect your name, address, or contact details through the app.',
        ],
      },
      {
        h: 'Payments through PayPal',
        paras: [
          'Pro upgrades are sold through PayPal. When you buy, PayPal collects and processes your payment details under PayPal\u2019s own privacy policy. We never see, receive, or store your card number or bank details.',
          'PayPal confirms the result of a purchase (for example, that a subscription is active) so the app can unlock Pro on your device. Subscriptions are managed, and can be cancelled, inside your PayPal account.',
        ],
      },
      {
        h: 'If you contact us',
        paras: [
          'If you email us, we receive your email address and the contents of your message. We use them only to reply and to resolve your question, and we do not add you to any marketing list.',
        ],
      },
      {
        h: 'No sale of personal information',
        paras: [
          'We do not sell personal information. Because the app collects almost none, there is very little this could ever apply to \u2014 and the answer is still no.',
        ],
      },
      {
        h: 'Who this app is for',
        paras: [
          'Sapphire Spins is an entertainment product intended for adult audiences (18+).',
        ],
      },
      {
        h: 'Changes to this policy',
        paras: [
          'If this policy changes, the updated text will be posted in the app with a new effective date. Continuing to use the app after a change means you accept the updated policy.',
        ],
      },
      {
        h: 'Contact',
        paras: ['Questions about this policy: ' + CONTACT + '.'],
      },
    ],
  },

  terms: {
    title: 'Terms of Use',
    sections: [
      {
        h: 'Accepting these terms',
        paras: [
          'Sapphire Spins is an entertainment product operated by Se Fire Tech. By using the app, you agree to these Terms of Use. If you do not agree, please do not use the app.',
        ],
      },
      {
        h: 'Play money only \u2014 this is not gambling',
        paras: [
          'Sapphire Spins is a play-money casino game. The credits used in the app have NO cash value. They are not currency, they cannot be bought, sold, or transferred, and they cannot be redeemed for money, prizes, or anything else of value.',
          'This is not real-money gambling. No real money is wagered in any game, and no real-money prizes exist. Game outcomes are generated randomly for entertainment only, and a credit balance \u2014 however large \u2014 is worth nothing outside the app.',
        ],
      },
      {
        h: 'Adults only',
        paras: [
          'Sapphire Spins is intended for adult audiences. You must be 18 years of age or older to use the app.',
        ],
      },
      {
        h: 'Pro upgrades',
        paras: [
          'The games are free to play. Optional Pro upgrades (monthly or yearly subscriptions, or a one-time lifetime purchase) are sold through PayPal and unlock extra features such as uncapped bets, VIP stakes, and statistics. Prices are shown at checkout before you pay.',
          'Cancellation and refunds are covered by the separate Cancellation & Refunds policy.',
        ],
      },
      {
        h: 'Acceptable use',
        paras: [
          'Use the app for your own personal entertainment. Do not attempt to disrupt or interfere with the app or its payment processing, do not use it for any unlawful purpose, and do not misrepresent play credits as having real-world value.',
          'Because credits and settings live in your own browser, what you do with your own device\u2019s storage is up to you \u2014 but altered balances or statistics are still worth nothing and cannot be exchanged for anything.',
        ],
      },
      {
        h: 'Provided \u201cas is\u201d',
        paras: [
          'The app is provided \u201cas is\u201d and \u201cas available\u201d, without warranties of any kind to the extent permitted by law. We may change, add, or remove games and features, or discontinue the app, at any time.',
        ],
      },
      {
        h: 'Limitation of liability',
        paras: [
          'To the maximum extent permitted by the laws of Ontario and Canada, Se Fire Tech is not liable for any indirect, incidental, or consequential losses arising from use of the app, and our total liability for any claim is limited to the amount you paid us for the app in the twelve months before the claim.',
        ],
      },
      {
        h: 'Governing law',
        paras: [
          'These terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply there.',
        ],
      },
      {
        h: 'Changes and contact',
        paras: [
          'We may update these terms; the current version will be posted in the app with a new effective date. Questions: ' + CONTACT + '.',
        ],
      },
    ],
  },

  refunds: {
    title: 'Cancellation & Refunds',
    sections: [
      {
        h: 'Subscriptions (monthly and yearly Pro)',
        paras: [
          'Pro subscriptions are billed through PayPal. You can cancel at any time inside your PayPal account: go to Settings, then Payments, then manage your automatic payments / subscriptions, and cancel the Se Fire Tech subscription.',
          'Cancelling stops future renewals. Your Pro access continues until the end of the period you have already paid for. We do not provide partial refunds for unused time within a paid period.',
        ],
      },
      {
        h: 'Lifetime purchases',
        paras: [
          'The lifetime upgrade is a one-time purchase, not a subscription. There is nothing to cancel and it never renews or bills again.',
        ],
      },
      {
        h: 'If something goes wrong on our side',
        paras: [
          'If a technical fault on our side prevents you from accessing the Pro features you paid for, contact us at ' + CONTACT + ' within 14 days of the purchase. We will repair the fault or refund that payment \u2014 your choice if the fault cannot be fixed promptly.',
          'Including your PayPal transaction ID or receipt date in your message helps us resolve it faster.',
        ],
      },
      {
        h: 'Play credits are never refundable',
        paras: [
          'Play credits are free, have no cash value, and are never sold \u2014 so they are never refundable or exchangeable, and no credit balance can be converted into money or a refund.',
        ],
      },
      {
        h: 'Contact',
        paras: ['For any billing question: ' + CONTACT + '.'],
      },
    ],
  },
};

export const LEGAL_IDS = Object.keys(DOCS);

export default function Legal({ doc }) {
  const d = DOCS[doc] || DOCS.privacy;
  return (
    <section
      className="bg-[var(--panel)] border border-[var(--edge)] rounded-[1.15rem] p-[clamp(1rem,4vw,2.4rem)]"
      aria-labelledby="legal-title"
    >
      <h2 id="legal-title" className="text-[clamp(1.5rem,4vw,2.2rem)] mb-1">
        {d.title}
      </h2>
      <p className="text-[var(--muted)] text-sm mb-6">
        Sapphire Spins · Se Fire Tech · Effective {EFFECTIVE}
      </p>
      <div className="max-w-[46rem]">
        {d.sections.map((s) => (
          <div key={s.h} className="mb-6">
            <h3 className="font-bold text-[1.05rem] mb-1.5 text-[var(--text)]">
              {s.h}
            </h3>
            {s.paras.map((p, i) => (
              <p key={i} className="text-[var(--muted)] leading-relaxed mb-2">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
