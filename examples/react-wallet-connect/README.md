# react-wallet-connect

Connect a Stellar wallet with Freighter, fetch balances, and send a payment — using `sorokit-core` in a React app.

```
Connect wallet → Fetch balances → Build payment → Sign → Submit
```

## Patterns covered

- Wallet connection and disconnection with `FreighterAdapter`
- Loading account balances with `client.account.getBalances`
- Building and signing a payment with `client.transaction.buildPayment`
- Handling `SorokitResult<T>` in component state (no try/catch)
- Loading and error states per operation

## Files

| File | Purpose |
|---|---|
| `src/useSorokit.ts` | Custom hook: client setup, wallet state, account ops, payment |
| `src/App.tsx` | UI: connect button, balance list, payment form, status messages |

## Setup

```bash
# From your own CRA / Vite React project:
npm install sorokit-core @creit.tech/stellar-wallets-kit
```

You need a Stellar Wallets Kit instance. Create it once at app startup:

```ts
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
} from "@creit.tech/stellar-wallets-kit";

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule()],
});
```

Then pass it to `useSorokit`:

```ts
const { walletState, connect, balances, sendPayment } = useSorokit(kit, "testnet");
```

## Running

Because this example lives inside the sorokit-core repo, its imports point to
`../../../src/...`. In your own app they become `import { ... } from "sorokit-core"`.

Type-check the example against the SDK source:

```bash
npm run typecheck:examples
```

## Localization

All user-facing strings in this example are routed through `src/shared/i18n.ts`
using `i18n.t("key")` calls. No raw string literals appear in rendered JSX.

### Adding a locale

1. Open `src/shared/i18n.ts` and add an entry for your locale alongside
   `EN_TRANSLATIONS` and `ES_TRANSLATIONS`:

   ```ts
   export const FR_TRANSLATIONS: Required<TranslationCatalog> = {
     "ui.app.title": "sorokit-core — Portefeuille React",
     "ui.wallet.connect_button": "Connecter Freighter",
     // ... all ui.* keys
   };
   ```

2. Register it with `createI18n`:

   ```ts
   const i18n = createI18n({ locale: "fr" }).withTranslations({ fr: FR_TRANSLATIONS });
   ```

3. Run the extraction script to verify no key is missing:

   ```bash
   node scripts/extract-i18n.mjs
   ```

   The script exits with code `1` if any key used in a component is absent
   from `EN_TRANSLATIONS`. Add the key there before proceeding.

4. The generated `scripts/messages.en.json` lists every key with its English
   default — hand this file to translators as the source catalog.
