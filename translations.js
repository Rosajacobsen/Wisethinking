/* ============================================================
   translations.js
   ------------------------------------------------------------
   Hvad: Indeholder alle UI-tekster på dansk (default) og engelsk.
   Hvorfor: Holder al brugervendt tekst ét sted, så sprog-toggle
   kan opdatere alt uden side-reload, og så gruppen let kan
   rette ordlyd ét sted i stedet for i HTML- og JS-filerne.

   Toneprincipper for engelsk version:
   - Samme to-lags-struktur (kort invitérende overskrift +
     orienterende undertekst).
   - Roligt, kontemplativt, personligt — IKKE marketing-agtigt.
   - Metafor-konsistens: bottle, sea, storm, journey.
   - Idiomatisk oversættelse af slider-niveauer, ikke ord-for-ord.
   ============================================================ */

// Det globale oversættelsesobjekt — eksponeres på window så script.js kan læse det
const translations = {

  // ============================================================
  // DANSK (default)
  // ============================================================
  da: {

    // --- Sprog-toggle og generelle UI-elementer ---
    langToggleLabel: "DA / EN",     // Toggle-knap øverst i hjørnet
    backButton: "Tilbage",          // Generel tilbage-knap

    // --- For-lille-skærm-besked ---
    smallScreenMessage: "Denne prototype er designet til computer. Åbn venligst på en større skærm.",

    // --- State 1 — Velkomst ---
    welcomeTitle: "Velkommen til din flaskepost",
    welcomeSubtitle: "Et rum til refleksion før og efter din Reflection Journey, Finding Your Professional Path.",
    welcomeBody: "Inden du begynder, skriver du en besked til dig selv — en flaskepost, du modtager når journey'en er færdig. Bagefter læser du den igen og reflekterer over hvad der har ændret sig undervejs.",
    welcomeTimeEstimate: "Du kan bruge omkring 10 minutter her før din journey og 5–10 minutter efter.",
    welcomeStartButton: "Begynd",
    welcomePrivacyNote: "Alt du skriver gemmes kun lokalt i din browser.",

    // --- State 2 — Emotional check-in før ---
    moodBeforeTitle: "Hvordan har du det indeni nu?",
    moodBeforeSubtitle: "Flyt skibet derhen hvor du står.",
    moodConfirmButton: "Bekræft",   // Knap i midten af slider-cirklen
    moodPercentLabel: "%",          // Suffix til procent-visning

    // Slider-niveauer (5 vejr-niveauer) — brugt af både State 2 og State 6
    moodLevel1: "Stille vande",                  // 1–20%
    moodLevel2: "Krusninger på overfladen",     // 21–40%
    moodLevel3: "Bølger i bevægelse",           // 41–60%
    moodLevel4: "Vinden tager til",             // 61–80%
    moodLevel5: "Storm i sindet",               // 81–99%

    // --- State 3 — Skriv besked til fremtidigt selv ---
    intentionTitle: "Skriv en besked til dig selv",
    intentionSubtitle: "Som du modtager når din journey er færdig. Hvad håber du at få ud af de kommende dage? Hvilke spørgsmål er du nysgerrig på?",
    intentionPlaceholder: "Skriv frit — der er ingen rigtige svar...",
    intentionSendButton: "Send flaskeposten",
    intentionEmptyError: "Skriv noget før du sender.",
    bottleTooltip: "Din flaskepost åbnes når du har gennemført din journey",

    // --- State 4 — Bro til Reflection Journey ---
    // Fase 4a — Inden journey'en starter
    bridgeBeforeTitle: "Din flaskepost er sendt",
    bridgeBeforeBody: "Nu venter den på dig. Klik nedenfor for at begynde din journey på wisethinking.world — den åbner i en ny fane. Når du er færdig kommer du tilbage hertil og åbner din flaskepost.",
    bridgeStartJourneyButton: "Begynd din journey",

    // Fase 4b — Venter på at brugeren vender tilbage
    bridgeAfterTitle: "Vi venter på dig",
    bridgeAfterBody: "Når du har gennemført din journey, kan du komme tilbage hertil og åbne din flaskepost. Tag den tid du har brug for.",
    bridgeJourneyCompletedButton: "Journey gennemført",

    // --- State 5 — Modtagelse af beskeden ---
    receiveTitle: "Din flaskepost er ankommet",
    receiveDateLabel: "Du skrev denne besked til dig selv den {date}, kl. {time}",  // {date} og {time} bliver erstattet i JS
    receiveInvitation: "Når du er klar, kan du reflektere over hvad du læser.",
    receiveContinueButton: "Reflektér videre",

    // --- State 6 — Efter-refleksion ---
    afterSection1Header: "Din besked til dig selv",
    afterSection1DateLabel: "Du skrev denne besked til dig selv den {date}, kl. {time}",

    afterSection2Title: "Hvordan har du det inden i nu?",
    afterSection2Subtitle: "Efter din journey — flyt skibet derhen hvor du står.",

    afterSection3Title: "Reflektér over din rejse",
    afterSection3Subtitle: "Hvad har bevæget sig siden du skrev beskeden til dig selv? Hvad ser du anderledes nu, set i lyset af de perspektiver du har mødt?",
    afterSection3LockedNote: "Bekræft først dit emotionelle check-in ovenfor.",
    afterReflectionPlaceholder: "Skriv frit — der er ingen rigtige svar...",
    afterCopyIconLabel: "Kopiér refleksionen",
    afterCopyConfirm: "Kopieret.",
    afterCopyError: "Kunne ikke kopiere — prøv at markere teksten manuelt.",
    afterSaveButton: "Gem refleksion",

    // --- State 7 — Send og del ---
    shareTitle: "Hvad vil du gøre med din refleksion?",
    shareYourReflectionLabel: "Din refleksion:",

    shareKeepButton: "Behold for mig selv",
    shareWisethinkingButton: "Del med wisethinking",
    shareWisethinkingSubLabel: "som feedback",
    shareCircleButton: "Del med min omgangskreds",
    shareChatButton: "Tag videre i en samtale",

    // Bekræftelses-tekster pr. valg
    shareKeepConfirmTitle: "Din refleksion er gemt.",
    shareKeepConfirmBody: "Tak for rejsen.",

    shareWisethinkingConfirmTitle: "Din refleksion er klar til at deles.",
    shareWisethinkingConfirmBody: "Kopiér din tekst og åbn wisethinking.world, hvor du kan dele den som feedback.",
    shareWisethinkingConfirmButton: "Kopiér og åbn wisethinking.world",

    shareCircleConfirmTitle: "Din refleksion er klar til at deles.",
    shareCircleConfirmBody: "Kopiér teksten og del den på den måde der passer dig bedst.",
    shareCircleConfirmButton: "Kopiér refleksionen",

    shareChatConfirmTitle: "Din refleksion er klar at tage videre.",
    shareChatConfirmBody: "Kopiér teksten og åbn wisethinking.world, hvor du kan starte en ny samtale med en tænker.",
    shareChatConfirmButton: "Kopiér og åbn wisethinking.world",

    // Valgfri ny flaskepost (Sektion 2 i State 7)
    futureInviteTitle: "Vil du sende dig selv endnu en flaskepost?",
    futureInviteBody: "En besked du modtager på et tidspunkt du selv vælger.",
    futureInviteYes: "Ja, jeg vil sende en ny",
    futureInviteNo: "Nej, ikke nu",

    futureWriteTitle: "Skriv en besked til dit fremtidige selv",
    futureWriteSubtitle: "Du modtager den på den dato du vælger nedenfor.",
    futureWritePlaceholder: "Skriv frit — der er ingen rigtige svar...",
    futureDateLabel: "Leveringsdato:",
    futureQuickIntervalsLabel: "Eller vælg et hurtigt interval:",
    futureInterval1Week: "Om 1 uge",
    futureInterval1Month: "Om 1 måned",
    futureInterval3Months: "Om 3 måneder",
    futureSendButton: "Send flaskeposten",
    futureDateInPastError: "Vælg en dato i fremtiden.",
    futureEmptyError: "Skriv noget før du sender.",

    // Bekræftelse efter fremtids-besked er sendt
    futureConfirmTitle: "Din næste flaskepost er sendt.",
    futureConfirmDateLine: "Du ville modtage den {date}.",
    futureConfirmDisclaimer: "⚠ Bemærk: I denne prototype-version leveres beskeden ikke automatisk. Funktionaliteten testes konceptuelt.",

    // Afsluttende skærm
    finalScreenTitle: "Tak for rejsen.",
    seeJourneyButton: "Se din rejse",
    backToShareButton: "← Tilbage til deling",

    // --- Nulstil ---
    resetButton: "Nulstil",
    resetConfirm: "Er du sikker? Al data slettes og du starter forfra.",

    // --- State 6 — Diskret før-check-in reference ---
    afterBeforeCheckInLabel: "Da du startede:",

    // --- Rejseoversigt ---
    journeyTitle: "Din rejse",
    journeySubtitle: "Fra start til slut.",
    journeyBeforeLabel: "Inden din journey",
    journeyMessageLabel: "Din besked til dig selv",
    journeyAfterLabel: "Efter din journey",
    journeyReflectionLabel: "Din afsluttende refleksion",
    journeyTimestampFormat: "{date}, kl. {time}",

    // --- Fejlbeskeder ---
    errorLocalStorage: "Beklager — din browser tillader ikke at gemme data lokalt. Prototypen kræver localStorage for at fungere. Tjek dine browser-indstillinger eller prøv en anden browser.",

    // --- Datoformat (bruges af JS til formatering) ---
    monthsLong: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"]
  },

  // ============================================================
  // ENGELSK
  // ============================================================
  en: {

    langToggleLabel: "DA / EN",
    backButton: "Back",

    smallScreenMessage: "This prototype is designed for desktop. Please open it on a larger screen.",

    // --- State 1 — Welcome ---
    welcomeTitle: "Welcome to your bottle",
    welcomeSubtitle: "A space for reflection before and after your Reflection Journey",
    welcomeBody: "Before you begin, you write a message to yourself — a bottle you receive once your journey is complete. Afterwards you read it again and reflect on what has shifted along the way.",
    welcomeTimeEstimate: "You can spend around 10 minutes here before your journey, and 5–10 minutes after.",
    welcomeStartButton: "Begin",
    welcomePrivacyNote: "Everything you write stays only in your browser.",

    // --- State 2 — Emotional check-in before ---
    moodBeforeTitle: "How are you feeling about your situation right now?",
    moodBeforeSubtitle: "Move the ship to where you are.",
    moodConfirmButton: "Confirm",
    moodPercentLabel: "%",

    // Slider-niveauer — idiomatisk oversættelse (samme rolige, billedlige kvalitet)
    moodLevel1: "Still waters",
    moodLevel2: "ripples on the surface",
    moodLevel3: "Waves in motion",
    moodLevel4: "The wind picks up",
    moodLevel5: "Storm in the mind",

    // --- State 3 — Write message to future self ---
    intentionTitle: "Write a message to yourself",
    intentionSubtitle: "One you will receive when your journey is complete. What do you hope to gain from the days ahead? What questions are you curious about?",
    intentionPlaceholder: "Write freely — there are no right answers...",
    intentionSendButton: "Send the bottle",
    intentionEmptyError: "Write something before sending.",
    bottleTooltip: "Your bottle opens when you have completed your journey",

    // --- State 4 — Bridge to Reflection Journey ---
    bridgeBeforeTitle: "Your bottle is sent",
    bridgeBeforeBody: "Now it is waiting for you. Click below to begin your journey on wisethinking.world — it opens in a new tab. When you are done, you come back here and open your bottle.",
    bridgeStartJourneyButton: "Begin your journey",

    bridgeAfterTitle: "We are waiting for you",
    bridgeAfterBody: "When you have completed your journey, you can return here and open your bottle. Take the time you need.",
    bridgeJourneyCompletedButton: "Journey complete",

    // --- State 5 — Receive the message ---
    receiveTitle: "Your bottle has arrived",
    receiveDateLabel: "You wrote this message to yourself on {date} at {time}",
    receiveInvitation: "When you are ready, you can reflect on what you read.",
    receiveContinueButton: "Reflect further",

    // --- State 6 — After-reflection ---
    afterSection1Header: "Your message to yourself",
    afterSection1DateLabel: "You wrote this message to yourself on {date} at {time}",

    afterSection2Title: "How is it inside right now?",
    afterSection2Subtitle: "After your journey — move the ship to where you are.",

    afterSection3Title: "Reflect on your journey",
    afterSection3Subtitle: "What has shifted since you wrote the message to yourself? What do you see differently now, in the light of the perspectives you have met?",
    afterSection3LockedNote: "First confirm your emotional check-in above.",
    afterReflectionPlaceholder: "Write freely — there are no right answers...",
    afterCopyIconLabel: "Copy the reflection",
    afterCopyConfirm: "Copied.",
    afterCopyError: "Couldn't copy — try selecting the text manually.",
    afterSaveButton: "Save reflection",

    // --- State 7 — Send and share ---
    shareTitle: "What do you want to do with your reflection?",
    shareYourReflectionLabel: "Your reflection:",

    shareKeepButton: "Keep for myself",
    shareWisethinkingButton: "Share with wisethinking",
    shareWisethinkingSubLabel: "as feedback",
    shareCircleButton: "Share with my circle",
    shareChatButton: "Take it into a conversation",

    shareKeepConfirmTitle: "Your reflection is saved.",
    shareKeepConfirmBody: "Thank you for the journey.",

    shareWisethinkingConfirmTitle: "Your reflection is ready to share.",
    shareWisethinkingConfirmBody: "Copy your text and open wisethinking.world, where you can share it as feedback.",
    shareWisethinkingConfirmButton: "Copy and open wisethinking.world",

    shareCircleConfirmTitle: "Your reflection is ready to share.",
    shareCircleConfirmBody: "Copy the text and share it in the way that suits you best.",
    shareCircleConfirmButton: "Copy the reflection",

    shareChatConfirmTitle: "Your reflection is ready to take further.",
    shareChatConfirmBody: "Copy the text and open wisethinking.world, where you can begin a new conversation with a thinker.",
    shareChatConfirmButton: "Copy and open wisethinking.world",

    // Optional new bottle
    futureInviteTitle: "Would you like to send yourself another bottle?",
    futureInviteBody: "A message you receive at a time you choose yourself.",
    futureInviteYes: "Yes, I'd like to send a new one",
    futureInviteNo: "No, not now",

    futureWriteTitle: "Write a message to your future self",
    futureWriteSubtitle: "You will receive it on the date you choose below.",
    futureWritePlaceholder: "Write freely — there are no right answers...",
    futureDateLabel: "Delivery date:",
    futureQuickIntervalsLabel: "Or choose a quick interval:",
    futureInterval1Week: "In 1 week",
    futureInterval1Month: "In 1 month",
    futureInterval3Months: "In 3 months",
    futureSendButton: "Send the bottle",
    futureDateInPastError: "Choose a date in the future.",
    futureEmptyError: "Write something before sending.",

    futureConfirmTitle: "Your next bottle is sent.",
    futureConfirmDateLine: "You would receive it on {date}.",
    futureConfirmDisclaimer: "⚠ Note: In this prototype version, the message is not delivered automatically. The functionality is tested conceptually.",

    finalScreenTitle: "Thank you for the journey.",
    seeJourneyButton: "See your journey",
    backToShareButton: "← Back to sharing",

    // --- Reset ---
    resetButton: "Reset",
    resetConfirm: "Are you sure? All data will be deleted and you will start over.",

    // --- State 6 — Discrete before check-in reference ---
    afterBeforeCheckInLabel: "When you started:",

    // --- Journey overview ---
    journeyTitle: "Your journey",
    journeySubtitle: "From start to finish.",
    journeyBeforeLabel: "Before your journey",
    journeyMessageLabel: "Your message to yourself",
    journeyAfterLabel: "After your journey",
    journeyReflectionLabel: "Your final reflection",
    journeyTimestampFormat: "{date} at {time}",

    errorLocalStorage: "Sorry — your browser doesn't allow saving data locally. The prototype requires localStorage to work. Check your browser settings or try a different browser.",

    monthsLong: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  }
};
