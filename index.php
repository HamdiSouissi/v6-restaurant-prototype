<?php
/**
 * ============================================================================
 *  SORRISO — Fast Food Italiano · Parma
 *  Prototipo one‑page "pubblicità interattiva" (PHP nativo, nessun database).
 * ----------------------------------------------------------------------------
 *  Struttura del file
 *    1. Configurazione del brand  (modifica qui per personalizzare la demo)
 *    2. Dati: categorie, prodotti, recensioni, FAQ, orari
 *    3. Helper di rendering
 *    4. Markup della pagina (scene in ordine di scroll)
 *
 *  Tutte le funzionalità (carrello, checkout, prenotazione, newsletter)
 *  sono simulate lato client: vedi /assets/js.
 * ============================================================================
 */

declare(strict_types=1);
date_default_timezone_set('Europe/Rome');

/* ---------------------------------------------------------------------------
 * 1. BRAND — tutto ciò che cambia da un locale all'altro vive qui.
 * ------------------------------------------------------------------------- */
$brand = [
    'name'     => 'Sorriso',
    'claim'    => 'Fast Food Italiano',
    'city'     => 'Parma',
    'address'  => 'Strada del Gusto 12',
    'zip'      => '43121 Parma (PR)',
    'phone'    => '+39 0521 000 000',
    'email'    => 'ciao@sorriso-parma.it',
    'promo'    => ['code' => 'CIAO30', 'percent' => 30],
    'delivery' => ['fee' => 2.90, 'free_from' => 25.00],
    'social'   => [
        'instagram' => ['Instagram', '#', 'instagram-line'],
        'tiktok'    => ['TikTok', '#', 'tiktok-line'],
        'facebook'  => ['Facebook', '#', 'facebook-circle-line'],
    ],
];

$nav = [
    'home'         => 'Home',
    'menu'         => 'Menu',
    'bestseller'   => 'Best Seller',
    'delivery'     => 'Delivery',
    'gallery'      => 'Gallery',
    'prenotazione' => 'Prenota',
    'contatti'     => 'Contatti',
];

/* ---------------------------------------------------------------------------
 * 2. DATI
 * ------------------------------------------------------------------------- */

/** Categorie del menu: [etichetta, immagine, colore di scena, frase]. */
$categories = [
    'pizza'    => ['label' => 'Pizza',           'img' => 'pizza',    'color' => '#FFD447', 'line' => 'Impasto a 48 ore di lievitazione, cotta in 90 secondi.'],
    'burger'   => ['label' => 'Burger Italiano', 'img' => 'burger',   'color' => '#9DD7F7', 'line' => 'Manzo italiano, pane brioche e salumi di Parma.'],
    'panini'   => ['label' => 'Panini',          'img' => 'panino',   'color' => '#A8D672', 'line' => 'Ciabatta croccante farcita davanti ai tuoi occhi.'],
    'pasta'    => ['label' => 'Pasta',           'img' => 'pasta',    'color' => '#FFB6A2', 'line' => 'Mantecata al momento, servita nel box da passeggio.'],
    'insalate' => ['label' => 'Insalate',        'img' => 'insalata', 'color' => '#FFE27A', 'line' => 'Verdure di stagione dai mercati della città.'],
    'patatine' => ['label' => 'Patatine',        'img' => 'patatine', 'color' => '#9DD7F7', 'line' => 'Tagliate a mano, fritte due volte, croccanti sempre.'],
    'dolci'    => ['label' => 'Dolci',           'img' => 'dolce',    'color' => '#FFB6A2', 'line' => 'Il finale dolce, fatto in casa ogni mattina.'],
    'bibite'   => ['label' => 'Bibite',          'img' => 'bibita',   'color' => '#A8D672', 'line' => 'Fresche, frizzanti, con agrumi veri.'],
];

/** Prodotti: id => [categoria, nome, descrizione, prezzo, badge opzionale]. */
$products = [
    // Pizza
    'pz-margherita' => ['pizza', 'Margherita Sorriso', 'Pomodoro San Marzano, fiordilatte, basilico fresco, olio EVO.', 7.50, 'Più Venduto'],
    'pz-parma'      => ['pizza', 'Parma & Burrata', 'Prosciutto di Parma 24 mesi, burrata, rucola, scaglie di Parmigiano.', 11.90, 'Speciale'],
    'pz-diavola'    => ['pizza', 'Diavola Rossa', 'Salame piccante, fiordilatte, peperoncino fresco, miele al chili.', 9.50, null],
    'pz-ortolana'   => ['pizza', 'Ortolana di Primavera', 'Zucchine, melanzane, peperoni, pomodorini, pesto di basilico.', 9.90, null],
    'pz-formaggi'   => ['pizza', 'Quattro Formaggi', 'Fiordilatte, gorgonzola, Parmigiano Reggiano, provola affumicata.', 10.50, null],
    'pz-pistacchio' => ['pizza', 'Bufala & Pistacchio', 'Mozzarella di bufala, mortadella, stracciatella, granella di pistacchio.', 12.50, 'Nuovo'],
    // Burger Italiano
    'bg-parmense'   => ['burger', 'Il Parmense', 'Manzo 180 g, Prosciutto di Parma, provola fusa, rucola, pesto di basilico.', 11.90, 'Speciale'],
    'bg-caprese'    => ['burger', 'Caprese Burger', 'Manzo, mozzarella di bufala, pomodoro cuore di bue, glassa balsamica.', 10.90, null],
    'bg-calabrese'  => ['burger', 'Calabrese Piccante', 'Manzo, ’nduja, scamorza, cipolla caramellata, peperoni arrostiti.', 11.50, null],
    'bg-pollo'      => ['burger', 'Pollo Croccante', 'Cotoletta di pollo, insalata, pomodoro, maionese al limone.', 9.90, null],
    'bg-verde'      => ['burger', 'Verde Vegetariano', 'Burger di ceci e spinaci, zucchine grigliate, stracciatella, pesto.', 10.50, 'Nuovo'],
    'bg-doppio'     => ['burger', 'Doppio Parmigiano', 'Doppio manzo, crema di Parmigiano 30 mesi, pancetta croccante.', 13.90, 'Più Venduto'],
    // Panini
    'pn-ducale'     => ['panini', 'Il Ducale', 'Ciabatta croccante, Prosciutto di Parma, mozzarella, pomodoro, rucola.', 8.50, 'Nuovo'],
    'pn-mortazza'   => ['panini', 'Mortazza & Pistacchio', 'Focaccia, mortadella, stracciatella, pesto di pistacchio.', 8.90, 'Più Venduto'],
    'pn-porchetta'  => ['panini', 'Porchetta Street', 'Porchetta arrosto, provola, cime di rapa, salsa verde.', 9.20, null],
    'pn-cotoletta'  => ['panini', 'Cotoletta Milano', 'Cotoletta croccante, insalata, pomodoro, maionese della casa.', 8.90, null],
    'pn-ortolano'   => ['panini', 'L’Ortolano', 'Verdure grigliate, scamorza, crema di pomodori secchi.', 7.90, null],
    'pn-felino'     => ['panini', 'Il Felino', 'Salame di Felino, scaglie di Parmigiano, carciofini, rucola.', 8.50, 'Speciale'],
    // Pasta
    'ps-pomodoro'   => ['pasta', 'Rigatoni al Pomodoro', 'Pomodoro fresco, basilico, scaglie di Parmigiano Reggiano.', 7.90, 'Più Venduto'],
    'ps-tortelli'   => ['pasta', 'Tortelli d’Erbetta', 'La ricetta di Parma: ricotta, erbette, burro fuso e Parmigiano.', 9.90, 'Speciale'],
    'ps-carbonara'  => ['pasta', 'Carbonara Express', 'Guanciale croccante, pecorino romano, uovo, pepe nero.', 9.50, null],
    'ps-pesto'      => ['pasta', 'Fusilli al Pesto', 'Pesto di basilico, pinoli tostati, pomodorini confit.', 8.50, null],
    'ps-ragu'       => ['pasta', 'Tagliatelle al Ragù', 'Ragù cotto sei ore, Parmigiano Reggiano 24 mesi.', 9.90, null],
    'ps-arrabbiata' => ['pasta', 'Penne all’Arrabbiata', 'Pomodoro, aglio, peperoncino, prezzemolo fresco.', 7.90, null],
    // Insalate
    'in-burrata'    => ['insalate', 'Burrata & Pomodorini', 'Burrata, pomodorini, rucola, olive, crostini dorati.', 9.50, 'Più Venduto'],
    'in-caprese'    => ['insalate', 'Caprese Classica', 'Mozzarella di bufala, pomodoro, basilico, origano.', 8.50, null],
    'in-pollo'      => ['insalate', 'Pollo & Parmigiano', 'Pollo grigliato, lattuga, scaglie di Parmigiano, salsa al limone.', 9.90, null],
    'in-mediterranea' => ['insalate', 'Mediterranea', 'Tonno, fagiolini, patate, uovo, olive taggiasche.', 9.50, null],
    'in-primavera'  => ['insalate', 'Primavera', 'Farro, zucchine, piselli, menta, primo sale.', 8.90, 'Nuovo'],
    'in-parma'      => ['insalate', 'Parma Bowl', 'Prosciutto di Parma, melone, rucola, mozzarella.', 10.50, null],
    // Patatine
    'pt-classiche'  => ['patatine', 'Classiche', 'Croccanti, dorate, con sale marino.', 3.50, null],
    'pt-parmigiano' => ['patatine', 'Parmigiano & Rosmarino', 'Parmigiano Reggiano grattugiato e rosmarino fresco.', 4.90, 'Nuovo'],
    'pt-cacio'      => ['patatine', 'Cacio e Pepe', 'Crema di pecorino, pepe nero macinato al momento.', 5.20, 'Più Venduto'],
    'pt-tartufo'    => ['patatine', 'Al Tartufo', 'Olio al tartufo, Parmigiano, prezzemolo.', 5.90, 'Speciale'],
    'pt-nduja'      => ['patatine', '’Nduja Piccanti', 'Salsa alla ’nduja e scamorza fusa.', 5.50, null],
    'pt-dolci'      => ['patatine', 'Patate Dolci', 'Patate dolci fritte, maionese al lime.', 4.90, null],
    // Dolci
    'dl-tiramisu'   => ['dolci', 'Tiramisù della Casa', 'Mascarpone, savoiardi, caffè espresso, cacao amaro.', 4.90, 'Più Venduto'],
    'dl-cannolo'    => ['dolci', 'Cannolo Siciliano', 'Ricotta di pecora, gocce di cioccolato, pistacchio.', 4.50, null],
    'dl-pannacotta' => ['dolci', 'Panna Cotta', 'Panna fresca e coulis di frutti rossi.', 4.50, null],
    'dl-gelato'     => ['dolci', 'Coppa Gelato', 'Tre gusti artigianali a scelta.', 4.90, null],
    'dl-bombolone'  => ['dolci', 'Bombolone alla Crema', 'Fritto al momento, ripieno di crema pasticcera.', 3.90, 'Nuovo'],
    'dl-affogato'   => ['dolci', 'Affogato al Caffè', 'Gelato fiordilatte ed espresso caldo.', 4.20, null],
    // Bibite
    'bb-spritz'     => ['bibite', 'Spritz Analcolico', 'Arancia, bitter analcolico, soda e menta.', 4.50, 'Più Venduto'],
    'bb-limonata'   => ['bibite', 'Limonata Fresca', 'Limoni di Sicilia, zucchero di canna, menta.', 3.90, null],
    'bb-aranciata'  => ['bibite', 'Aranciata Rossa', 'Arance rosse, leggermente frizzante.', 3.50, null],
    'bb-te'         => ['bibite', 'Tè Freddo alla Pesca', 'Infuso a freddo, pesca e limone.', 3.50, null],
    'bb-birra'      => ['bibite', 'Birra Artigianale', 'Bionda del territorio, 33 cl.', 5.00, 'Speciale'],
    'bb-acqua'      => ['bibite', 'Acqua', 'Naturale o frizzante, 50 cl.', 1.50, null],
];

/** Best seller: ogni prodotto è lo spot di sé stesso. [id, colore scena, tema testo, parola gigante, frase]. */
$bestSellers = [
    ['pz-margherita', '#FFD447', 'dark',  'Margherita', 'Tre ingredienti, zero compromessi. La regina di casa.'],
    ['bg-parmense',   '#9DD7F7', 'dark',  'Parmense',   'Il burger che parla dialetto: Prosciutto di Parma e provola filante.'],
    ['pn-ducale',     '#A8D672', 'dark',  'Ducale',     'Croccante fuori, generoso dentro. Farcito al momento.'],
    ['ps-pomodoro',   '#FFB6A2', 'dark',  'Rigatoni',   'Pomodoro fresco e Parmigiano: la pasta della domenica, ogni giorno.'],
    ['pt-parmigiano', '#58A84C', 'light', 'Patatine',   'Dorate due volte, innevate di Parmigiano Reggiano.'],
];

/** Selezione rapida della scena "Ordina online". */
$quickPicks = ['pz-margherita', 'bg-parmense', 'pn-ducale', 'ps-pomodoro', 'in-burrata', 'pt-parmigiano', 'dl-tiramisu', 'bb-spritz'];

$features = [
    ['leaf-fill',         'Prodotti freschi',  'Verdure di stagione, mozzarella del giorno e impasti a lunga lievitazione preparati ogni mattina.', '#A8D672'],
    ['e-bike-2-fill',     'Consegna veloce',   'Dal forno alla tua porta in 25 minuti. Caldo, croccante e sempre puntuale.',                          '#9DD7F7'],
    ['restaurant-2-fill', 'Ricette italiane',  'Le ricette di casa, ripensate per chi ha fretta ma non rinuncia al gusto.',                           '#FFD447'],
    ['map-pin-2-fill',    'Prodotti locali',   'Prosciutto di Parma, Parmigiano Reggiano e fornitori a pochi chilometri da noi.',                     '#FFB6A2'],
];

$stats = [
    ['15',  ' min', 'tempo medio al banco'],
    ['48',  ' h',   'di lievitazione dell’impasto'],
    ['30',  ' km',  'raggio dei nostri fornitori'],
    ['4,9', ' / 5', 'voto medio dei clienti'],
];

$gallery = [
    ['g-pizza',    'Margherita, sole e basilico'],
    ['g-burger',   'Il Parmense, protagonista assoluto'],
    ['g-spritz',   'L’aperitivo che sa di primavera'],
    ['g-panino',   'Il Ducale, farcito al momento'],
    ['g-patatine', 'Patatine al Parmigiano, croccanti sempre'],
    ['g-pasta',    'Rigatoni al pomodoro, da passeggio'],
    ['g-insalata', 'Burrata e pomodorini, freschezza pura'],
    ['g-dolce',    'Tiramisù della casa, il gran finale'],
];

$reviews = [
    ['Giulia R.',  'Parma Centro',   'pz-margherita', 'La Margherita più buona che abbia mangiato fuori da Napoli. Arrivata calda in venti minuti, con un impasto leggerissimo.', '#FFD447'],
    ['Marco T.',   'Oltretorrente',  'bg-parmense',   'Il Parmense è una bomba: prosciutto vero, provola filante e pane morbidissimo. Ormai è la mia pausa pranzo fissa.',       '#9DD7F7'],
    ['Sara B.',    'Cittadella',     'pt-parmigiano', 'Locale coloratissimo, ragazzi sempre sorridenti e patatine al Parmigiano che creano dipendenza. Consigliatissimo!',        '#FFB6A2'],
    ['Luca M.',    'San Leonardo',   'pn-ducale',     'Ordinato dall’app e ritirato in dieci minuti. Il Ducale è croccante fuori e ricchissimo dentro. Top.',                     '#A8D672'],
    ['Elena P.',   'Montanara',      'dl-tiramisu',   'Finalmente un fast food dove si sente la qualità degli ingredienti. E il tiramisù è quello della nonna, giuro.',           '#FFD447'],
    ['Andrea F.',  'Campus',         'ps-pomodoro',   'Consegna puntuale e rider gentilissimo. La pasta nel box arriva ancora fumante: studiare non è mai stato così buono.',     '#9DD7F7'],
];

$faq = [
    ['Quanto tempo ci vuole per la consegna?', 'In media dai 25 ai 35 minuti in tutta Parma città. Dal momento dell’ordine puoi seguire il rider in tempo reale, passo dopo passo.'],
    ['In quali zone consegnate?', 'Consegniamo nel centro storico e in tutti i quartieri entro 5 km dal locale. Inserisci il tuo indirizzo al checkout: ti diciamo subito se sei in zona.'],
    ['Avete opzioni vegetariane, vegane o senza glutine?', 'Sì. Trovi pizze e burger vegetariani, insalate vegane e, su richiesta, l’impasto senza glutine preparato in un’area dedicata.'],
    ['Posso prenotare un tavolo per un gruppo?', 'Certo. Online puoi prenotare fino a 12 persone; per gruppi più numerosi, compleanni o feste di laurea chiamaci e organizziamo tutto insieme.'],
    ['Quali metodi di pagamento accettate?', 'Carte di credito e debito, Apple Pay, Google Pay, Satispay e contanti alla consegna o al ritiro.'],
    ['Come funziona il programma fedeltà?', 'Ogni euro speso vale un punto. A 100 punti la prossima Margherita la offriamo noi. Scarica l’app e inizia a collezionare sorrisi.'],
];

/** Orari: giorno ISO (1 = lunedì) => [apertura, chiusura]. */
$hours = [
    1 => ['11:30', '23:00'], 2 => ['11:30', '23:00'], 3 => ['11:30', '23:00'], 4 => ['11:30', '23:00'],
    5 => ['11:30', '01:00'], 6 => ['11:30', '01:00'], 7 => ['12:00', '23:00'],
];
$dayNames = [1 => 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

/* ---------------------------------------------------------------------------
 * 3. HELPER
 * ------------------------------------------------------------------------- */

/** Escape HTML. */
function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** URL di un asset con cache‑busting basato sulla data di modifica. */
function asset(string $path): string
{
    $file = __DIR__ . '/assets/' . $path;
    return 'assets/' . $path . (is_file($file) ? '?v=' . filemtime($file) : '');
}

/** Icona dallo sprite SVG (Remix Icon). */
function icon(string $name, string $class = ''): string
{
    return '<svg class="icon ' . e($class) . '" aria-hidden="true" focusable="false"><use href="assets/img/icons.svg#' . e($name) . '"></use></svg>';
}

/** Prezzo in formato italiano. */
function euro(float $value): string
{
    return number_format($value, 2, ',', '.') . ' €';
}

/**
 * <img> responsive di un prodotto scontornato (WebP con trasparenza).
 * Legge le dimensioni reali per riservare lo spazio ed evitare layout shift.
 */
function cutout(string $name, string $alt, string $sizes = '50vw', bool $lazy = true, string $class = ''): string
{
    static $cache = [];
    $dir = 'assets/img/products/';
    if (!isset($cache[$name])) {
        $set = [];
        foreach ([320, 640, 1280] as $size) {
            $info = @getimagesize(__DIR__ . '/' . $dir . $name . '-' . $size . '.webp');
            if ($info) {
                $set[$size] = [$info[0], $info[1]];
            }
        }
        $cache[$name] = $set ?: [640 => [640, 640]];
    }
    $set = $cache[$name];
    [$w, $h] = $set[640] ?? reset($set);
    $srcset = [];
    foreach ($set as $size => [$sw]) {
        $srcset[] = $dir . $name . '-' . $size . '.webp ' . $sw . 'w';
    }
    return sprintf(
        '<img class="%s" src="%s%s-640.webp" srcset="%s" sizes="%s" width="%d" height="%d" alt="%s"%s decoding="async" draggable="false">',
        e($class), $dir, $name, implode(', ', $srcset), e($sizes), $w, $h, e($alt),
        $lazy ? ' loading="lazy"' : ' fetchpriority="high"'
    );
}

/** Badge prodotto → classe colore. */
function badge(?string $label): string
{
    if (!$label) {
        return '';
    }
    $map = ['Nuovo' => 'badge--new', 'Più Venduto' => 'badge--top', 'Speciale' => 'badge--special'];
    return '<span class="badge ' . ($map[$label] ?? '') . '">' . e($label) . '</span>';
}

/** Logo: pomodoro sorridente + wordmark. */
function logo(string $name, string $claim): string
{
    return '<span class="logo__mark" aria-hidden="true"><svg viewBox="0 0 48 48" width="44" height="44">'
        . '<circle cx="24" cy="26" r="19" fill="#E63946"/>'
        . '<path d="M24 9.5c1.6-3.4 4.6-5.3 8.6-5.5-.2 3.6-2 6.3-5.2 7.9 3 .1 5.4 1.2 7.2 3.3-3.4 1.6-6.9 1.3-10.6-.9-3.7 2.2-7.2 2.5-10.6.9 1.8-2.1 4.2-3.2 7.2-3.3-3.2-1.6-5-4.3-5.2-7.9 4 .2 7 2.1 8.6 5.5z" fill="#58A84C"/>'
        . '<path class="logo__smile" d="M14.5 27.5c2.2 5.4 5.4 8 9.5 8s7.3-2.6 9.5-8" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>'
        . '</svg></span>'
        . '<span class="logo__text"><strong>' . e(strtolower($name)) . '</strong><small>' . e($claim) . '</small></span>';
}

/** QR code fittizio ma credibile (pattern deterministico + tre "finder"). */
function fake_qr(string $seed, int $n = 25): string
{
    mt_srand(crc32($seed));
    $cells = '';
    $inFinder = static function (int $x, int $y) use ($n): bool {
        return ($x < 8 && $y < 8) || ($x >= $n - 8 && $y < 8) || ($x < 8 && $y >= $n - 8);
    };
    for ($y = 0; $y < $n; $y++) {
        for ($x = 0; $x < $n; $x++) {
            if (!$inFinder($x, $y) && mt_rand(0, 100) < 47) {
                $cells .= "M{$x} {$y}h1v1h-1z";
            }
        }
    }
    $finder = '';
    foreach ([[0, 0], [$n - 7, 0], [0, $n - 7]] as [$fx, $fy]) {
        $finder .= sprintf('<rect x="%d" y="%d" width="7" height="7" rx="1.8"/><rect x="%d" y="%d" width="5" height="5" rx="1.1" fill="#fff"/><rect x="%d" y="%d" width="3" height="3" rx=".7"/>', $fx, $fy, $fx + 1, $fy + 1, $fx + 2, $fy + 2);
    }
    mt_srand();
    return '<svg class="qr" viewBox="-1 -1 ' . ($n + 2) . ' ' . ($n + 2) . '" role="img" aria-label="QR code dimostrativo" fill="#1D1D1D"><rect x="-1" y="-1" width="' . ($n + 2) . '" height="' . ($n + 2) . '" fill="#fff"/><path d="' . $cells . '"/>' . $finder . '</svg>';
}

/** Stato di apertura calcolato sull'ora di Parma. */
function open_state(array $hours): array
{
    $now   = new DateTimeImmutable('now');
    $today = (int) $now->format('N');
    $mins  = (int) $now->format('G') * 60 + (int) $now->format('i');
    $toMin = static fn (string $t): int => (int) substr($t, 0, 2) * 60 + (int) substr($t, 3, 2);

    // Chiusura dopo mezzanotte del giorno precedente (es. venerdì → 01:00).
    $yesterday = $today === 1 ? 7 : $today - 1;
    [$yo, $yc] = array_map($toMin, $hours[$yesterday]);
    if ($yc < $yo && $mins < $yc) {
        return ['open' => true, 'label' => 'Aperto ora · chiude alle ' . $hours[$yesterday][1], 'today' => $today];
    }
    [$o, $c] = array_map($toMin, $hours[$today]);
    if ($c < $o) {
        $c += 1440;
    }
    if ($mins >= $o && $mins < $c) {
        return ['open' => true, 'label' => 'Aperto ora · chiude alle ' . $hours[$today][1], 'today' => $today];
    }
    if ($mins < $o) {
        return ['open' => false, 'label' => 'Chiuso · apre alle ' . $hours[$today][0], 'today' => $today];
    }
    $tomorrow = $today === 7 ? 1 : $today + 1;
    return ['open' => false, 'label' => 'Chiuso · apre domani alle ' . $hours[$tomorrow][0], 'today' => $today];
}

$state = open_state($hours);
$year  = date('Y');

/** Catalogo compatto per il carrello lato client. */
$catalog = [];
foreach ($products as $id => [$cat, $name, $desc, $price]) {
    $catalog[$id] = ['name' => $name, 'price' => $price, 'img' => $categories[$cat]['img'], 'color' => $categories[$cat]['color'], 'cat' => $categories[$cat]['label']];
}
$clientConfig = [
    'brand'    => $brand['name'],
    'promo'    => $brand['promo'],
    'delivery' => $brand['delivery'],
    'catalog'  => $catalog,
];

/** Orari per il select di prenotazione (ogni 30 minuti). */
$slots = [];
foreach ([[12, 15], [19, 23]] as [$from, $to]) {
    for ($h = $from; $h < $to; $h++) {
        $slots[] = sprintf('%02d:00', $h);
        $slots[] = sprintf('%02d:30', $h);
    }
}
?>
<!DOCTYPE html>
<html lang="it" class="no-js">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title><?= e($brand['name']) ?> — <?= e($brand['claim']) ?> a <?= e($brand['city']) ?> · Il gusto italiano che mette il sorriso</title>
    <meta name="description" content="Pizza, burger italiani, panini e pasta preparati al momento con ingredienti freschi del territorio. Ordina online, ritira in 15 minuti o ricevi a casa a <?= e($brand['city']) ?>.">
    <meta name="theme-color" content="#FFFDF8">
    <meta property="og:title" content="<?= e($brand['name']) ?> — <?= e($brand['claim']) ?> a <?= e($brand['city']) ?>">
    <meta property="og:description" content="Il gusto italiano che mette il sorriso.">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="it_IT">
    <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">

    <!-- Precaricamento intelligente: font dei titoli + prodotto hero -->
    <link rel="preload" href="assets/fonts/poppins-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" as="image" type="image/webp" href="assets/img/products/pizza-640.webp" imagesrcset="assets/img/products/pizza-320.webp 320w, assets/img/products/pizza-640.webp 640w, assets/img/products/pizza-1280.webp 1280w" imagesizes="(max-width: 900px) 92vw, 60vw">

    <link rel="stylesheet" href="<?= asset('vendor/swiper-bundle.min.css') ?>">
    <link rel="stylesheet" href="<?= asset('css/base.css') ?>">
    <link rel="stylesheet" href="<?= asset('css/components.css') ?>">
    <link rel="stylesheet" href="<?= asset('css/sections.css') ?>">

    <script>document.documentElement.className = document.documentElement.className.replace('no-js', 'js');</script>
    <noscript><style>.preloader{display:none!important}</style></noscript>
</head>
<body>

<!-- =========================================================================
     PRELOADER — sipario d'apertura
     ====================================================================== -->
<div class="preloader" id="preloader" aria-hidden="true">
    <div class="preloader__layer preloader__layer--back"></div>
    <div class="preloader__layer preloader__layer--front">
        <div class="preloader__logo logo logo--light"><?= logo($brand['name'], $brand['claim']) ?></div>
        <div class="preloader__words"><span>Impastiamo</span><span>Inforniamo</span><span>Serviamo!</span></div>
        <div class="preloader__count"><span data-preload-count>0</span>%</div>
    </div>
</div>

<!-- Elementi globali d'interfaccia -->
<div class="progress" aria-hidden="true"><span class="progress__bar"></span></div>
<div class="cursor" aria-hidden="true"><div class="cursor__ring"><span class="cursor__label"></span></div><div class="cursor__dot"></div></div>
<div class="grain" aria-hidden="true"></div>
<canvas class="confetti" id="confetti" aria-hidden="true"></canvas>
<div class="toasts" id="toasts" role="status" aria-live="polite"></div>
<a class="skip-link" href="#main">Vai al contenuto</a>

<!-- =========================================================================
     HEADER
     ====================================================================== -->
<header class="header" id="header">
    <div class="header__inner">
        <a class="logo" href="#home" aria-label="<?= e($brand['name']) ?> — torna all'inizio"><?= logo($brand['name'], $brand['claim']) ?></a>

        <nav class="nav" aria-label="Navigazione principale">
            <?php foreach ($nav as $anchor => $label): ?>
                <a class="nav__link" href="#<?= $anchor ?>"><span><?= e($label) ?></span></a>
            <?php endforeach; ?>
        </nav>

        <div class="header__actions">
            <button class="cart-btn" type="button" data-cart-open aria-label="Apri il carrello">
                <?= icon('shopping-bag-3-line') ?>
                <span class="cart-btn__count" data-cart-count>0</span>
            </button>
            <a class="btn btn--primary btn--sm header__cta" href="#delivery" data-magnetic>
                <span class="btn__label">Ordina Ora</span>
                <span class="btn__icon"><?= icon('arrow-right-up-line') ?></span>
            </a>
            <button class="burger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="mobile-nav">
                <span></span><span></span>
            </button>
        </div>
    </div>
</header>

<!-- Navigazione mobile a tutto schermo -->
<div class="mobile-nav" id="mobile-nav" aria-hidden="true">
    <nav class="mobile-nav__links" aria-label="Navigazione mobile">
        <?php $i = 0; foreach ($nav as $anchor => $label): $i++; ?>
            <a href="#<?= $anchor ?>"><small><?= sprintf('%02d', $i) ?></small><?= e($label) ?></a>
        <?php endforeach; ?>
    </nav>
    <div class="mobile-nav__foot">
        <a class="btn btn--primary" href="#delivery"><span class="btn__label">Ordina Ora</span><span class="btn__icon"><?= icon('arrow-right-up-line') ?></span></a>
        <p><?= e($brand['address']) ?> · <?= e($brand['city']) ?></p>
    </div>
</div>

<main id="main">

<!-- =========================================================================
     SCENA 01 — HERO
     ====================================================================== -->
<section class="hero" id="home" data-nav="home">
    <div class="hero__bg" aria-hidden="true">
        <span class="blob blob--sun"></span>
        <span class="blob blob--peach"></span>
        <span class="blob blob--sky"></span>
        <span class="blob blob--mint"></span>
        <svg class="hero__rings" viewBox="0 0 800 800" fill="none">
            <circle cx="400" cy="400" r="398" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 14" stroke-linecap="round"/>
            <circle cx="400" cy="400" r="330" stroke="currentColor" stroke-width="1.5" stroke-dasharray="1 22" stroke-linecap="round"/>
        </svg>
        <div class="particles" data-particles="18"></div>
    </div>

    <div class="hero__inner container">
        <div class="hero__copy">
            <p class="eyebrow hero__eyebrow" data-hero-fade><span class="eyebrow__pulse"></span><?= e($brand['claim']) ?> · <?= e($brand['city']) ?></p>

            <h1 class="hero__title" aria-label="Il gusto italiano che mette il sorriso.">
                <span class="hero__line" aria-hidden="true"><span data-hero-split>Il gusto</span></span>
                <span class="hero__line" aria-hidden="true"><span data-hero-split>italiano che</span></span>
                <span class="hero__line" aria-hidden="true"><span data-hero-split>mette il</span>
                    <span class="smile"><span data-hero-split>sorriso.</span>
                        <svg class="smile__line" viewBox="0 0 300 40" preserveAspectRatio="none" fill="none"><path d="M6 10c58 30 228 30 288 0" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>
                    </span>
                </span>
            </h1>

            <p class="hero__lead" data-hero-fade>Pizza, burger e panini preparati al momento con ingredienti freschi del territorio. Pronti in 15 minuti, buoni come a casa.</p>

            <div class="hero__cta" data-hero-fade>
                <a class="btn btn--primary btn--lg btn--pulse" href="#delivery" data-magnetic data-cursor="Via!">
                    <span class="btn__label">Ordina Ora</span>
                    <span class="btn__icon"><?= icon('arrow-right-up-line') ?></span>
                </a>
                <a class="btn btn--ghost btn--lg" href="#menu" data-magnetic>
                    <span class="btn__label">Scopri il Menu</span>
                    <span class="btn__icon"><?= icon('arrow-down-line') ?></span>
                </a>
            </div>

            <ul class="hero__stats" data-hero-fade>
                <li><strong>4,9 <?= icon('star-fill') ?></strong><span>oltre 1.200 recensioni</span></li>
                <li><strong>15 min</strong><span>pronto al banco</span></li>
                <li><strong>100%</strong><span>ingredienti italiani</span></li>
            </ul>
        </div>
    </div>

    <!-- Palcoscenico del prodotto: pizza gigante + ingredienti in volo -->
    <div class="hero__stage" data-parallax-root aria-hidden="true">
        <div class="hero__camera">
            <div class="hero__halo"></div>
            <div class="hero__shadow"></div>
            <div class="hero__product">
                <?= cutout('pizza', '', '(max-width: 900px) 92vw, 60vw', false, 'hero__pizza') ?>
            </div>

            <div class="floater floater--basil-1" data-depth="0.9"><div class="floater__p"><img src="assets/img/products/basil-320.webp" width="320" height="163" alt=""></div></div>
            <div class="floater floater--tomato-1" data-depth="0.6"><div class="floater__p"><img src="assets/img/products/tomato-320.webp" width="289" height="320" alt=""></div></div>
            <div class="floater floater--basil-2" data-depth="0.4"><div class="floater__p"><img src="assets/img/products/basil-320.webp" width="320" height="163" alt=""></div></div>
            <div class="floater floater--lemon" data-depth="0.75"><div class="floater__p"><svg class="sticker"><use href="assets/img/decor.svg#lemon"></use></svg></div></div>
            <div class="floater floater--tomato-2" data-depth="1.2"><div class="floater__p"><img src="assets/img/products/tomato-320.webp" width="289" height="320" alt=""></div></div>
            <div class="floater floater--mozza" data-depth="0.5"><div class="floater__p"><svg class="sticker"><use href="assets/img/decor.svg#mozzarella"></use></svg></div></div>
            <div class="floater floater--basil-3" data-depth="1.4"><div class="floater__p"><img src="assets/img/products/basil-320.webp" width="320" height="163" alt=""></div></div>
            <div class="floater floater--olive" data-depth="1"><div class="floater__p"><svg class="sticker"><use href="assets/img/decor.svg#olive"></use></svg></div></div>
            <div class="floater floater--spark" data-depth="0.3"><div class="floater__p"><svg class="sticker"><use href="assets/img/decor.svg#spark"></use></svg></div></div>
        </div>

        <div class="hero__seal" data-depth="0.5">
            <svg viewBox="0 0 200 200">
                <defs><path id="seal-path" d="M100 100m-76 0a76 76 0 1 1 152 0a76 76 0 1 1-152 0"/></defs>
                <circle cx="100" cy="100" r="100" fill="#E63946"/>
                <text><textPath href="#seal-path" startOffset="0">FRESCO OGNI GIORNO • PRONTO IN 15 MINUTI • </textPath></text>
            </svg>
            <span class="hero__seal-core"><?= icon('fire-fill') ?></span>
        </div>
    </div>

    <!-- Card prodotto "in vetro" -->
    <div class="hero__tag glass" data-hero-pop>
        <span class="hero__tag-thumb"><img src="assets/img/products/slice-320.webp" width="320" height="320" alt="" decoding="async"></span>
        <span class="hero__tag-text"><small>Più venduta</small><strong>Margherita Sorriso</strong><em><?= euro($products['pz-margherita'][3]) ?></em></span>
        <button class="add-btn" type="button" data-add="pz-margherita" data-cursor="Aggiungi" aria-label="Aggiungi Margherita Sorriso al carrello"><?= icon('add-line') ?></button>
    </div>
    <div class="hero__chip glass" data-hero-pop>
        <span class="hero__chip-icon"><?= icon('e-bike-2-fill') ?></span>
        <span><strong>Consegna in 25 min</strong><small>in tutta <?= e($brand['city']) ?></small></span>
    </div>

    <a class="scroll-indicator" href="#perche" data-hero-fade aria-label="Scorri per scoprire">
        <span class="scroll-indicator__mouse"><i></i></span>
        <span class="scroll-indicator__label">Scorri</span>
    </a>
</section>

<!-- Nastro pubblicitario -->
<div class="ribbon" aria-hidden="true">
    <div class="ribbon__band ribbon__band--a" data-marquee="1">
        <div class="ribbon__track">
            <?php for ($r = 0; $r < 2; $r++): foreach ($categories as $c): ?>
                <span><?= e($c['label']) ?></span><svg class="ribbon__star"><use href="assets/img/decor.svg#spark-solid"></use></svg>
            <?php endforeach; endfor; ?>
        </div>
    </div>
    <div class="ribbon__band ribbon__band--b" data-marquee="-1">
        <div class="ribbon__track">
            <?php for ($r = 0; $r < 3; $r++): foreach (['Fatto al momento', 'Ingredienti di Parma', 'Pronto in 15 minuti', 'Consegna veloce', 'Buono davvero'] as $t): ?>
                <span><?= e($t) ?></span><svg class="ribbon__star"><use href="assets/img/decor.svg#smile"></use></svg>
            <?php endforeach; endfor; ?>
        </div>
    </div>
</div>

<!-- =========================================================================
     SCENA 02 — PERCHÉ NOI
     ====================================================================== -->
<section class="why" id="perche" data-bg="#FFFDF8">
    <div class="container">
        <p class="eyebrow" data-reveal>Perché noi</p>
        <p class="why__statement" data-scrub-words>Ogni mattina scegliamo ingredienti freschi dai mercati di <mark>Parma</mark>. Ogni giorno li trasformiamo in street food italiano che arriva <mark>caldo</mark>, <mark>veloce</mark> e con il <mark>sorriso</mark>.</p>

        <div class="why__grid">
            <?php foreach ($features as $n => [$ic, $title, $text, $color]): ?>
                <article class="feature" data-tilt data-reveal-card style="--accent: <?= $color ?>">
                    <span class="feature__num"><?= sprintf('%02d', $n + 1) ?></span>
                    <span class="feature__icon feature__icon--<?= $n + 1 ?>"><span class="feature__blob"></span><?= icon($ic) ?></span>
                    <h3 class="feature__title"><?= e($title) ?></h3>
                    <p class="feature__text"><?= e($text) ?></p>
                    <span class="feature__glow"></span>
                </article>
            <?php endforeach; ?>
        </div>

        <ul class="why__stats">
            <?php foreach ($stats as [$num, $unit, $label]): ?>
                <li data-reveal>
                    <strong><span data-count="<?= e($num) ?>"><?= e($num) ?></span><small><?= e($unit) ?></small></strong>
                    <span><?= e($label) ?></span>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>

    <svg class="float-deco float-deco--why-1 sticker" data-float aria-hidden="true"><use href="assets/img/decor.svg#lemon"></use></svg>
    <img class="float-deco float-deco--why-2" data-float src="assets/img/products/basil-320.webp" width="320" height="163" alt="" loading="lazy" decoding="async">
</section>

<!-- =========================================================================
     SCENA 03 — BEST SELLER (spot orizzontali)
     ====================================================================== -->
<section class="best" id="bestseller" data-nav="bestseller">
    <div class="best__pin">
        <header class="best__head">
            <p class="eyebrow eyebrow--onColor">Best Seller</p>
            <h2 class="best__title">I più amati<br>di <?= e($brand['city']) ?>.</h2>
        </header>

        <div class="best__track">
            <?php foreach ($bestSellers as $n => [$id, $color, $theme, $word, $line]):
                [$cat, $name, $desc, $price, $tag] = $products[$id];
                $img = $categories[$cat]['img']; ?>
                <article class="spot spot--<?= $theme ?> spot--<?= $img ?>" style="--scene: <?= $color ?>" data-color="<?= $color ?>" data-theme="<?= $theme ?>">
                    <span class="spot__word" aria-hidden="true"><?= e($word) ?></span>
                    <div class="spot__visual" data-tilt-soft>
                        <span class="spot__disc"></span>
                        <div class="spot__product"><?= cutout($img, $name, '(max-width: 900px) 80vw, 42vw', true, 'spot__img') ?></div>
                        <span class="spot__price"><small>solo</small><strong><?= euro($price) ?></strong></span>
                        <img class="spot__deco spot__deco--a" src="assets/img/products/basil-320.webp" width="320" height="163" alt="" loading="lazy" decoding="async">
                        <img class="spot__deco spot__deco--b" src="assets/img/products/tomato-320.webp" width="289" height="320" alt="" loading="lazy" decoding="async">
                    </div>
                    <div class="spot__info">
                        <span class="spot__index"><?= sprintf('%02d', $n + 1) ?><i>/</i><?= sprintf('%02d', count($bestSellers)) ?></span>
                        <?= badge($tag) ?>
                        <h3 class="spot__name"><?= e($name) ?></h3>
                        <p class="spot__line"><?= e($line) ?></p>
                        <p class="spot__desc"><?= e($desc) ?></p>
                        <div class="spot__actions">
                            <button class="btn btn--dark btn--lg" type="button" data-add="<?= $id ?>" data-magnetic data-cursor="Gnam!">
                                <span class="btn__label">Aggiungi</span>
                                <span class="btn__icon"><?= icon('add-line') ?></span>
                            </button>
                            <span class="spot__kcal"><?= icon('timer-flash-line') ?> pronto in 15 min</span>
                        </div>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>

        <div class="best__progress" aria-hidden="true"><span></span></div>
    </div>
</section>

<!-- =========================================================================
     SCENA 04 — MENU
     ====================================================================== -->
<section class="menu" id="menu" data-nav="menu" data-bg="#FFF6E8">
    <div class="container">
        <header class="section-head section-head--center">
            <p class="eyebrow" data-reveal>Il nostro menu</p>
            <h2 class="title" data-split>Scegli la tua <span class="hl hl--red">felicità.</span></h2>
            <p class="lead" data-reveal>Otto famiglie di bontà, un solo ingrediente segreto: la voglia di farti stare bene.</p>
        </header>

        <div class="menu__tabs" role="tablist" aria-label="Categorie del menu" data-reveal>
            <span class="menu__tab-pill" aria-hidden="true"></span>
            <?php $first = true; foreach ($categories as $key => $c): ?>
                <button class="menu__tab<?= $first ? ' is-active' : '' ?>" type="button" role="tab" id="tab-<?= $key ?>" aria-selected="<?= $first ? 'true' : 'false' ?>" aria-controls="panel-<?= $key ?>" data-tab="<?= $key ?>" data-color="<?= $c['color'] ?>"<?= $first ? '' : ' tabindex="-1"' ?>>
                    <img src="assets/img/products/<?= $c['img'] ?>-160.webp" width="40" height="40" alt="" loading="lazy" decoding="async">
                    <span><?= e($c['label']) ?></span>
                </button>
            <?php $first = false; endforeach; ?>
        </div>

        <div class="menu__body">
            <!-- Vetrina della categoria -->
            <aside class="menu__stage" style="--scene: <?= reset($categories)['color'] ?>">
                <span class="menu__stage-blob" aria-hidden="true"></span>
                <span class="menu__stage-ring" aria-hidden="true"></span>
                <?php $first = true; foreach ($categories as $key => $c): ?>
                    <figure class="menu__hero<?= $first ? ' is-active' : '' ?>" data-stage="<?= $key ?>">
                        <?= cutout($c['img'], $c['label'], '(max-width: 900px) 70vw, 34vw', true, 'menu__hero-img') ?>
                    </figure>
                <?php $first = false; endforeach; ?>
                <div class="menu__stage-copy">
                    <strong class="menu__stage-title" data-stage-title><?= e(reset($categories)['label']) ?></strong>
                    <p class="menu__stage-line" data-stage-line><?= e(reset($categories)['line']) ?></p>
                </div>
                <?php foreach ($categories as $key => $c): ?>
                    <template data-stage-data="<?= $key ?>" data-title="<?= e($c['label']) ?>" data-line="<?= e($c['line']) ?>" data-color="<?= $c['color'] ?>"></template>
                <?php endforeach; ?>
            </aside>

            <!-- Pannelli prodotti -->
            <div class="menu__panels">
                <?php $first = true; foreach ($categories as $key => $c): ?>
                    <div class="menu__panel<?= $first ? ' is-active' : '' ?>" role="tabpanel" id="panel-<?= $key ?>" aria-labelledby="tab-<?= $key ?>" data-panel="<?= $key ?>"<?= $first ? '' : ' hidden' ?>>
                        <?php foreach ($products as $id => [$cat, $name, $desc, $price, $tag]): if ($cat !== $key) continue; ?>
                            <article class="dish" data-glow style="--scene: <?= $c['color'] ?>">
                                <span class="dish__thumb"><img src="assets/img/products/<?= $c['img'] ?>-160.webp" width="160" height="160" alt="" loading="lazy" decoding="async"></span>
                                <div class="dish__body">
                                    <div class="dish__top">
                                        <h3 class="dish__name"><?= e($name) ?></h3>
                                        <?= badge($tag) ?>
                                    </div>
                                    <p class="dish__desc"><?= e($desc) ?></p>
                                    <div class="dish__foot">
                                        <strong class="dish__price"><?= euro($price) ?></strong>
                                        <button class="add-btn add-btn--label" type="button" data-add="<?= $id ?>" data-cursor="Aggiungi" aria-label="Aggiungi <?= e($name) ?> al carrello">
                                            <span>Aggiungi</span><?= icon('add-line') ?>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php $first = false; endforeach; ?>
            </div>
        </div>
    </div>
</section>

<!-- =========================================================================
     SCENA 05 — PROMO
     ====================================================================== -->
<section class="promo" id="promo" data-bg="#FFF6E8">
    <div class="container">
        <div class="promo__card" data-promo>
            <div class="promo__bg" aria-hidden="true">
                <span class="promo__blob promo__blob--1"></span>
                <span class="promo__blob promo__blob--2"></span>
                <div class="bubbles" data-bubbles="14"></div>
                <svg class="promo__wave" viewBox="0 0 1440 160" preserveAspectRatio="none"><path d="M0 80c160-60 320-60 480 0s320 60 480 0 320-60 480 0v80H0z" fill="rgba(255,255,255,.12)"/></svg>
            </div>

            <div class="promo__copy">
                <p class="promo__kicker"><?= icon('gift-2-fill') ?> Offerta di benvenuto</p>
                <h2 class="promo__title"><span class="promo__big">−<?= (int) $brand['promo']['percent'] ?>%</span><span class="promo__sub">sul tuo primo<br>ordine online</span></h2>
                <p class="promo__text">Inserisci il codice al checkout e goditi il primo morso con lo sconto. Vale su tutto il menu, consegna o asporto.</p>

                <div class="promo__row">
                    <button class="coupon" type="button" data-copy="<?= e($brand['promo']['code']) ?>" data-cursor="Copia" aria-label="Copia il codice promozionale <?= e($brand['promo']['code']) ?>">
                        <span class="coupon__label">Codice</span>
                        <strong class="coupon__code"><?= e($brand['promo']['code']) ?></strong>
                        <span class="coupon__copy"><?= icon('file-copy-line') ?></span>
                    </button>
                    <a class="btn btn--light btn--lg" href="#delivery" data-magnetic>
                        <span class="btn__label">Usalo subito</span>
                        <span class="btn__icon"><?= icon('arrow-right-up-line') ?></span>
                    </a>
                </div>

                <div class="countdown" data-countdown aria-label="Tempo rimanente per l'offerta">
                    <p class="countdown__label">L’offerta termina tra</p>
                    <div class="countdown__units">
                        <div class="countdown__unit"><strong data-cd="h">00</strong><span>ore</span></div>
                        <i>:</i>
                        <div class="countdown__unit"><strong data-cd="m">00</strong><span>min</span></div>
                        <i>:</i>
                        <div class="countdown__unit"><strong data-cd="s">00</strong><span>sec</span></div>
                    </div>
                </div>
            </div>

            <div class="promo__visual" aria-hidden="true">
                <span class="promo__sun"></span>
                <div class="promo__item promo__item--fries"><?= cutout('patatine', '', '(max-width: 900px) 46vw, 24vw') ?></div>
                <div class="promo__item promo__item--drink"><?= cutout('bibita', '', '(max-width: 900px) 24vw, 12vw') ?></div>
                <div class="promo__item promo__item--burger"><?= cutout('burger', '', '(max-width: 900px) 50vw, 26vw') ?></div>
                <span class="promo__burst"><svg viewBox="0 0 200 200"><use href="assets/img/decor.svg#burst"></use></svg><b>Solo<br>online</b></span>
            </div>
        </div>
    </div>
</section>

<!-- =========================================================================
     SCENA 06 — ORDINA ONLINE
     ====================================================================== -->
<section class="order" id="delivery" data-nav="delivery" data-bg="#FFFDF8">
    <div class="container">
        <header class="section-head">
            <p class="eyebrow" data-reveal>Ordina online</p>
            <h2 class="title" data-split>A casa tua o al volo: <span class="hl hl--orange">decidi tu.</span></h2>
            <p class="lead" data-reveal>Scegli come vuoi ricevere il tuo ordine, aggiungi i tuoi preferiti e al resto pensiamo noi.</p>
        </header>

        <div class="order__modes" role="radiogroup" aria-label="Modalità di ritiro">
            <button class="mode is-active" type="button" role="radio" aria-checked="true" data-mode="consegna" data-tilt data-reveal-card>
                <span class="mode__check"><?= icon('check-line') ?></span>
                <span class="mode__icon mode__icon--ride"><?= icon('e-bike-2-fill') ?></span>
                <span class="mode__body">
                    <strong>Consegna</strong>
                    <span>Arriviamo noi in 25–35 minuti, in tutta <?= e($brand['city']) ?>.</span>
                    <em><?= euro($brand['delivery']['fee']) ?> · gratis sopra <?= number_format($brand['delivery']['free_from'], 0) ?> €</em>
                </span>
                <span class="mode__road" aria-hidden="true"></span>
            </button>
            <button class="mode" type="button" role="radio" aria-checked="false" data-mode="asporto" data-tilt data-reveal-card>
                <span class="mode__check"><?= icon('check-line') ?></span>
                <span class="mode__icon mode__icon--bag"><?= icon('takeaway-fill') ?></span>
                <span class="mode__body">
                    <strong>Asporto</strong>
                    <span>Ordini ora, ritiri al banco in 15 minuti senza fare la fila.</span>
                    <em>Ritiro gratuito · <?= e($brand['address']) ?></em>
                </span>
                <span class="mode__road" aria-hidden="true"></span>
            </button>
        </div>

        <div class="order__body">
            <div class="order__picks">
                <?php foreach ($quickPicks as $id):
                    [$cat, $name, $desc, $price] = $products[$id];
                    $c = $categories[$cat]; ?>
                    <article class="pick" data-pick="<?= $id ?>" data-reveal-card style="--scene: <?= $c['color'] ?>">
                        <span class="pick__visual"><?= cutout($c['img'], $name, '(max-width: 700px) 40vw, 180px', true, 'pick__img') ?></span>
                        <span class="pick__cat"><?= e($c['label']) ?></span>
                        <h3 class="pick__name"><?= e($name) ?></h3>
                        <div class="pick__foot">
                            <strong><?= euro($price) ?></strong>
                            <div class="stepper" data-stepper="<?= $id ?>">
                                <button type="button" class="stepper__btn stepper__btn--minus" data-step="-1" aria-label="Rimuovi un <?= e($name) ?>"><?= icon('subtract-line') ?></button>
                                <output class="stepper__qty" aria-live="polite">0</output>
                                <button type="button" class="stepper__btn stepper__btn--plus" data-step="1" data-cursor="Aggiungi" aria-label="Aggiungi un <?= e($name) ?>"><?= icon('add-line') ?></button>
                            </div>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>

            <!-- Riepilogo in tempo reale -->
            <aside class="summary" data-summary aria-label="Riepilogo dell'ordine">
                <div class="summary__head">
                    <h3>Il tuo ordine</h3>
                    <span class="summary__mode" data-mode-label><?= icon('e-bike-2-fill') ?> Consegna</span>
                </div>
                <ul class="summary__list" data-summary-list></ul>
                <p class="summary__empty" data-summary-empty><?= icon('emotion-happy-line') ?> Il carrello è vuoto. Aggiungi qualcosa di buono!</p>
                <dl class="summary__totals">
                    <div><dt>Subtotale</dt><dd data-subtotal>0,00 €</dd></div>
                    <div class="summary__discount" data-discount-row hidden><dt>Sconto <span data-discount-code></span></dt><dd data-discount>−0,00 €</dd></div>
                    <div><dt>Consegna</dt><dd data-shipping>—</dd></div>
                    <div class="summary__total"><dt>Totale</dt><dd data-total>0,00 €</dd></div>
                </dl>
                <p class="summary__hint" data-free-hint></p>
                <button class="btn btn--primary btn--block" type="button" data-cart-open data-magnetic>
                    <span class="btn__label">Vai al carrello</span>
                    <span class="btn__icon"><?= icon('arrow-right-line') ?></span>
                </button>
                <p class="summary__safe"><?= icon('shield-check-line') ?> Demo: nessun pagamento reale verrà effettuato.</p>
            </aside>
        </div>
    </div>
    <img class="float-deco float-deco--order-1" data-float src="assets/img/products/tomato-320.webp" width="289" height="320" alt="" loading="lazy" decoding="async">
</section>

<!-- =========================================================================
     SCENA 07 — GALLERIA
     ====================================================================== -->
<section class="gallery" id="gallery" data-nav="gallery" data-bg="#FFD447">
    <div class="container">
        <header class="section-head section-head--split">
            <div>
                <p class="eyebrow eyebrow--onColor" data-reveal>Galleria</p>
                <h2 class="title" data-split>Da mangiare con gli occhi.</h2>
            </div>
            <div class="gallery__nav" data-reveal>
                <button class="round-btn gallery__prev" type="button" aria-label="Foto precedente" data-magnetic><?= icon('arrow-left-line') ?></button>
                <button class="round-btn gallery__next" type="button" aria-label="Foto successiva" data-magnetic><?= icon('arrow-right-line') ?></button>
            </div>
        </header>
    </div>

    <div class="swiper gallery__swiper" data-cursor="Trascina">
        <div class="swiper-wrapper">
            <?php foreach ($gallery as $n => [$file, $caption]): ?>
                <figure class="swiper-slide shot">
                    <button class="shot__btn" type="button" data-cursor="Zoom" data-lightbox="<?= $n ?>" data-full="assets/img/gallery/<?= $file ?>-1400.webp" data-caption="<?= e($caption) ?>" aria-label="Ingrandisci: <?= e($caption) ?>">
                        <img src="assets/img/gallery/<?= $file ?>-800.webp" width="800" height="1000" alt="<?= e($caption) ?>" loading="lazy" decoding="async">
                        <span class="shot__zoom"><?= icon('zoom-in-line') ?></span>
                    </button>
                    <figcaption><span><?= sprintf('%02d', $n + 1) ?></span><?= e($caption) ?></figcaption>
                </figure>
            <?php endforeach; ?>
        </div>
    </div>
    <p class="gallery__tag container" data-reveal><?= icon('instagram-line') ?> Tagga <strong>@<?= e(strtolower($brand['name'])) ?>.<?= e(strtolower($brand['city'])) ?></strong> e finisci in bacheca.</p>
</section>

<!-- =========================================================================
     SCENA 08 — PRENOTAZIONE
     ====================================================================== -->
<section class="booking" id="prenotazione" data-nav="prenotazione" data-bg="#FFFDF8">
    <div class="container booking__grid">
        <div class="booking__intro">
            <p class="eyebrow" data-reveal>Prenotazione</p>
            <h2 class="title" data-split>Il tuo tavolo <span class="hl hl--green">al sole.</span></h2>
            <p class="lead" data-reveal>Pranzo veloce, aperitivo in terrazza o cena con gli amici: prenota in trenta secondi, ti confermiamo subito.</p>

            <ul class="booking__perks">
                <li data-reveal><span><?= icon('sparkling-2-fill') ?></span>Dehors soleggiato nel cuore di <?= e($brand['city']) ?></li>
                <li data-reveal><span><?= icon('group-line') ?></span>Tavoli fino a 12 persone</li>
                <li data-reveal><span><?= icon('gift-fill') ?></span>Compleanni e feste di laurea</li>
            </ul>

            <div class="booking__art" aria-hidden="true">
                <span class="booking__art-disc"></span>
                <?= cutout('insalata', '', '(max-width: 900px) 40vw, 20vw', true, 'booking__art-a') ?>
                <?= cutout('bibita', '', '(max-width: 900px) 20vw, 10vw', true, 'booking__art-b') ?>
            </div>
        </div>

        <form class="form booking__form" id="booking-form" novalidate data-reveal-card>
            <div class="form__row">
                <div class="field">
                    <input class="field__input" type="text" id="bk-name" name="nome" placeholder=" " autocomplete="name" required minlength="2">
                    <label class="field__label" for="bk-name">Nome</label>
                    <span class="field__error" data-error-for="bk-name"></span>
                </div>
                <div class="field">
                    <input class="field__input" type="tel" id="bk-phone" name="telefono" placeholder=" " autocomplete="tel" required pattern="[0-9+\s().-]{6,}">
                    <label class="field__label" for="bk-phone">Telefono</label>
                    <span class="field__error" data-error-for="bk-phone"></span>
                </div>
            </div>
            <div class="field">
                <input class="field__input" type="email" id="bk-email" name="email" placeholder=" " autocomplete="email" required>
                <label class="field__label" for="bk-email">Email</label>
                <span class="field__error" data-error-for="bk-email"></span>
            </div>

            <div class="form__row form__row--3">
                <div class="field field--static">
                    <span class="field__label field__label--static" id="bk-people-label">Numero di persone</span>
                    <div class="people" role="group" aria-labelledby="bk-people-label">
                        <button type="button" class="people__btn" data-people="-1" aria-label="Una persona in meno"><?= icon('subtract-line') ?></button>
                        <input class="people__input" type="number" id="bk-people" name="persone" value="2" min="1" max="12" inputmode="numeric" aria-labelledby="bk-people-label">
                        <button type="button" class="people__btn" data-people="1" aria-label="Una persona in più"><?= icon('add-line') ?></button>
                    </div>
                </div>
                <div class="field field--static">
                    <label class="field__label field__label--static" for="bk-date">Data</label>
                    <input class="field__input field__input--compact" type="date" id="bk-date" name="data" required min="<?= date('Y-m-d') ?>" value="<?= date('Y-m-d', strtotime('+1 day')) ?>">
                    <span class="field__error" data-error-for="bk-date"></span>
                </div>
                <div class="field field--static">
                    <label class="field__label field__label--static" for="bk-time">Ora</label>
                    <select class="field__input field__input--compact" id="bk-time" name="ora" required>
                        <?php foreach ($slots as $slot): ?>
                            <option value="<?= $slot ?>"<?= $slot === '20:00' ? ' selected' : '' ?>><?= $slot ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div class="field">
                <textarea class="field__input field__input--area" id="bk-notes" name="commenti" placeholder=" " rows="3" maxlength="400"></textarea>
                <label class="field__label" for="bk-notes">Commenti (allergie, occasioni speciali…)</label>
            </div>

            <div class="form__foot">
                <p class="form__note"><?= icon('information-line') ?> Prenotazione dimostrativa: nessun dato viene inviato.</p>
                <button class="btn btn--primary btn--lg" type="submit" data-magnetic>
                    <span class="btn__label">Prenota</span>
                    <span class="btn__icon"><?= icon('arrow-right-up-line') ?></span>
                    <span class="btn__spinner" aria-hidden="true"></span>
                </button>
            </div>
        </form>
    </div>
</section>

<!-- =========================================================================
     SCENA 09 — APP MOBILE
     ====================================================================== -->
<section class="app" id="app" data-bg="#9DD7F7">
    <div class="container app__grid">
        <div class="app__copy">
            <p class="eyebrow eyebrow--onColor" data-reveal>L’app <?= e($brand['name']) ?></p>
            <h2 class="title" data-split>Tutto il gusto, in tasca.</h2>
            <p class="lead lead--dark" data-reveal>Ordina in tre tocchi, segui il rider in tempo reale e trasforma ogni morso in punti. Più mangi, più sorridi.</p>

            <ul class="app__features">
                <li data-reveal><span><?= icon('notification-3-fill') ?></span><div><strong>Notifiche in tempo reale</strong><p>Sai sempre quando il tuo ordine entra in forno.</p></div></li>
                <li data-reveal><span><?= icon('route-line') ?></span><div><strong>Segui il tuo ordine</strong><p>Dal banco alla tua porta, minuto per minuto.</p></div></li>
                <li data-reveal><span><?= icon('medal-fill') ?></span><div><strong>Programma fedeltà</strong><p>1 € = 1 punto. A 100 punti la Margherita è offerta.</p></div></li>
            </ul>

            <div class="app__get" data-reveal>
                <div class="app__qr"><?= fake_qr($brand['name'] . $brand['city']) ?><span class="app__qr-scan"></span></div>
                <div class="app__stores">
                    <p>Inquadra il codice<br>oppure scarica da</p>
                    <div>
                        <a class="store" href="#app" data-demo-link><?= icon('apple-fill') ?><span><small>Scarica su</small>App Store</span></a>
                        <a class="store" href="#app" data-demo-link><?= icon('google-play-fill') ?><span><small>Disponibile su</small>Google Play</span></a>
                    </div>
                </div>
            </div>
        </div>

        <div class="app__stage" aria-hidden="true">
            <span class="app__disc"></span>
            <div class="phone" data-phone>
                <div class="phone__notch"></div>
                <div class="phone__screen">
                    <div class="phone__status"><span>9:41</span><span class="phone__status-icons"><i></i><i></i><i></i></span></div>
                    <div class="phone__hello"><span><small>Ciao Giulia,</small><strong>hai fame?</strong></span><span class="phone__avatar">G</span></div>

                    <div class="phone__track">
                        <div class="phone__track-head"><strong>Ordine #2048</strong><span>in arrivo · 8 min</span></div>
                        <div class="phone__route">
                            <span class="phone__route-line"><i data-route-fill></i></span>
                            <span class="phone__rider" data-route-rider><?= icon('e-bike-2-fill') ?></span>
                            <ol>
                                <li class="is-done"><i></i>Ricevuto</li>
                                <li class="is-done"><i></i>In forno</li>
                                <li class="is-now"><i></i>In viaggio</li>
                                <li><i></i>Da te</li>
                            </ol>
                        </div>
                    </div>

                    <div class="phone__loyalty">
                        <div class="phone__loyalty-head"><span><small>Punti <?= e($brand['name']) ?></small><strong><b data-points>0</b> / 100</strong></span><?= icon('medal-fill') ?></div>
                        <div class="phone__stamps"><?php for ($s = 0; $s < 10; $s++): ?><i class="<?= $s < 8 ? 'is-on' : '' ?>"></i><?php endfor; ?></div>
                        <p>Ancora 2 ordini e la Margherita è offerta.</p>
                    </div>

                    <div class="phone__again">
                        <span class="phone__again-thumb"><img src="assets/img/products/burger-160.webp" width="160" height="160" alt="" loading="lazy" decoding="async"></span>
                        <span><small>Ordina di nuovo</small><strong>Il Parmense</strong></span>
                        <b><?= icon('add-line') ?></b>
                    </div>
                    <div class="phone__tabbar"><i class="is-on"></i><i></i><i></i><i></i></div>
                </div>
            </div>

            <div class="notif notif--1 glass" data-notif><span class="notif__icon notif__icon--red"><?= icon('fire-fill') ?></span><span><strong>È in forno!</strong><small>La tua Margherita sta cuocendo</small></span><em>ora</em></div>
            <div class="notif notif--2 glass" data-notif><span class="notif__icon notif__icon--green"><?= icon('e-bike-2-fill') ?></span><span><strong>Rider in arrivo</strong><small>Marco è a 4 minuti da te</small></span><em>2 min</em></div>
            <div class="notif notif--3 glass" data-notif><span class="notif__icon notif__icon--yellow"><?= icon('medal-fill') ?></span><span><strong>+25 punti</strong><small>Sei a un passo dal premio</small></span><em>5 min</em></div>
        </div>
    </div>
</section>

<!-- =========================================================================
     SCENA 10 — RECENSIONI
     ====================================================================== -->
<section class="reviews" id="recensioni" data-bg="#FFFDF8">
    <div class="container">
        <header class="section-head section-head--split">
            <div>
                <p class="eyebrow" data-reveal>Recensioni</p>
                <h2 class="title" data-split>Chi ci prova, <span class="hl hl--red">sorride.</span></h2>
            </div>
            <div class="reviews__score" data-reveal>
                <strong>4,9</strong>
                <div>
                    <span class="stars" aria-label="4,9 stelle su 5"><?= str_repeat(icon('star-fill'), 5) ?></span>
                    <small>1.284 recensioni verificate</small>
                </div>
            </div>
        </header>
    </div>

    <div class="swiper reviews__swiper" data-cursor="Trascina">
        <div class="swiper-wrapper">
            <?php foreach ($reviews as [$who, $where, $pid, $text, $color]):
                [$cat, $pname] = $products[$pid]; ?>
                <article class="swiper-slide review" style="--accent: <?= $color ?>">
                    <div class="review__top">
                        <span class="stars" aria-label="5 stelle su 5"><?= str_repeat(icon('star-fill'), 5) ?></span>
                        <?= icon('double-quotes-l', 'review__quote') ?>
                    </div>
                    <p class="review__text">«<?= e($text) ?>»</p>
                    <div class="review__order">
                        <span class="review__thumb"><img src="assets/img/products/<?= $categories[$cat]['img'] ?>-160.webp" width="160" height="160" alt="<?= e($pname) ?>" loading="lazy" decoding="async"></span>
                        <span><small>Ha ordinato</small><strong><?= e($pname) ?></strong></span>
                    </div>
                    <footer class="review__who">
                        <span class="review__avatar"><?= e(mb_substr($who, 0, 1)) ?></span>
                        <span><strong><?= e($who) ?></strong><small><?= e($where) ?> · <?= icon('verified-badge-fill') ?> verificata</small></span>
                    </footer>
                </article>
            <?php endforeach; ?>
        </div>
        <div class="reviews__pagination"></div>
    </div>
</section>

<!-- =========================================================================
     SCENA 11 — FAQ
     ====================================================================== -->
<section class="faq" id="faq" data-bg="#FFF6E8">
    <div class="container faq__grid">
        <div class="faq__intro">
            <p class="eyebrow" data-reveal>Domande frequenti</p>
            <h2 class="title" data-split>Hai una <span class="hl hl--orange">curiosità?</span></h2>
            <p class="lead" data-reveal>Le risposte alle domande che ci fate più spesso. Se manca la tua, scrivici: rispondiamo più veloci di un forno a legna.</p>
            <a class="btn btn--ghost" href="#contatti" data-magnetic data-reveal>
                <span class="btn__label">Scrivici</span><span class="btn__icon"><?= icon('arrow-right-up-line') ?></span>
            </a>
            <div class="faq__art" aria-hidden="true"><span></span><?= cutout('dolce', '', '(max-width: 900px) 30vw, 16vw') ?></div>
        </div>

        <div class="accordion" data-accordion>
            <?php foreach ($faq as $n => [$q, $a]): ?>
                <div class="accordion__item<?= $n === 0 ? ' is-open' : '' ?>" data-reveal>
                    <h3>
                        <button class="accordion__trigger" type="button" id="faq-t-<?= $n ?>" aria-expanded="<?= $n === 0 ? 'true' : 'false' ?>" aria-controls="faq-p-<?= $n ?>">
                            <span class="accordion__num"><?= sprintf('%02d', $n + 1) ?></span>
                            <span class="accordion__q"><?= e($q) ?></span>
                            <span class="accordion__icon"><i></i><i></i></span>
                        </button>
                    </h3>
                    <div class="accordion__panel" id="faq-p-<?= $n ?>" role="region" aria-labelledby="faq-t-<?= $n ?>">
                        <div class="accordion__inner"><p><?= e($a) ?></p></div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- =========================================================================
     SCENA 12 — CONTATTI
     ====================================================================== -->
<section class="contact" id="contatti" data-nav="contatti" data-bg="#FFFDF8">
    <div class="container">
        <header class="section-head">
            <p class="eyebrow" data-reveal>Contatti</p>
            <h2 class="title" data-split>Ci vediamo a <span class="hl hl--green"><?= e($brand['city']) ?>.</span></h2>
        </header>

        <div class="contact__grid">
            <div class="contact__info">
                <a class="info-card" href="#contatti" data-demo-link data-reveal-card data-glow>
                    <span class="info-card__icon"><?= icon('map-pin-2-fill') ?></span>
                    <span><small>Indirizzo</small><strong><?= e($brand['address']) ?></strong><em><?= e($brand['zip']) ?></em></span>
                </a>
                <a class="info-card" href="tel:<?= e(preg_replace('/\s+/', '', $brand['phone'])) ?>" data-reveal-card data-glow>
                    <span class="info-card__icon"><?= icon('phone-fill') ?></span>
                    <span><small>Telefono</small><strong><?= e($brand['phone']) ?></strong><em>Ordini e prenotazioni</em></span>
                </a>
                <a class="info-card" href="mailto:<?= e($brand['email']) ?>" data-reveal-card data-glow>
                    <span class="info-card__icon"><?= icon('mail-line') ?></span>
                    <span><small>Email</small><strong><?= e($brand['email']) ?></strong><em>Rispondiamo in giornata</em></span>
                </a>

                <div class="hours" data-reveal-card>
                    <div class="hours__head">
                        <h3><?= icon('time-line') ?> Orari</h3>
                        <span class="hours__state <?= $state['open'] ? 'is-open' : 'is-closed' ?>"><i></i><?= e($state['label']) ?></span>
                    </div>
                    <ul>
                        <?php foreach ($hours as $d => [$from, $to]): ?>
                            <li class="<?= $d === $state['today'] ? 'is-today' : '' ?>"><span><?= $dayNames[$d] ?></span><span><?= $from ?> – <?= $to ?></span></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>

            <!-- Mappa stilizzata (illustrazione, non geografica) -->
            <div class="map" data-map data-reveal-card>
                <svg class="map__svg" viewBox="0 0 800 640" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mappa stilizzata del centro di <?= e($brand['city']) ?> con la posizione del locale">
                    <rect width="800" height="640" fill="#FFF6E8"/>
                    <!-- isolati -->
                    <g fill="#FFFFFF" opacity=".9">
                        <rect x="40" y="40" width="150" height="110" rx="18"/><rect x="210" y="40" width="120" height="110" rx="18"/>
                        <rect x="470" y="30" width="140" height="120" rx="18"/><rect x="630" y="30" width="140" height="120" rx="18"/>
                        <rect x="40" y="170" width="110" height="130" rx="18"/><rect x="170" y="170" width="160" height="130" rx="18"/>
                        <rect x="470" y="170" width="120" height="100" rx="18"/><rect x="610" y="170" width="160" height="100" rx="18"/>
                        <rect x="470" y="290" width="300" height="120" rx="18"/>
                        <rect x="40" y="470" width="130" height="130" rx="18"/><rect x="190" y="470" width="140" height="130" rx="18"/>
                        <rect x="470" y="430" width="130" height="170" rx="18"/><rect x="620" y="430" width="150" height="170" rx="18"/>
                    </g>
                    <!-- parco -->
                    <rect x="40" y="320" width="290" height="130" rx="28" fill="#A8D672" opacity=".55"/>
                    <g fill="#58A84C" opacity=".75"><circle cx="90" cy="365" r="16"/><circle cx="130" cy="405" r="12"/><circle cx="190" cy="360" r="14"/><circle cx="250" cy="400" r="17"/><circle cx="290" cy="352" r="10"/></g>
                    <text x="64" y="436" class="map__label">Parco Ducale</text>
                    <!-- torrente -->
                    <path d="M400 -20c-30 120 40 190 0 330s-40 210 10 350" stroke="#9DD7F7" stroke-width="64" fill="none" stroke-linecap="round"/>
                    <path class="map__water" d="M400 -20c-30 120 40 190 0 330s-40 210 10 350" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="14 26" stroke-linecap="round" opacity=".8"/>
                    <text x="418" y="590" class="map__label map__label--water" transform="rotate(-84 418 590)">Torrente Parma</text>
                    <!-- ponti e strade principali -->
                    <g stroke="#FFE9C7" stroke-width="20" stroke-linecap="round" fill="none">
                        <path d="M20 160h760"/><path d="M20 460h310M470 420h310"/><path d="M340 20v600M460 20v600"/><path d="M600 160v460"/>
                    </g>
                    <text x="622" y="282" class="map__label">Piazza Garibaldi</text>
                    <text x="486" y="60" class="map__label">Duomo</text>
                    <!-- percorso di consegna -->
                    <path class="map__route" data-route d="M150 520c40-70 120-60 190-60h80c50 0 60-40 60-90s30-60 80-60h40" stroke="#E63946" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="2 14"/>
                    <circle cx="150" cy="520" r="10" fill="#fff" stroke="#1D1D1D" stroke-width="4"/>
                    <g class="map__rider" data-route-dot><circle r="17" fill="#1D1D1D"/><circle r="6" fill="#FFD447"/></g>
                </svg>

                <div class="map__pin" data-pin>
                    <span class="map__pulse"></span><span class="map__pulse map__pulse--2"></span>
                    <span class="map__pin-head"><svg viewBox="0 0 48 48" width="34" height="34"><circle cx="24" cy="26" r="19" fill="#fff"/><path d="M14.5 27.5c2.2 5.4 5.4 8 9.5 8s7.3-2.6 9.5-8" fill="none" stroke="#E63946" stroke-width="3.6" stroke-linecap="round"/></svg></span>
                </div>
                <div class="map__card glass">
                    <strong><?= e($brand['name']) ?></strong>
                    <span><?= e($brand['address']) ?></span>
                    <a href="#contatti" data-demo-link><?= icon('navigation-fill') ?> Indicazioni</a>
                </div>
                <span class="map__compass"><?= icon('navigation-fill') ?> N</span>
            </div>
        </div>
    </div>
</section>

</main>

<!-- =========================================================================
     FOOTER
     ====================================================================== -->
<footer class="footer" data-bg="#FFF6E8">
    <div class="container">
        <div class="footer__cta">
            <h2 class="footer__title" data-split>Fame? <span class="hl hl--red">Ci pensiamo noi.</span></h2>
            <a class="btn btn--primary btn--lg btn--pulse" href="#delivery" data-magnetic>
                <span class="btn__label">Ordina Ora</span><span class="btn__icon"><?= icon('arrow-right-up-line') ?></span>
            </a>
        </div>

        <div class="footer__grid">
            <div class="footer__brand">
                <a class="logo" href="#home" aria-label="<?= e($brand['name']) ?>"><?= logo($brand['name'], $brand['claim']) ?></a>
                <p>Street food italiano fatto al momento, nel cuore di <?= e($brand['city']) ?>. Fresco, veloce e con il sorriso.</p>
                <div class="footer__social">
                    <?php foreach ($brand['social'] as [$label, $url, $ic]): ?>
                        <a href="<?= e($url) ?>" aria-label="<?= e($label) ?>" data-magnetic data-demo-link><?= icon($ic) ?></a>
                    <?php endforeach; ?>
                </div>
            </div>

            <nav class="footer__nav" aria-label="Navigazione a piè di pagina">
                <h3>Esplora</h3>
                <ul>
                    <?php foreach ($nav as $anchor => $label): ?>
                        <li><a href="#<?= $anchor ?>"><?= e($label) ?></a></li>
                    <?php endforeach; ?>
                </ul>
            </nav>

            <div class="footer__contact">
                <h3>Vieni a trovarci</h3>
                <p><?= e($brand['address']) ?><br><?= e($brand['zip']) ?></p>
                <p><a href="tel:<?= e(preg_replace('/\s+/', '', $brand['phone'])) ?>"><?= e($brand['phone']) ?></a><br><a href="mailto:<?= e($brand['email']) ?>"><?= e($brand['email']) ?></a></p>
            </div>

            <div class="footer__news">
                <h3>Newsletter</h3>
                <p>Novità, menu di stagione e sconti riservati. Niente spam, solo cose buone.</p>
                <form class="newsletter" id="newsletter-form" novalidate>
                    <label class="sr-only" for="nl-email">La tua email</label>
                    <input type="email" id="nl-email" name="email" placeholder="La tua email" autocomplete="email" required>
                    <button type="submit" aria-label="Iscriviti alla newsletter" data-magnetic><?= icon('send-plane-fill') ?></button>
                </form>
                <p class="newsletter__msg" data-newsletter-msg role="status"></p>
            </div>
        </div>

        <div class="footer__word" aria-hidden="true"><?= e(strtolower($brand['name'])) ?></div>

        <div class="footer__bottom">
            <p>© <?= $year ?> <?= e($brand['name']) ?> · <?= e($brand['claim']) ?>, <?= e($brand['city']) ?>. Tutti i diritti riservati.</p>
            <p>Sito dimostrativo · P. IVA 00000000000 · <a href="#home" data-demo-link>Privacy</a> · <a href="#home" data-demo-link>Cookie</a></p>
        </div>
    </div>
</footer>

<!-- =========================================================================
     CARRELLO — drawer laterale (carrello → checkout → conferma)
     ====================================================================== -->
<div class="drawer" id="cart-drawer" aria-hidden="true">
    <div class="drawer__overlay" data-cart-close></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabindex="-1">
        <header class="drawer__head">
            <button class="drawer__back" type="button" data-cart-back aria-label="Torna al carrello" hidden><?= icon('arrow-left-line') ?></button>
            <h2 id="cart-title" data-cart-title>Il tuo carrello</h2>
            <button class="round-btn round-btn--sm" type="button" data-cart-close aria-label="Chiudi il carrello"><?= icon('close-line') ?></button>
        </header>

        <!-- Step 1: carrello -->
        <div class="drawer__step is-active" data-step-view="cart">
            <div class="drawer__switch" role="radiogroup" aria-label="Modalità di ritiro">
                <span class="drawer__switch-pill" aria-hidden="true"></span>
                <button type="button" role="radio" aria-checked="true" class="is-active" data-mode="consegna"><?= icon('e-bike-2-fill') ?> Consegna</button>
                <button type="button" role="radio" aria-checked="false" data-mode="asporto"><?= icon('takeaway-fill') ?> Asporto</button>
            </div>

            <div class="drawer__scroll" data-lenis-prevent>
                <ul class="cart-list" data-cart-list></ul>
                <div class="cart-empty" data-cart-empty>
                    <span class="cart-empty__art"><img src="assets/img/products/slice-320.webp" width="320" height="320" alt="" loading="lazy" decoding="async"></span>
                    <strong>Qui manca qualcosa di buono</strong>
                    <p>Aggiungi una pizza, un burger o quello che ti fa sorridere.</p>
                    <a class="btn btn--ghost" href="#menu" data-cart-close><span class="btn__label">Vai al menu</span></a>
                </div>
            </div>

            <footer class="drawer__foot" data-cart-foot>
                <form class="promo-input" data-promo-form novalidate>
                    <?= icon('coupon-3-line') ?>
                    <label class="sr-only" for="promo-code">Codice sconto</label>
                    <input type="text" id="promo-code" placeholder="Codice sconto" autocomplete="off" autocapitalize="characters" spellcheck="false">
                    <button type="submit">Applica</button>
                </form>
                <p class="promo-input__msg" data-promo-msg role="status"></p>
                <dl class="drawer__totals">
                    <div><dt>Subtotale</dt><dd data-subtotal>0,00 €</dd></div>
                    <div class="summary__discount" data-discount-row hidden><dt>Sconto <span data-discount-code></span></dt><dd data-discount>−0,00 €</dd></div>
                    <div><dt>Consegna</dt><dd data-shipping>—</dd></div>
                    <div class="drawer__total"><dt>Totale</dt><dd data-total>0,00 €</dd></div>
                </dl>
                <button class="btn btn--primary btn--block btn--lg" type="button" data-checkout-go>
                    <span class="btn__label">Vai al checkout</span><span class="btn__icon"><?= icon('arrow-right-line') ?></span>
                </button>
            </footer>
        </div>

        <!-- Step 2: checkout simulato -->
        <div class="drawer__step" data-step-view="checkout" hidden>
            <form class="form checkout" id="checkout-form" novalidate>
                <div class="drawer__scroll" data-lenis-prevent>
                    <p class="checkout__lead">Ultimo passo. <strong>È una demo:</strong> nessun pagamento reale.</p>
                    <div class="field">
                        <input class="field__input" type="text" id="ck-name" placeholder=" " autocomplete="name" required minlength="2">
                        <label class="field__label" for="ck-name">Nome e cognome</label>
                        <span class="field__error" data-error-for="ck-name"></span>
                    </div>
                    <div class="field">
                        <input class="field__input" type="tel" id="ck-phone" placeholder=" " autocomplete="tel" required pattern="[0-9+\s().-]{6,}">
                        <label class="field__label" for="ck-phone">Telefono</label>
                        <span class="field__error" data-error-for="ck-phone"></span>
                    </div>
                    <div class="field" data-address-field>
                        <input class="field__input" type="text" id="ck-address" placeholder=" " autocomplete="street-address" required minlength="5">
                        <label class="field__label" for="ck-address">Indirizzo di consegna</label>
                        <span class="field__error" data-error-for="ck-address"></span>
                    </div>

                    <fieldset class="choice">
                        <legend>Quando</legend>
                        <label><input type="radio" name="when" value="Il prima possibile" checked><span><?= icon('timer-flash-line') ?> Il prima possibile</span></label>
                        <label><input type="radio" name="when" value="Tra un'ora"><span><?= icon('time-line') ?> Tra un’ora</span></label>
                    </fieldset>
                    <fieldset class="choice">
                        <legend>Pagamento</legend>
                        <label><input type="radio" name="pay" value="Carta" checked><span><?= icon('bank-card-line') ?> Carta</span></label>
                        <label><input type="radio" name="pay" value="Contanti"><span><?= icon('cash-line') ?> Contanti</span></label>
                        <label><input type="radio" name="pay" value="Wallet"><span><?= icon('wallet-3-line') ?> Wallet</span></label>
                    </fieldset>
                </div>
                <footer class="drawer__foot">
                    <dl class="drawer__totals">
                        <div class="drawer__total"><dt>Totale da pagare</dt><dd data-total>0,00 €</dd></div>
                    </dl>
                    <button class="btn btn--primary btn--block btn--lg" type="submit">
                        <span class="btn__label">Conferma l’ordine</span><span class="btn__icon"><?= icon('check-line') ?></span><span class="btn__spinner" aria-hidden="true"></span>
                    </button>
                </footer>
            </form>
        </div>

        <!-- Step 3: conferma -->
        <div class="drawer__step" data-step-view="done" hidden>
            <div class="drawer__scroll done" data-lenis-prevent>
                <span class="done__check"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" stroke="currentColor" stroke-width="5"/><path d="M25 41.5l10.5 10.5L56 30" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                <h3>Ordine confermato!</h3>
                <p>Grazie <strong data-done-name></strong>, stiamo già accendendo il forno.</p>
                <div class="done__ticket">
                    <div><small>Numero ordine</small><strong data-done-number>#0000</strong></div>
                    <div><small data-done-eta-label>Consegna prevista</small><strong data-done-eta>—</strong></div>
                    <div><small>Totale</small><strong data-done-total>—</strong></div>
                </div>
                <ol class="done__steps">
                    <li class="is-on"><i></i>Ordine ricevuto</li>
                    <li><i></i>In preparazione</li>
                    <li><i></i><span data-done-last>In consegna</span></li>
                </ol>
                <button class="btn btn--dark btn--block" type="button" data-cart-finish><span class="btn__label">Torna al sito</span></button>
            </div>
        </div>
    </aside>
</div>

<!-- Pulsante carrello flottante (mobile) -->
<button class="fab" type="button" data-cart-open aria-label="Apri il carrello">
    <?= icon('shopping-bag-3-fill') ?><span data-cart-count>0</span><em data-fab-total>0,00 €</em>
</button>

<!-- =========================================================================
     MODALI — conferma prenotazione + lightbox galleria
     ====================================================================== -->
<div class="modal" id="booking-modal" aria-hidden="true">
    <div class="modal__overlay" data-modal-close></div>
    <div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title" tabindex="-1">
        <button class="round-btn round-btn--sm modal__close" type="button" data-modal-close aria-label="Chiudi"><?= icon('close-line') ?></button>
        <div class="modal__art" aria-hidden="true">
            <span class="modal__ring"></span>
            <svg class="modal__check" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" stroke="currentColor" stroke-width="5"/><path d="M25 41.5l10.5 10.5L56 30" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <p class="eyebrow">Prenotazione</p>
        <h2 class="modal__title" id="booking-modal-title">La tua richiesta è stata ricevuta.</h2>
        <p class="modal__text">Grazie <strong data-bk-name></strong>! Ti aspettiamo con il sorriso. Riceverai una conferma a <strong data-bk-email></strong>.</p>
        <ul class="modal__recap">
            <li><?= icon('calendar-event-line') ?><span data-bk-date>—</span></li>
            <li><?= icon('time-line') ?><span data-bk-time>—</span></li>
            <li><?= icon('group-line') ?><span data-bk-people>—</span></li>
        </ul>
        <button class="btn btn--primary btn--block" type="button" data-modal-close><span class="btn__label">Perfetto, a presto!</span></button>
    </div>
</div>

<div class="lightbox" id="lightbox" aria-hidden="true">
    <div class="lightbox__overlay" data-lightbox-close></div>
    <figure class="lightbox__figure" role="dialog" aria-modal="true" aria-label="Foto ingrandita" tabindex="-1">
        <img class="lightbox__img" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="">
        <figcaption class="lightbox__caption"></figcaption>
    </figure>
    <button class="round-btn lightbox__close" type="button" data-lightbox-close aria-label="Chiudi"><?= icon('close-line') ?></button>
    <button class="round-btn lightbox__prev" type="button" aria-label="Foto precedente"><?= icon('arrow-left-line') ?></button>
    <button class="round-btn lightbox__next" type="button" aria-label="Foto successiva"><?= icon('arrow-right-line') ?></button>
    <span class="lightbox__count"></span>
</div>

<!-- Dati per il carrello simulato -->
<script type="application/json" id="app-config"><?= json_encode($clientConfig, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?></script>

<!-- Librerie (self‑hosted in /assets/vendor) -->
<script src="<?= asset('vendor/gsap.min.js') ?>" defer></script>
<script src="<?= asset('vendor/ScrollTrigger.min.js') ?>" defer></script>
<script src="<?= asset('vendor/lenis.min.js') ?>" defer></script>
<script src="<?= asset('vendor/split-type.min.js') ?>" defer></script>
<script src="<?= asset('vendor/swiper-bundle.min.js') ?>" defer></script>
<script type="module" src="<?= asset('js/main.js') ?>"></script>
</body>
</html>
