# DocCăutare

Caută în documentele tale — DOCX, PDF, TXT — direct pe telefon sau pe calculator.
Totul rămâne la tine: documentele se citesc în browser și se păstrează în memoria
lui, nu pleacă nicăieri. Merge și fără internet.

## Ce e în folder

| Fișier | La ce e |
|---|---|
| `index.html` | Aplicația întreagă (are înăuntru și bibliotecile pentru DOCX și PDF) |
| `manifest.webmanifest` | Cartea de identitate a aplicației: nume, culori, iconițe |
| `sw.js` | Ține aplicația în memorie, ca să pornească și fără internet |
| `icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png`, `favicon-64.png` | Iconițele pentru ecranul de pornire |
| `.nojekyll` | Îi spune lui GitHub să publice fișierele așa cum sunt |

Toate trebuie să stea împreună, în aceeași rădăcină. Numele nu se schimbă.

## Cum îl urci pe GitHub

1. Pe github.com: **New repository** → dă-i un nume (de exemplu `doccautare`)
   → **Public** → **Create repository**.
2. **Add file → Upload files** → urcă toate fișierele: `index.html`,
   `manifest.webmanifest`, `sw.js`, `README.md`, `.nojekyll` și cele cinci
   iconițe `.png` → **Commit changes**. Toate stau grămadă, în rădăcină,
   fără niciun folder.
3. **Settings → Pages** → la *Source* alege **Deploy from a branch**,
   ramura `main`, folderul `/ (root)` → **Save**.
4. Așteaptă un minut. Adresa apare tot acolo, sus:
   `https://NUMELE-TAU.github.io/doccautare/`

> Dacă nu vezi `.nojekyll` după ce l-ai tras în fereastră: e un fișier ascuns.
> Poți să-l faci direct pe GitHub cu **Add file → Create new file**,
> scrii `.nojekyll` la nume, lași conținutul gol și salvezi.

## Cum o instalezi pe telefon

**Android (Chrome).** Deschide adresa. Apare butonul verde **Instalează** în bara
de sus — sau, din meniul cu trei puncte, **Adaugă la ecranul principal**.

**iPhone / iPad (Safari — trebuie Safari, nu Chrome).** Deschide adresa,
apasă butonul de partajare (pătratul cu săgeata în sus) → **Adaugă la ecranul
principal** → **Adaugă**.

**Pe calculator (Chrome sau Edge).** În bara de adresă, la dreapta, apare o
iconiță de instalare; sau meniul cu trei puncte → **Instalează DocCăutare**.

După instalare pornește ca o aplicație obișnuită, cu iconiță proprie și fără
bara browserului. Prima deschidere are nevoie de internet (se descarcă o dată);
după aceea merge și pe avion.

## Când schimbi ceva în aplicație

Telefoanele țin versiunea veche în memorie, deci nu e destul să înlocuiești
`index.html`. Deschide și `sw.js` și schimbă numărul din prima linie:

```js
const VERSIUNE = 'doccautare-2.10.2';   // pune 2.10.3, apoi 2.10.4 …
```

Asta e tot. La următoarea deschidere aplicația ia versiunea nouă și te anunță
printr-un mesaj scurt să o închizi și să o redeschizi.

## Dacă nu apare butonul de instalare

- Adresa trebuie să fie `https://…` (GitHub Pages e https din start).
  De pe un fișier deschis local, cu `file://`, instalarea nu se poate.
- Dacă ai deschis-o deja o dată, e posibil să fie instalată; caut-o pe ecranul
  de pornire.
- Pe iPhone butonul nu apare niciodată — acolo se face din meniul de partajare
  al lui Safari, ca mai sus.
- Reîncarcă pagina o dată; verificarea de instalare se face la pornire.

## Documentele tale

Rămân în memoria browserului de pe dispozitivul acela (IndexedDB) — nu se urcă
pe GitHub și nu se văd de nicăieri altundeva. Dacă golești datele browserului
sau ștergi aplicația, se șterg și ele. Ce vrei să păstrezi, salvează din
aplicație cu **Descarcă** (`.md`).
