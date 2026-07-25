import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';


interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  imageUrl?: string;
}

interface QnAPair {
  question: string;
  answer: string;
  keywords: string[];
  synonyms?: string[];
  imageUrl?: string;
}

@Component({
  selector: 'app-chatbot-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeHtmlPipe],
  templateUrl: './chatbot-popup.component.html',
  styleUrls: ['./chatbot-popup.component.css']
})
export class ChatbotPopupComponent implements OnInit {
  @ViewChild('scrollContainer', { static: false }) private scrollContainer!: ElementRef;

  isOpen = false;
  userInput = '';
  messages: ChatMessage[] = [];
  isTyping = false;
  selectedImage: string | null = null;
  isImageModalOpen = false;
  awaitingFeedback: boolean = false;
  pendingBotResponse: { text: string; imageUrl?: string } | null = null;
  private feedbackTimeout: any;


  private whatsappNumber = '(+44) 7403904850';
  private whatsappLink = 'https://wa.me/447403904850'; // AJOUTER CETTE LIGNE
  private whatsappMessage = "Pour plus d'informations, contactez-nous sur WhatsApp au ";

  private orderPageLink = '/order';


  showQuickQuestions = false;
  currentQuickQuestions: string[] = [];

  constructor(private router: Router) { } // Injectez Router


  private greetings = {
    fr: {
      patterns: ["salut", "bonjour", "coucou", "hey", "hello", "bonsoir", "slt", "cc", "bsr", "hi", "hello", "hola"],
      responses: [
        "Salut ! 👋 Comment puis-je vous aider aujourd'hui ?",
        "Bonjour ! 👋 Bienvenue à la TuniCure. En quoi puis-je vous être utile ?",
        "Coucou ! 👋 Ravi(e) de vous voir. Quelle est votre question ?",
        "Hey ! 👋 Comment puis-je vous renseigner aujourd'hui ?",
        "Bonjour et bienvenue ! 👋 Je suis là pour répondre à vos questions."
      ]
    },
    en: {
      patterns: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "greetings", "howdy"],
      responses: [
        "Hi! 👋 How can I help you today?",
        "Hello! 👋 Welcome to TuniCure. How may I assist you?",
        "Hey there! 👋 What can I do for you today?",
        "Greetings! 👋 I'm here to answer your questions."
      ]
    },
    es: {
      patterns: ["hola", "buenos días", "buenas tardes", "buenas noches", "hey", "saludos"],
      responses: [
        "¡Hola! 👋 ¿Cómo puedo ayudarte hoy?",
        "¡Buenos días! 👋 Bienvenida a TuniCure. ¿En qué puedo ayudarte?",
        "¡Saludos! 👋 Estoy aquí para responder tus preguntas."
      ]
    },
    pt: {
      patterns: ["olá", "oi", "bom dia", "boa tarde", "boa noite", "hey", "saudações"],
      responses: [
        "Olá! 👋 Como posso ajudar você hoje?",
        "Oi! 👋 Bem-vinda à TuniCure. Em que posso ser útil?",
        "Saudações! 👋 Estou aqui para responder suas perguntas."
      ]
    },
    de: {
      patterns: ["hallo", "guten tag", "guten morgen", "guten abend", "hi", "hey", "servus", "grüß gott"],
      responses: [
        "Hallo! 👋 Wie kann ich Ihnen heute helfen?",
        "Guten Tag! 👋 Willkommen bei TuniCure. Wie kann ich Ihnen behilflich sein?",
        "Hi! 👋 Was kann ich heute für Sie tun?",
        "Herzlich willkommen! 👋 Ich bin hier, um Ihre Fragen zu beantworten."
      ]
    },
    it: {
      patterns: ["ciao", "salve", "buongiorno", "buonasera", "buona sera", "hey", "saluti"],
      responses: [
        "Ciao! 👋 Come posso aiutarti oggi?",
        "Salve! 👋 Benvenuto da TuniCure. Come posso esserti utile?",
        "Buongiorno! 👋 Sono qui per rispondere alle tue domande.",
        "Hey! 👋 Cosa posso fare per te oggi?"
      ]
    }
  };

  // Langues disponibles
  selectedLanguage = 'fr';
  languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  knowledgeBase: Record<string, QnAPair[]> = {
    fr: [
      // Ginoplastie / Féminisation du visage
      {
        question: "En quoi consiste une Ginoplastie dans la féminisation du visage ?",
        answer: "La Ginoplastie est une intervention qui vise à adoucir et affiner les angles de la mâchoire en remodelant l'os mandibulaire, afin d'obtenir des traits plus féminins, harmonieux et équilibrés.",
        keywords: ["Ginoplastie", "féminisation visage", "mâchoire", "angle mandibulaire", "féminisation du visage"],
        synonyms: ["qu'est-ce que la Ginoplastie", "Ginoplastie définition", "chirurgie mâchoire féminine"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Suis-je une bonne candidate pour une Ginoplastie ?",
        answer: "Vous pouvez être une bonne candidate si votre mâchoire est large, carrée ou très marquée et que vous souhaitez un contour facial plus doux. Le chirurgien confirmera l'indication après analyse médicale et étude de vos photos.",
        keywords: ["bonne candidate", "candidature Ginoplastie", "indication Ginoplastie", "qualifiée Ginoplastie"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "La Ginoplastie peut-elle être réalisée seule ?",
        answer: "Oui, elle peut être réalisée seule ou intégrée dans un programmeme complet de féminisation du visage, en association avec le menton, les pommettes, le front, le nez ou les tissus mous, selon vos objectifs.",
        keywords: ["Ginoplastie seule", "combinaison interventions", "programmeme féminisation visage", "chirurgie combinée"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Quelle technique chirurgicale est utilisée pour la Ginoplastie ?",
        answer: "La technique consiste à remodeler précisément l'os de l'angle mandibulaire. Les incisions sont le plus souvent réalisées à l'intérieur de la bouche, ce qui évite toute cicatrice visible sur le visage.",
        keywords: ["technique Ginoplastie", "incision intra-orale", "chirurgie mâchoire", "méthode Ginoplastie"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Quels sont les risques de la Ginoplastie ?",
        answer: "Comme toute chirurgie, il existe des risques (infection, œdème prolongé, engourdissement temporaire), mais ils restent rares lorsque l'intervention est réalisée par un chirurgien expérimenté dans un environnement médical sécurisé.",
        keywords: ["risques Ginoplastie", "complications", "danger chirurgie mâchoire", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },

      // Rhinoplastie
      {
        question: "En quoi consiste une rhinoplastie ?",
        answer: "La rhinoplastie est une intervention chirurgicale visant à améliorer la forme du nez et/ou la respiration, tout en respectant l'harmonie du visage et vos traits naturels.",
        keywords: ["rhinoplastie", "chirurgie nez", "nez", "rhino", "remodelage nez"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "Quelle est la différence entre une rhinoplastie classique et une rhinoplastie Piezo ?",
        answer: "La rhinoplastie Piezo utilise des ultrasons pour remodeler l'os avec une grande précision, sans traumatiser les tissus environnants. Elle permet généralement moins d'ecchymoses, moins de gonflement et une récupération plus rapide qu'une technique classique.",
        keywords: ["rhinoplastie piezo", "piezo vs classique", "ultrasons nez", "technologie piezo"],
        synonyms: ["différence rhinoplastie", "quelle rhinoplastie choisir"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "La rhinoplastie peut-elle améliorer la respiration ?",
        answer: "Oui. Une rhinoplastie peut être fonctionnelle, notamment en cas de déviation de la cloison nasale (septoplastie), et améliorer significativement la respiration.",
        keywords: ["rhinoplastie fonctionnelle", "respiration nez", "septoplastie", "nez fonctionnel"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "Combien de temps dure l'intervention de rhinoplastie ?",
        answer: "L'intervention dure en moyenne 2 à 3 heures. Une nuit à la clinique est généralement suffisante.",
        keywords: ["durée rhinoplastie", "temps opération nez", "longueur chirurgie nez", "hospitalisation rhinoplastie"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },

      // Mommy Makeover
      {
        question: "Qu'est-ce qu'un Mommy Makeover ?",
        answer: "Le Mommy Makeover est un ensemble d'interventions personnalisées visant à restaurer la silhouette après une ou plusieurs grossesses. Il associe généralement une abdominoplastie (tummy tuck), une chirurgie mammaire (lifting, augmentation ou réduction) et parfois une liposuccion.",
        keywords: ["mommy makeover", "après grossesse", "remise en forme post-grossesse", "chirurgie post-partum"],
        synonyms: ["qu'est-ce que mommy makeover", "makeover maman"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Quelles interventions peuvent être incluses dans un Mommy Makeover ?",
        answer: "Le programmeme est entièrement personnalisé et peut inclure : Tummy tuck (avec ou sans réparation des muscles), Lifting des seins (avec ou sans implants), Liposuccion ciblée (abdomen, flancs, dos, hanches). Le chirurgien définira la combinaison la plus adaptée à vos objectifs.",
        keywords: ["interventions mommy makeover", "combinaison chirurgies", "package mommy makeover", "procédures incluses"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Tout est-il réalisé en une seule intervention pour le Mommy Makeover ?",
        answer: "Dans la majorité des cas, oui. Les interventions sont combinées lors d'une seule opération afin de limiter l'anesthésie et d'optimiser la récupération, dans le respect des règles de sécurité.",
        keywords: ["une seule opération", "chirurgie combinée", "temps mommy makeover", "simultanéité interventions"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Quand pourrai-je reprendre mes activités après un Mommy Makeover ?",
        answer: "Les activités légères peuvent être reprises après 10 à 14 jours. Les efforts physiques et le sport sont généralement autorisés après 6 à 8 semaines, selon l'évolution.",
        keywords: ["récupération mommy makeover", "reprise activités", "convalescence", "temps de guérison"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },

      // Liposuccion
      {
        question: "En quoi consiste une liposuccion ?",
        answer: "La liposuccion est une intervention chirurgicale visant à éliminer les amas graisseux localisés résistants au sport et à l'alimentation, afin d'affiner et de redessiner la silhouette.",
        keywords: ["liposuccion", "lipoaspiration", "graisse localisée", "silhouette", "chirurgie graisse"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "Quelles zones peuvent être traitées par liposuccion ?",
        answer: "Les zones les plus couramment traitées sont l'abdomen, les flancs, le dos, les cuisses, les hanches, les bras, le menton et les genoux. Le chirurgien confirmera les zones adaptées à votre morphologie.",
        keywords: ["zones liposuccion", "régions traitées", "corps liposuccion", "localisations graisse"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "Peut-on associer la liposuccion à une autre intervention ?",
        answer: "Oui, elle peut être associée à un tummy tuck (abdominoplastie), un BBL (lipofilling) ou d'autres interventions selon vos objectifs esthétiques et les recommandations médicales.",
        keywords: ["liposuccion combinée", "association chirurgies", "lipo + autre", "chirurgie multiple", "BBL"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },
      {
        question: "Le résultat de la liposuccion est-il définitif ?",
        answer: "Les cellules graisseuses retirées ne reviennent pas, mais une prise de poids peut modifier le résultat. Une hygiène de vie saine est essentielle pour maintenir les résultats à long terme.",
        keywords: ["résultat définitif", "durabilité liposuccion", "maintien résultats", "permanence lipo"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },

      // Tummy Tuck (Abdominoplastie)
      {
        question: "Qu'est-ce qu'un Tummy Tuck (Abdominoplastie) ?",
        answer: "Le Tummy Tuck (ou abdominoplastie) est une intervention chirurgicale qui consiste à retirer l'excès de peau et de graisse de la paroi abdominale et à resserrer les muscles abdominaux pour obtenir un ventre plus plat et plus ferme.",
        keywords: ["tummy tuck", "abdominoplastie", "ventre plat", "chirurgie abdomen", "ventre", "abdominal"],
        synonyms: ["qu'est-ce qu'une abdominoplastie", "définition tummy tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },

      // Body Lift
      {
        question: "Qu'est-ce qu'un Body Lift ?",
        answer: "Le Body Lift est une intervention chirurgicale complète qui redessine et raffermit plusieurs zones du corps (abdomen, fesses, cuisses) en une seule opération. Il est idéal après une perte de poids importante.",
        keywords: ["body lift", "lifting corporel", "chirurgie corps entier", "remodelage corps", "après perte poids"],
        synonyms: ["lifting du corps", "chirurgie de remodelage corporel"],
        imageUrl: "assets/img/chatbot/Body-Lift.png"
      },

      // Buttock Augmentation
      {
        question: "Qu'est-ce que la Buttock Augmentation ?",
        answer: "La Buttock Augmentation (ou augmentation fessière) est une procédure chirurgicale visant à augmenter le volume et à améliorer la forme des fesses, soit par des implants, soit par transfert de graisse (BBL).",
        keywords: ["buttock augmentation", "augmentation fessière", "fesses", "implants fessiers", "bbf"],
        synonyms: ["augmentation des fesses", "chirurgie des fesses"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },

      // Breast Augmentation
      {
        question: "Qu'est-ce que la Breast Augmentation ?",
        answer: "La Breast Augmentation (ou augmentation mammaire) est une intervention chirurgicale qui augmente la taille et améliore la forme des seins à l'aide d'implants mammaires ou de transfert de graisse.",
        keywords: ["breast augmentation", "augmentation mammaire", "implants mammaires", "seins", "poitrine"],
        synonyms: ["agrandissement des seins", "chirurgie mammaire"],
        imageUrl: "assets/img/chatbot/Breast-Augmentation.png"
      },

      // Breast Reduction
      {
        question: "Qu'est-ce que la Breast Reduction ?",
        answer: "La Breast Reduction (ou réduction mammaire) est une intervention chirurgicale qui réduit la taille des seins en retirant l'excès de tissu graisseux, glandulaire et cutané, pour soulager les douleurs dorsales et améliorer la proportion corporelle.",
        keywords: ["breast reduction", "réduction mammaire", "seins trop lourds", "macromastie", "douleurs dos"],
        synonyms: ["réduction des seins", "chirurgie réductrice mammaire"],
        imageUrl: "assets/img/chatbot/Breast-Reduction.png"
      },

      // Mastopexy / Breast Lift
      {
        question: "Qu'est-ce qu'une Mastopexy (Breast Lift) ?",
        answer: "La Mastopexy (ou lifting mammaire) est une intervention chirurgicale qui redresse et relève les seins affaissés en retirant l'excès de peau et en resserrant les tissus, sans modifier significativement leur volume.",
        keywords: ["mastopexy", "breast lift", "lifting mammaire", "seins affaissés", "ptose mammaire"],
        synonyms: ["relèvement des seins", "redressement poitrine"],
        imageUrl: "assets/img/chatbot/Mastopexy-Breast-Lift.png"
      },

      // Breast Reconstruction
      {
        question: "Qu'est-ce que la Breast Reconstruction ?",
        answer: "La Breast Reconstruction (ou reconstruction mammaire) est une procédure chirurgicale qui restaure la forme, le volume et l'apparence du sein après une mastectomie (ablation du sein) pour cause médicale.",
        keywords: ["breast reconstruction", "reconstruction mammaire", "après mastectomie", "cancer du sein", "reconstruction sein"],
        synonyms: ["reconstruction des seins", "chirurgie reconstructrice"],
        imageUrl: "assets/img/chatbot/Breast-Reconstruction.png"
      },

      // Breast Implant Exchange / Removal
      {
        question: "Qu'est-ce que l'échange ou le retrait d'implants mammaires ?",
        answer: "L'échange ou le retrait d'implants mammaires est une intervention chirurgicale qui consiste à remplacer des implants existants par de nouveaux, ou à les retirer complètement, souvent pour des raisons médicales, esthétiques ou personnelles.",
        keywords: ["breast implant exchange", "retrait implants", "remplacement implants", "explantation", "capsulectomie"],
        synonyms: ["changement d'implants", "enlèvement implants mammaires"],
        imageUrl: "assets/img/chatbot/Breast-Implant-Exchange-Removal.png"
      },

      // Laser Vaginal Rejuvenation
      {
        question: "Qu'est-ce que la Laser Vaginal Rejuvenation ?",
        answer: "La Laser Vaginal Rejuvenation est une procédure non chirurgicale utilisant la technologie laser pour traiter le relâchement vaginal, l'incontinence urinaire légère et améliorer la fonction sexuelle après l'accouchement ou avec l'âge.",
        keywords: ["laser vaginal rejuvenation", "rejuvenation vaginale", "vaginal tightening", "incontinence", "relâchement vaginal"],
        synonyms: ["rajeunissement vaginal", "resserrement vaginal"],
        imageUrl: "assets/img/chatbot/Laser-Vaginal-Rejuvenation.png"
      },

      // Questions générales
      {
        question: "bonjour",
        answer: "Bonjour ! 👋 Bienvenue à la TuniCure. Comment puis-je vous aider aujourd'hui ?",
        keywords: ["bonjour", "salut", "hello", "bonsoir", "coucou"]
      },
      {
        question: "comment prendre rendez-vous",
        answer: `Vous pouvez prendre rendez-vous de deux façons :

📞 **Par téléphone** : <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">(+44) 7403904850</a>
📝 **En ligne** : <a href="${this.orderPageLink}" class="chat-link-order">Cliquez ici pour remplir le formulaire de demande</a>

Notre équipe vous contactera dans les plus brefs délais pour confirmer votre rendez-vous.`,
        keywords: ["rendez-vous", "prise de rdv", "comment prendre rdv", "prendre un rendez-vous", "consultation", "rdv", "prendre rdv"]
      },
      {
        question: "quelles sont vos procédures",
        answer: "Nous proposons les procédures suivantes :\n\n• Rhinoplastie (classique & Piezo)\n• Liposuccion\n• Ginoplastie\n• Mommy Makeover\n• Tummy Tuck (Abdominoplastie)\n• Body Lift\n• Augmentation mammaire\n• Réduction mammaire\n• Lifting mammaire (Mastopexy)\n• BBL (Brazilian Butt Lift)\n• Greffe capillaire\n• Blépharoplastie\n• Avancement de la ligne frontale\n• Laser Vaginal Rejuvenation\n• Sleeve gastrique\n\nNous proposons également de nombreuses autres procédures adaptées à vos besoins.",
        keywords: ["procédures", "interventions", "opérations", "soins", "traitements", "chirurgies"]
      },
      {
        question: "Quel type de tummy tuck me convient (complet, mini, avec réparation musculaire) ?",
        answer: "Le chirurgien vous expliquera la technique la plus adaptée à votre morphologie et à vos objectifs après évaluation complète lors de la consultation préopératoire.",
        keywords: ["type tummy tuck", "tummy tuck complet", "tummy tuck mini", "réparation musculaire", "quel tummy tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Combien de nuits vais-je rester à la clinique après un tummy tuck ?",
        answer: "Généralement 2 à 3 nuits à la clinique pour surveillance médicale optimale après l'intervention.",
        keywords: ["nuits clinique", "hospitalisation tummy tuck", "durée séjour clinique", "combien de nuits"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "L'hôtel est-il proche de la clinique ?",
        answer: "Oui, l'hébergement est sélectionné à proximité de la clinique pour faciliter les déplacements et assurer votre confort pendant la période de récupération.",
        keywords: ["hôtel proche", "proximité clinique", "logement près clinique", "hébergement"],
        imageUrl: "assets/img/chatbot/Accommodation.png"
      },
      {
        question: "Le port de la gaine est-il inclus après un tummy tuck ?",
        answer: "Oui, une gaine post-opératoire est fournie ou prescrite et son utilisation est incluse dans le suivi post-opératoire.",
        keywords: ["gaine post-opératoire", "gainage tummy tuck", "compression", "vêtement de contention"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Y a-t-il des séances de physiothérapie ou drainage lymphatique incluses ?",
        answer: "Oui, selon le forfait choisi, des séances de drainage lymphatique ou de physiothérapie sont incluses ou proposées en option pour optimiser votre récupération.",
        keywords: ["physiothérapie", "drainage lymphatique", "séances récupération", "rééducation"],
        imageUrl: "assets/img/chatbot/Post-Op-Care.png"
      },
      {
        question: "Où sera située la cicatrice après un tummy tuck ?",
        answer: "La cicatrice est placée bas, généralement au niveau du bikini, discrètement dissimulée sous les sous-vêtements. Le chirurgien vous expliquera son évolution et les soins à apporter.",
        keywords: ["cicatrice tummy tuck", "position cicatrice", "cicatrice abdominoplastie", "cicatrisation"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Que se passe-t-il en cas de complication ?",
        answer: "En cas de complication, l'agence assure un suivi médical immédiat, l'accès au chirurgien et une prise en charge selon les protocoles médicaux établis, avec une assistance 24/7.",
        keywords: ["complications", "problèmes post-opératoires", "urgence médicale", "assistance complication"],
        imageUrl: "assets/img/chatbot/Emergency-fr.png"
      },
      {
        question: "Aurai-je une assistance sur place ?",
        answer: "Oui, une coordinatrice médicale francophone est disponible 24 heures sur 24 pendant toute la durée de votre séjour pour vous assister et répondre à vos besoins.",
        keywords: ["assistance sur place", "coordinatrice médicale", "aide locale", "support"],
        imageUrl: "assets/img/chatbot/Assistance.png"
      },

      // Blépharoplastie
      {
        question: "Suis-je une bonne candidate pour une blépharoplastie upper & lower ?",
        answer: "Après étude de vos photos, de votre âge, de la qualité de votre peau et de vos antécédents médicaux, le chirurgien confirmera votre éligibilité pour une blépharoplastie des paupières supérieures et inférieures.",
        keywords: ["blépharoplastie", "paupières", "yeux", "candidate blépharoplastie", "upper lower"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Quelle technique sera utilisée pour les paupières supérieures et inférieures ?",
        answer: "Le chirurgien expliquera la technique adaptée : incision dans le pli naturel de la paupière supérieure, et incision sous les cils ou par voie transconjonctivale pour la paupière inférieure, selon votre cas.",
        keywords: ["technique blépharoplastie", "paupières supérieures", "paupières inférieures", "méthode"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Dois-je rester hospitalisée après une blépharoplastie ?",
        answer: "Dans la majorité des cas, il s'agit d'une chirurgie ambulatoire. Une nuit peut être recommandée selon votre état général et l'avis du chirurgien.",
        keywords: ["hospitalisation blépharoplastie", "nuit clinique", "ambulatoire", "séjour clinique"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Quels sont les effets après une blépharoplastie (gonflement, ecchymoses) ?",
        answer: "Un gonflement et des ecchymoses sont normaux après l'intervention et diminuent progressivement en 10 à 15 jours. Des compresses froides sont recommandées les premiers jours.",
        keywords: ["gonflement paupières", "ecchymoses yeux", "effets secondaires", "récupération blépharoplastie"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Quand pourrai-je reprendre mes activités normales après une blépharoplastie ?",
        answer: "En général après 7 à 10 jours pour les activités légères, selon votre évolution et la rapidité de votre récupération.",
        keywords: ["reprise activités", "temps récupération", "retour travail", "convalescence"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Où seront situées les cicatrices après une blépharoplastie ?",
        answer: "Les cicatrices sont très discrètes : dans le pli naturel de la paupière supérieure, et sous les cils ou à l'intérieur de la paupière inférieure, selon la technique utilisée.",
        keywords: ["cicatrices paupières", "cicatrisation yeux", "cicatrices discrètes", "position cicatrices"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },

      // Greffe capillaire
      {
        question: "Suis-je une bonne candidate pour une greffe capillaire ?",
        answer: "Oui, après une analyse personnalisée basée sur vos photos, votre historique médical, le type de chute de cheveux et la qualité de la zone donneuse. Une consultation avec le médecin est obligatoire avant confirmation.",
        keywords: ["candidate greffe capillaire", "éligibilité greffe", "bonne candidate", "qualification greffe"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Un diagnostic médical est-il fait avant mon arrivée pour une greffe capillaire ?",
        answer: "Oui. Une pré-évaluation à distance est réalisée (photos + questionnaire médical), puis une consultation finale en clinique avant l'intervention pour confirmer le diagnostic.",
        keywords: ["diagnostic greffe", "évaluation préalable", "analyse photos", "consultation préalable"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Quelle technique sera utilisée pour la greffe capillaire (FUE, DHI, Sapphire) et pourquoi ?",
        answer: "Le choix dépend de votre cas : FUE (technique la plus utilisée, naturelle et peu invasive), DHI (implantation directe) ou Sapphire FUE (cicatrisation plus rapide). Le médecin choisit la technique la plus adaptée à votre cuir chevelu et à vos objectifs.",
        keywords: ["technique greffe", "fue", "dhi", "sapphire", "méthode greffe"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Qui réalise la greffe capillaire exactement ?",
        answer: "La greffe est réalisée par un médecin spécialisé en greffe capillaire, assisté d'une équipe médicale qualifiée. Le médecin intervient personnellement sur les étapes clés (design, extraction, implantation).",
        keywords: ["médecin greffe", "équipe médicale", "spécialiste greffe", "qui réalise"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Combien de greffons vais-je recevoir lors d'une greffe capillaire ?",
        answer: "Le nombre exact est confirmé après analyse médicale. En moyenne, cela varie entre 1 500 et 4 000 greffons, selon la densité souhaitée et la zone à traiter.",
        keywords: ["nombre greffons", "quantité cheveux", "greffons", "densité"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Le résultat d'une greffe capillaire sera-t-il naturel ?",
        answer: "Oui. La ligne frontale est dessinée sur mesure, en respectant votre morphologie et l'implantation naturelle des cheveux pour un résultat harmonieux et naturel.",
        keywords: ["résultat naturel", "aspect naturel", "harmonie", "design frontal"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Une greffe capillaire est-elle douloureuse ?",
        answer: "Non. L'intervention se fait sous anesthésie locale. Vous pouvez ressentir une légère gêne pendant l'anesthésie, mais aucune douleur importante pendant l'intervention.",
        keywords: ["douleur greffe", "gêne", "anesthésie locale", "confort"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "L'hébergement et les transferts sont-ils inclus pour une greffe capillaire ?",
        answer: "Oui. Le package comprend : transferts aéroport – hôtel – clinique, hôtel (3 à 5 étoiles selon la formule), assistance et accompagnement tout au long du séjour.",
        keywords: ["hébergement greffe", "transferts inclus", "package complet", "logistique"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Que se passe-t-il après une greffe capillaire ?",
        answer: "Vous bénéficiez de : médicaments post-opératoires, premier lavage en clinique, instructions détaillées, et suivi à distance pendant plusieurs mois.",
        keywords: ["après greffe", "soins post-opératoires", "suivi", "récupération"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Y a-t-il une période de chute des cheveux après une greffe ?",
        answer: "Oui. Une chute temporaire (shock loss) est normale entre 2 et 6 semaines. Les cheveux repoussent progressivement à partir du 3ᵉ mois.",
        keywords: ["chute temporaire", "shock loss", "chute cheveux", "phase chute"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Quand verrai-je les résultats définitifs d'une greffe capillaire ?",
        answer: "Premiers signes : 3–4 mois, résultat visible : 6 mois, résultat final : 12 mois après l'intervention.",
        keywords: ["résultats définitifs", "délais résultats", "évolution cheveux", "temps croissance"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Que comprend exactement le prix d'une greffe capillaire ?",
        answer: "Le prix inclut : greffe capillaire, honoraires médicaux, médicaments, hôtel, transferts, et suivi post-opératoire. Aucun coût caché.",
        keywords: ["prix greffe", "inclus dans prix", "coût", "transparence"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Y a-t-il une garantie pour une greffe capillaire ?",
        answer: "Oui, l'agence garantit la qualité de la prise en charge et le suivi médical. Certains centres proposent aussi une garantie de greffons.",
        keywords: ["garantie greffe", "assurance qualité", "engagement", "sécurité"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },

      // Avancement de la lisière
      {
        question: "Suis-je une bonne candidate pour un avancement de la lisière des cheveux ?",
        answer: "Une évaluation est faite à partir de vos photos, de la hauteur du front, de l'élasticité du cuir chevelu, de votre densité capillaire et de l'absence de chute de cheveux active. Le chirurgien confirmera l'éligibilité lors de la consultation.",
        keywords: ["avancement lisière", "lisière cheveux", "front", "candidate lisière"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Y a-t-il des contre-indications pour l'avancement de la lisière ?",
        answer: "Antécédents de chute de cheveux sévère, alopécie évolutive, cicatrisation difficile ou maladies du cuir chevelu doivent être signalés et évalués par le chirurgien.",
        keywords: ["contre-indications", "contre-indication lisière", "risques", "précautions"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Qui réalisera l'avancement de la lisière et quelles sont ses qualifications ?",
        answer: "Un chirurgien spécialisé en chirurgie esthétique et en chirurgie du cuir chevelu, avec une expérience confirmée dans l'avancement de la ligne frontale.",
        keywords: ["chirurgien lisière", "qualifications", "spécialiste", "expérience"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "La clinique est-elle agréée pour l'avancement de la lisière ?",
        answer: "Oui, la chirurgie est réalisée dans une clinique certifiée, respectant les normes d'hygiène et de sécurité internationales.",
        keywords: ["clinique agréée", "certification", "normes sécurité", "qualité"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Quelle technique sera utilisée pour l'avancement de la lisière ?",
        answer: "Avancement chirurgical de la ligne frontale avec incision discrète au niveau de la lisière des cheveux, permettant d'abaisser le front de façon naturelle.",
        keywords: ["technique lisière", "méthode avancement", "chirurgie lisière", "procédure"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "De combien de centimètres peut-on avancer la lisière ?",
        answer: "En moyenne entre 1,5 et 3 cm, selon l'élasticité du cuir chevelu et la morphologie de votre front.",
        keywords: ["centimètres avancement", "abaissement front", "distance", "mesure"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "L'avancement de la lisière laisse-t-il une cicatrice visible ?",
        answer: "La cicatrice est placée dans la lisière capillaire et devient généralement très discrète avec le temps, cachée par les cheveux.",
        keywords: ["cicatrice lisière", "visibilité cicatrice", "cicatrisation", "cicatrice discrète"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "De quel type d'anesthésie est utilisé pour l'avancement de la lisière ?",
        answer: "Anesthésie générale ou locale avec sédation, selon le cas et l'avis du chirurgien après évaluation préopératoire.",
        keywords: ["anesthésie lisière", "type anesthésie", "sédation", "anesthésie générale"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Le séjour à la clinique est-il nécessaire après un avancement de la lisière ?",
        answer: "Habituellement 1 nuit à la clinique pour surveillance, puis transfert à l'hôtel pour le reste de la convalescence.",
        keywords: ["séjour clinique", "nuit clinique", "hospitalisation", "surveillance"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "La douleur est-elle importante après l'avancement de la lisière ?",
        answer: "Les douleurs sont généralement modérées et bien contrôlées par les traitements prescrits. Un inconfort peut être ressenti les premiers jours.",
        keywords: ["douleur lisière", "inconfort", "gêne post-opératoire", "antidouleurs"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Y aura-t-il des gonflements ou des ecchymoses après l'avancement de la lisière ?",
        answer: "Oui, un œdème du front et parfois des paupières est fréquent les premiers jours et disparaît progressivement en une semaine environ.",
        keywords: ["gonflement lisière", "ecchymoses", "œdème front", "bleus"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Le résultat de l'avancement de la lisière est-il permanent ?",
        answer: "Oui, l'avancement de la lisière est définitif, sous réserve d'une stabilité capillaire et d'une absence de chute de cheveux évolutive.",
        keywords: ["permanent lisière", "définitif", "durabilité", "résultat durable"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Suis-je une bonne candidate pour un Lip Lift ?",
        answer: "Avant toute confirmation, votre éligibilité sera évaluée par le chirurgien à partir de vos photos médicales et de votre historique de santé. Le Lip Lift est généralement recommandé aux patientes présentant : une lèvre supérieure fine ou allongée, un espace important entre le nez et la lèvre supérieure, un manque de définition de l'arc de Cupidon. Une consultation préopératoire avec le chirurgien sera organisée à votre arrivée pour confirmer l'indication.",
        keywords: ["lip lift", "candidate lip lift", "éligibilité lip lift", "bonne candidate lip lift", "lifting lèvre"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quelle est la qualification et l'expérience du chirurgien pour un Lip Lift ?",
        answer: "Nous collaborons uniquement avec des chirurgiens spécialisés en chirurgie esthétique faciale, certifiés et expérimentés dans la procédure du Lip Lift. Vous recevrez : le profil du chirurgien, ses années d'expérience, des photos avant/après de cas similaires, avant de confirmer votre séjour.",
        keywords: ["qualification chirurgien lip lift", "expérience chirurgien", "chirurgien lip lift", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Dans quelle clinique l'intervention de Lip Lift sera-t-elle réalisée ?",
        answer: "Votre intervention sera réalisée dans une clinique accréditée respectant les normes internationales d'hygiène et de sécurité, équipée d'un bloc opératoire moderne et d'une équipe médicale qualifiée.",
        keywords: ["clinique lip lift", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quelle technique sera utilisée pour mon Lip Lift ?",
        answer: "La technique la plus couramment utilisée est le Lip Lift sous-nasal (Bullhorn technique). Le chirurgien vous expliquera : la technique adaptée à votre morphologie, l'emplacement de la cicatrice (dissimulée sous la base du nez), le résultat attendu lors de la consultation préopératoire.",
        keywords: ["technique lip lift", "bullhorn technique", "lip lift sous-nasal", "méthode lip lift"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quel type d'anesthésie sera utilisé pour un Lip Lift ?",
        answer: "Le Lip Lift est généralement réalisé sous anesthésie locale, parfois avec sédation légère selon votre confort et l'avis du chirurgien.",
        keywords: ["anesthésie lip lift", "type anesthésie", "sédation", "anesthésie locale"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Combien de temps dure l'intervention de Lip Lift et le séjour ?",
        answer: "Durée de l'intervention : environ 45 minutes à 1 heure. Séjour clinique : ambulatoire (sortie le jour même). Durée recommandée du séjour en Tunisie : 5 à 6 jours. Ceci inclut : consultation préopératoire, intervention, suivi post-opératoire, retrait des points si nécessaire.",
        keywords: ["durée lip lift", "temps opération", "séjour clinique", "combien de jours"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Que comprend le package médical pour un Lip Lift ?",
        answer: "Votre package inclut : consultation avec le chirurgien, frais de la clinique et de l'intervention, médicaments post-opératoires, transferts VIP (aéroport / clinique / hôtel), hébergement en hôtel, assistance par un coordinateur médical dédié tout au long du séjour.",
        keywords: ["package lip lift", "inclus lip lift", "prestations", "forfait médical"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quels sont les risques ou complications possibles d'un Lip Lift ?",
        answer: "Comme toute intervention chirurgicale, le Lip Lift comporte certains risques tels que : infection, saignement, cicatrisation visible, asymétrie. Le chirurgien vous informera en détail lors de la consultation préopératoire et des mesures sont mises en place pour minimiser ces risques.",
        keywords: ["risques lip lift", "complications", "danger lip lift", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quel est le temps de récupération après un Lip Lift ?",
        answer: "Gonflement et ecchymoses : 7 à 10 jours. Reprise des activités sociales : après 10 à 14 jours. Résultat final : visible après quelques semaines à mesure que l'œdème diminue.",
        keywords: ["récupération lip lift", "convalescence", "reprise activités", "temps guérison"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Y a-t-il un suivi après mon retour dans mon pays après un Lip Lift ?",
        answer: "Oui, nous assurons un suivi post-opératoire à distance avec votre coordinateur médical et le chirurgien si nécessaire, afin de garantir une récupération optimale.",
        keywords: ["suivi lip lift", "après retour", "suivi à distance", "post-opératoire"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Suis-je une bonne candidate pour un Neck Lift ?",
        answer: "Votre éligibilité sera d'abord évaluée par le chirurgien à partir de photos médicales et de votre historique de santé. Un Neck Lift est généralement recommandé pour les patientes présentant : un relâchement cutané au niveau du cou, un double menton, des bandes musculaires visibles (platysma), une perte de définition de l'angle cervico-mentonnier. Une consultation préopératoire en clinique sera organisée à votre arrivée afin de confirmer l'indication chirurgicale.",
        keywords: ["neck lift", "lifting cou", "candidate neck lift", "relâchement cou", "double menton"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quelle est la qualification du chirurgien qui réalisera mon Neck Lift ?",
        answer: "Nous travaillons avec des chirurgiens spécialisés en chirurgie esthétique du visage et du cou, certifiés et expérimentés dans les procédures de Neck Lift. Avant votre confirmation, vous recevrez : le profil du chirurgien, ses années d'expérience, des photos avant/après de cas similaires.",
        keywords: ["qualification chirurgien neck lift", "expérience chirurgien cou", "chirurgien neck lift", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Dans quelle clinique l'intervention de Neck Lift sera-t-elle réalisée ?",
        answer: "Votre Neck Lift sera réalisé dans une clinique accréditée respectant les normes internationales de sécurité, disposant d'un bloc opératoire moderne et d'une équipe médicale qualifiée.",
        keywords: ["clinique neck lift", "établissement cou", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quelle technique sera utilisée dans mon cas pour un Neck Lift ?",
        answer: "La technique utilisée dépendra de votre anatomie et du degré de relâchement cutané. Elle peut inclure : le resserrement du muscle platysma, l'élimination de l'excès de peau, une liposuccion du cou si nécessaire. Le chirurgien vous expliquera en détail la technique recommandée lors de votre consultation préopératoire.",
        keywords: ["technique neck lift", "platysma", "resserrement muscle", "technique cou"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quel type d'anesthésie sera utilisé pour un Neck Lift ?",
        answer: "Le Neck Lift est généralement réalisé sous anesthésie générale afin d'assurer votre confort et votre sécurité pendant l'intervention.",
        keywords: ["anesthésie neck lift", "type anesthésie cou", "anesthésie générale", "sédation"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Combien de temps dure l'intervention de Neck Lift et le séjour ?",
        answer: "Durée de l'intervention : 2 à 3 heures. Séjour en clinique : 1 nuit. Séjour recommandé en Tunisie : 6 à 7 jours. Votre séjour inclura : consultation préopératoire, analyses médicales, intervention chirurgicale, suivi post-opératoire, retrait des drains et des sutures si nécessaire.",
        keywords: ["durée neck lift", "temps opération cou", "séjour clinique", "combien de jours"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Que comprend le package médical pour un Neck Lift ?",
        answer: "Votre package inclut : consultation avec le chirurgien, frais de la clinique et de l'intervention, anesthésie, médicaments post-opératoires, vêtement de contention (mentonnière), transferts VIP (aéroport / clinique / hôtel), hébergement à l'hôtel, assistance d'un coordinateur médical dédié durant tout votre séjour.",
        keywords: ["package neck lift", "inclus neck lift", "prestations cou", "forfait médical"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quels sont les risques associés à un Neck Lift ?",
        answer: "Comme toute chirurgie, le Neck Lift comporte certains risques tels que : infection, hématome, gonflement prolongé, cicatrisation visible, engourdissement temporaire. Toutes les mesures nécessaires sont prises pour minimiser ces risques et assurer votre sécurité.",
        keywords: ["risques neck lift", "complications cou", "danger neck lift", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quel est le temps de récupération après un Neck Lift ?",
        answer: "Gonflement et ecchymoses : 10 à 14 jours. Port de la mentonnière : recommandé pendant 2 à 3 semaines. Reprise des activités sociales : après 2 semaines. Résultat final : visible progressivement sur 2 à 3 mois.",
        keywords: ["récupération neck lift", "convalescence cou", "reprise activités", "temps guérison"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Un suivi est-il assuré après mon retour dans mon pays après un Neck Lift ?",
        answer: "Oui, nous assurons un suivi post-opératoire à distance avec votre coordinateur médical et le chirurgien afin d'accompagner votre récupération après votre retour.",
        keywords: ["suivi neck lift", "après retour cou", "suivi à distance", "post-opératoire"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Suis-je une bonne candidate pour une bichectomie ?",
        answer: "Votre éligibilité sera évaluée par le chirurgien à partir de photos médicales et de votre historique de santé. La bichectomie est généralement recommandée aux patientes présentant : un visage rond ou des joues volumineuses, un excès de graisse au niveau des boules de Bichat, un manque de définition au niveau des pommettes ou de l'ovale du visage. Une consultation préopératoire sera organisée à votre arrivée afin de confirmer l'indication chirurgicale.",
        keywords: ["bichectomie", "boules de Bichat", "joues", "visage rond", "affiner visage"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Quelle est la qualification du chirurgien qui réalisera ma bichectomie ?",
        answer: "Nous collaborons avec des chirurgiens spécialisés en chirurgie esthétique du visage, certifiés et expérimentés dans la procédure de bichectomie. Avant toute confirmation, vous recevrez : le profil du chirurgien, ses années d'expérience, des photos avant/après de cas similaires.",
        keywords: ["qualification chirurgien bichectomie", "expérience chirurgien joues", "chirurgien bichectomie", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Dans quelle clinique l'intervention de bichectomie sera-t-elle réalisée ?",
        answer: "Votre intervention sera réalisée dans une clinique accréditée respectant les normes internationales d'hygiène et de sécurité, équipée d'un bloc opératoire moderne et d'une équipe médicale qualifiée.",
        keywords: ["clinique bichectomie", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Comment se déroule l'intervention de bichectomie ?",
        answer: "La bichectomie consiste à retirer une partie des boules de Bichat afin d'affiner le bas du visage. Les incisions sont réalisées à l'intérieur de la bouche, ce qui signifie qu'il n'y a aucune cicatrice visible sur la peau.",
        keywords: ["déroulement bichectomie", "technique", "incision bouche", "pas de cicatrice"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Quel type d'anesthésie sera utilisé pour une bichectomie ?",
        answer: "La bichectomie est généralement réalisée sous anesthésie locale, parfois avec sédation légère selon votre confort et l'avis du chirurgien.",
        keywords: ["anesthésie bichectomie", "type anesthésie", "anesthésie locale", "sédation"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Combien de temps dure l'intervention de bichectomie et le séjour ?",
        answer: "Durée de l'intervention : 30 à 45 minutes. Séjour en clinique : ambulatoire (sortie le jour même). Durée recommandée du séjour en Tunisie : 4 à 5 jours. Votre séjour inclut : consultation préopératoire, analyses médicales si nécessaires, intervention chirurgicale, suivi post-opératoire.",
        keywords: ["durée bichectomie", "temps opération", "séjour clinique", "combien de jours"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Que comprend le package médical pour une bichectomie ?",
        answer: "Votre package inclut : honoraires du chirurgien, frais de la clinique, anesthésie, médicaments post-opératoires, transferts VIP (aéroport / clinique / hôtel), hébergement à l'hôtel, assistance d'un coordinateur médical dédié tout au long de votre séjour.",
        keywords: ["package bichectomie", "inclus bichectomie", "prestations", "forfait médical"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Quels sont les risques ou complications possibles d'une bichectomie ?",
        answer: "Comme toute intervention chirurgicale, la bichectomie comporte certains risques tels que : infection, gonflement, asymétrie, engourdissement temporaire. Toutes les mesures sont mises en place afin de minimiser ces risques.",
        keywords: ["risques bichectomie", "complications", "danger bichectomie", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Quel est le temps de récupération après une bichectomie ?",
        answer: "Gonflement : 7 à 10 jours. Reprise des activités sociales : après 5 à 7 jours. Résultat final : visible progressivement après 4 à 6 semaines.",
        keywords: ["récupération bichectomie", "convalescence", "reprise activités", "temps guérison"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Suis-je une bonne candidate pour une canthopexie ?",
        answer: "Votre éligibilité sera évaluée par le chirurgien à partir de photos médicales et de votre historique de santé. La canthopexie est généralement recommandée pour les patientes présentant : un relâchement de la paupière inférieure, un regard tombant ou fatigué, un manque de soutien au niveau du coin externe de l'œil, le souhait d'améliorer la forme ou la tension de la paupière inférieure. Une consultation préopératoire sera organisée à votre arrivée afin de confirmer l'indication chirurgicale.",
        keywords: ["canthopexie", "paupière", "regard", "coin oeil", "paupière inférieure"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Quelle est la qualification du chirurgien qui réalisera ma canthopexie ?",
        answer: "Nous collaborons avec des chirurgiens spécialisés en chirurgie esthétique des paupières et du regard, certifiés et expérimentés dans la procédure de canthopexie. Avant toute confirmation, vous recevrez : le profil du chirurgien, ses années d'expérience, des photos avant/après de cas similaires.",
        keywords: ["qualification chirurgien canthopexie", "expérience chirurgien paupière", "chirurgien canthopexie", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Dans quelle clinique l'intervention de canthopexie sera-t-elle réalisée ?",
        answer: "Votre intervention sera réalisée dans une clinique accréditée respectant les normes internationales d'hygiène et de sécurité, équipée d'un bloc opératoire moderne et d'une équipe médicale qualifiée.",
        keywords: ["clinique canthopexie", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Comment se déroule l'intervention de canthopexie ?",
        answer: "La canthopexie consiste à retendre et repositionner le tendon du coin externe de la paupière inférieure afin d'améliorer le soutien et la forme de l'œil. Elle peut être réalisée seule ou en complément d'une blépharoplastie inférieure selon votre cas.",
        keywords: ["déroulement canthopexie", "technique", "tendon", "coin oeil"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Quel type d'anesthésie sera utilisé pour une canthopexie ?",
        answer: "La canthopexie est généralement réalisée sous anesthésie locale avec sédation légère, ou sous anesthésie générale selon l'indication et les recommandations du chirurgien.",
        keywords: ["anesthésie canthopexie", "type anesthésie", "anesthésie locale", "sédation"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Combien de temps dure l'intervention de canthopexie et le séjour ?",
        answer: "Durée de l'intervention : environ 1 heure. Séjour en clinique : ambulatoire (sortie le jour même). Durée recommandée du séjour en Tunisie : 4 à 5 jours. Votre séjour inclut : consultation préopératoire, intervention chirurgicale, suivi post-opératoire, retrait des sutures si nécessaire.",
        keywords: ["durée canthopexie", "temps opération", "séjour clinique", "combien de jours"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Que comprend le package médical pour une canthopexie ?",
        answer: "Votre package inclut : honoraires du chirurgien, frais de la clinique, anesthésie, médicaments post-opératoires, transferts VIP (aéroport / clinique / hôtel), hébergement à l'hôtel, assistance par un coordinateur médical dédié tout au long de votre séjour.",
        keywords: ["package canthopexie", "inclus canthopexie", "prestations", "forfait médical"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Quels sont les risques ou complications possibles d'une canthopexie ?",
        answer: "Comme toute intervention chirurgicale, la canthopexie comporte certains risques tels que : infection, gonflement, sécheresse oculaire temporaire, asymétrie, irritation oculaire. Toutes les mesures sont mises en place afin de minimiser ces risques.",
        keywords: ["risques canthopexie", "complications", "danger canthopexie", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Quel est le temps de récupération après une canthopexie ?",
        answer: "Gonflement et ecchymoses : 7 à 10 jours. Reprise des activités sociales : après 7 à 10 jours. Résultat final : visible progressivement après quelques semaines.",
        keywords: ["récupération canthopexie", "convalescence", "reprise activités", "temps guérison"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Suis-je une bonne candidate pour un Facial Fat Grafting ?",
        answer: "Votre éligibilité sera évaluée par le chirurgien à partir de photos médicales et de votre historique de santé. Le Facial Fat Grafting est généralement recommandé aux patientes présentant : une perte de volume au niveau du visage, des cernes creux, des joues ou tempes creusées, des plis nasogéniens marqués, un manque de définition de l'ovale du visage. Une consultation préopératoire sera organisée à votre arrivée afin de confirmer l'indication et établir un plan de traitement personnalisé.",
        keywords: ["facial fat grafting", "lipofilling visage", "graisse visage", "volume visage", "cernes"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Quelle est la qualification du chirurgien qui réalisera mon Facial Fat Grafting ?",
        answer: "Nous collaborons avec des chirurgiens spécialisés en chirurgie esthétique du visage, certifiés et expérimentés dans les techniques de lipofilling facial. Avant toute confirmation, vous recevrez : le profil du chirurgien, ses années d'expérience, des photos avant/après de cas similaires.",
        keywords: ["qualification chirurgien lipofilling", "expérience chirurgien visage", "chirurgien fat grafting", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Dans quelle clinique l'intervention de Facial Fat Grafting sera-t-elle réalisée ?",
        answer: "Votre intervention sera réalisée dans une clinique accréditée respectant les normes internationales d'hygiène et de sécurité, équipée d'un bloc opératoire moderne et d'une équipe médicale qualifiée.",
        keywords: ["clinique lipofilling", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Comment se déroule l'intervention de Facial Fat Grafting ?",
        answer: "Le Facial Fat Grafting consiste à prélever de la graisse sur une zone donneuse (comme l'abdomen ou les cuisses), à la purifier, puis à la réinjecter dans les zones du visage nécessitant du volume, afin d'obtenir un résultat naturel et durable.",
        keywords: ["déroulement lipofilling", "technique", "prélèvement graisse", "réinjection"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Quel type d'anesthésie sera utilisé pour un Facial Fat Grafting ?",
        answer: "Cette procédure est généralement réalisée sous anesthésie locale avec sédation légère ou sous anesthésie générale, selon l'étendue du traitement et les recommandations du chirurgien.",
        keywords: ["anesthésie lipofilling", "type anesthésie", "anesthésie locale", "sédation"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Combien de temps dure l'intervention de Facial Fat Grafting et le séjour ?",
        answer: "Durée de l'intervention : 1 à 2 heures. Séjour en clinique : ambulatoire ou 1 nuit. Durée recommandée du séjour en Tunisie : 5 à 6 jours. Votre séjour inclut : consultation préopératoire, analyses médicales si nécessaires, intervention chirurgicale, suivi post-opératoire.",
        keywords: ["durée lipofilling", "temps opération", "séjour clinique", "combien de jours"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Que comprend le package médical pour un Facial Fat Grafting ?",
        answer: "Votre package inclut : honoraires du chirurgien, frais de la clinique, anesthésie, médicaments post-opératoires, transferts VIP (aéroport / clinique / hôtel), hébergement à l'hôtel, assistance d'un coordinateur médical dédié tout au long de votre séjour.",
        keywords: ["package lipofilling", "inclus fat grafting", "prestations", "forfait médical"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Quels sont les risques ou complications possibles d'un Facial Fat Grafting ?",
        answer: "Comme toute intervention chirurgicale, le Facial Fat Grafting comporte certains risques tels que : infection, gonflement, résorption partielle de la graisse injectée, asymétrie. Toutes les mesures nécessaires sont mises en place afin de minimiser ces risques.",
        keywords: ["risques lipofilling", "complications", "danger fat grafting", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Quel est le temps de récupération après un Facial Fat Grafting ?",
        answer: "Gonflement et ecchymoses : 7 à 14 jours. Reprise des activités sociales : après 10 à 14 jours. Résultat final : visible progressivement après quelques semaines à mesure que l'œdème diminue.",
        keywords: ["récupération lipofilling", "convalescence", "reprise activités", "temps guérison"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Suis-je une bonne candidate pour un Brow Lift ?",
        answer: "Votre éligibilité sera évaluée par le chirurgien à partir de photos médicales et de votre historique de santé. Le Brow Lift est généralement recommandé aux patientes présentant : des sourcils tombants, un regard fatigué ou triste, un excès de peau au niveau du front, des rides frontales ou intersourcilières marquées. Une consultation préopératoire sera organisée à votre arrivée afin de confirmer l'indication chirurgicale.",
        keywords: ["brow lift", "lifting sourcils", "sourcils tombants", "regard fatigué", "rides front"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Quelle est la qualification du chirurgien qui réalisera mon Brow Lift ?",
        answer: "Nous collaborons avec des chirurgiens spécialisés en chirurgie esthétique du visage, certifiés et expérimentés dans les procédures de lifting des sourcils. Avant toute confirmation, vous recevrez : le profil du chirurgien, ses années d'expérience, des photos avant/après de cas similaires.",
        keywords: ["qualification chirurgien brow lift", "expérience chirurgien sourcils", "chirurgien brow lift", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Dans quelle clinique l'intervention de Brow Lift sera-t-elle réalisée ?",
        answer: "Votre intervention sera réalisée dans une clinique accréditée respectant les normes internationales d'hygiène et de sécurité, équipée d'un bloc opératoire moderne et d'une équipe médicale qualifiée.",
        keywords: ["clinique brow lift", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Quelle technique sera utilisée dans mon cas pour un Brow Lift ?",
        answer: "La technique utilisée dépendra de votre anatomie et du résultat souhaité. Elle peut inclure : un lifting endoscopique des sourcils, un lifting temporal, ou un lifting frontal classique. Le chirurgien vous expliquera la technique recommandée lors de votre consultation préopératoire.",
        keywords: ["technique brow lift", "lifting endoscopique", "lifting temporal", "lifting frontal"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Quel type d'anesthésie sera utilisé pour un Brow Lift ?",
        answer: "Le Brow Lift est généralement réalisé sous anesthésie générale ou sous anesthésie locale avec sédation légère selon la technique utilisée.",
        keywords: ["anesthésie brow lift", "type anesthésie", "anesthésie générale", "sédation"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Combien de temps dure l'intervention de Brow Lift et le séjour ?",
        answer: "Durée de l'intervention : 1 à 2 heures. Séjour en clinique : ambulatoire ou 1 nuit. Durée recommandée du séjour en Tunisie : 5 à 6 jours. Votre séjour inclut : consultation préopératoire, analyses médicales si nécessaires, intervention chirurgicale, suivi post-opératoire, retrait des sutures si nécessaire.",
        keywords: ["durée brow lift", "temps opération", "séjour clinique", "combien de jours"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Que comprend le package médical pour un Brow Lift ?",
        answer: "Votre package inclut : honoraires du chirurgien, frais de la clinique, anesthésie, médicaments post-opératoires, transferts VIP (aéroport / clinique / hôtel), hébergement à l'hôtel, assistance par un coordinateur médical dédié tout au long de votre séjour.",
        keywords: ["package brow lift", "inclus brow lift", "prestations", "forfait médical"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Quels sont les risques ou complications possibles d'un Brow Lift ?",
        answer: "Comme toute intervention chirurgicale, le Brow Lift comporte certains risques tels que : infection, gonflement, ecchymoses, asymétrie, engourdissement temporaire. Toutes les mesures nécessaires sont mises en place afin de minimiser ces risques.",
        keywords: ["risques brow lift", "complications", "danger brow lift", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Quel est le temps de récupération après un Brow Lift ?",
        answer: "Gonflement et ecchymoses : 7 à 10 jours. Reprise des activités sociales : après 10 à 14 jours. Résultat final : visible progressivement après quelques semaines.",
        keywords: ["récupération brow lift", "convalescence", "reprise activités", "temps guérison"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Le chirurgien est-il qualifié et expérimenté dans l'otoplastie ?",
        answer: "Oui, nous collaborons avec des chirurgiens spécialisés en chirurgie esthétique et reconstructrice, ayant plusieurs années d'expérience dans la réalisation d'otoplasties avec des résultats naturels.",
        keywords: ["chirurgien otoplastie", "qualification chirurgien oreilles", "expérience otoplastie", "chirurgien oreilles décollées"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Puis-je voir des photos avant/après de patients ayant subi une otoplastie ?",
        answer: "Bien sûr, nous pouvons vous partager des photos avant/après de cas similaires réalisés par le chirurgien, tout en respectant la confidentialité des patients.",
        keywords: ["photos avant après otoplastie", "résultats otoplastie", "galerie photos", "cas similaires"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Dans quelle clinique l'opération d'otoplastie sera-t-elle réalisée ? Est-elle certifiée ?",
        answer: "L'intervention se déroule dans une clinique agréée respectant les normes internationales d'hygiène et de sécurité.",
        keywords: ["clinique otoplastie", "établissement certifié", "clinique agréée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "L'opération d'otoplastie est-elle réalisée sous anesthésie locale ou générale ?",
        answer: "L'otoplastie est généralement réalisée sous anesthésie locale avec sédation légère, mais une anesthésie générale peut être envisagée selon votre cas et la recommandation du chirurgien.",
        keywords: ["anesthésie otoplastie", "type anesthésie oreilles", "anesthésie locale", "anesthésie générale"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Les résultats de l'otoplastie sont-ils permanents ?",
        answer: "Oui, les résultats de l'otoplastie sont généralement définitifs une fois la cicatrisation complète.",
        keywords: ["résultats permanents otoplastie", "durabilité", "définitif", "permanent"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Aurai-je des cicatrices visibles après une otoplastie ?",
        answer: "Les incisions sont faites derrière l'oreille, les cicatrices sont donc discrètes et deviennent quasiment invisibles avec le temps.",
        keywords: ["cicatrices otoplastie", "visibilité cicatrices", "incisions derrière oreille", "cicatrices discrètes"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Combien de jours dois-je rester en Tunisie pour une otoplastie ?",
        answer: "Le séjour recommandé est généralement de 5 à 7 jours : Jour 1 : Arrivée & transfert à l'hôtel, Jour 2 : Consultation avec le chirurgien + analyses médicales, Jour 3 : Intervention, Jour 4 : Repos, Jour 5 : Premier contrôle post-opératoire, Jour 6-7 : Autorisation de vol après validation médicale.",
        keywords: ["durée séjour otoplastie", "combien de jours", "timeline", "parcours"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Combien de temps dure l'opération d'otoplastie ?",
        answer: "L'intervention dure en moyenne entre 1h et 2h.",
        keywords: ["durée otoplastie", "temps opération oreilles", "combien de temps"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Vais-je passer la nuit à la clinique après une otoplastie ?",
        answer: "L'otoplastie est généralement réalisée en ambulatoire. Vous pourrez quitter la clinique le jour même après observation médicale.",
        keywords: ["nuit clinique otoplastie", "hospitalisation", "ambulatoire", "séjour clinique"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Vais-je ressentir des douleurs après l'opération d'otoplastie ?",
        answer: "Une gêne légère à modérée peut être ressentie pendant quelques jours, mais elle est bien contrôlée avec des antalgiques.",
        keywords: ["douleur otoplastie", "gêne post-opératoire", "antalgiques", "confort"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Devrai-je porter un bandage après une otoplastie ?",
        answer: "Oui, un bandeau compressif devra être porté : 24h/24 pendant 5 à 7 jours, puis uniquement la nuit pendant 2 à 3 semaines.",
        keywords: ["bandage otoplastie", "bandeau compressif", "compression", "soins post-opératoires"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Quand puis-je reprendre mes activités normales après une otoplastie ?",
        answer: "Travail : après 5 à 7 jours. Sport : après 3 à 4 semaines.",
        keywords: ["reprise activités otoplastie", "retour travail", "reprise sport", "convalescence"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Le suivi post-opératoire est-il inclus dans le package d'otoplastie ?",
        answer: "Oui, le suivi post-opératoire est inclus, comprenant : consultation de contrôle avant votre départ, assistance médicale à distance après votre retour, recommandations pour les soins post-opératoires.",
        keywords: ["suivi otoplastie", "inclus dans package", "contrôle", "assistance"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Quels sont les risques possibles d'une otoplastie ?",
        answer: "Comme toute intervention chirurgicale, il existe des risques rares tels que : infection, hématome, asymétrie. Mais toutes les précautions sont prises pour minimiser ces risques.",
        keywords: ["risques otoplastie", "complications", "danger otoplastie", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Suis-je une bonne candidate pour une dimpleplastie ?",
        answer: "Une évaluation personnalisée sera réalisée à partir de photos ou lors d'une consultation avec le chirurgien. Le médecin vérifiera : l'élasticité de votre peau, la structure de vos joues, vos attentes esthétiques afin de confirmer que la procédure est adaptée à votre morphologie faciale.",
        keywords: ["dimpleplastie", "fossettes", "candidate dimpleplastie", "création fossettes", "joues"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Qui réalisera ma dimpleplastie et quelles sont ses qualifications ?",
        answer: "L'agence doit vous fournir : le nom du chirurgien, ses années d'expérience, ses certifications, des photos avant/après de patientes ayant subi une dimpleplastie.",
        keywords: ["chirurgien dimpleplastie", "qualifications", "expérience fossettes", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Où se déroule l'intervention de dimpleplastie ?",
        answer: "L'intervention se déroule dans une clinique agréée respectant les normes d'hygiène internationales. Il s'agit généralement d'une procédure ambulatoire réalisée sous anesthésie locale.",
        keywords: ["clinique dimpleplastie", "établissement", "clinique agréée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Quelle est la durée de l'intervention de dimpleplastie et du séjour ?",
        answer: "Durée de l'intervention : 20 à 40 minutes. Séjour recommandé : 3 à 5 jours. Arrivée : consultation pré-opératoire. Jour J : intervention. Jour 2-3 : contrôle post-opératoire avant le retour.",
        keywords: ["durée dimpleplastie", "temps opération", "séjour clinique", "combien de jours"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Les résultats de la dimpleplastie sont-ils permanents ?",
        answer: "Oui, les résultats sont généralement permanents. Les fossettes peuvent apparaître en permanence au début, puis devenir plus naturelles avec le temps (visibles uniquement lors du sourire).",
        keywords: ["résultats permanents dimpleplastie", "durabilité fossettes", "définitif", "permanent"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Quels sont les risques ou effets secondaires d'une dimpleplastie ?",
        answer: "Gonflement temporaire, légère douleur, asymétrie (rare), infection (très rare avec une bonne hygiène).",
        keywords: ["risques dimpleplastie", "complications", "effets secondaires", "danger fossettes"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Quel est le temps de récupération après une dimpleplastie ?",
        answer: "Reprise des activités normales : 2 à 3 jours. Résultat final : 4 à 6 semaines. Recommandations : éviter les aliments durs, maintenir une bonne hygiène buccale.",
        keywords: ["récupération dimpleplastie", "convalescence", "reprise activités", "temps guérison"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Suis-je une bonne candidate pour une génioplastie ?",
        answer: "Vous devez être en bonne santé générale, ne pas avoir de contre-indications chirurgicales et présenter un menton en recul, trop avancé ou asymétrique. Une évaluation médicale sera réalisée à partir de vos photos et examens afin de confirmer votre éligibilité.",
        keywords: ["génioplastie", "chirurgie menton", "candidate génioplastie", "menton en recul", "asymétrie menton"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Quels examens dois-je faire avant une génioplastie ?",
        answer: "Un bilan sanguin complet, une radiographie ou un scanner céphalométrique peuvent être demandés afin d'analyser la structure osseuse de votre menton et planifier l'intervention avec précision.",
        keywords: ["examens génioplastie", "bilan sanguin", "scanner menton", "radiographie"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Le chirurgien est-il qualifié pour une génioplastie ?",
        answer: "Oui, nous collaborons uniquement avec des chirurgiens maxillo-faciaux expérimentés, spécialisés en chirurgie du menton et certifiés par les autorités médicales compétentes.",
        keywords: ["chirurgien génioplastie", "qualification", "chirurgien maxillo-facial", "expérience menton"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Dans quelle clinique l'intervention de génioplastie aura-t-elle lieu ?",
        answer: "L'intervention sera réalisée dans une clinique accréditée respectant les normes internationales en matière d'hygiène, d'équipement et de sécurité.",
        keywords: ["clinique génioplastie", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Combien de temps dure l'intervention de génioplastie et l'hospitalisation ?",
        answer: "La génioplastie dure en moyenne entre 1 à 2 heures sous anesthésie générale. Une hospitalisation d'une nuit est généralement nécessaire pour assurer une surveillance post-opératoire.",
        keywords: ["durée génioplastie", "temps opération", "hospitalisation", "nuit clinique"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Quelles sont les suites opératoires d'une génioplastie ?",
        answer: "Un gonflement, des ecchymoses et une gêne temporaire peuvent apparaître après l'intervention. Une alimentation molle est recommandée pendant quelques jours. Le port d'un bandage de contention peut être nécessaire.",
        keywords: ["suites génioplastie", "gonflement", "ecchymoses", "alimentation molle"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Le traitement post-opératoire est-il inclus dans la génioplastie ?",
        answer: "Oui, les médicaments nécessaires (antalgiques, antibiotiques), les consultations de suivi ainsi que les soins post-opératoires sont inclus dans votre package.",
        keywords: ["traitement post-opératoire", "médicaments inclus", "suivi génioplastie", "package"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Quels sont les risques possibles d'une génioplastie ?",
        answer: "Comme toute intervention chirurgicale, la génioplastie comporte des risques tels qu'infection, saignement ou engourdissement temporaire. Ceux-ci restent rares et toutes les précautions sont prises pour les minimiser.",
        keywords: ["risques génioplastie", "complications", "danger menton", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Qui sera mon chirurgien pour le bypass gastrique ?",
        answer: "L'agence doit répondre : le nom complet du chirurgien, son expérience en chirurgie bariatrique, le nombre d'interventions réalisées, ses certifications et accréditations.",
        keywords: ["chirurgien bypass", "qualifications", "expérience bariatrique", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Dans quelle clinique l'opération de bypass gastrique aura-t-elle lieu ?",
        answer: "L'agence doit répondre : le nom de la clinique, son niveau d'équipement, les normes d'hygiène et de sécurité, la présence d'un service de réanimation.",
        keywords: ["clinique bypass", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Quels examens dois-je faire avant un bypass gastrique ?",
        answer: "Liste complète des analyses (prise de sang, ECG, échographie…), consultation avec le chirurgien + anesthésiste, éventuel régime pré-opératoire obligatoire.",
        keywords: ["examens bypass", "bilan sanguin", "ECG", "consultation"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Combien de jours vais-je rester à la clinique après un bypass gastrique ?",
        answer: "2 à 3 nuits en clinique (en moyenne), 5 à 7 nuits à l'hôtel pour récupération, retour possible après validation médicale.",
        keywords: ["hospitalisation bypass", "nuits clinique", "séjour", "récupération"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Quels sont les risques liés au bypass gastrique ?",
        answer: "Explication claire des risques possibles, prise en charge immédiate sur place si besoin, suivi médical inclus dans le package.",
        keywords: ["risques bypass", "complications", "danger", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Vais-je bénéficier d'un suivi nutritionnel après un bypass gastrique ?",
        answer: "Plan alimentaire post-opératoire, suivi à distance avec nutritionniste, assistance continue après retour.",
        keywords: ["suivi nutritionnel bypass", "régime", "nutritionniste", "alimentation"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Suis-je une bonne candidate pour une sleeve gastrique ?",
        answer: "Votre éligibilité dépend de votre IMC, de vos antécédents médicaux et de votre état de santé général. Un bilan préopératoire complet sera réalisé à votre arrivée (analyses sanguines, ECG, échographie abdominale, etc.) afin que le chirurgien puisse confirmer si l'intervention peut être pratiquée en toute sécurité.",
        keywords: ["sleeve gastrique", "candidate sleeve", "chirurgie bariatrique", "perte poids", "obésité"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Qui sera mon chirurgien pour la sleeve gastrique et quelles sont ses qualifications ?",
        answer: "L'agence doit vous communiquer : le nom du chirurgien, son expérience en chirurgie bariatrique, son nombre d'interventions réalisées, ses accréditations et formations internationales. Une consultation avec le chirurgien est prévue avant l'opération pour discuter de vos attentes et valider le protocole chirurgical.",
        keywords: ["chirurgien sleeve", "qualifications", "expérience bariatrique", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Dans quelle clinique l'opération de sleeve gastrique sera-t-elle réalisée ?",
        answer: "L'intervention est réalisée dans une clinique accréditée respectant les normes internationales d'hygiène et de sécurité, équipée d'un bloc opératoire moderne et d'une unité de soins intensifs si nécessaire.",
        keywords: ["clinique sleeve", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Quel suivi est prévu après l'opération de sleeve gastrique ?",
        answer: "Le suivi inclut : visites médicales post-opératoires, assistance nutritionnelle, traitement médicamenteux, recommandations alimentaires, suivi à distance après votre retour dans votre pays (WhatsApp / email).",
        keywords: ["suivi sleeve", "post-opératoire", "nutrition", "assistance"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Quels sont les risques ou complications possibles d'une sleeve gastrique ?",
        answer: "Comme toute chirurgie, la sleeve gastrique comporte des risques potentiels tels que : infection, saignement, fuite gastrique, carences nutritionnelles. Toutes les précautions sont prises pour minimiser ces risques, et une surveillance médicale continue est assurée pendant votre hospitalisation.",
        keywords: ["risques sleeve", "complications", "danger", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Vais-je recevoir un programmeme alimentaire après l'intervention de sleeve gastrique ?",
        answer: "Oui, un plan nutritionnel progressif vous sera fourni (liquide → mixé → solide) ainsi que des conseils diététiques pour assurer une perte de poids saine et durable.",
        keywords: ["alimentation sleeve", "régime", "plan nutritionnel", "conseils diététiques"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Travaillez-vous avec des chirurgiens spécialisés dans la chirurgie de la cataracte ?",
        answer: "Oui, nous collaborons avec des ophtalmologues hautement qualifiés, spécialisés en chirurgie de la cataracte, exerçant dans des cliniques accréditées respectant les normes internationales d'hygiène et de sécurité.",
        keywords: ["cataracte", "chirurgie cataracte", "ophtalmologue", "spécialiste cataracte"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Quelle technique est utilisée pour l'opération de la cataracte ?",
        answer: "La chirurgie est réalisée par phacoémulsification, une technique moderne, rapide et mini-invasive, permettant de retirer le cristallin opacifié et de le remplacer par une lentille intraoculaire (implant).",
        keywords: ["technique cataracte", "phacoémulsification", "lentille intraoculaire", "implant"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Quel type d'implant intraoculaire est proposé pour la cataracte ?",
        answer: "Nous proposons différents types d'implants : monofocal (vision de loin), multifocal (vision de loin et de près), torique (corrige l'astigmatisme). Le choix sera déterminé après un bilan ophtalmologique complet effectué sur place.",
        keywords: ["implants cataracte", "monofocal", "multifocal", "torique", "lentilles"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Quels sont les risques ou complications possibles d'une chirurgie de la cataracte ?",
        answer: "La chirurgie de la cataracte est une procédure sûre avec un taux de réussite très élevé. Comme toute intervention, certains risques existent (infection, inflammation…), mais ils restent rares et sont pris en charge par l'équipe médicale.",
        keywords: ["risques cataracte", "complications", "danger", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Quand puis-je reprendre l'avion après une opération de la cataracte ?",
        answer: "Vous pouvez généralement reprendre l'avion 24 à 48 heures après l'intervention, après validation du chirurgien lors du contrôle postopératoire.",
        keywords: ["retour avion cataracte", "vol", "autorisation", "délai"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Combien de temps dure la récupération après une opération de la cataracte ?",
        answer: "L'amélioration de la vision est généralement rapide, dès les premiers jours. La récupération complète peut prendre quelques semaines.",
        keywords: ["récupération cataracte", "vision", "temps guérison", "convalescence"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Suis-je une bonne candidate pour une brachioplastie ?",
        answer: "Vous pouvez être une bonne candidate si : vous présentez un relâchement cutané important au niveau des bras (souvent après perte de poids ou vieillissement), votre poids est stable depuis au moins 3 à 6 mois, vous êtes en bonne santé générale et non fumeuse (ou prête à arrêter avant et après l'intervention), vous avez des attentes réalistes concernant les cicatrices et les résultats.",
        keywords: ["brachioplastie", "lifting bras", "candidate brachioplastie", "relâchement bras", "chirurgie bras"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Le chirurgien est-il qualifié et expérimenté dans une brachioplastie ?",
        answer: "Le chirurgien est spécialisé en chirurgie plastique et reconstructrice. Il possède une expérience confirmée en brachioplastie. Des photos avant/après de patientes ayant subi la même intervention peuvent être fournies. Une consultation pré-opératoire sera organisée à votre arrivée pour valider votre éligibilité.",
        keywords: ["chirurgien brachioplastie", "qualifications", "expérience bras", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Dans quelle clinique l'opération de brachioplastie sera-t-elle réalisée ?",
        answer: "L'intervention est effectuée dans une clinique accréditée respectant les normes internationales d'hygiène et de sécurité. Le bloc opératoire est équipé pour la chirurgie esthétique. L'intervention se fait sous anesthésie générale avec présence d'un anesthésiste qualifié.",
        keywords: ["clinique brachioplastie", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Quel est le déroulement du séjour médical pour une brachioplastie ?",
        answer: "Votre parcours doit être clairement détaillé : Jour 1 : Arrivée + transfert à l'hôtel, Jour 2 : Analyses médicales + consultation avec le chirurgien, Jour 3 : Intervention chirurgicale, 1 à 2 nuits d'hospitalisation en clinique, Retour à l'hôtel avec suivi infirmier, Séances de physiothérapie / drainage lymphatique, Consultations post-opératoires, Autorisation de vol après validation médicale (généralement 7 à 10 jours).",
        keywords: ["parcours brachioplastie", "timeline", "séjour", "étapes"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Quels sont les risques et complications possibles d'une brachioplastie ?",
        answer: "Comme toute chirurgie, la brachioplastie comporte certains risques : infection, hématome, retard de cicatrisation, cicatrices visibles, asymétrie, engourdissement temporaire. Toutes les précautions sont prises pour minimiser ces risques.",
        keywords: ["risques brachioplastie", "complications", "danger bras", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Les cicatrices seront-elles visibles après une brachioplastie ?",
        answer: "La cicatrice se situe généralement sur la face interne du bras. Elle est permanente mais s'estompe avec le temps. Des soins cicatriciels et séances de physiothérapie peuvent être inclus pour optimiser la cicatrisation.",
        keywords: ["cicatrices brachioplastie", "visibilité", "soins cicatriciels", "face interne bras"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Que comprend le suivi post-opératoire d'une brachioplastie ?",
        answer: "Médicaments post-opératoires, vêtement de compression, soins infirmiers, drainage lymphatique / physiothérapie, consultations de contrôle, assistance 24/7 avec votre coordinatrice pendant tout le séjour.",
        keywords: ["suivi brachioplastie", "inclus", "soins", "assistance"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Suis-je une bonne candidate pour le LASIK ?",
        answer: "Une évaluation pré-opératoire complète sera réalisée à votre arrivée. Elle inclut : topographie cornéenne, pachymétrie (épaisseur de la cornée), test de sécheresse oculaire, analyse de la réfraction. Le chirurgien confirmera si le LASIK est adapté ou proposera une alternative (PRK ou SMILE si nécessaire).",
        keywords: ["LASIK", "candidate LASIK", "chirurgie yeux", "correction vue", "myopie"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Qui est le chirurgien et quelle est son expérience en LASIK ?",
        answer: "Votre intervention sera réalisée par un ophtalmologue spécialisé en chirurgie réfractive. Le médecin possède une expérience significative en LASIK et a réalisé un grand nombre de procédures avec succès. Il/elle est certifié(e) et exerce dans une clinique accréditée.",
        keywords: ["chirurgien LASIK", "ophtalmologue", "expérience", "qualifications"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Dans quelle clinique l'intervention LASIK sera-t-elle réalisée ?",
        answer: "La chirurgie se déroule dans une clinique spécialisée en ophtalmologie équipée de technologie laser de dernière génération. La clinique respecte des normes strictes d'hygiène et de sécurité internationales.",
        keywords: ["clinique LASIK", "technologie laser", "établissement", "normes sécurité"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Quelle technologie LASIK utilisez-vous ?",
        answer: "La procédure utilise un laser femtoseconde pour la création du flap. Le remodelage cornéen est effectué à l'aide d'un laser excimer de haute précision. La technique est personnalisée selon votre profil visuel.",
        keywords: ["technologie LASIK", "laser femtoseconde", "laser excimer", "technique"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Quel est le déroulement du séjour médical pour un LASIK ?",
        answer: "Jour 1 : Arrivée + transfert hôtel, Jour 2 : Consultation pré-opératoire + examens, Jour 3 : Intervention LASIK, Jour 4 : Contrôle post-opératoire, Retour possible sous 3 à 5 jours selon validation du chirurgien.",
        keywords: ["parcours LASIK", "timeline", "séjour", "étapes"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Combien de temps dure l'intervention LASIK ?",
        answer: "L'intervention dure environ 10 à 15 minutes pour les deux yeux. Elle est réalisée sous anesthésie locale par collyre.",
        keywords: ["durée LASIK", "temps opération", "combien de temps", "anesthésie locale"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "La récupération après LASIK est-elle douloureuse ?",
        answer: "Une légère gêne peut être ressentie pendant 24 à 48h. La vision s'améliore généralement dès le lendemain. La récupération complète peut prendre quelques semaines.",
        keywords: ["récupération LASIK", "douleur", "vision", "temps récupération"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Quand puis-je reprendre l'avion et le travail après un LASIK ?",
        answer: "Le vol retour est autorisé après le contrôle post-opératoire. Reprise du travail possible après 3 à 5 jours selon votre confort visuel.",
        keywords: ["retour avion LASIK", "reprise travail", "vol", "autorisation"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Quels soins post-opératoires sont inclus dans le package LASIK ?",
        answer: "Médicaments (collyres antibiotiques et hydratants), lunettes de protection si nécessaires, consultation de suivi avant le départ, assistance 24/7 avec votre coordinatrice.",
        keywords: ["soins LASIK", "collyres", "suivi", "inclus"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Suis-je une bonne candidate pour une cruroplastie ?",
        answer: "Vous êtes généralement éligible si vous présentez : un relâchement cutané au niveau des cuisses, une perte de volume après amaigrissement ou grossesse, une peau qui ne se retend plus malgré le sport, un poids stable depuis au moins 6 mois. Une évaluation médicale préalable avec le chirurgien est obligatoire afin de confirmer l'indication opératoire.",
        keywords: ["cruroplastie", "lifting cuisses", "candidate cruroplastie", "relâchement cuisses", "chirurgie cuisses"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Qui est le chirurgien qui va m'opérer pour une cruroplastie ?",
        answer: "L'agence doit fournir : le nom du chirurgien, ses certifications, son expérience en chirurgie corporelle, des photos avant/après de patientes ayant subi une cruroplastie.",
        keywords: ["chirurgien cruroplastie", "qualifications", "expérience cuisses", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Dans quelle clinique l'intervention de cruroplastie sera-t-elle réalisée ?",
        answer: "L'agence doit préciser : le nom de la clinique, les normes d'hygiène et de sécurité, l'accréditation de l'établissement, si une unité de soins intensifs est disponible en cas de besoin.",
        keywords: ["clinique cruroplastie", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quels examens dois-je effectuer avant une cruroplastie ?",
        answer: "Oui, un bilan préopératoire est requis comprenant : analyse sanguine, ECG, consultation avec l'anesthésiste. Ces examens peuvent être réalisés à votre arrivée en Tunisie.",
        keywords: ["examens cruroplastie", "bilan sanguin", "ECG", "consultation anesthésiste"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Combien de temps vais-je rester à la clinique après une cruroplastie ?",
        answer: "La durée de séjour en clinique est généralement de 1 à 2 nuits sous surveillance médicale.",
        keywords: ["hospitalisation cruroplastie", "nuits clinique", "séjour", "surveillance"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Que se passe-t-il après ma sortie de la clinique après une cruroplastie ?",
        answer: "L'agence doit inclure : transfert clinique → hôtel, suivi post-opératoire, visites de contrôle, soins infirmiers si nécessaires.",
        keywords: ["sortie clinique", "transfert hôtel", "suivi", "soins infirmiers"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Vais-je avoir besoin de soins post-opératoires après une cruroplastie ?",
        answer: "Oui, les soins post-opératoires incluent : pansements, port d'un vêtement de contention, séances de drainage lymphatique pour réduire l'œdème et favoriser la cicatrisation.",
        keywords: ["soins post-opératoires", "vêtement contention", "drainage lymphatique", "cicatrisation"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Combien de temps dois-je rester en Tunisie pour une cruroplastie ?",
        answer: "Le séjour recommandé est généralement de 7 à 10 jours afin d'assurer : le suivi post-opératoire, le retrait des drains si nécessaires, la validation médicale avant le retour.",
        keywords: ["durée séjour", "combien de jours", "retrait drains", "validation retour"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quels sont les risques liés à une cruroplastie ?",
        answer: "L'agence doit informer sur : infection, hématome, retard de cicatrisation, œdème temporaire. Et rassurer sur le fait qu'un suivi médical est assuré pendant tout le séjour.",
        keywords: ["risques cruroplastie", "complications", "danger cuisses", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "feedback_oui",
        answer: "Merci 😊",
        keywords: ["feedback_oui"]
      },
      {
        question: "feedback_non",
        answer: `<a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">Contactez un agent TuniCure au (+44) 7403904850</a>`,
        keywords: ["feedback_non"]
      },
      {
        question: "feedback_invalid",
        answer: "Veuillez répondre par 'oui' ou 'non' s'il vous plaît.",
        keywords: ["feedback_invalid"]
      },
      {
        question: "feedback_timeout",
        answer: "Je reste disponible si vous avez d'autres questions ! 😊",
        keywords: ["feedback_timeout"]
      }

    ],
    en: [
      {
        question: "hello",
        answer: "Hello! 👋 Welcome to the TuniCure. How can I help you today?",
        keywords: ["hello", "hi", "hey", "good morning", "good afternoon"]
      },
      {
        question: "what is gonioplasty",
        answer: "Gonioplasty is a surgical procedure that softens and refines the jaw angles by reshaping the mandibular bone, in order to obtain more feminine, harmonious and balanced facial features.",
        keywords: ["gonioplasty", "jaw surgery", "feminization surgery", "jaw contouring"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "what is mommy makeover",
        answer: "Mommy Makeover is a set of personalised procedures aimed at restoring the silhouette after one or more pregnancies. It typically combines a tummy tuck, breast surgery (lift, augmentation or reduction) and sometimes liposuction.",
        keywords: ["mommy makeover", "post-pregnancy surgery", "mommy surgery", "postpartum makeover"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "what is rhinoplasty",
        answer: "Rhinoplasty is a surgical procedure aimed at improving the shape of the nose and/or breathing, while respecting facial harmony and your natural features.",
        keywords: ["rhinoplasty", "nose job", "nose surgery", "nose reshaping"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "what is liposuction",
        answer: "Liposuction is a surgical procedure that removes localized fat deposits resistant to diet and exercise, in order to refine and reshape the silhouette.",
        keywords: ["liposuction", "lipo", "fat removal", "body contouring"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      // Tummy Tuck
      {
        question: "What is a Tummy Tuck?",
        answer: "A Tummy Tuck (abdominoplasty) is a surgical procedure that removes excess skin and fat from the abdominal wall and tightens the abdominal muscles to achieve a flatter, firmer stomach.",
        keywords: ["tummy tuck", "abdominoplasty", "flat stomach", "abdominal surgery", "belly"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },

      // Body Lift
      {
        question: "What is a Body Lift?",
        answer: "A Body Lift is a comprehensive surgical procedure that reshapes and tightens multiple body areas (abdomen, buttocks, thighs) in a single operation. It is ideal after significant weight loss.",
        keywords: ["body lift", "body contouring", "full body surgery", "post weight loss surgery"],
        imageUrl: "assets/img/chatbot/Body-Lift.png"
      },

      // Buttock Augmentation
      {
        question: "What is Buttock Augmentation?",
        answer: "Buttock Augmentation is a surgical procedure that increases the volume and improves the shape of the buttocks, either with implants or fat transfer (BBL).",
        keywords: ["buttock augmentation", "butt implants", "butt enhancement", "brazilian butt lift", "BBL"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },

      // Breast Augmentation
      {
        question: "What is Breast Augmentation?",
        answer: "Breast Augmentation is a surgical procedure that increases the size and improves the shape of the breasts using breast implants or fat transfer.",
        keywords: ["breast augmentation", "breast implants", "boob job", "breast enlargement"],
        imageUrl: "assets/img/chatbot/Breast-Augmentation.png"
      },

      // Breast Reduction
      {
        question: "What is Breast Reduction?",
        answer: "Breast Reduction is a surgical procedure that reduces the size of the breasts by removing excess fatty tissue, glandular tissue, and skin to relieve back pain and improve body proportion.",
        keywords: ["breast reduction", "breast reduction surgery", "large breasts", "back pain relief"],
        imageUrl: "assets/img/chatbot/Breast-Reduction.png"
      },

      // Mastopexy / Breast Lift
      {
        question: "What is a Breast Lift (Mastopexy)?",
        answer: "A Breast Lift (Mastopexy) is a surgical procedure that raises and firms sagging breasts by removing excess skin and tightening the surrounding tissue, without significantly changing breast size.",
        keywords: ["breast lift", "mastopexy", "sagging breasts", "breast ptosis"],
        imageUrl: "assets/img/chatbot/Mastopexy-Breast-Lift.png"
      },

      // Breast Reconstruction
      {
        question: "What is Breast Reconstruction?",
        answer: "Breast Reconstruction is a surgical procedure that restores the shape, volume, and appearance of the breast after a mastectomy (breast removal) for medical reasons.",
        keywords: ["breast reconstruction", "post mastectomy", "cancer reconstruction", "breast restoration"],
        imageUrl: "assets/img/chatbot/Breast-Reconstruction.png"
      },

      // Breast Implant Exchange / Removal
      {
        question: "What is Breast Implant Exchange or Removal?",
        answer: "Breast Implant Exchange or Removal is a surgical procedure that replaces existing implants with new ones, or removes them completely, often for medical, aesthetic, or personal reasons.",
        keywords: ["breast implant exchange", "implant removal", "implant replacement", "explantation"],
        imageUrl: "assets/img/chatbot/Breast-Implant-Exchange-Removal.png"
      },

      // Laser Vaginal Rejuvenation
      {
        question: "What is Laser Vaginal Rejuvenation?",
        answer: "Laser Vaginal Rejuvenation is a non-surgical procedure using laser technology to treat vaginal laxity, mild urinary incontinence, and improve sexual function after childbirth or with ageing.",
        keywords: ["laser vaginal rejuvenation", "vaginal tightening", "vaginal rejuvenation", "incontinence treatment"],
        imageUrl: "assets/img/chatbot/Laser-Vaginal-Rejuvenation.png"
      },
      // Ajoutez ces questions générales manquantes
      {
        question: "how to make an appointment",
        answer: `You can make an appointment in two ways:

📞 **By phone**: <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">(+44) 7403904850</a>
📝 **Online**: <a href="${this.orderPageLink}" class="chat-link-order">Click here to fill in the request form</a>

Our team will contact you as soon as possible to confirm your appointment.`,
        keywords: ["appointment", "make appointment", "how to book", "schedule", "consultation"]
      },
      {
        question: "what procedures do you offer",
        answer: "We offer the following procedures:\n\n• Rhinoplasty (classic & Piezo)\n• Liposuction\n• Gonioplasty\n• Mommy Makeover\n• Tummy Tuck (Abdominoplasty)\n• Body Lift\n• Breast Augmentation\n• Breast Reduction\n• Breast Lift (Mastopexy)\n• BBL (Brazilian Butt Lift)\n• Hair Transplant\n• Blepharoplasty\n• Hairline Advancement\n• Laser Vaginal Rejuvenation\n• Gastric Sleeve\n\nWe also offer many other procedures tailored to your needs.",
        keywords: ["procedures", "treatments", "surgeries", "operations", "services"],
      },

      // Ajoutez les questions sur les procédures existantes en français mais manquantes en anglais
      {
        question: "how long does gonioplasty surgery take",
        answer: "The surgery typically lasts 1.5 to 3 hours. A stay in hospital of 1 to 2 nights at the clinic is recommended for optimal monitoring.",
        keywords: ["gonioplasty duration", "surgery time", "how long gonioplasty", "operation length"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "is gonioplasty combined with other procedures",
        answer: "Yes, it can be performed alone or integrated into a complete facial feminization programme, in combination with chin, cheekbones, forehead, nose, or soft tissues, depending on your goals.",
        keywords: ["gonioplasty combination", "combined surgery", "multiple procedures", "facial feminization programme"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "what is the recovery time for rhinoplasty",
        answer: "Complete recovery after rhinoplasty takes about 1 year, but you can return to normal activities after 2-3 weeks.",
        keywords: ["rhinoplasty recovery", "healing time", "recovery period", "back to work"],
        imageUrl: "assets/img/chatbot/Rhinoplasty.png"
      },
      {
        question: "what is the recovery time for liposuction",
        answer: "Light activities can be resumed after 7-10 days. Sports and physical exercise are generally allowed after 4-6 weeks, depending on progress.",
        keywords: ["liposuction recovery", "liposuction healing", "recovery timeline", "return to activities"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "what areas can be treated with mommy makeover",
        answer: "The programme is fully personalised and can include: Tummy tuck (with or without muscle repair), Breast lift (with or without implants), Targeted liposuction (abdomen, flanks, back, hips). The surgeon will define the combination best suited to your needs.",
        keywords: ["mommy makeover areas", "treatment zones", "body parts treated", "targeted areas"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "how long should I stay after mommy makeover surgery",
        answer: "A stay of 10 to 14 nights is recommended to ensure complete and secure postoperative follow-up before your return.",
        keywords: ["stay duration", "how long stay", "recovery stay", "post-op stay"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "What type of tummy tuck is right for me (complete, mini, with muscle repair)?",
        answer: "The surgeon will explain the technique most suited to your morphology and goals after complete evaluation during the preoperative consultation.",
        keywords: ["type tummy tuck", "complete tummy tuck", "mini tummy tuck", "muscle repair", "which tummy tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "How many nights will I stay at the clinic after a tummy tuck?",
        answer: "Generally 2 to 3 nights at the clinic for optimal medical monitoring after the procedure.",
        keywords: ["clinic nights", "tummy tuck hospitalisation", "clinic stay duration", "how many nights"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Is the hotel close to the clinic?",
        answer: "Yes, accommodation is selected near the clinic to facilitate transport and ensure your comfort during the recovery period.",
        keywords: ["hotel close", "clinic proximity", "lodging near clinic", "accommodation"],
        imageUrl: "assets/img/chatbot/Accommodation.png"
      },
      {
        question: "Is the compression garment included after a tummy tuck?",
        answer: "Yes, a post-operative compression garment is provided or prescribed and its use is included in the post-operative follow-up.",
        keywords: ["compression garment", "tummy tuck compression", "post-op garment", "compression wear"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Are physiotherapy or lymphatic drainage sessions included?",
        answer: "Yes, depending on the chosen package, lymphatic drainage or physiotherapy sessions are included or offered as an option to optimise your recovery.",
        keywords: ["physiotherapy", "lymphatic drainage", "recovery sessions", "rehabilitation"],
        imageUrl: "assets/img/chatbot/Post-Op-Care.png"
      },
      {
        question: "Where will the scar be located after a tummy tuck?",
        answer: "The scar is placed low, generally at bikini level, discreetly hidden under underwear. The surgeon will explain its evolution and the care needed.",
        keywords: ["tummy tuck scar", "scar location", "abdominoplasty scar", "scarring"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "What happens in case of complications?",
        answer: "In case of complications, the agency ensures immediate medical follow-up, access to the surgeon, and management according to established medical protocols, with 24/7 assistance.",
        keywords: ["complications", "post-op problems", "medical emergency", "complication assistance"],
        imageUrl: "assets/img/chatbot/Emergency-en.png"
      },
      {
        question: "Will I have on-site assistance?",
        answer: "Yes, a medical coordinator is available 24 hours a day throughout your stay to assist you and meet your needs.",
        keywords: ["on-site assistance", "medical coordinator", "local help", "support"],
        imageUrl: "assets/img/chatbot/Assistance.png"
      },
      {
        question: "Am I a good candidate for upper & lower blepharoplasty?",
        answer: "After reviewing your photos, age, skin quality and medical history, the surgeon will confirm your eligibility for upper and lower eyelid blepharoplasty.",
        keywords: ["blepharoplasty", "eyelids", "eyes", "blepharoplasty candidate", "upper lower"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "What technique will be used for upper and lower eyelids?",
        answer: "The surgeon will explain the appropriate technique: incision in the natural fold of the upper eyelid, and incision under the lashes or transconjunctival approach for the lower eyelid, depending on your case.",
        keywords: ["blepharoplasty technique", "upper eyelids", "lower eyelids", "method"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Do I need to stay hospitalized after blepharoplasty?",
        answer: "In most cases, it is outpatient surgery. One night may be recommended depending on your general condition and the surgeon's opinion.",
        keywords: ["blepharoplasty hospitalisation", "clinic night", "outpatient", "clinic stay"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "What are the effects after blepharoplasty (swelling, bruising)?",
        answer: "Swelling and bruising are normal after the procedure and gradually decrease within 10 to 15 days. Cold compresses are recommended for the first few days.",
        keywords: ["eyelid swelling", "eye bruising", "side effects", "blepharoplasty recovery"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "When can I resume normal activities after blepharoplasty?",
        answer: "Generally after 7 to 10 days for light activities, depending on your progress and recovery speed.",
        keywords: ["resume activities", "recovery time", "return to work", "convalescence"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Where will the scars be located after blepharoplasty?",
        answer: "The scars are very discreet: in the natural fold of the upper eyelid, and under the lashes or inside the lower eyelid, depending on the technique used.",
        keywords: ["eyelid scars", "eye scarring", "discreet scars", "scar location"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Am I a good candidate for hair transplant?",
        answer: "Yes, after a personalised analysis based on your photos, medical history, type of hair loss and quality of the donor area. A consultation with the doctor is mandatory before confirmation.",
        keywords: ["hair transplant candidate", "transplant eligibility", "good candidate", "transplant qualification"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Is a medical diagnosis made before my arrival for hair transplant?",
        answer: "Yes. A remote pre-evaluation is done (photos + medical questionnaire), then a final consultation at the clinic before the procedure to confirm the diagnosis.",
        keywords: ["transplant diagnosis", "prior evaluation", "photo analysis", "prior consultation"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "What technique will be used for hair transplant (FUE, DHI, Sapphire) and why?",
        answer: "The choice depends on your case: FUE (most used technique, natural and minimally invasive), DHI (direct implantation) or Sapphire FUE (faster healing). The doctor chooses the technique best suited to your scalp and goals.",
        keywords: ["transplant technique", "fue", "dhi", "sapphire", "transplant method"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Who exactly performs the hair transplant?",
        answer: "The transplant is performed by a doctor specialized in hair transplantation, assisted by a qualified medical team. The doctor personally intervenes on key steps (design, extraction, implantation).",
        keywords: ["transplant doctor", "medical team", "transplant specialist", "who performs"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "How many grafts will I receive during a hair transplant?",
        answer: "The exact number is confirmed after medical analysis. On average, it varies between 1,500 and 4,000 grafts, depending on the desired density and the area to be treated.",
        keywords: ["number of grafts", "hair quantity", "grafts", "density"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Will the result of a hair transplant be natural?",
        answer: "Yes. The hairline is custom-designed, respecting your morphology and natural hair implantation for a harmonious and natural result.",
        keywords: ["natural result", "natural appearance", "harmony", "frontal design"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Is a hair transplant painful?",
        answer: "No. The procedure is done under local anaesthesia. You may feel slight discomfort during anaesthesia, but no significant pain during the procedure.",
        keywords: ["transplant pain", "discomfort", "local anaesthesia", "comfort"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Are accommodation and transfers included for hair transplant?",
        answer: "Yes. The package includes: airport - hotel - clinic transfers, hotel (3 to 5 stars depending on the package), assistance and support throughout your stay.",
        keywords: ["transplant accommodation", "included transfers", "complete package", "logistics"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "What happens after a hair transplant?",
        answer: "You benefit from: post-operative medications, first wash at the clinic, detailed instructions, and remote follow-up for several months.",
        keywords: ["after transplant", "post-op care", "follow-up", "recovery"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Is there a hair shedding period after a transplant?",
        answer: "Yes. Temporary shedding (shock loss) is normal between 2 and 6 weeks. Hair grows back gradually from the 3rd month.",
        keywords: ["temporary shedding", "shock loss", "hair loss", "shedding phase"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "When will I see the final results of a hair transplant?",
        answer: "First signs: 3-4 months, visible result: 6 months, final result: 12 months after the procedure.",
        keywords: ["final results", "result timeline", "hair growth evolution", "growth time"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "What exactly is included in the price of a hair transplant?",
        answer: "The price includes: hair transplant, medical fees, medications, hotel, transfers, and post-operative follow-up. No hidden costs.",
        keywords: ["transplant price", "included in price", "cost", "transparency"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Is there a guarantee for hair transplant?",
        answer: "Yes, the agency guarantees the quality of care and medical follow-up. Some centres also offer a graft guarantee.",
        keywords: ["transplant guarantee", "quality assurance", "commitment", "safety"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Am I a good candidate for hairline advancement?",
        answer: "An evaluation is made from your photos, forehead height, scalp elasticity, hair density and absence of active hair loss. The surgeon will confirm eligibility during the consultation.",
        keywords: ["hairline advancement", "hairline", "forehead", "hairline candidate"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Are there any contraindications for hairline advancement?",
        answer: "History of severe hair loss, progressive alopecia, difficult healing or scalp diseases should be reported and evaluated by the surgeon.",
        keywords: ["contraindications", "hairline contraindication", "risks", "precautions"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Who will perform the hairline advancement and what are their qualifications?",
        answer: "A surgeon specialized in aesthetic surgery and scalp surgery, with confirmed experience in hairline advancement.",
        keywords: ["hairline surgeon", "qualifications", "specialist", "experience"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Is the clinic certified for hairline advancement?",
        answer: "Yes, the surgery is performed in a certified clinic, respecting international hygiene and safety standards.",
        keywords: ["certified clinic", "certification", "safety standards", "quality"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "What technique will be used for hairline advancement?",
        answer: "Surgical advancement of the hairline with discreet incision at the hairline level, allowing natural lowering of the forehead.",
        keywords: ["hairline technique", "advancement method", "hairline surgery", "procedure"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "How many centimeters can the hairline be advanced?",
        answer: "On average between 1.5 and 3 cm, depending on scalp elasticity and your forehead morphology.",
        keywords: ["centimeters advancement", "forehead lowering", "distance", "measurement"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Does hairline advancement leave a visible scar?",
        answer: "The scar is placed within the hairline and usually becomes very discreet over time, hidden by hair.",
        keywords: ["hairline scar", "scar visibility", "scarring", "discreet scar"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "What type of anaesthesia is used for hairline advancement?",
        answer: "General anaesthesia or local anaesthesia with sedation, depending on the case and the surgeon's opinion after preoperative evaluation.",
        keywords: ["hairline anaesthesia", "anaesthesia type", "sedation", "general anaesthesia"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Is a clinic stay necessary after hairline advancement?",
        answer: "Usually 1 night at the clinic for monitoring, then transfer to the hotel for the rest of the convalescence.",
        keywords: ["clinic stay", "clinic night", "hospitalisation", "monitoring"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Is the pain significant after hairline advancement?",
        answer: "Pain is generally moderate and well controlled by prescribed treatments. Some discomfort may be felt in the first few days.",
        keywords: ["hairline pain", "discomfort", "post-op discomfort", "painkillers"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Will there be swelling or bruising after hairline advancement?",
        answer: "Yes, forehead edema and sometimes eyelid swelling are common in the first few days and gradually disappear within about a week.",
        keywords: ["hairline swelling", "bruising", "forehead edema", "bruises"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Is the result of hairline advancement permanent?",
        answer: "Yes, hairline advancement is permanent, subject to hair stability and absence of progressive hair loss.",
        keywords: ["permanent hairline", "definitive", "durability", "lasting result"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Am I a good candidate for a Lip Lift?",
        answer: "Before any confirmation, your eligibility will be assessed by the surgeon based on your medical photos and health history. Lip Lift is generally recommended for patients presenting: a thin or elongated upper lip, a significant space between the nose and upper lip, a lack of Cupid's bow definition. A preoperative consultation with the surgeon will be organised upon your arrival to confirm the indication.",
        keywords: ["lip lift", "lip lift candidate", "lip lift eligibility", "good candidate lip lift", "lip lifting"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "What are the qualifications and experience of the surgeon for Lip Lift?",
        answer: "We work only with surgeons specialized in facial aesthetic surgery, certified and experienced in the Lip Lift procedure. You will receive: the surgeon's profile, years of experience, before/after photos of similar cases, before confirming your stay.",
        keywords: ["surgeon qualification lip lift", "surgeon experience", "lip lift surgeon", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "In which clinic will the Lip Lift procedure be performed?",
        answer: "Your procedure will be performed in an accredited clinic respecting international hygiene and safety standards, equipped with a modern operating room and qualified medical team.",
        keywords: ["lip lift clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "What technique will be used for my Lip Lift?",
        answer: "The most commonly used technique is the subnasal Lip Lift (Bullhorn technique). The surgeon will explain: the technique adapted to your morphology, the scar location (hidden under the base of the nose), the expected result during the preoperative consultation.",
        keywords: ["lip lift technique", "bullhorn technique", "subnasal lip lift", "lip lift method"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "What type of anaesthesia will be used for Lip Lift?",
        answer: "Lip Lift is generally performed under local anaesthesia, sometimes with light sedation depending on your comfort and the surgeon's advice.",
        keywords: ["lip lift anaesthesia", "anaesthesia type", "sedation", "local anaesthesia"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "How long does the Lip Lift procedure and stay take?",
        answer: "Procedure duration: approximately 45 minutes to 1 hour. Clinic stay: outpatient (discharge same day). Recommended stay duration in Tunisia: 5 to 6 days. This includes: preoperative consultation, procedure, post-operative follow-up, suture removal if necessary.",
        keywords: ["lip lift duration", "operation time", "clinic stay", "how many days"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "What does the medical package for Lip Lift include?",
        answer: "Your package includes: consultation with the surgeon, clinic and procedure fees, post-operative medications, VIP transfers (airport / clinic / hotel), hotel accommodation, assistance from a dedicated medical coordinator throughout your stay.",
        keywords: ["lip lift package", "lip lift inclusions", "services", "medical package"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "What are the possible risks or complications of Lip Lift?",
        answer: "Like any surgical procedure, Lip Lift carries certain risks such as: infection, bleeding, visible scarring, asymmetry. The surgeon will inform you in detail during the preoperative consultation and measures are in place to minimise these risks.",
        keywords: ["lip lift risks", "complications", "lip lift dangers", "side effects"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "What is the recovery time after Lip Lift?",
        answer: "Swelling and bruising: 7 to 10 days. Return to social activities: after 10 to 14 days. Final result: visible after a few weeks as swelling decreases.",
        keywords: ["lip lift recovery", "convalescence", "return to activities", "healing time"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Is there follow-up after I return to my country after Lip Lift?",
        answer: "Yes, we ensure remote post-operative follow-up with your medical coordinator and the surgeon if necessary, to guarantee optimal recovery.",
        keywords: ["lip lift follow-up", "after return", "remote follow-up", "post-operative"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Am I a good candidate for a Neck Lift?",
        answer: "Your eligibility will first be assessed by the surgeon based on medical photos and your health history. A Neck Lift is generally recommended for patients presenting: skin laxity in the neck area, double chin, visible muscle bands (platysma), loss of definition of the cervico-mental angle. A preoperative consultation at the clinic will be organised upon your arrival to confirm the surgical indication.",
        keywords: ["neck lift", "neck lifting", "neck lift candidate", "neck laxity", "double chin"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "What are the qualifications of the surgeon who will perform my Neck Lift?",
        answer: "We work with surgeons specialized in facial and neck aesthetic surgery, certified and experienced in Neck Lift procedures. Before your confirmation, you will receive: the surgeon's profile, years of experience, before/after photos of similar cases.",
        keywords: ["neck lift surgeon qualifications", "neck surgeon experience", "neck lift surgeon", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "In which clinic will the Neck Lift procedure be performed?",
        answer: "Your Neck Lift will be performed in an accredited clinic respecting international safety standards, with a modern operating room and qualified medical team.",
        keywords: ["neck lift clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "What technique will be used in my case for Neck Lift?",
        answer: "The technique used will depend on your anatomy and degree of skin laxity. It may include: tightening of the platysma muscle, removal of excess skin, liposuction of the neck if necessary. The surgeon will explain in detail the recommended technique during your preoperative consultation.",
        keywords: ["neck lift technique", "platysma", "muscle tightening", "neck technique"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "What type of anaesthesia will be used for Neck Lift?",
        answer: "Neck Lift is generally performed under general anaesthesia to ensure your comfort and safety during the procedure.",
        keywords: ["neck lift anaesthesia", "anaesthesia type", "general anaesthesia", "sedation"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "How long does the Neck Lift procedure and stay take?",
        answer: "Procedure duration: 2 to 3 hours. Clinic stay: 1 night. Recommended stay in Tunisia: 6 to 7 days. Your stay will include: preoperative consultation, medical tests, surgical procedure, post-operative follow-up, drain and suture removal if necessary.",
        keywords: ["neck lift duration", "operation time", "clinic stay", "how many days"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },

      {
        question: "What does the medical package for Neck Lift include?",
        answer: "Your package includes: consultation with the surgeon, clinic and procedure fees, anaesthesia, post-operative medications, compression garment (chin strap), VIP transfers (airport / clinic / hotel), hotel accommodation, assistance from a dedicated medical coordinator throughout your stay.",
        keywords: ["neck lift package", "neck lift inclusions", "services", "medical package"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "What are the risks associated with Neck Lift?",
        answer: "Like any surgery, Neck Lift carries certain risks such as: infection, hematoma, prolonged swelling, visible scarring, temporary numbness. All necessary measures are taken to minimise these risks and ensure your safety.",
        keywords: ["neck lift risks", "complications", "neck lift dangers", "side effects"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "What is the recovery time after Neck Lift?",
        answer: "Swelling and bruising: 10 to 14 days. Wearing the chin strap: recommended for 2 to 3 weeks. Return to social activities: after 2 weeks. Final result: progressively visible over 2 to 3 months.",
        keywords: ["neck lift recovery", "convalescence", "return to activities", "healing time"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Is follow-up ensured after I return to my country after Neck Lift?",
        answer: "Yes, we ensure remote post-operative follow-up with your medical coordinator and the surgeon to accompany your recovery after your return.",
        keywords: ["neck lift follow-up", "after return", "remote follow-up", "post-operative"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Am I a good candidate for buccal fat removal?",
        answer: "Your eligibility will be assessed by the surgeon based on medical photos and your health history. Buccal fat removal is generally recommended for patients presenting: a round face or full cheeks, excess fat in the buccal fat pads, lack of definition in the cheekbones or facial oval. A preoperative consultation will be organised upon your arrival to confirm the surgical indication.",
        keywords: ["buccal fat removal", "bichectomy", "cheeks", "round face", "face slimming"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "What are the qualifications of the surgeon who will perform my buccal fat removal?",
        answer: "We work with surgeons specialized in facial aesthetic surgery, certified and experienced in buccal fat removal procedures. Before any confirmation, you will receive: the surgeon's profile, years of experience, before/after photos of similar cases.",
        keywords: ["buccal fat removal surgeon qualifications", "surgeon experience", "bichectomy surgeon", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "In which clinic will the buccal fat removal procedure be performed?",
        answer: "Your procedure will be performed in an accredited clinic respecting international hygiene and safety standards, equipped with a modern operating room and qualified medical team.",
        keywords: ["buccal fat removal clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "How is the buccal fat removal procedure performed?",
        answer: "Buccal fat removal consists of removing part of the buccal fat pads to slim the lower face. Incisions are made inside the mouth, which means there are no visible scars on the skin.",
        keywords: ["procedure", "technique", "mouth incision", "no scars"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "What type of anaesthesia will be used for buccal fat removal?",
        answer: "Buccal fat removal is generally performed under local anaesthesia, sometimes with light sedation depending on your comfort and the surgeon's advice.",
        keywords: ["anaesthesia", "local anaesthesia", "sedation", "anaesthesia type"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "How long does the buccal fat removal procedure and stay take?",
        answer: "Procedure duration: 30 to 45 minutes. Clinic stay: outpatient (discharge same day). Recommended stay in Tunisia: 4 to 5 days. Your stay includes: preoperative consultation, medical tests if necessary, surgical procedure, post-operative follow-up.",
        keywords: ["duration", "operation time", "clinic stay", "how many days"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "What does the medical package for buccal fat removal include?",
        answer: "Your package includes: surgeon's fees, clinic fees, anaesthesia, post-operative medications, VIP transfers (airport / clinic / hotel), hotel accommodation, assistance from a dedicated medical coordinator throughout your stay.",
        keywords: ["package", "inclusions", "services", "medical package"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "What are the possible risks or complications of buccal fat removal?",
        answer: "Like any surgical procedure, buccal fat removal carries certain risks such as: infection, swelling, asymmetry, temporary numbness. All measures are taken to minimise these risks.",
        keywords: ["risks", "complications", "side effects", "dangers"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "What is the recovery time after buccal fat removal?",
        answer: "Swelling: 7 to 10 days. Return to social activities: after 5 to 7 days. Final result: progressively visible after 4 to 6 weeks.",
        keywords: ["recovery", "convalescence", "return to activities", "healing time"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Am I a good candidate for canthopexy?",
        answer: "Your eligibility will be assessed by the surgeon based on medical photos and your health history. Canthopexy is generally recommended for patients presenting: laxity of the lower eyelid, droopy or tired-looking eyes, lack of support at the outer corner of the eye, desire to improve the shape or tension of the lower eyelid. A preoperative consultation will be organised upon your arrival to confirm the surgical indication.",
        keywords: ["canthopexy", "eyelid", "eye corner", "lower eyelid", "eye lift"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "What are the qualifications of the surgeon who will perform my canthopexy?",
        answer: "We work with surgeons specialized in eyelid and eye aesthetic surgery, certified and experienced in canthopexy procedures. Before any confirmation, you will receive: the surgeon's profile, years of experience, before/after photos of similar cases.",
        keywords: ["canthopexy surgeon qualifications", "eyelid surgeon experience", "canthopexy surgeon", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "In which clinic will the canthopexy procedure be performed?",
        answer: "Your procedure will be performed in an accredited clinic respecting international hygiene and safety standards, equipped with a modern operating room and qualified medical team.",
        keywords: ["canthopexy clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "How is the canthopexy procedure performed?",
        answer: "Canthopexy consists of tightening and repositioning the tendon at the outer corner of the lower eyelid to improve support and shape of the eye. It can be performed alone or in combination with lower blepharoplasty depending on your case.",
        keywords: ["procedure", "technique", "tendon", "eye corner"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "What type of anaesthesia will be used for canthopexy?",
        answer: "Canthopexy is generally performed under local anaesthesia with light sedation, or under general anaesthesia depending on the indication and surgeon's recommendations.",
        keywords: ["anaesthesia", "local anaesthesia", "sedation", "general anaesthesia"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "How long does the canthopexy procedure and stay take?",
        answer: "Procedure duration: approximately 1 hour. Clinic stay: outpatient (discharge same day). Recommended stay in Tunisia: 4 to 5 days. Your stay includes: preoperative consultation, surgical procedure, post-operative follow-up, suture removal if necessary.",
        keywords: ["duration", "operation time", "clinic stay", "how many days"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "What does the medical package for canthopexy include?",
        answer: "Your package includes: surgeon's fees, clinic fees, anaesthesia, post-operative medications, VIP transfers (airport / clinic / hotel), hotel accommodation, assistance from a dedicated medical coordinator throughout your stay.",
        keywords: ["package", "inclusions", "services", "medical package"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "What are the possible risks or complications of canthopexy?",
        answer: "Like any surgical procedure, canthopexy carries certain risks such as: infection, swelling, temporary dry eye, asymmetry, eye irritation. All measures are taken to minimise these risks.",
        keywords: ["risks", "complications", "side effects", "dangers"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "What is the recovery time after canthopexy?",
        answer: "Swelling and bruising: 7 to 10 days. Return to social activities: after 7 to 10 days. Final result: progressively visible after a few weeks.",
        keywords: ["recovery", "convalescence", "return to activities", "healing time"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Am I a good candidate for Facial Fat Grafting?",
        answer: "Your eligibility will be assessed by the surgeon based on medical photos and your health history. Facial Fat Grafting is generally recommended for patients presenting: loss of volume in the face, hollow under-eye circles, sunken cheeks or temples, pronounced nasolabial folds, lack of definition of the facial oval. A preoperative consultation will be organised upon your arrival to confirm the indication and establish a personalised treatment plan.",
        keywords: ["facial fat grafting", "lipofilling", "face fat transfer", "facial volume", "under eyes"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "What are the qualifications of the surgeon who will perform my Facial Fat Grafting?",
        answer: "We work with surgeons specialized in facial aesthetic surgery, certified and experienced in facial lipofilling techniques. Before any confirmation, you will receive: the surgeon's profile, years of experience, before/after photos of similar cases.",
        keywords: ["fat grafting surgeon qualifications", "surgeon experience", "lipofilling surgeon", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "In which clinic will the Facial Fat Grafting procedure be performed?",
        answer: "Your procedure will be performed in an accredited clinic respecting international hygiene and safety standards, equipped with a modern operating room and qualified medical team.",
        keywords: ["lipofilling clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "How is the Facial Fat Grafting procedure performed?",
        answer: "Facial Fat Grafting consists of harvesting fat from a donor area (such as the abdomen or thighs), purifying it, then reinjecting it into facial areas requiring volume, to obtain a natural and long-lasting result.",
        keywords: ["procedure", "technique", "fat harvesting", "reinjection"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "What type of anaesthesia will be used for Facial Fat Grafting?",
        answer: "This procedure is generally performed under local anaesthesia with light sedation or under general anaesthesia, depending on the extent of treatment and the surgeon's recommendations.",
        keywords: ["anaesthesia", "local anaesthesia", "sedation", "general anaesthesia"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "How long does the Facial Fat Grafting procedure and stay take?",
        answer: "Procedure duration: 1 to 2 hours. Clinic stay: outpatient or 1 night. Recommended stay in Tunisia: 5 to 6 days. Your stay includes: preoperative consultation, medical tests if necessary, surgical procedure, post-operative follow-up.",
        keywords: ["duration", "operation time", "clinic stay", "how many days"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "What does the medical package for Facial Fat Grafting include?",
        answer: "Your package includes: surgeon's fees, clinic fees, anaesthesia, post-operative medications, VIP transfers (airport / clinic / hotel), hotel accommodation, assistance from a dedicated medical coordinator throughout your stay.",
        keywords: ["package", "inclusions", "services", "medical package"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "What are the possible risks or complications of Facial Fat Grafting?",
        answer: "Like any surgical procedure, Facial Fat Grafting carries certain risks such as: infection, swelling, partial resorption of injected fat, asymmetry. All necessary measures are taken to minimise these risks.",
        keywords: ["risks", "complications", "side effects", "dangers"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "What is the recovery time after Facial Fat Grafting?",
        answer: "Swelling and bruising: 7 to 14 days. Return to social activities: after 10 to 14 days. Final result: progressively visible after a few weeks as swelling decreases.",
        keywords: ["recovery", "convalescence", "return to activities", "healing time"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Am I a good candidate for a Brow Lift?",
        answer: "Your eligibility will be assessed by the surgeon based on medical photos and your health history. Brow Lift is generally recommended for patients presenting: drooping eyebrows, tired or sad-looking eyes, excess skin on the forehead, marked forehead or glabellar lines. A preoperative consultation will be organised upon your arrival to confirm the surgical indication.",
        keywords: ["brow lift", "eyebrow lift", "drooping eyebrows", "tired eyes", "forehead lines"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "What are the qualifications of the surgeon who will perform my Brow Lift?",
        answer: "We work with surgeons specialized in facial aesthetic surgery, certified and experienced in brow lift procedures. Before any confirmation, you will receive: the surgeon's profile, years of experience, before/after photos of similar cases.",
        keywords: ["brow lift surgeon qualifications", "eyebrow surgeon experience", "brow lift surgeon", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "In which clinic will the Brow Lift procedure be performed?",
        answer: "Your procedure will be performed in an accredited clinic respecting international hygiene and safety standards, equipped with a modern operating room and qualified medical team.",
        keywords: ["brow lift clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "What technique will be used in my case for Brow Lift?",
        answer: "The technique used will depend on your anatomy and desired result. It may include: endoscopic brow lift, temporal lift, or classic forehead lift. The surgeon will explain the recommended technique during your preoperative consultation.",
        keywords: ["brow lift technique", "endoscopic brow lift", "temporal lift", "forehead lift"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "What type of anaesthesia will be used for Brow Lift?",
        answer: "Brow Lift is generally performed under general anaesthesia or local anaesthesia with light sedation depending on the technique used.",
        keywords: ["brow lift anaesthesia", "anaesthesia type", "general anaesthesia", "sedation"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "How long does the Brow Lift procedure and stay take?",
        answer: "Procedure duration: 1 to 2 hours. Clinic stay: outpatient or 1 night. Recommended stay in Tunisia: 5 to 6 days. Your stay includes: preoperative consultation, medical tests if necessary, surgical procedure, post-operative follow-up, suture removal if necessary.",
        keywords: ["brow lift duration", "operation time", "clinic stay", "how many days"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "What does the medical package for Brow Lift include?",
        answer: "Your package includes: surgeon's fees, clinic fees, anaesthesia, post-operative medications, VIP transfers (airport / clinic / hotel), hotel accommodation, assistance from a dedicated medical coordinator throughout your stay.",
        keywords: ["brow lift package", "inclusions", "services", "medical package"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "What are the possible risks or complications of Brow Lift?",
        answer: "Like any surgical procedure, Brow Lift carries certain risks such as: infection, swelling, bruising, asymmetry, temporary numbness. All necessary measures are taken to minimise these risks.",
        keywords: ["brow lift risks", "complications", "side effects", "dangers"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "What is the recovery time after Brow Lift?",
        answer: "Swelling and bruising: 7 to 10 days. Return to social activities: after 10 to 14 days. Final result: progressively visible after a few weeks.",
        keywords: ["brow lift recovery", "convalescence", "return to activities", "healing time"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Is the surgeon qualified and experienced in otoplasty?",
        answer: "Yes, we work with surgeons specialized in aesthetic and reconstructive surgery, with several years of experience performing otoplasties with natural results.",
        keywords: ["otoplasty surgeon", "surgeon qualifications", "otoplasty experience", "ear surgery surgeon"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Can I see before/after photos of patients who have undergone otoplasty?",
        answer: "Of course, we can share before/after photos of similar cases performed by the surgeon, while respecting patient confidentiality.",
        keywords: ["before after photos otoplasty", "otoplasty results", "photo gallery", "similar cases"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "In which clinic will the otoplasty procedure be performed? Is it certified?",
        answer: "The procedure takes place in an accredited clinic respecting international hygiene and safety standards.",
        keywords: ["otoplasty clinic", "certified facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Is otoplasty performed under local or general anaesthesia?",
        answer: "Otoplasty is generally performed under local anaesthesia with light sedation, but general anaesthesia may be considered depending on your case and the surgeon's recommendation.",
        keywords: ["otoplasty anaesthesia", "anaesthesia type", "local anaesthesia", "general anaesthesia"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Are otoplasty results permanent?",
        answer: "Yes, otoplasty results are generally permanent once healing is complete.",
        keywords: ["permanent results otoplasty", "durability", "definitive", "permanent"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Will I have visible scars after otoplasty?",
        answer: "Incisions are made behind the ear, so scars are discreet and become almost invisible over time.",
        keywords: ["otoplasty scars", "scar visibility", "incisions behind ear", "discreet scars"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "How many days should I stay in Tunisia for otoplasty?",
        answer: "The recommended stay is generally 5 to 7 days: Day 1: Arrival & transfer to hotel, Day 2: Consultation with surgeon + medical tests, Day 3: Procedure, Day 4: Rest, Day 5: First post-operative check-up, Day 6-7: fit to fly clearance after medical validation.",
        keywords: ["otoplasty stay duration", "how many days", "timeline", "journey"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "How long does otoplasty surgery take?",
        answer: "The procedure lasts on average between 1 and 2 hours.",
        keywords: ["otoplasty duration", "operation time", "how long"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Will I spend the night at the clinic after otoplasty?",
        answer: "Otoplasty is generally performed on an outpatient basis. You can leave the clinic the same day after medical observation.",
        keywords: ["otoplasty overnight", "hospitalisation", "outpatient", "clinic stay"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Will I feel pain after otoplasty surgery?",
        answer: "Mild to moderate discomfort may be felt for a few days, but it is well controlled with painkillers.",
        keywords: ["otoplasty pain", "post-op discomfort", "painkillers", "comfort"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Will I need to wear a bandage after otoplasty?",
        answer: "Yes, a compression headband must be worn: 24/7 for 5 to 7 days, then only at night for 2 to 3 weeks.",
        keywords: ["otoplasty bandage", "compression headband", "compression", "post-op care"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "When can I resume normal activities after otoplasty?",
        answer: "Work: after 5 to 7 days. Sports: after 3 to 4 weeks.",
        keywords: ["otoplasty return to activities", "back to work", "return to sports", "recovery"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Is post-operative follow-up included in the otoplasty package?",
        answer: "Yes, post-operative follow-up is included, comprising: check-up consultation before your departure, remote medical assistance after your return, recommendations for post-operative care.",
        keywords: ["otoplasty follow-up", "included in package", "check-up", "assistance"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "What are the possible risks of otoplasty?",
        answer: "Like any surgical procedure, there are rare risks such as: infection, hematoma, asymmetry. But all precautions are taken to minimise these risks.",
        keywords: ["otoplasty risks", "complications", "otoplasty dangers", "side effects"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Am I a good candidate for dimpleplasty?",
        answer: "A personalised evaluation will be carried out from photos or during a consultation with the surgeon. The doctor will check: your skin elasticity, your cheek structure, your aesthetic expectations to confirm that the procedure is suitable for your facial morphology.",
        keywords: ["dimpleplasty", "dimples", "dimpleplasty candidate", "dimple creation", "cheeks"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Who will perform my dimpleplasty and what are their qualifications?",
        answer: "The agency must provide you with: the surgeon's name, years of experience, certifications, before/after photos of patients who have undergone dimpleplasty.",
        keywords: ["dimpleplasty surgeon", "qualifications", "dimple experience", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Where will the dimpleplasty procedure take place?",
        answer: "The procedure takes place in an accredited clinic respecting international hygiene standards. It is generally an outpatient procedure performed under local anaesthesia.",
        keywords: ["dimpleplasty clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "How long does the dimpleplasty procedure and stay take?",
        answer: "Procedure duration: 20 to 40 minutes. Recommended stay: 3 to 5 days. Arrival: pre-operative consultation. Day of procedure: surgery. Day 2-3: post-operative check-up before return.",
        keywords: ["dimpleplasty duration", "operation time", "clinic stay", "how many days"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Are dimpleplasty results permanent?",
        answer: "Yes, results are generally permanent. Dimples may appear permanently at first, then become more natural over time (visible only when smiling).",
        keywords: ["permanent results dimpleplasty", "dimple durability", "definitive", "permanent"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "What are the risks or side effects of dimpleplasty?",
        answer: "Temporary swelling, mild pain, asymmetry (rare), infection (very rare with good hygiene).",
        keywords: ["dimpleplasty risks", "complications", "side effects", "dimple dangers"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "What is the recovery time after dimpleplasty?",
        answer: "Return to normal activities: 2 to 3 days. Final result: 4 to 6 weeks. Recommendations: avoid hard foods, maintain good oral hygiene.",
        keywords: ["dimpleplasty recovery", "convalescence", "return to activities", "healing time"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Am I a good candidate for genioplasty?",
        answer: "You must be in good general health, have no surgical contraindications and have a receding, overly prominent or asymmetrical chin. A medical evaluation will be carried out from your photos and examinations to confirm your eligibility.",
        keywords: ["genioplasty", "chin surgery", "genioplasty candidate", "receding chin", "chin asymmetry"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "What tests do I need before genioplasty?",
        answer: "A complete blood test, X-ray or cephalometric scan may be requested to analyze the bone structure of your chin and plan the procedure precisely.",
        keywords: ["genioplasty tests", "blood test", "chin scan", "x-ray"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Is the surgeon qualified for genioplasty?",
        answer: "Yes, we work only with experienced maxillofacial surgeons, specialized in chin surgery and certified by the relevant medical authorities.",
        keywords: ["genioplasty surgeon", "qualification", "maxillofacial surgeon", "chin experience"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "In which clinic will the genioplasty procedure take place?",
        answer: "The procedure will be performed in an accredited clinic respecting international standards of hygiene, equipment and safety.",
        keywords: ["genioplasty clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "How long does genioplasty surgery and hospitalisation take?",
        answer: "Genioplasty lasts on average between 1 to 2 hours under general anaesthesia. An overnight hospitalisation is generally necessary to ensure post-operative monitoring.",
        keywords: ["genioplasty duration", "operation time", "hospitalisation", "clinic night"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "What is the post-operative course after genioplasty?",
        answer: "Swelling, bruising and temporary discomfort may appear after the procedure. A soft diet is recommended for a few days. Wearing a compression bandage may be necessary.",
        keywords: ["genioplasty recovery", "swelling", "bruising", "soft diet"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Is post-operative treatment included in genioplasty?",
        answer: "Yes, necessary medications (painkillers, antibiotics), follow-up consultations and post-operative care are included in your package.",
        keywords: ["post-operative treatment", "medications included", "genioplasty follow-up", "package"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "What are the possible risks of genioplasty?",
        answer: "Like any surgical procedure, genioplasty carries risks such as infection, bleeding or temporary numbness. These remain rare and all precautions are taken to minimise them.",
        keywords: ["genioplasty risks", "complications", "chin dangers", "side effects"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Who will be my surgeon for gastric bypass?",
        answer: "The agency must provide: the surgeon's full name, experience in bariatric surgery, number of procedures performed, certifications and accreditations.",
        keywords: ["gastric bypass surgeon", "qualifications", "bariatric experience", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "In which clinic will the gastric bypass procedure take place?",
        answer: "The agency must provide: the name of the clinic, its equipment level, hygiene and safety standards, presence of an intensive care unit.",
        keywords: ["gastric bypass clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "What tests do I need before gastric bypass?",
        answer: "Complete list of analyses (blood test, ECG, ultrasound...), consultation with surgeon + anesthesiologist, possible mandatory pre-operative diet.",
        keywords: ["gastric bypass tests", "blood test", "ECG", "consultation"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "How many days will I stay at the clinic after gastric bypass?",
        answer: "2 to 3 nights in clinic (average), 5 to 7 nights at hotel for recovery, return possible after medical validation.",
        keywords: ["gastric bypass hospitalisation", "clinic nights", "stay", "recovery"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "What are the risks associated with gastric bypass?",
        answer: "Clear explanation of possible risks, immediate on-site management if needed, medical follow-up included in the package.",
        keywords: ["gastric bypass risks", "complications", "dangers", "side effects"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Will I benefit from nutritional follow-up after gastric bypass?",
        answer: "Post-operative dietary plan, remote follow-up with nutritionist, continuous assistance after return.",
        keywords: ["gastric bypass nutritional follow-up", "diet", "nutritionist", "eating"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Am I a good candidate for gastric sleeve?",
        answer: "Your eligibility depends on your BMI, medical history and general health. A complete preoperative assessment will be performed upon your arrival (blood tests, ECG, abdominal ultrasound, etc.) so that the surgeon can confirm whether the procedure can be performed safely.",
        keywords: ["gastric sleeve", "sleeve candidate", "bariatric surgery", "weight loss", "obesity"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Who will be my surgeon for gastric sleeve and what are their qualifications?",
        answer: "The agency must provide you with: the surgeon's name, experience in bariatric surgery, number of procedures performed, accreditations and international training. A consultation with the surgeon is scheduled before the operation to discuss your expectations and validate the surgical protocol.",
        keywords: ["gastric sleeve surgeon", "qualifications", "bariatric experience", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "In which clinic will the gastric sleeve procedure be performed?",
        answer: "The procedure is performed in an accredited clinic respecting international hygiene and safety standards, equipped with a modern operating room and intensive care unit if necessary.",
        keywords: ["gastric sleeve clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "What follow-up is planned after gastric sleeve surgery?",
        answer: "Follow-up includes: post-operative medical visits, nutritional assistance, medication, dietary recommendations, remote follow-up after your return to your country (WhatsApp / email).",
        keywords: ["gastric sleeve follow-up", "post-op", "nutrition", "assistance"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "What are the possible risks or complications of gastric sleeve?",
        answer: "Like any surgery, gastric sleeve carries potential risks such as: infection, bleeding, gastric leak, nutritional deficiencies. All precautions are taken to minimise these risks, and continuous medical monitoring is ensured during your hospitalisation.",
        keywords: ["gastric sleeve risks", "complications", "dangers", "side effects"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Will I receive a dietary programme after gastric sleeve surgery?",
        answer: "Yes, a progressive nutritional plan will be provided (liquid → pureed → solid) as well as dietary advice to ensure healthy and sustainable weight loss.",
        keywords: ["gastric sleeve diet", "nutritional plan", "dietary advice", "eating"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Do you work with surgeons specialized in cataract surgery?",
        answer: "Yes, we collaborate with highly qualified ophthalmologists, specialized in cataract surgery, practicing in accredited clinics respecting international hygiene and safety standards.",
        keywords: ["cataract", "cataract surgery", "ophthalmologist", "cataract specialist"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "What technique is used for cataract surgery?",
        answer: "Surgery is performed by phacoemulsification, a modern, fast and minimally invasive technique, allowing removal of the opacified lens and replacement with an intraocular lens (implant).",
        keywords: ["cataract technique", "phacoemulsification", "intraocular lens", "implant"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "What type of intraocular implant is offered for cataract?",
        answer: "We offer different types of implants: monofocal (distance vision), multifocal (distance and near vision), toric (corrects astigmatism). The choice will be determined after a complete ophthalmological assessment carried out on site.",
        keywords: ["cataract implants", "monofocal", "multifocal", "toric", "lenses"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "What are the possible risks or complications of cataract surgery?",
        answer: "Cataract surgery is a safe procedure with a very high success rate. Like any procedure, certain risks exist (infection, inflammation...), but they remain rare and are managed by the medical team.",
        keywords: ["cataract risks", "complications", "dangers", "side effects"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "When can I fly back after cataract surgery?",
        answer: "You can generally fly back 24 to 48 hours after the procedure, after validation by the surgeon during the postoperative check-up.",
        keywords: ["cataract return flight", "flight", "authorization", "delay"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "How long does recovery take after cataract surgery?",
        answer: "Vision improvement is generally rapid, from the first days. Complete recovery may take a few weeks.",
        keywords: ["cataract recovery", "vision", "healing time", "convalescence"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Am I a good candidate for brachioplasty?",
        answer: "You may be a good candidate if: you have significant skin laxity in the arms (often after weight loss or ageing), your weight has been stable for at least 3 to 6 months, you are in good general health and a non-smoker (or willing to stop before and after surgery), you have realistic expectations regarding scars and results.",
        keywords: ["brachioplasty", "arm lift", "brachioplasty candidate", "arm laxity", "arm surgery"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Is the surgeon qualified and experienced in brachioplasty?",
        answer: "The surgeon is specialized in plastic and reconstructive surgery. He has confirmed experience in brachioplasty. Before/after photos of patients who have undergone the same procedure can be provided. A pre-operative consultation will be organised upon your arrival to validate your eligibility.",
        keywords: ["brachioplasty surgeon", "qualifications", "arm experience", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "In which clinic will the brachioplasty procedure be performed?",
        answer: "The procedure is performed in an accredited clinic respecting international hygiene and safety standards. The operating room is equipped for aesthetic surgery. The procedure is done under general anaesthesia with a qualified anesthesiologist.",
        keywords: ["brachioplasty clinic", "facility", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "What is the medical stay schedule for brachioplasty?",
        answer: "Your journey should be clearly detailed: Day 1: Arrival + transfer to hotel, Day 2: Medical tests + consultation with surgeon, Day 3: Surgical procedure, 1 to 2 nights hospitalisation in clinic, Return to hotel with nursing follow-up, Physiotherapy / lymphatic drainage sessions, Post-operative consultations, fit to fly clearance after medical validation (generally 7 to 10 days).",
        keywords: ["brachioplasty journey", "timeline", "stay", "steps"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "What are the possible risks and complications of brachioplasty?",
        answer: "Like any surgery, brachioplasty carries certain risks: infection, hematoma, delayed healing, visible scars, asymmetry, temporary numbness. All precautions are taken to minimise these risks.",
        keywords: ["brachioplasty risks", "complications", "arm dangers", "side effects"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Will scars be visible after brachioplasty?",
        answer: "The scar is generally located on the inner side of the arm. It is permanent but fades over time. Scar care and physiotherapy sessions may be included to optimise healing.",
        keywords: ["brachioplasty scars", "visibility", "scar care", "inner arm"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "What does post-operative follow-up for brachioplasty include?",
        answer: "Post-operative medications, compression garment, nursing care, lymphatic drainage / physiotherapy, check-up consultations, 24/7 assistance with your coordinator throughout your stay.",
        keywords: ["brachioplasty follow-up", "included", "care", "assistance"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Am I a good candidate for LASIK?",
        answer: "A complete pre-operative evaluation will be performed upon your arrival. It includes: corneal topography, pachymetry (corneal thickness), dry eye test, refraction analysis. The surgeon will confirm if LASIK is suitable or propose an alternative (PRK or SMILE if necessary).",
        keywords: ["LASIK", "LASIK candidate", "eye surgery", "vision correction", "myopia"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Who is the surgeon and what is their experience in LASIK?",
        answer: "Your procedure will be performed by an ophthalmologist specialized in refractive surgery. The doctor has significant experience in LASIK and has successfully performed a large number of procedures. He/she is certified and practices in an accredited clinic.",
        keywords: ["LASIK surgeon", "ophthalmologist", "experience", "qualifications"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "In which clinic will the LASIK procedure be performed?",
        answer: "The surgery takes place in a specialized ophthalmology clinic equipped with latest generation laser technology. The clinic respects strict international hygiene and safety standards.",
        keywords: ["LASIK clinic", "laser technology", "facility", "safety standards"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "What LASIK technology do you use?",
        answer: "The procedure uses a femtosecond laser for flap creation. Corneal reshaping is performed using a high-precision excimer laser. The technique is personalised according to your visual profile.",
        keywords: ["LASIK technology", "femtosecond laser", "excimer laser", "technique"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "What is the medical stay schedule for LASIK?",
        answer: "Day 1: Arrival + hotel transfer, Day 2: Pre-operative consultation + tests, Day 3: LASIK procedure, Day 4: Post-operative check-up, Return possible within 3 to 5 days depending on surgeon's validation.",
        keywords: ["LASIK journey", "timeline", "stay", "steps"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "How long does the LASIK procedure take?",
        answer: "The procedure takes approximately 10 to 15 minutes for both eyes. It is performed under local anaesthesia with eye drops.",
        keywords: ["LASIK duration", "operation time", "how long", "local anaesthesia"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Is LASIK recovery painful?",
        answer: "Mild discomfort may be felt for 24 to 48 hours. Vision generally improves the next day. Complete recovery may take a few weeks.",
        keywords: ["LASIK recovery", "pain", "vision", "recovery time"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "When can I fly back and return to work after LASIK?",
        answer: "Return flight is authorized after the post-operative check-up. Return to work possible after 3 to 5 days depending on your visual comfort.",
        keywords: ["LASIK return flight", "return to work", "flight", "authorization"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "What post-operative care is included in the LASIK package?",
        answer: "Medications (antibiotic and moisturizing eye drops), protective glasses if necessary, follow-up consultation before departure, 24/7 assistance with your coordinator.",
        keywords: ["LASIK care", "eye drops", "follow-up", "included"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Am I a good candidate for cruroplasty (thigh lift)?",
        answer: "You are generally eligible if you have: skin laxity in the thighs, volume loss after weight loss or pregnancy, skin that no longer tightens despite exercise, stable weight for at least 6 months. A prior medical evaluation with the surgeon is mandatory to confirm the surgical indication.",
        keywords: ["cruroplasty", "thigh lift", "thigh lift candidate", "thigh laxity", "thigh surgery"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Who is the surgeon who will perform my cruroplasty?",
        answer: "The agency must provide: the surgeon's name, certifications, experience in body surgery, before/after photos of patients who have undergone cruroplasty.",
        keywords: ["cruroplasty surgeon", "thigh lift surgeon", "thigh experience", "surgeon profile"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "In which clinic will the cruroplasty procedure be performed?",
        answer: "The agency must specify: the name of the clinic, hygiene and safety standards, accreditation of the facility, whether an intensive care unit is available if needed.",
        keywords: ["cruroplasty clinic", "thigh lift clinic", "accredited clinic", "safety standards"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "What tests do I need before cruroplasty?",
        answer: "Yes, a preoperative assessment is required including: blood test, ECG, consultation with the anesthesiologist. These tests can be performed upon your arrival in Tunisia.",
        keywords: ["cruroplasty tests", "thigh lift tests", "blood test", "ECG", "anesthesiologist"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "How long will I stay at the clinic after cruroplasty?",
        answer: "The length of stay at the clinic is generally 1 to 2 nights under medical supervision.",
        keywords: ["cruroplasty hospitalisation", "thigh lift stay", "clinic nights", "supervision"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "What happens after I leave the clinic following cruroplasty?",
        answer: "The agency must include: clinic → hotel transfer, post-operative follow-up, check-up visits, nursing care if necessary.",
        keywords: ["clinic discharge", "hotel transfer", "follow-up", "nursing care"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Will I need post-operative care after cruroplasty?",
        answer: "Yes, post-operative care includes: dressings, wearing compression garments, lymphatic drainage sessions to reduce swelling and promote healing.",
        keywords: ["post-operative care", "compression garment", "lymphatic drainage", "healing"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "How long should I stay in Tunisia for cruroplasty?",
        answer: "The recommended stay is generally 7 to 10 days to ensure: post-operative follow-up, drain removal if necessary, medical validation before return.",
        keywords: ["stay duration", "how many days", "drain removal", "return validation"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "What are the risks associated with cruroplasty?",
        answer: "The agency must inform about: infection, hematoma, delayed healing, temporary edema. And reassure that medical follow-up is ensured throughout the stay.",
        keywords: ["cruroplasty risks", "thigh lift risks", "complications", "side effects"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "feedback_yes",
        answer: "Thank you 😊",
        keywords: ["feedback_yes"]
      },
      {
        question: "feedback_no",
        answer: `<a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">Contact a TuniCure agent at (+44) 7403904850</a>`,
        keywords: ["feedback_no"]
      },
      {
        question: "feedback_invalid",
        answer: "Please answer 'yes' or 'no'.",
        keywords: ["feedback_invalid"]
      },
      {
        question: "feedback_timeout",
        answer: "I'm still here if you have any other questions! 😊",
        keywords: ["feedback_timeout"]
      }
    ],
    es: [
      {
        question: "hola",
        answer: "¡Hola! 👋 Bienvenida a la TuniCure. ¿Cómo puedo ayudarte hoy?",
        keywords: ["hola", "buenos días", "buenas tardes", "saludos"],
      },
      {
        question: "qué es gonioplastia",
        answer: "La gonioplastia es un procedimiento quirúrgico que suaviza y afina los ángulos de la mandíbula remodelando el hueso mandibular, para obtener rasgos faciales más femeninos, armoniosos y equilibrados.",
        keywords: ["gonioplastia", "cirugía de mandíbula", "feminización facial", "contorno mandibular"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      // Tummy Tuck
      {
        question: "¿Qué es un Tummy Tuck (Abdominoplastia)?",
        answer: "El Tummy Tuck (abdominoplastia) es un procedimiento quirúrgico que elimina el exceso de piel y grasa de la pared abdominal y tensa los músculos abdominales para lograr un estómago más plano y firme.",
        keywords: ["tummy tuck", "abdominoplastia", "estómago plano", "cirugía abdominal", "vientre"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },

      // Body Lift
      {
        question: "¿Qué es un Body Lift?",
        answer: "El Body Lift es un procedimiento quirúrgico integral que remodela y tensa múltiples áreas del cuerpo (abdomen, glúteos, muslos) en una sola operación. Es ideal después de una pérdida de peso significativa.",
        keywords: ["body lift", "levantamiento corporal", "cirugía corporal completa", "post pérdida de peso"],
        imageUrl: "assets/img/chatbot/Body-Lift.png"
      },

      // Buttock Augmentation
      {
        question: "¿Qué es la Buttock Augmentation?",
        answer: "La Buttock Augmentation (aumento de glúteos) es un procedimiento quirúrgico que aumenta el volumen y mejora la forma de los glúteos, ya sea con implantes o transferencia de grasa (BBL).",
        keywords: ["buttock augmentation", "aumento de glúteos", "implantes glúteos", "BBL", "glúteos"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },

      // Breast Augmentation
      {
        question: "¿Qué es la Breast Augmentation?",
        answer: "La Breast Augmentation (aumento de senos) es un procedimiento quirúrgico que aumenta el tamaño y mejora la forma de los senos utilizando implantes mamarios o transferencia de grasa.",
        keywords: ["breast augmentation", "aumento de senos", "implantes mamarios", "senos", "busto"],
        imageUrl: "assets/img/chatbot/Breast-Augmentation.png"
      },

      // Breast Reduction
      {
        question: "¿Qué es la Breast Reduction?",
        answer: "La Breast Reduction (reducción mamaria) es un procedimiento quirúrgico que reduce el tamaño de los senos eliminando el exceso de tejido graso, glandular y cutáneo para aliviar el dolor de espalda y mejorar la proporción corporal.",
        keywords: ["breast reduction", "reducción mamaria", "senos grandes", "alivio dolor espalda"],
        imageUrl: "assets/img/chatbot/Breast-Reduction.png"
      },

      // Mastopexy / Breast Lift
      {
        question: "¿Qué es una Mastopexy (Breast Lift)?",
        answer: "La Mastopexy (levantamiento de senos) es un procedimiento quirúrgico que eleva y firma los senos caídos eliminando el exceso de piel y tensando el tejido circundante, sin cambiar significativamente el tamaño del seno.",
        keywords: ["mastopexy", "breast lift", "levantamiento de senos", "senos caídos", "ptosis mamaria"],
        imageUrl: "assets/img/chatbot/Mastopexy-Breast-Lift.png"
      },

      // Breast Reconstruction
      {
        question: "¿Qué es la Breast Reconstruction?",
        answer: "La Breast Reconstruction (reconstrucción mamaria) es un procedimiento quirúrgico que restaura la forma, el volumen y la apariencia del seno después de una mastectomía (extirpación del seno) por razones médicas.",
        keywords: ["breast reconstruction", "reconstrucción mamaria", "post mastectomía", "cáncer de mama"],
        imageUrl: "assets/img/chatbot/Breast-Reconstruction.png"
      },

      // Breast Implant Exchange / Removal
      {
        question: "¿Qué es el intercambio o retiro de implantes mamarios?",
        answer: "El intercambio o retiro de implantes mamarios es un procedimiento quirúrgico que reemplaza los implantes existentes por otros nuevos, o los retira completamente, a menudo por razones médicas, estéticas o personales.",
        keywords: ["breast implant exchange", "retiro de implantes", "reemplazo de implantes", "explantación"],
        imageUrl: "assets/img/chatbot/Breast-Implant-Exchange-Removal.png"
      },

      // Laser Vaginal Rejuvenation
      {
        question: "¿Qué es la Laser Vaginal Rejuvenation?",
        answer: "La Laser Vaginal Rejuvenation (rejuvenecimiento vaginal con láser) es un procedimiento no quirúrgico que utiliza tecnología láser para tratar la laxitud vaginal, la incontinencia urinaria leve y mejorar la función sexual después del parto o con la edad.",
        keywords: ["laser vaginal rejuvenation", "rejuvenecimiento vaginal", "estrechamiento vaginal", "incontinencia"],
        imageUrl: "assets/img/chatbot/Laser-Vaginal-Rejuvenation.png"
      },
      // Ajoutez ces questions générales manquantes
      {
        question: "cómo tomar una cita",
        answer: `Puede tomar una cita de dos maneras:
  
📞 **Por teléfono**: +34-91-123-45-67
📝 **En línea**: <a href="${this.orderPageLink}" class="chat-link-order">Haga clic aquí para completar el formulario de solicitud</a>

Nuestro equipo se comunicará con usted lo antes posible para confirmar su cita.`,
        keywords: ["cita", "tomar cita", "cómo sacar cita", "consultar", "consulta"]
        ,
        imageUrl: "assets/img/chatbot/Cita.png"
      },
      {
        question: "qué procedimientos ofrecen",
        answer: "Ofrecemos los siguientes procedimientos:\n\n• Rinoplastia (clásica y Piezo)\n• Liposucción\n• Gonioplastia\n• Mommy Makeover\n• Tummy Tuck (Abdominoplastia)\n• Body Lift\n• Aumento mamario\n• Reducción mamaria\n• Levantamiento mamario (Mastopexy)\n• BBL (Brazilian Butt Lift)\n• Trasplante capilar\n• Blefaroplastia\n• Avance de línea frontal\n• Laser Vaginal Rejuvenation\n• Manga gástrica\n\nTambién ofrecemos muchos otros procedimientos adaptados a sus necesidades.",
        keywords: ["procedimientos", "tratamientos", "cirugías", "operaciones", "servicios"],

        imageUrl: "assets/img/chatbot/Procedimientos.png"
      },

      // Ajoutez les questions sur les procédures existantes en français mais manquantes en espagnol
      {
        question: "cuánto tiempo dura la cirugía de gonioplastia",
        answer: "La cirugía dura típicamente de 1,5 a 3 horas. Se recomienda una estancia hospitalaria de 1 a 2 noches en la clínica para un seguimiento óptimo.",
        keywords: ["duración gonioplastia", "tiempo cirugía", "cuánto dura gonioplastia", "duración operación"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "se combina la gonioplastia con otros procedimientos",
        answer: "Sí, puede realizarse sola o integrarse en un programmea completo de feminización facial, en combinación con mentón, pómulos, frente, nariz o tejidos blandos, según sus objetivos.",
        keywords: ["combinación gonioplastia", "cirugía combinada", "múltiples procedimientos", "programmea feminización facial"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "cuál es el tiempo de recuperación para rinoplastia",
        answer: "La recuperación completa después de una rinoplastia toma aproximadamente 1 año, pero puede reanudar sus actividades normales después de 2-3 semanas.",
        keywords: ["recuperación rinoplastia", "tiempo curación", "periodo recuperación", "volver al trabajo"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "cuál es el tiempo de recuperación para liposucción",
        answer: "Las actividades ligeras pueden reanudarse después de 7-10 días. Los deportes y el ejercicio físico generalmente están permitidos después de 4-6 semanas, según la evolución.",
        keywords: ["recuperación liposucción", "curación liposucción", "línea de tiempo recuperación", "retorno actividades"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "qué áreas se pueden tratar con mommy makeover",
        answer: "El programmea está completamente personalizado y puede incluir: Tummy tuck (con o sin reparación muscular), Levantamiento de senos (con o sin implantes), Liposucción dirigida (abdomen, flancos, espalda, caderas). El cirujano definirá la combinación más adecuada a sus objetivos.",
        keywords: ["áreas mommy makeover", "zonas tratamiento", "partes cuerpo tratadas", "áreas objetivo"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "cuánto tiempo debo quedarme después de la cirugía mommy makeover",
        answer: "Se recomienda una estancia de 10 a 14 noches para garantizar un seguimiento postoperatorio completo y seguro antes de su regreso.",
        keywords: ["duración estancia", "cuánto tiempo quedarse", "estancia recuperación", "estancia postoperatoria"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },

      // Ajoutez les questions pour les procédures qui ont des images en français
      {
        question: "qué es mommy makeover",
        answer: "El Mommy Makeover es un conjunto de intervenciones personalizadas que buscan restaurar la silueta después de uno o más embarazos. Generalmente combina una abdominoplastia (tummy tuck), una cirugía mamaria (levantamiento, aumento o reducción) y a veces liposucción.",
        keywords: ["mommy makeover", "después embarazo", "recuperación post-parto", "cirugía post-parto"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "qué es rinoplastia",
        answer: "La rinoplastia es una intervención quirúrgica que busca mejorar la forma de la nariz y/o la respiración, respetando la armonía del rostro y sus rasgos naturales.",
        keywords: ["rinoplastia", "cirugía nariz", "nariz", "remodelación nariz"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "qué es liposucción",
        answer: "La liposucción es una intervención quirúrgica que busca eliminar los depósitos de grasa localizados resistentes al deporte y la alimentación, para afinar y rediseñar la silueta.",
        keywords: ["liposucción", "lipoaspiración", "grasa localizada", "silueta", "cirugía grasa"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "¿Qué tipo de tummy tuck es adecuado para mí (completo, mini, con reparación muscular)?",
        answer: "El cirujano explicará la técnica más adecuada para su morfología y objetivos después de una evaluación completa durante la consulta preoperatoria.",
        keywords: ["tipo tummy tuck", "tummy tuck completo", "tummy tuck mini", "reparación muscular", "qué tummy tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "¿Cuántas noches permaneceré en la clínica después de un tummy tuck?",
        answer: "Generalmente de 2 a 3 noches en la clínica para un seguimiento médico óptimo después del procedimiento.",
        keywords: ["noches clínica", "hospitalización tummy tuck", "duración estancia clínica", "cuántas noches"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "¿Está el hotel cerca de la clínica?",
        answer: "Sí, el alojamiento se selecciona cerca de la clínica para facilitar el transporte y garantizar su comodidad durante el período de recuperación.",
        keywords: ["hotel cerca", "proximidad clínica", "alojamiento cerca clínica", "hospedaje"],
        imageUrl: "assets/img/chatbot/Accommodation.png"
      },
      {
        question: "¿Está incluida la faja de compresión después de un tummy tuck?",
        answer: "Sí, se proporciona o prescribe una faja postoperatoria y su uso está incluido en el seguimiento postoperatorio.",
        keywords: ["faja postoperatoria", "compresión tummy tuck", "ropa compresión", "prendas compresión"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "¿Se incluyen sesiones de fisioterapia o drenaje linfático?",
        answer: "Sí, según el paquete elegido, se incluyen sesiones de drenaje linfático o fisioterapia o se ofrecen como opción para optimizar su recuperación.",
        keywords: ["fisioterapia", "drenaje linfático", "sesiones recuperación", "rehabilitación"],
        imageUrl: "assets/img/chatbot/Post-Op-Care.png"
      },
      {
        question: "¿Dónde estará ubicada la cicatriz después de un tummy tuck?",
        answer: "La cicatriz se coloca baja, generalmente a nivel del bikini, discretamente oculta debajo de la ropa interior. El cirujano explicará su evolución y los cuidados necesarios.",
        keywords: ["cicatriz tummy tuck", "ubicación cicatriz", "cicatriz abdominoplastia", "cicatrización"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "¿Qué sucede en caso de complicaciones?",
        answer: "En caso de complicaciones, la agencia garantiza seguimiento médico inmediato, acceso al cirujano y manejo según protocolos médicos establecidos, con asistencia 24/7.",
        keywords: ["complicaciones", "problemas postoperatorios", "emergencia médica", "asistencia complicaciones"],
        imageUrl: "assets/img/chatbot/Emergency-en.png"
      },
      {
        question: "¿Tendré asistencia en el lugar?",
        answer: "Sí, un coordinador médico está disponible las 24 horas durante toda su estancia para asistirle y satisfacer sus necesidades.",
        keywords: ["asistencia en lugar", "coordinador médico", "ayuda local", "soporte"],
        imageUrl: "assets/img/chatbot/Assistance.png"
      },
      {
        question: "¿Soy una buena candidata para blefaroplastia superior e inferior?",
        answer: "Después de revisar sus fotos, edad, calidad de la piel y antecedentes médicos, el cirujano confirmará su elegibilidad para blefaroplastia de párpados superiores e inferiores.",
        keywords: ["blefaroplastia", "párpados", "ojos", "candidata blefaroplastia", "superior inferior"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "¿Qué técnica se utilizará para párpados superiores e inferiores?",
        answer: "El cirujano explicará la técnica apropiada: incisión en el pliegue natural del párpado superior, e incisión bajo las pestañas o abordaje transconjuntival para el párpado inferior, según su caso.",
        keywords: ["técnica blefaroplastia", "párpados superiores", "párpados inferiores", "método"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "¿Debo permanecer hospitalizada después de la blefaroplastia?",
        answer: "En la mayoría de los casos, es cirugía ambulatoria. Puede recomendarse una noche según su estado general y la opinión del cirujano.",
        keywords: ["hospitalización blefaroplastia", "noche clínica", "ambulatorio", "estancia clínica"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "¿Cuáles son los efectos después de la blefaroplastia (hinchazón, hematomas)?",
        answer: "La hinchazón y los hematomas son normales después del procedimiento y disminuyen gradualmente en 10 a 15 días. Se recomiendan compresas frías los primeros días.",
        keywords: ["hinchazón párpados", "hematomas ojos", "efectos secundarios", "recuperación blefaroplastia"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "¿Cuándo puedo reanudar actividades normales después de blefaroplastia?",
        answer: "Generalmente después de 7 a 10 días para actividades ligeras, dependiendo de su progreso y velocidad de recuperación.",
        keywords: ["reanudar actividades", "tiempo recuperación", "retorno trabajo", "convalecencia"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "¿Dónde estarán ubicadas las cicatrices después de blefaroplastia?",
        answer: "Las cicatrices son muy discretas: en el pliegue natural del párpado superior, y bajo las pestañas o dentro del párpado inferior, dependiendo de la técnica utilizada.",
        keywords: ["cicatrices párpados", "cicatrización ojos", "cicatrices discretas", "ubicación cicatrices"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "¿Soy una buena candidata para trasplante capilar?",
        answer: "Sí, después de un análisis personalizado basado en sus fotos, historial médico, tipo de pérdida de cabello y calidad del área donante. Una consulta con el médico es obligatoria antes de la confirmación.",
        keywords: ["candidata trasplante", "elegibilidad trasplante", "buena candidata", "calificación trasplante"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Se hace un diagnóstico médico antes de mi llegada para trasplante capilar?",
        answer: "Sí. Se realiza una preevaluación remota (fotos + cuestionario médico), luego una consulta final en la clínica antes del procedimiento para confirmar el diagnóstico.",
        keywords: ["diagnóstico trasplante", "evaluación previa", "análisis fotos", "consulta previa"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Qué técnica se utilizará para trasplante capilar (FUE, DHI, Sapphire) y por qué?",
        answer: "La elección depende de su caso: FUE (técnica más utilizada, natural y mínimamente invasiva), DHI (implantación directa) o Sapphire FUE (cicatrización más rápida). El médico elige la técnica más adecuada a su cuero cabelludo y objetivos.",
        keywords: ["técnica trasplante", "fue", "dhi", "sapphire", "método trasplante"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Quién realiza exactamente el trasplante capilar?",
        answer: "El trasplante lo realiza un médico especializado en trasplante capilar, asistido por un equipo médico calificado. El médico interviene personalmente en los pasos clave (diseño, extracción, implantación).",
        keywords: ["médico trasplante", "equipo médico", "especialista trasplante", "quién realiza"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Cuántos injertos recibiré durante un trasplante capilar?",
        answer: "El número exacto se confirma después del análisis médico. En promedio, varía entre 1.500 y 4.000 injertos, dependiendo de la densidad deseada y el área a tratar.",
        keywords: ["número injertos", "cantidad cabello", "injertos", "densidad"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Será natural el resultado de un trasplante capilar?",
        answer: "Sí. La línea frontal se diseña a medida, respetando su morfología y la implantación natural del cabello para un resultado armonioso y natural.",
        keywords: ["resultado natural", "apariencia natural", "armonía", "diseño frontal"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Es doloroso un trasplante capilar?",
        answer: "No. El procedimiento se realiza bajo anestesia local. Puede sentir una ligera molestia durante la anestesia, pero ningún dolor significativo durante el procedimiento.",
        keywords: ["dolor trasplante", "molestia", "anestesia local", "confort"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Están incluidos alojamiento y traslados para trasplante capilar?",
        answer: "Sí. El paquete incluye: traslados aeropuerto - hotel - clínica, hotel (3 a 5 estrellas según el paquete), asistencia y apoyo durante toda su estancia.",
        keywords: ["alojamiento trasplante", "traslados incluidos", "paquete completo", "logística"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Qué sucede después de un trasplante capilar?",
        answer: "Usted se beneficia de: medicamentos postoperatorios, primer lavado en la clínica, instrucciones detalladas y seguimiento remoto durante varios meses.",
        keywords: ["después trasplante", "cuidados postoperatorios", "seguimiento", "recuperación"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Hay un período de caída del cabello después de un trasplante?",
        answer: "Sí. La caída temporal (shock loss) es normal entre 2 y 6 semanas. El cabello vuelve a crecer gradualmente a partir del 3er mes.",
        keywords: ["caída temporal", "shock loss", "caída cabello", "fase caída"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Cuándo veré los resultados definitivos de un trasplante capilar?",
        answer: "Primeras señales: 3-4 meses, resultado visible: 6 meses, resultado final: 12 meses después del procedimiento.",
        keywords: ["resultados definitivos", "plazo resultados", "evolución crecimiento", "tiempo crecimiento"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Qué incluye exactamente el precio de un trasplante capilar?",
        answer: "El precio incluye: trasplante capilar, honorarios médicos, medicamentos, hotel, traslados y seguimiento postoperatorio. Sin costos ocultos.",
        keywords: ["precio trasplante", "incluido precio", "costo", "transparencia"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Hay garantía para trasplante capilar?",
        answer: "Sí, la agencia garantiza la calidad de la atención y el seguimiento médico. Algunos centros también ofrecen una garantía de injertos.",
        keywords: ["garantía trasplante", "aseguramiento calidad", "compromiso", "seguridad"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "¿Soy una buena candidata para avance de la línea frontal?",
        answer: "Se realiza una evaluación a partir de sus fotos, altura de la frente, elasticidad del cuero cabelludo, densidad capilar y ausencia de pérdida activa de cabello. El cirujano confirmará la elegibilidad durante la consulta.",
        keywords: ["avance línea frontal", "línea capilar", "frente", "candidata línea frontal"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Hay contraindicaciones para el avance de la línea frontal?",
        answer: "Antecedentes de pérdida severa de cabello, alopecia progresiva, cicatrización difícil o enfermedades del cuero cabelludo deben ser reportados y evaluados por el cirujano.",
        keywords: ["contraindicaciones", "contraindicación línea frontal", "riesgos", "precauciones"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Quién realizará el avance de la línea frontal y cuáles son sus calificaciones?",
        answer: "Un cirujano especializado en cirugía estética y cirugía del cuero cabelludo, con experiencia confirmada en avance de línea frontal.",
        keywords: ["cirujano línea frontal", "calificaciones", "especialista", "experiencia"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Está la clínica certificada para avance de línea frontal?",
        answer: "Sí, la cirugía se realiza en una clínica certificada, respetando normas internacionales de higiene y seguridad.",
        keywords: ["clínica certificada", "certificación", "normas seguridad", "calidad"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Qué técnica se utilizará para avance de línea frontal?",
        answer: "Avance quirúrgico de la línea frontal con incisión discreta a nivel de la línea capilar, permitiendo el descenso natural de la frente.",
        keywords: ["técnica línea frontal", "método avance", "cirugía línea frontal", "procedimiento"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Cuántos centímetros se puede avanzar la línea frontal?",
        answer: "En promedio entre 1.5 y 3 cm, dependiendo de la elasticidad del cuero cabelludo y su morfología de frente.",
        keywords: ["centímetros avance", "descenso frente", "distancia", "medición"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Deja el avance de línea frontal una cicatriz visible?",
        answer: "La cicatriz se coloca dentro de la línea capilar y generalmente se vuelve muy discreta con el tiempo, oculta por el cabello.",
        keywords: ["cicatriz línea frontal", "visibilidad cicatriz", "cicatrización", "cicatriz discreta"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Qué tipo de anestesia se usa para avance de línea frontal?",
        answer: "Anestesia general o anestesia local con sedación, dependiendo del caso y la opinión del cirujano después de evaluación preoperatoria.",
        keywords: ["anestesia línea frontal", "tipo anestesia", "sedación", "anestesia general"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Es necesaria una estancia en clínica después de avance de línea frontal?",
        answer: "Generalmente 1 noche en la clínica para monitoreo, luego traslado al hotel para el resto de la convalecencia.",
        keywords: ["estancia clínica", "noche clínica", "hospitalización", "monitoreo"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Es significativo el dolor después del avance de línea frontal?",
        answer: "El dolor es generalmente moderado y bien controlado por los tratamientos prescritos. Puede sentirse alguna molestia los primeros días.",
        keywords: ["dolor línea frontal", "molestia", "incomodidad postoperatoria", "analgésicos"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Habrá hinchazón o hematomas después del avance de línea frontal?",
        answer: "Sí, edema de la frente y a veces hinchazón de párpados son comunes los primeros días y desaparecen gradualmente en aproximadamente una semana.",
        keywords: ["hinchazón línea frontal", "hematomas", "edema frente", "moretones"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Es permanente el resultado del avance de línea frontal?",
        answer: "Sí, el avance de línea frontal es permanente, sujeto a estabilidad capilar y ausencia de pérdida progresiva de cabello.",
        keywords: ["línea frontal permanente", "definitivo", "durabilidad", "resultado duradero"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "¿Soy una buena candidata para un Lip Lift?",
        answer: "Antes de cualquier confirmación, su elegibilidad será evaluada por el cirujano a partir de sus fotos médicas e historial de salud. El Lip Lift generalmente se recomienda para pacientes que presentan: un labio superior fino o alargado, un espacio significativo entre la nariz y el labio superior, falta de definición del arco de Cupido. Se organizará una consulta preoperatoria con el cirujano a su llegada para confirmar la indicación.",
        keywords: ["lip lift", "candidata lip lift", "elegibilidad lip lift", "buena candidata lip lift", "lifting labio"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Cuál es la calificación y experiencia del cirujano para Lip Lift?",
        answer: "Colaboramos únicamente con cirujanos especializados en cirugía estética facial, certificados y experimentados en el procedimiento de Lip Lift. Recibirá: el perfil del cirujano, sus años de experiencia, fotos antes/después de casos similares, antes de confirmar su estancia.",
        keywords: ["calificación cirujano lip lift", "experiencia cirujano", "cirujano lip lift", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de Lip Lift?",
        answer: "Su procedimiento se realizará en una clínica acreditada que respeta las normas internacionales de higiene y seguridad, equipada con un quirófano moderno y un equipo médico calificado.",
        keywords: ["clínica lip lift", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Qué técnica se utilizará para mi Lip Lift?",
        answer: "La técnica más comúnmente utilizada es el Lip Lift subnasal (técnica Bullhorn). El cirujano le explicará: la técnica adaptada a su morfología, la ubicación de la cicatriz (oculta bajo la base de la nariz), el resultado esperado durante la consulta preoperatoria.",
        keywords: ["técnica lip lift", "técnica bullhorn", "lip lift subnasal", "método lip lift"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Qué tipo de anestesia se utilizará para Lip Lift?",
        answer: "El Lip Lift generalmente se realiza bajo anestesia local, a veces con sedación ligera según su comodidad y la opinión del cirujano.",
        keywords: ["anestesia lip lift", "tipo anestesia", "sedación", "anestesia local"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Cuánto dura el procedimiento de Lip Lift y la estancia?",
        answer: "Duración del procedimiento: aproximadamente 45 minutos a 1 hora. Estancia clínica: ambulatorio (alta el mismo día). Duración recomendada de la estancia en Túnez: 5 a 6 días. Esto incluye: consulta preoperatoria, procedimiento, seguimiento postoperatorio, retiro de puntos si es necesario.",
        keywords: ["duración lip lift", "tiempo operación", "estancia clínica", "cuántos días"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Qué incluye el paquete médico para Lip Lift?",
        answer: "Su paquete incluye: consulta con el cirujano, honorarios de clínica y procedimiento, medicamentos postoperatorios, traslados VIP (aeropuerto / clínica / hotel), alojamiento en hotel, asistencia de un coordinador médico dedicado durante toda su estancia.",
        keywords: ["paquete lip lift", "inclusiones lip lift", "servicios", "paquete médico"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos o complicaciones del Lip Lift?",
        answer: "Como cualquier procedimiento quirúrgico, el Lip Lift conlleva ciertos riesgos como: infección, sangrado, cicatrización visible, asimetría. El cirujano le informará en detalle durante la consulta preoperatoria y se toman medidas para minimizar estos riesgos.",
        keywords: ["riesgos lip lift", "complicaciones", "peligros lip lift", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Cuál es el tiempo de recuperación después de un Lip Lift?",
        answer: "Hinchazón y hematomas: 7 a 10 días. Reanudación de actividades sociales: después de 10 a 14 días. Resultado final: visible después de unas semanas a medida que disminuye la hinchazón.",
        keywords: ["recuperación lip lift", "convalecencia", "reanudar actividades", "tiempo curación"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Hay seguimiento después de mi regreso a mi país después de Lip Lift?",
        answer: "Sí, aseguramos un seguimiento postoperatorio a distancia con su coordinador médico y el cirujano si es necesario, para garantizar una recuperación óptima.",
        keywords: ["seguimiento lip lift", "después regreso", "seguimiento remoto", "postoperatorio"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "¿Soy una buena candidata para un Neck Lift?",
        answer: "Su elegibilidad será evaluada primero por el cirujano a partir de fotos médicas y su historial de salud. Un Neck Lift generalmente se recomienda para pacientes que presentan: flacidez cutánea en el área del cuello, papada, bandas musculares visibles (platisma), pérdida de definición del ángulo cervico-mentoniano. Se organizará una consulta preoperatoria en la clínica a su llegada para confirmar la indicación quirúrgica.",
        keywords: ["neck lift", "lifting cuello", "candidata neck lift", "flacidez cuello", "papada"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Cuál es la calificación del cirujano que realizará mi Neck Lift?",
        answer: "Trabajamos con cirujanos especializados en cirugía estética facial y de cuello, certificados y experimentados en procedimientos de Neck Lift. Antes de su confirmación, recibirá: el perfil del cirujano, sus años de experiencia, fotos antes/después de casos similares.",
        keywords: ["calificación cirujano neck lift", "experiencia cirujano cuello", "cirujano neck lift", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de Neck Lift?",
        answer: "Su Neck Lift se realizará en una clínica acreditada que respeta las normas internacionales de seguridad, con un quirófano moderno y equipo médico calificado.",
        keywords: ["clínica neck lift", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Qué técnica se utilizará en mi caso para Neck Lift?",
        answer: "La técnica utilizada dependerá de su anatomía y grado de flacidez cutánea. Puede incluir: tensado del músculo platisma, eliminación del exceso de piel, liposucción del cuello si es necesario. El cirujano explicará en detalle la técnica recomendada durante su consulta preoperatoria.",
        keywords: ["técnica neck lift", "platisma", "tensado muscular", "técnica cuello"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Qué tipo de anestesia se utilizará para Neck Lift?",
        answer: "El Neck Lift generalmente se realiza bajo anestesia general para garantizar su comodidad y seguridad durante el procedimiento.",
        keywords: ["anestesia neck lift", "tipo anestesia", "anestesia general", "sedación"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Cuánto dura el procedimiento de Neck Lift y la estancia?",
        answer: "Duración del procedimiento: 2 a 3 horas. Estancia en clínica: 1 noche. Estancia recomendada en Túnez: 6 a 7 días. Su estancia incluirá: consulta preoperatoria, análisis médicos, procedimiento quirúrgico, seguimiento postoperatorio, retiro de drenajes y suturas si es necesario.",
        keywords: ["duración neck lift", "tiempo operación", "estancia clínica", "cuántos días"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Qué incluye el paquete médico para Neck Lift?",
        answer: "Su paquete incluye: consulta con el cirujano, honorarios de clínica y procedimiento, anestesia, medicamentos postoperatorios, prenda de compresión (mentonera), traslados VIP (aeropuerto / clínica / hotel), alojamiento en hotel, asistencia de un coordinador médico dedicado durante toda su estancia.",
        keywords: ["paquete neck lift", "inclusiones neck lift", "servicios", "paquete médico"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Cuáles son los riesgos asociados con Neck Lift?",
        answer: "Como cualquier cirugía, el Neck Lift conlleva ciertos riesgos como: infección, hematoma, hinchazón prolongada, cicatrización visible, entumecimiento temporal. Se toman todas las medidas necesarias para minimizar estos riesgos y garantizar su seguridad.",
        keywords: ["riesgos neck lift", "complicaciones", "peligros neck lift", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Cuál es el tiempo de recuperación después de un Neck Lift?",
        answer: "Hinchazón y hematomas: 10 a 14 días. Uso de la mentonera: recomendado durante 2 a 3 semanas. Reanudación de actividades sociales: después de 2 semanas. Resultado final: visible progresivamente durante 2 a 3 meses.",
        keywords: ["recuperación neck lift", "convalecencia", "reanudar actividades", "tiempo curación"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Se asegura seguimiento después de mi regreso a mi país después de Neck Lift?",
        answer: "Sí, aseguramos un seguimiento postoperatorio remoto con su coordinador médico y el cirujano para acompañar su recuperación después de su regreso.",
        keywords: ["seguimiento neck lift", "después regreso", "seguimiento remoto", "postoperatorio"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "¿Soy una buena candidata para una bichectomía?",
        answer: "Su elegibilidad será evaluada por el cirujano a partir de fotos médicas y su historial de salud. La bichectomía generalmente se recomienda para pacientes que presentan: cara redonda o mejillas voluminosas, exceso de grasa en las bolsas de Bichat, falta de definición en los pómulos o el óvalo facial. Se organizará una consulta preoperatoria a su llegada para confirmar la indicación quirúrgica.",
        keywords: ["bichectomía", "bolsas de Bichat", "mejillas", "cara redonda", "afinar cara"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿Cuál es la calificación del cirujano que realizará mi bichectomía?",
        answer: "Colaboramos con cirujanos especializados en cirugía estética facial, certificados y experimentados en el procedimiento de bichectomía. Antes de cualquier confirmación, recibirá: el perfil del cirujano, sus años de experiencia, fotos antes/después de casos similares.",
        keywords: ["calificación cirujano bichectomía", "experiencia cirujano", "cirujano bichectomía", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de bichectomía?",
        answer: "Su procedimiento se realizará en una clínica acreditada que respeta las normas internacionales de higiene y seguridad, equipada con un quirófano moderno y un equipo médico calificado.",
        keywords: ["clínica bichectomía", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿Cómo se realiza el procedimiento de bichectomía?",
        answer: "La bichectomía consiste en extraer parte de las bolsas de Bichat para afinar la parte inferior de la cara. Las incisiones se realizan dentro de la boca, lo que significa que no hay cicatrices visibles en la piel.",
        keywords: ["procedimiento", "técnica", "incisión boca", "sin cicatrices"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿Qué tipo de anestesia se utilizará para una bichectomía?",
        answer: "La bichectomía generalmente se realiza bajo anestesia local, a veces con sedación ligera según su comodidad y la opinión del cirujano.",
        keywords: ["anestesia", "anestesia local", "sedación", "tipo anestesia"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿Cuánto dura el procedimiento de bichectomía y la estancia?",
        answer: "Duración del procedimiento: 30 a 45 minutos. Estancia en clínica: ambulatorio (alta el mismo día). Estancia recomendada en Túnez: 4 a 5 días. Su estancia incluye: consulta preoperatoria, análisis médicos si son necesarios, procedimiento quirúrgico, seguimiento postoperatorio.",
        keywords: ["duración", "tiempo operación", "estancia clínica", "cuántos días"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿Qué incluye el paquete médico para una bichectomía?",
        answer: "Su paquete incluye: honorarios del cirujano, honorarios de clínica, anestesia, medicamentos postoperatorios, traslados VIP (aeropuerto / clínica / hotel), alojamiento en hotel, asistencia de un coordinador médico dedicado durante toda su estancia.",
        keywords: ["paquete", "inclusiones", "servicios", "paquete médico"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos o complicaciones de una bichectomía?",
        answer: "Como cualquier procedimiento quirúrgico, la bichectomía conlleva ciertos riesgos como: infección, hinchazón, asimetría, entumecimiento temporal. Se toman todas las medidas para minimizar estos riesgos.",
        keywords: ["riesgos", "complicaciones", "efectos secundarios", "peligros"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿Cuál es el tiempo de recuperación después de una bichectomía?",
        answer: "Hinchazón: 7 a 10 días. Reanudación de actividades sociales: después de 5 a 7 días. Resultado final: visible progresivamente después de 4 a 6 semanas.",
        keywords: ["recuperación", "convalecencia", "reanudar actividades", "tiempo curación"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "¿Soy una buena candidata para una cantopexia?",
        answer: "Su elegibilidad será evaluada por el cirujano a partir de fotos médicas y su historial de salud. La cantopexia generalmente se recomienda para pacientes que presentan: flacidez del párpado inferior, mirada caída o cansada, falta de soporte en el canto externo del ojo, deseo de mejorar la forma o tensión del párpado inferior. Se organizará una consulta preoperatoria a su llegada para confirmar la indicación quirúrgica.",
        keywords: ["cantopexia", "párpado", "mirada", "canto ojo", "párpado inferior"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿Cuál es la calificación del cirujano que realizará mi cantopexia?",
        answer: "Colaboramos con cirujanos especializados en cirugía estética de párpados y mirada, certificados y experimentados en el procedimiento de cantopexia. Antes de cualquier confirmación, recibirá: el perfil del cirujano, sus años de experiencia, fotos antes/después de casos similares.",
        keywords: ["calificación cirujano cantopexia", "experiencia cirujano párpado", "cirujano cantopexia", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de cantopexia?",
        answer: "Su procedimiento se realizará en una clínica acreditada que respeta las normas internacionales de higiene y seguridad, equipada con un quirófano moderno y un equipo médico calificado.",
        keywords: ["clínica cantopexia", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿Cómo se realiza el procedimiento de cantopexia?",
        answer: "La cantopexia consiste en tensar y reposicionar el tendón del canto externo del párpado inferior para mejorar el soporte y la forma del ojo. Puede realizarse sola o en combinación con blefaroplastia inferior según su caso.",
        keywords: ["procedimiento", "técnica", "tendón", "canto ojo"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿Qué tipo de anestesia se utilizará para una cantopexia?",
        answer: "La cantopexia generalmente se realiza bajo anestesia local con sedación ligera, o bajo anestesia general según la indicación y las recomendaciones del cirujano.",
        keywords: ["anestesia", "anestesia local", "sedación", "anestesia general"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿Cuánto dura el procedimiento de cantopexia y la estancia?",
        answer: "Duración del procedimiento: aproximadamente 1 hora. Estancia en clínica: ambulatorio (alta el mismo día). Estancia recomendada en Túnez: 4 a 5 días. Su estancia incluye: consulta preoperatoria, procedimiento quirúrgico, seguimiento postoperatorio, retiro de suturas si es necesario.",
        keywords: ["duración", "tiempo operación", "estancia clínica", "cuántos días"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿Qué incluye el paquete médico para una cantopexia?",
        answer: "Su paquete incluye: honorarios del cirujano, honorarios de clínica, anestesia, medicamentos postoperatorios, traslados VIP (aeropuerto / clínica / hotel), alojamiento en hotel, asistencia de un coordinador médico dedicado durante toda su estancia.",
        keywords: ["paquete", "inclusiones", "servicios", "paquete médico"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos o complicaciones de una cantopexia?",
        answer: "Como cualquier procedimiento quirúrgico, la cantopexia conlleva ciertos riesgos como: infección, hinchazón, sequedad ocular temporal, asimetría, irritación ocular. Se toman todas las medidas para minimizar estos riesgos.",
        keywords: ["riesgos", "complicaciones", "efectos secundarios", "peligros"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿Cuál es el tiempo de recuperación después de una cantopexia?",
        answer: "Hinchazón y hematomas: 7 a 10 días. Reanudación de actividades sociales: después de 7 a 10 días. Resultado final: visible progresivamente después de unas semanas.",
        keywords: ["recuperación", "convalecencia", "reanudar actividades", "tiempo curación"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "¿Soy una buena candidata para un Facial Fat Grafting?",
        answer: "Su elegibilidad será evaluada por el cirujano a partir de fotos médicas y su historial de salud. El Facial Fat Grafting generalmente se recomienda para pacientes que presentan: pérdida de volumen en la cara, ojeras hundidas, mejillas o sienes hundidas, pliegues nasogenianos marcados, falta de definición del óvalo facial. Se organizará una consulta preoperatoria a su llegada para confirmar la indicación y establecer un plan de tratamiento personalizado.",
        keywords: ["facial fat grafting", "lipofilling facial", "grasa facial", "volumen facial", "ojeras"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿Cuál es la calificación del cirujano que realizará mi Facial Fat Grafting?",
        answer: "Colaboramos con cirujanos especializados en cirugía estética facial, certificados y experimentados en técnicas de lipofilling facial. Antes de cualquier confirmación, recibirá: el perfil del cirujano, sus años de experiencia, fotos antes/después de casos similares.",
        keywords: ["calificación cirujano lipofilling", "experiencia cirujano facial", "cirujano fat grafting", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de Facial Fat Grafting?",
        answer: "Su procedimiento se realizará en una clínica acreditada que respeta las normas internacionales de higiene y seguridad, equipada con un quirófano moderno y un equipo médico calificado.",
        keywords: ["clínica lipofilling", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿Cómo se realiza el procedimiento de Facial Fat Grafting?",
        answer: "El Facial Fat Grafting consiste en extraer grasa de un área donante (como el abdomen o los muslos), purificarla y luego reinyectarla en las áreas faciales que necesitan volumen, para obtener un resultado natural y duradero.",
        keywords: ["procedimiento", "técnica", "extracción grasa", "reinyección"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿Qué tipo de anestesia se utilizará para Facial Fat Grafting?",
        answer: "Este procedimiento generalmente se realiza bajo anestesia local con sedación ligera o bajo anestesia general, según la extensión del tratamiento y las recomendaciones del cirujano.",
        keywords: ["anestesia", "anestesia local", "sedación", "anestesia general"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿Cuánto dura el procedimiento de Facial Fat Grafting y la estancia?",
        answer: "Duración del procedimiento: 1 a 2 horas. Estancia en clínica: ambulatorio o 1 noche. Estancia recomendada en Túnez: 5 a 6 días. Su estancia incluye: consulta preoperatoria, análisis médicos si son necesarios, procedimiento quirúrgico, seguimiento postoperatorio.",
        keywords: ["duración", "tiempo operación", "estancia clínica", "cuántos días"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿Qué incluye el paquete médico para Facial Fat Grafting?",
        answer: "Su paquete incluye: honorarios del cirujano, honorarios de clínica, anestesia, medicamentos postoperatorios, traslados VIP (aeropuerto / clínica / hotel), alojamiento en hotel, asistencia de un coordinador médico dedicado durante toda su estancia.",
        keywords: ["paquete", "inclusiones", "servicios", "paquete médico"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos o complicaciones del Facial Fat Grafting?",
        answer: "Como cualquier procedimiento quirúrgico, el Facial Fat Grafting conlleva ciertos riesgos como: infección, hinchazón, resorción parcial de la grasa inyectada, asimetría. Se toman todas las medidas necesarias para minimizar estos riesgos.",
        keywords: ["riesgos", "complicaciones", "efectos secundarios", "peligros"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿Cuál es el tiempo de recuperación después de un Facial Fat Grafting?",
        answer: "Hinchazón y hematomas: 7 a 14 días. Reanudación de actividades sociales: después de 10 a 14 días. Resultado final: visible progresivamente después de unas semanas a medida que disminuye la hinchazón.",
        keywords: ["recuperación", "convalecencia", "reanudar actividades", "tiempo curación"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "¿Soy una buena candidata para un Brow Lift?",
        answer: "Su elegibilidad será evaluada por el cirujano a partir de fotos médicas y su historial de salud. El Brow Lift generalmente se recomienda para pacientes que presentan: cejas caídas, mirada cansada o triste, exceso de piel en la frente, arrugas frontales o entrecejo marcadas. Se organizará una consulta preoperatoria a su llegada para confirmar la indicación quirúrgica.",
        keywords: ["brow lift", "lifting cejas", "cejas caídas", "mirada cansada", "arrugas frente"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿Cuál es la calificación del cirujano que realizará mi Brow Lift?",
        answer: "Colaboramos con cirujanos especializados en cirugía estética facial, certificados y experimentados en procedimientos de lifting de cejas. Antes de cualquier confirmación, recibirá: el perfil del cirujano, sus años de experiencia, fotos antes/después de casos similares.",
        keywords: ["calificación cirujano brow lift", "experiencia cirujano cejas", "cirujano brow lift", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de Brow Lift?",
        answer: "Su procedimiento se realizará en una clínica acreditada que respeta las normas internacionales de higiene y seguridad, equipada con un quirófano moderno y un equipo médico calificado.",
        keywords: ["clínica brow lift", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿Qué técnica se utilizará en mi caso para Brow Lift?",
        answer: "La técnica utilizada dependerá de su anatomía y el resultado deseado. Puede incluir: lifting endoscópico de cejas, lifting temporal o lifting frontal clásico. El cirujano explicará la técnica recomendada durante su consulta preoperatoria.",
        keywords: ["técnica brow lift", "lifting endoscópico", "lifting temporal", "lifting frontal"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿Qué tipo de anestesia se utilizará para Brow Lift?",
        answer: "El Brow Lift generalmente se realiza bajo anestesia general o bajo anestesia local con sedación ligera según la técnica utilizada.",
        keywords: ["anestesia brow lift", "tipo anestesia", "anestesia general", "sedación"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿Cuánto dura el procedimiento de Brow Lift y la estancia?",
        answer: "Duración del procedimiento: 1 a 2 horas. Estancia en clínica: ambulatorio o 1 noche. Estancia recomendada en Túnez: 5 a 6 días. Su estancia incluye: consulta preoperatoria, análisis médicos si son necesarios, procedimiento quirúrgico, seguimiento postoperatorio, retiro de suturas si es necesario.",
        keywords: ["duración brow lift", "tiempo operación", "estancia clínica", "cuántos días"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿Qué incluye el paquete médico para Brow Lift?",
        answer: "Su paquete incluye: honorarios del cirujano, honorarios de clínica, anestesia, medicamentos postoperatorios, traslados VIP (aeropuerto / clínica / hotel), alojamiento en hotel, asistencia de un coordinador médico dedicado durante toda su estancia.",
        keywords: ["paquete brow lift", "inclusiones", "servicios", "paquete médico"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos o complicaciones del Brow Lift?",
        answer: "Como cualquier procedimiento quirúrgico, el Brow Lift conlleva ciertos riesgos como: infección, hinchazón, hematomas, asimetría, entumecimiento temporal. Se toman todas las medidas necesarias para minimizar estos riesgos.",
        keywords: ["riesgos brow lift", "complicaciones", "efectos secundarios", "peligros"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿Cuál es el tiempo de recuperación después de un Brow Lift?",
        answer: "Hinchazón y hematomas: 7 a 10 días. Reanudación de actividades sociales: después de 10 a 14 días. Resultado final: visible progresivamente después de unas semanas.",
        keywords: ["recuperación brow lift", "convalecencia", "reanudar actividades", "tiempo curación"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "¿El cirujano está calificado y tiene experiencia en otoplastia?",
        answer: "Sí, colaboramos con cirujanos especializados en cirugía estética y reconstructiva, con varios años de experiencia realizando otoplastias con resultados naturales.",
        keywords: ["cirujano otoplastia", "calificaciones cirujano", "experiencia otoplastia", "cirujano orejas"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Puedo ver fotos antes/después de pacientes que se han sometido a otoplastia?",
        answer: "Por supuesto, podemos compartir fotos antes/después de casos similares realizados por el cirujano, respetando la confidencialidad de los pacientes.",
        keywords: ["fotos antes después otoplastia", "resultados otoplastia", "galería fotos", "casos similares"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de otoplastia? ¿Está certificada?",
        answer: "El procedimiento se realiza en una clínica acreditada que respeta las normas internacionales de higiene y seguridad.",
        keywords: ["clínica otoplastia", "instalación certificada", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿La otoplastia se realiza bajo anestesia local o general?",
        answer: "La otoplastia generalmente se realiza bajo anestesia local con sedación ligera, pero se puede considerar anestesia general según su caso y la recomendación del cirujano.",
        keywords: ["anestesia otoplastia", "tipo anestesia", "anestesia local", "anestesia general"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Los resultados de la otoplastia son permanentes?",
        answer: "Sí, los resultados de la otoplastia son generalmente permanentes una vez completada la cicatrización.",
        keywords: ["resultados permanentes otoplastia", "durabilidad", "definitivo", "permanente"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Tendré cicatrices visibles después de la otoplastia?",
        answer: "Las incisiones se realizan detrás de la oreja, por lo que las cicatrices son discretas y se vuelven casi invisibles con el tiempo.",
        keywords: ["cicatrices otoplastia", "visibilidad cicatrices", "incisiones detrás oreja", "cicatrices discretas"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Cuántos días debo quedarme en Túnez para una otoplastia?",
        answer: "La estancia recomendada es generalmente de 5 a 7 días: Día 1: Llegada y traslado al hotel, Día 2: Consulta con el cirujano + análisis médicos, Día 3: Intervención, Día 4: Descanso, Día 5: Primer control postoperatorio, Día 6-7: Autorización para volar después de validación médica.",
        keywords: ["duración estancia otoplastia", "cuántos días", "cronograma", "itinerario"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Cuánto dura la cirugía de otoplastia?",
        answer: "El procedimiento dura en promedio entre 1 y 2 horas.",
        keywords: ["duración otoplastia", "tiempo operación", "cuánto tiempo"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Pasaré la noche en la clínica después de la otoplastia?",
        answer: "La otoplastia generalmente se realiza de forma ambulatoria. Puede salir de la clínica el mismo día después de la observación médica.",
        keywords: ["noche clínica otoplastia", "hospitalización", "ambulatorio", "estancia clínica"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Sentiré dolor después de la cirugía de otoplastia?",
        answer: "Se puede sentir una molestia leve a moderada durante unos días, pero está bien controlada con analgésicos.",
        keywords: ["dolor otoplastia", "molestia postoperatoria", "analgésicos", "confort"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Tendré que usar un vendaje después de la otoplastia?",
        answer: "Sí, se debe usar una banda de compresión: 24/7 durante 5 a 7 días, luego solo por la noche durante 2 a 3 semanas.",
        keywords: ["vendaje otoplastia", "banda compresión", "compresión", "cuidados postoperatorios"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Cuándo puedo reanudar mis actividades normales después de la otoplastia?",
        answer: "Trabajo: después de 5 a 7 días. Deporte: después de 3 a 4 semanas.",
        keywords: ["reanudar actividades otoplastia", "volver trabajo", "reanudar deporte", "recuperación"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿El seguimiento postoperatorio está incluido en el paquete de otoplastia?",
        answer: "Sí, el seguimiento postoperatorio está incluido e incluye: consulta de control antes de su partida, asistencia médica remota después de su regreso, recomendaciones para cuidados postoperatorios.",
        keywords: ["seguimiento otoplastia", "incluido en paquete", "control", "asistencia"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos de una otoplastia?",
        answer: "Como cualquier procedimiento quirúrgico, existen riesgos poco frecuentes como: infección, hematoma, asimetría. Pero se toman todas las precauciones para minimizar estos riesgos.",
        keywords: ["riesgos otoplastia", "complicaciones", "peligros otoplastia", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "¿Soy una buena candidata para una dimpleplastia?",
        answer: "Se realizará una evaluación personalizada a partir de fotos o durante una consulta con el cirujano. El médico verificará: la elasticidad de su piel, la estructura de sus mejillas, sus expectativas estéticas para confirmar que el procedimiento es adecuado para su morfología facial.",
        keywords: ["dimpleplastia", "hoyuelos", "candidata dimpleplastia", "creación hoyuelos", "mejillas"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "¿Quién realizará mi dimpleplastia y cuáles son sus calificaciones?",
        answer: "La agencia debe proporcionarle: el nombre del cirujano, sus años de experiencia, sus certificaciones, fotos antes/después de pacientes que se han sometido a dimpleplastia.",
        keywords: ["cirujano dimpleplastia", "calificaciones", "experiencia hoyuelos", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "¿Dónde se realiza el procedimiento de dimpleplastia?",
        answer: "El procedimiento se realiza en una clínica acreditada que respeta las normas internacionales de higiene. Generalmente es un procedimiento ambulatorio realizado bajo anestesia local.",
        keywords: ["clínica dimpleplastia", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "¿Cuánto dura el procedimiento de dimpleplastia y la estancia?",
        answer: "Duración del procedimiento: 20 a 40 minutos. Estancia recomendada: 3 a 5 días. Llegada: consulta preoperatoria. Día de la intervención: cirugía. Día 2-3: control postoperatorio antes del regreso.",
        keywords: ["duración dimpleplastia", "tiempo operación", "estancia clínica", "cuántos días"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "¿Los resultados de la dimpleplastia son permanentes?",
        answer: "Sí, los resultados son generalmente permanentes. Los hoyuelos pueden aparecer permanentemente al principio, luego volverse más naturales con el tiempo (visibles solo al sonreír).",
        keywords: ["resultados permanentes dimpleplastia", "durabilidad hoyuelos", "definitivo", "permanente"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "¿Cuáles son los riesgos o efectos secundarios de una dimpleplastia?",
        answer: "Hinchazón temporal, dolor leve, asimetría (raro), infección (muy rara con buena higiene).",
        keywords: ["riesgos dimpleplastia", "complicaciones", "efectos secundarios", "peligros hoyuelos"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "¿Cuál es el tiempo de recuperación después de una dimpleplastia?",
        answer: "Reanudación de actividades normales: 2 a 3 días. Resultado final: 4 a 6 semanas. Recomendaciones: evitar alimentos duros, mantener buena higiene bucal.",
        keywords: ["recuperación dimpleplastia", "convalecencia", "reanudar actividades", "tiempo curación"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "¿Soy una buena candidata para una genioplastia?",
        answer: "Debe gozar de buena salud general, no tener contraindicaciones quirúrgicas y presentar un mentón retraído, demasiado prominente o asimétrico. Se realizará una evaluación médica a partir de sus fotos y exámenes para confirmar su elegibilidad.",
        keywords: ["genioplastia", "cirugía mentón", "candidata genioplastia", "mentón retraído", "asimetría mentón"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "¿Qué exámenes debo hacerme antes de una genioplastia?",
        answer: "Se puede solicitar un análisis de sangre completo, una radiografía o una tomografía cefalométrica para analizar la estructura ósea de su mentón y planificar el procedimiento con precisión.",
        keywords: ["exámenes genioplastia", "análisis sangre", "escáner mentón", "radiografía"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "¿El cirujano está calificado para una genioplastia?",
        answer: "Sí, colaboramos únicamente con cirujanos maxilofaciales experimentados, especializados en cirugía de mentón y certificados por las autoridades médicas competentes.",
        keywords: ["cirujano genioplastia", "calificación", "cirujano maxilofacial", "experiencia mentón"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de genioplastia?",
        answer: "El procedimiento se realizará en una clínica acreditada que respeta las normas internacionales de higiene, equipamiento y seguridad.",
        keywords: ["clínica genioplastia", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "¿Cuánto dura la cirugía de genioplastia y la hospitalización?",
        answer: "La genioplastia dura en promedio entre 1 y 2 horas bajo anestesia general. Generalmente es necesaria una hospitalización de una noche para garantizar la vigilancia postoperatoria.",
        keywords: ["duración genioplastia", "tiempo operación", "hospitalización", "noche clínica"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "¿Cómo es el postoperatorio de una genioplastia?",
        answer: "Pueden aparecer hinchazón, hematomas y molestias temporales después de la intervención. Se recomienda una dieta blanda durante unos días. Puede ser necesario usar un vendaje de compresión.",
        keywords: ["postoperatorio genioplastia", "hinchazón", "hematomas", "dieta blanda"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "¿El tratamiento postoperatorio está incluido en la genioplastia?",
        answer: "Sí, los medicamentos necesarios (analgésicos, antibióticos), las consultas de seguimiento y los cuidados postoperatorios están incluidos en su paquete.",
        keywords: ["tratamiento postoperatorio", "medicamentos incluidos", "seguimiento genioplastia", "paquete"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos de una genioplastia?",
        answer: "Como cualquier procedimiento quirúrgico, la genioplastia conlleva riesgos como infección, sangrado o entumecimiento temporal. Estos son poco frecuentes y se toman todas las precauciones para minimizarlos.",
        keywords: ["riesgos genioplastia", "complicaciones", "peligros mentón", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "¿Quién será mi cirujano para el bypass gástrico?",
        answer: "La agencia debe proporcionar: el nombre completo del cirujano, su experiencia en cirugía bariátrica, número de procedimientos realizados, certificaciones y acreditaciones.",
        keywords: ["cirujano bypass gástrico", "calificaciones", "experiencia bariátrica", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de bypass gástrico?",
        answer: "La agencia debe proporcionar: el nombre de la clínica, su nivel de equipamiento, normas de higiene y seguridad, presencia de una unidad de cuidados intensivos.",
        keywords: ["clínica bypass gástrico", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "¿Qué exámenes necesito antes del bypass gástrico?",
        answer: "Lista completa de análisis (análisis de sangre, ECG, ecografía...), consulta con cirujano + anestesiólogo, posible dieta preoperatoria obligatoria.",
        keywords: ["exámenes bypass gástrico", "análisis sangre", "ECG", "consulta"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "¿Cuántos días estaré en la clínica después del bypass gástrico?",
        answer: "2 a 3 noches en clínica (promedio), 5 a 7 noches en hotel para recuperación, regreso posible después de validación médica.",
        keywords: ["hospitalización bypass gástrico", "noches clínica", "estancia", "recuperación"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "¿Cuáles son los riesgos asociados con el bypass gástrico?",
        answer: "Explicación clara de los posibles riesgos, manejo inmediato en el lugar si es necesario, seguimiento médico incluido en el paquete.",
        keywords: ["riesgos bypass gástrico", "complicaciones", "peligros", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "¿Me beneficiaré de un seguimiento nutricional después del bypass gástrico?",
        answer: "Plan dietético postoperatorio, seguimiento remoto con nutricionista, asistencia continua después del regreso.",
        keywords: ["seguimiento nutricional bypass gástrico", "dieta", "nutricionista", "alimentación"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "¿Soy una buena candidata para una manga gástrica?",
        answer: "Su elegibilidad depende de su IMC, antecedentes médicos y estado de salud general. Se realizará una evaluación preoperatoria completa a su llegada (análisis de sangre, ECG, ecografía abdominal, etc.) para que el cirujano pueda confirmar si el procedimiento se puede realizar de manera segura.",
        keywords: ["manga gástrica", "candidata manga", "cirugía bariátrica", "pérdida peso", "obesidad"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "¿Quién será mi cirujano para la manga gástrica y cuáles son sus calificaciones?",
        answer: "La agencia debe proporcionarle: el nombre del cirujano, su experiencia en cirugía bariátrica, número de procedimientos realizados, acreditaciones y formación internacional. Se programmeará una consulta con el cirujano antes de la operación para discutir sus expectativas y validar el protocolo quirúrgico.",
        keywords: ["cirujano manga gástrica", "calificaciones", "experiencia bariátrica", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de manga gástrica?",
        answer: "El procedimiento se realiza en una clínica acreditada que respeta las normas internacionales de higiene y seguridad, equipada con un quirófano moderno y unidad de cuidados intensivos si es necesario.",
        keywords: ["clínica manga gástrica", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "¿Qué seguimiento está previsto después de la cirugía de manga gástrica?",
        answer: "El seguimiento incluye: visitas médicas postoperatorias, asistencia nutricional, medicación, recomendaciones dietéticas, seguimiento remoto después de su regreso a su país (WhatsApp / email).",
        keywords: ["seguimiento manga gástrica", "postoperatorio", "nutrición", "asistencia"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos o complicaciones de una manga gástrica?",
        answer: "Como cualquier cirugía, la manga gástrica conlleva riesgos potenciales como: infección, sangrado, fuga gástrica, deficiencias nutricionales. Se toman todas las precauciones para minimizar estos riesgos y se garantiza una vigilancia médica continua durante su hospitalización.",
        keywords: ["riesgos manga gástrica", "complicaciones", "peligros", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "¿Recibiré un programmea alimenticio después de la cirugía de manga gástrica?",
        answer: "Sí, se le proporcionará un plan nutricional progresivo (líquido → puré → sólido) así como consejos dietéticos para asegurar una pérdida de peso saludable y sostenible.",
        keywords: ["dieta manga gástrica", "plan nutricional", "consejos dietéticos", "alimentación"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "¿Trabajan con cirujanos especializados en cirugía de cataratas?",
        answer: "Sí, colaboramos con oftalmólogos altamente calificados, especializados en cirugía de cataratas, que ejercen en clínicas acreditadas que respetan las normas internacionales de higiene y seguridad.",
        keywords: ["cataratas", "cirugía cataratas", "oftalmólogo", "especialista cataratas"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "¿Qué técnica se utiliza para la cirugía de cataratas?",
        answer: "La cirugía se realiza mediante facoemulsificación, una técnica moderna, rápida y mínimamente invasiva, que permite extraer el cristalino opacificado y reemplazarlo por un lente intraocular (implante).",
        keywords: ["técnica cataratas", "facoemulsificación", "lente intraocular", "implante"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "¿Qué tipo de implante intraocular se ofrece para cataratas?",
        answer: "Ofrecemos diferentes tipos de implantes: monofocal (visión de lejos), multifocal (visión de lejos y cerca), tórico (corrige el astigmatismo). La elección se determinará después de una evaluación oftalmológica completa realizada en el lugar.",
        keywords: ["implantes cataratas", "monofocal", "multifocal", "tórico", "lentes"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos o complicaciones de la cirugía de cataratas?",
        answer: "La cirugía de cataratas es un procedimiento seguro con una tasa de éxito muy alta. Como cualquier intervención, existen ciertos riesgos (infección, inflamación...), pero son poco frecuentes y son manejados por el equipo médico.",
        keywords: ["riesgos cataratas", "complicaciones", "peligros", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "¿Cuándo puedo tomar el avión de regreso después de una cirugía de cataratas?",
        answer: "Generalmente puede tomar el avión de regreso 24 a 48 horas después del procedimiento, después de la validación del cirujano durante el control postoperatorio.",
        keywords: ["vuelo regreso cataratas", "vuelo", "autorización", "plazo"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "¿Cuánto dura la recuperación después de una cirugía de cataratas?",
        answer: "La mejora de la visión es generalmente rápida, desde los primeros días. La recuperación completa puede tomar algunas semanas.",
        keywords: ["recuperación cataratas", "visión", "tiempo curación", "convalecencia"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "¿Soy una buena candidata para una braquioplastia?",
        answer: "Puede ser una buena candidata si: tiene flacidez cutánea significativa en los brazos (a menudo después de pérdida de peso o envejecimiento), su peso ha sido estable durante al menos 3 a 6 meses, goza de buena salud general y no fuma (o está dispuesta a dejar de fumar antes y después de la cirugía), tiene expectativas realistas sobre las cicatrices y resultados.",
        keywords: ["braquioplastia", "lifting brazos", "candidata braquioplastia", "flacidez brazos", "cirugía brazos"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "¿El cirujano está calificado y tiene experiencia en braquioplastia?",
        answer: "El cirujano está especializado en cirugía plástica y reconstructiva. Tiene experiencia confirmada en braquioplastia. Se pueden proporcionar fotos antes/después de pacientes que se han sometido al mismo procedimiento. Se organizará una consulta preoperatoria a su llegada para validar su elegibilidad.",
        keywords: ["cirujano braquioplastia", "calificaciones", "experiencia brazos", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de braquioplastia?",
        answer: "El procedimiento se realiza en una clínica acreditada que respeta las normas internacionales de higiene y seguridad. El quirófano está equipado para cirugía estética. El procedimiento se realiza bajo anestesia general con un anestesiólogo calificado.",
        keywords: ["clínica braquioplastia", "instalación", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "¿Cuál es el cronograma de la estancia médica para una braquioplastia?",
        answer: "Su itinerario debe estar claramente detallado: Día 1: Llegada + traslado al hotel, Día 2: Análisis médicos + consulta con el cirujano, Día 3: Procedimiento quirúrgico, 1 a 2 noches de hospitalización en clínica, Regreso al hotel con seguimiento de enfermería, Sesiones de fisioterapia / drenaje linfático, Consultas postoperatorias, Autorización para volar después de validación médica (generalmente 7 a 10 días).",
        keywords: ["itinerario braquioplastia", "cronograma", "estancia", "pasos"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "¿Cuáles son los posibles riesgos y complicaciones de una braquioplastia?",
        answer: "Como cualquier cirugía, la braquioplastia conlleva ciertos riesgos: infección, hematoma, retraso en la cicatrización, cicatrices visibles, asimetría, entumecimiento temporal. Se toman todas las precauciones para minimizar estos riesgos.",
        keywords: ["riesgos braquioplastia", "complicaciones", "peligros brazos", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "¿Serán visibles las cicatrices después de una braquioplastia?",
        answer: "La cicatriz generalmente se encuentra en la parte interna del brazo. Es permanente pero se desvanece con el tiempo. Se pueden incluir cuidados de cicatrices y sesiones de fisioterapia para optimizar la curación.",
        keywords: ["cicatrices braquioplastia", "visibilidad", "cuidado cicatrices", "parte interna brazo"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "¿Qué incluye el seguimiento postoperatorio de una braquioplastia?",
        answer: "Medicamentos postoperatorios, prenda de compresión, cuidados de enfermería, drenaje linfático / fisioterapia, consultas de control, asistencia 24/7 con su coordinadora durante toda su estancia.",
        keywords: ["seguimiento braquioplastia", "incluido", "cuidados", "asistencia"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "¿Soy una buena candidata para el LASIK?",
        answer: "Se realizará una evaluación preoperatoria completa a su llegada. Incluye: topografía corneal, paquimetría (grosor de la córnea), prueba de ojo seco, análisis de refracción. El cirujano confirmará si el LASIK es adecuado o propondrá una alternativa (PRK o SMILE si es necesario).",
        keywords: ["LASIK", "candidata LASIK", "cirugía ojos", "corrección visión", "miopía"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿Quién es el cirujano y cuál es su experiencia en LASIK?",
        answer: "Su procedimiento será realizado por un oftalmólogo especializado en cirugía refractiva. El médico tiene experiencia significativa en LASIK y ha realizado un gran número de procedimientos con éxito. Está certificado y ejerce en una clínica acreditada.",
        keywords: ["cirujano LASIK", "oftalmólogo", "experiencia", "calificaciones"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento LASIK?",
        answer: "La cirugía se realiza en una clínica especializada en oftalmología equipada con tecnología láser de última generación. La clínica respeta estrictas normas internacionales de higiene y seguridad.",
        keywords: ["clínica LASIK", "tecnología láser", "instalación", "normas seguridad"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿Qué tecnología LASIK utilizan?",
        answer: "El procedimiento utiliza un láser femtosegundo para la creación del flap. El remodelado corneal se realiza con un láser excimer de alta precisión. La técnica se personaliza según su perfil visual.",
        keywords: ["tecnología LASIK", "láser femtosegundo", "láser excimer", "técnica"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿Cuál es el cronograma de la estancia médica para LASIK?",
        answer: "Día 1: Llegada + traslado al hotel, Día 2: Consulta preoperatoria + exámenes, Día 3: Procedimiento LASIK, Día 4: Control postoperatorio, Posible regreso en 3 a 5 días según validación del cirujano.",
        keywords: ["itinerario LASIK", "cronograma", "estancia", "pasos"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿Cuánto dura el procedimiento LASIK?",
        answer: "El procedimiento dura aproximadamente 10 a 15 minutos para ambos ojos. Se realiza bajo anestesia local con gotas oculares.",
        keywords: ["duración LASIK", "tiempo operación", "cuánto tiempo", "anestesia local"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿Es dolorosa la recuperación después del LASIK?",
        answer: "Se puede sentir una ligera molestia durante 24 a 48 horas. La visión generalmente mejora al día siguiente. La recuperación completa puede tomar algunas semanas.",
        keywords: ["recuperación LASIK", "dolor", "visión", "tiempo recuperación"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿Cuándo puedo tomar el avión de regreso y volver al trabajo después del LASIK?",
        answer: "El vuelo de regreso está autorizado después del control postoperatorio. El regreso al trabajo es posible después de 3 a 5 días según su comodidad visual.",
        keywords: ["vuelo regreso LASIK", "volver trabajo", "vuelo", "autorización"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿Qué cuidados postoperatorios están incluidos en el paquete LASIK?",
        answer: "Medicamentos (gotas antibióticas e hidratantes), gafas de protección si son necesarias, consulta de seguimiento antes de la partida, asistencia 24/7 con su coordinadora.",
        keywords: ["cuidados LASIK", "gotas", "seguimiento", "incluido"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "¿Soy una buena candidata para una cruroplastia (lifting de muslos)?",
        answer: "Generalmente es elegible si presenta: flacidez cutánea en los muslos, pérdida de volumen después de adelgazamiento o embarazo, piel que ya no se tensa a pesar del ejercicio, peso estable durante al menos 6 meses. Es obligatoria una evaluación médica previa con el cirujano para confirmar la indicación quirúrgica.",
        keywords: ["cruroplastia", "lifting muslos", "candidata cruroplastia", "flacidez muslos", "cirugía muslos"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "¿Quién es el cirujano que realizará mi cruroplastia?",
        answer: "La agencia debe proporcionar: el nombre del cirujano, sus certificaciones, experiencia en cirugía corporal, fotos antes/después de pacientes que se han sometido a cruroplastia.",
        keywords: ["cirujano cruroplastia", "cirujano lifting muslos", "experiencia muslos", "perfil cirujano"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "¿En qué clínica se realizará el procedimiento de cruroplastia?",
        answer: "La agencia debe especificar: el nombre de la clínica, las normas de higiene y seguridad, la acreditación del establecimiento, si hay una unidad de cuidados intensivos disponible en caso necesario.",
        keywords: ["clínica cruroplastia", "clínica lifting muslos", "clínica acreditada", "normas seguridad"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "¿Qué exámenes debo realizarme antes de una cruroplastia?",
        answer: "Sí, se requiere una evaluación preoperatoria que incluye: análisis de sangre, ECG, consulta con el anestesiólogo. Estos exámenes pueden realizarse a su llegada a Túnez.",
        keywords: ["exámenes cruroplastia", "exámenes lifting muslos", "análisis sangre", "ECG", "anestesiólogo"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "¿Cuánto tiempo estaré en la clínica después de una cruroplastia?",
        answer: "La duración de la estancia en la clínica es generalmente de 1 a 2 noches bajo supervisión médica.",
        keywords: ["hospitalización cruroplastia", "estancia lifting muslos", "noches clínica", "supervisión"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "¿Qué sucede después de mi salida de la clínica tras una cruroplastia?",
        answer: "La agencia debe incluir: traslado clínica → hotel, seguimiento postoperatorio, visitas de control, cuidados de enfermería si son necesarios.",
        keywords: ["salida clínica", "traslado hotel", "seguimiento", "cuidados enfermería"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "¿Necesitaré cuidados postoperatorios después de una cruroplastia?",
        answer: "Sí, los cuidados postoperatorios incluyen: vendajes, uso de prenda de compresión, sesiones de drenaje linfático para reducir la hinchazón y favorecer la cicatrización.",
        keywords: ["cuidados postoperatorios", "prenda compresión", "drenaje linfático", "cicatrización"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "¿Cuánto tiempo debo quedarme en Túnez para una cruroplastia?",
        answer: "La estancia recomendada es generalmente de 7 a 10 días para garantizar: seguimiento postoperatorio, retiro de drenajes si es necesario, validación médica antes del regreso.",
        keywords: ["duración estancia", "cuántos días", "retiro drenajes", "validación regreso"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "¿Cuáles son los riesgos asociados a una cruroplastia?",
        answer: "La agencia debe informar sobre: infección, hematoma, retraso en la cicatrización, edema temporal. Y tranquilizar que se garantiza un seguimiento médico durante toda la estancia.",
        keywords: ["riesgos cruroplastia", "riesgos lifting muslos", "complicaciones", "efectos secundarios"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "feedback_si",
        answer: "¡Gracias! 😊",
        keywords: ["feedback_si"]
      },
      {
        question: "feedback_no",
        answer: `<a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">Contacte a un agente de TuniCure al (+44) 7403904850</a>`,
        keywords: ["feedback_no"]
      },
      {
        question: "feedback_invalid",
        answer: "Por favor, responda 'sí' o 'no'.",
        keywords: ["feedback_invalid"]
      },
      {
        question: "feedback_timeout",
        answer: "¡Sigo aquí si tienes más preguntas! 😊",
        keywords: ["feedback_timeout"]
      }

    ],
    pt: [
      {
        question: "olá",
        answer: "Olá! 👋 Bem-vinda à TuniCure. Como posso ajudá-la hoje?",
        keywords: ["olá", "oi", "bom dia", "boa tarde"],
      },
      {
        question: "o que é gonioplastia",
        answer: "A gonioplastia é um procedimento cirúrgico que suaviza e afina os ângulos da mandíbula remodelando o osso mandibular, para obter características faciais mais femininas, harmoniosas e equilibradas.",
        keywords: ["gonioplastia", "cirurgia de mandíbula", "feminização facial", "contorno mandibular"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      // Tummy Tuck
      {
        question: "O que é um Tummy Tuck (Abdominoplastia)?",
        answer: "O Tummy Tuck (abdominoplastia) é um procedimento cirúrgico que remove o excesso de pele e gordura da parede abdominal e aperta os músculos abdominais para obter uma barriga mais plana e firme.",
        keywords: ["tummy tuck", "abdominoplastia", "barriga lisa", "cirurgia abdominal", "ventre"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },

      // Body Lift
      {
        question: "O que é um Body Lift?",
        answer: "O Body Lift é um procedimento cirúrgico abrangente que remodela e firma várias áreas do corpo (abdômen, nádegas, coxas) em uma única operação. É ideal após uma perda significativa de peso.",
        keywords: ["body lift", "lifting corporal", "cirurgia corporal completa", "pós perda de peso"],
        imageUrl: "assets/img/chatbot/Body-Lift.png"
      },

      // Buttock Augmentation
      {
        question: "O que é a Buttock Augmentation?",
        answer: "A Buttock Augmentation (aumento de nádegas) é um procedimento cirúrgico que aumenta o volume e melhora a forma das nádegas, seja com implantes ou transferência de gordura (BBL).",
        keywords: ["buttock augmentation", "aumento de nádegas", "implantes glúteos", "BBL", "nádegas"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },

      // Breast Augmentation
      {
        question: "O que é a Breast Augmentation?",
        answer: "A Breast Augmentation (aumento mamário) é um procedimento cirúrgico que aumenta o tamanho e melhora a forma dos seios usando implantes mamários ou transferência de gordura.",
        keywords: ["breast augmentation", "aumento mamário", "implantes mamários", "seios", "busto"],
        imageUrl: "assets/img/chatbot/Breast-Augmentation.png"
      },

      // Breast Reduction
      {
        question: "O que é a Breast Reduction?",
        answer: "A Breast Reduction (redução mamária) é um procedimento cirúrgico que reduz o tamanho dos seios removendo o excesso de tecido adiposo, glandular e cutâneo para aliviar dores nas costas e melhorar a proporção corporal.",
        keywords: ["breast reduction", "redução mamária", "seios grandes", "alívio dor costas"],
        imageUrl: "assets/img/chatbot/Breast-Reduction.png"
      },

      // Mastopexy / Breast Lift
      {
        question: "O que é uma Mastopexy (Breast Lift)?",
        answer: "A Mastopexy (lifting mamário) é um procedimento cirúrgico que eleva e firma os seios caídos removendo o excesso de pele e apertando o tecido circundante, sem alterar significativamente o tamanho dos seios.",
        keywords: ["mastopexy", "breast lift", "lifting mamário", "seios caídos", "ptose mamária"],
        imageUrl: "assets/img/chatbot/Mastopexy-Breast-Lift.png"
      },

      // Breast Reconstruction
      {
        question: "O que é a Breast Reconstruction?",
        answer: "A Breast Reconstruction (reconstrução mamária) é um procedimento cirúrgico que restaura a forma, o volume e a aparência da mama após uma mastectomia (remoção da mama) por razões médicas.",
        keywords: ["breast reconstruction", "reconstrução mamária", "pós mastectomia", "câncer de mama"],
        imageUrl: "assets/img/chatbot/Breast-Reconstruction.png"
      },

      // Breast Implant Exchange / Removal
      {
        question: "O que é a troca ou remoção de implantes mamários?",
        answer: "A troca ou remoção de implantes mamários é um procedimento cirúrgico que substitui implantes existentes por novos, ou os remove completamente, muitas vezes por razões médicas, estéticas ou pessoais.",
        keywords: ["breast implant exchange", "remoção de implantes", "troca de implantes", "explantação"],
        imageUrl: "assets/img/chatbot/Breast-Implant-Exchange-Removal.png"
      },

      // Laser Vaginal Rejuvenation
      {
        question: "O que é a Laser Vaginal Rejuvenation?",
        answer: "A Laser Vaginal Rejuvenation (rejuvenescimento vaginal a laser) é um procedimento não cirúrgico que utiliza tecnologia laser para tratar a laxidez vaginal, incontinência urinária leve e melhorar a função sexual após o parto ou com a idade.",
        keywords: ["laser vaginal rejuvenation", "rejuvenescimento vaginal", "aperto vaginal", "incontinência"],
        imageUrl: "assets/img/chatbot/Laser-Vaginal-Rejuvenation.png"
      },
      // Ajoutez ces questions générales manquantes
      {
        question: "como marcar consulta",
        answer: `Pode marcar consulta de duas formas:
  
📞 **Por telefone**: +44 7403904850
📝 **Online**: <a href="${this.orderPageLink}" class="chat-link-order">Clique aqui para preencher o formulário de solicitação</a>

Nossa equipe entrará em contato o mais breve possível para confirmar sua consulta.`,
        keywords: ["consulta", "marcar consulta", "como agendar", "marcação", "agendamento"]
      },
      {
        question: "quais procedimentos oferecem",
        answer: "Oferecemos os seguintes procedimentos:\n\n• Rinoplastia (clássica e Piezo)\n• Lipoaspiração\n• Gonioplastia\n• Mommy Makeover\n• Tummy Tuck (Abdominoplastia)\n• Body Lift\n• Aumento mamário\n• Redução mamária\n• Lifting mamário (Mastopexy)\n• BBL (Brazilian Butt Lift)\n• Transplante capilar\n• Blefaroplastia\n• Avanço da linha frontal\n• Laser Vaginal Rejuvenation\n• Sleeve gástrico\n\nTambém oferecemos muitos outros procedimentos adaptados às suas necessidades.",
        keywords: ["procedimentos", "tratamentos", "cirurgias", "operações", "serviços"]
      },

      // Ajoutez les questions sur les procédures existantes en français mais manquantes en portugais
      {
        question: "quanto tempo dura a cirurgia de gonioplastia",
        answer: "A cirurgia geralmente dura 1,5 a 3 horas. É recomendada uma internação de 1 a 2 noites na clínica para monitoramento ideal.",
        keywords: ["duração gonioplastia", "tempo cirurgia", "quanto dura gonioplastia", "duração operação"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "a gonioplastia é combinada com outros procedimentos",
        answer: "Sim, pode ser realizada sozinha ou integrada em um programmea completo de feminização facial, em combinação com queixo, maçãs do rosto, testa, nariz ou tecidos moles, dependendo dos seus objetivos.",
        keywords: ["combinação gonioplastia", "cirurgia combinada", "múltiplos procedimentos", "programmea feminização facial"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "qual é o tempo de recuperação para rinoplastia",
        answer: "A recuperação completa após uma rinoplastia leva cerca de 1 ano, mas você pode retomar suas atividades normais após 2-3 semanas.",
        keywords: ["recuperação rinoplastia", "tempo cura", "período recuperação", "voltar ao trabalho"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "qual é o tempo de recuperação para lipoaspiração",
        answer: "As atividades leves podem ser retomadas após 7-10 dias. Esportes e exercícios físicos geralmente são permitidos após 4-6 semanas, dependendo da evolução.",
        keywords: ["recuperação lipoaspiração", "cura lipoaspiração", "linha do tempo recuperação", "retorno atividades"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "quais áreas podem ser tratadas com mommy makeover",
        answer: "O programmea é totalmente personalizado e pode incluir: Tummy tuck (com ou sem reparo muscular), Lifting mamário (com ou sem implantes), Lipoaspiração direcionada (abdômen, flancos, costas, quadris). O cirurgião definirá a combinação mais adequada aos seus objetivos.",
        keywords: ["áreas mommy makeover", "zonas tratamento", "partes corpo tratadas", "áreas alvo"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "quanto tempo devo ficar após a cirurgia mommy makeover",
        answer: "Uma estadia de 10 a 14 noites é recomendada para garantir um acompanhamento pós-operatório completo e seguro antes do seu retorno.",
        keywords: ["duração estadia", "quanto tempo ficar", "estadia recuperação", "estadia pós-operatória"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },

      // Ajoutez les questions pour les procédures qui ont des images en français
      {
        question: "o que é mommy makeover",
        answer: "O Mommy Makeover é um conjunto de intervenções personalizadas que visam restaurar a silhueta após uma ou mais gravidezes. Geralmente combina uma abdominoplastia (tummy tuck), cirurgia mamária (lifting, aumento ou redução) e às vezes lipoaspiração.",
        keywords: ["mommy makeover", "após gravidez", "recuperação pós-parto", "cirurgia pós-parto"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "o que é rinoplastia",
        answer: "A rinoplastia é uma intervenção cirúrgica que visa melhorar a forma do nariz e/ou a respiração, respeitando a harmonia do rosto e seus traços naturais.",
        keywords: ["rinoplastia", "cirurgia nariz", "nariz", "remodelação nariz"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "o que é lipoaspiração",
        answer: "A lipoaspiração é uma intervenção cirúrgica que visa eliminar os depósitos de gordura localizados resistentes ao esporte e à alimentação, para afinar e redesenhar a silhueta.",
        keywords: ["lipoaspiração", "liposuccion", "gordura localizada", "silhueta", "cirurgia gordura"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "Que tipo de tummy tuck é adequado para mim (completo, mini, com reparo muscular)?",
        answer: "O cirurgião explicará a técnica mais adequada à sua morfologia e objetivos após avaliação completa durante a consulta pré-operatória.",
        keywords: ["tipo tummy tuck", "tummy tuck completo", "tummy tuck mini", "reparo muscular", "qual tummy tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Quantas noites ficarei na clínica após um tummy tuck?",
        answer: "Geralmente de 2 a 3 noites na clínica para monitoramento médico ideal após o procedimento.",
        keywords: ["noites clínica", "hospitalização tummy tuck", "duração estadia clínica", "quantas noites"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "O hotel fica perto da clínica?",
        answer: "Sim, a acomodação é selecionada perto da clínica para facilitar o transporte e garantir seu conforto durante o período de recuperação.",
        keywords: ["hotel perto", "proximidade clínica", "hospedagem perto clínica", "acomodação"],
        imageUrl: "assets/img/chatbot/Accommodation.png"
      },
      {
        question: "A cinta de compressão está incluída após um tummy tuck?",
        answer: "Sim, uma cinta pós-operatória é fornecida ou prescrita e seu uso está incluído no acompanhamento pós-operatório.",
        keywords: ["cinta pós-operatória", "compressão tummy tuck", "roupa compressão", "vestuário compressão"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Sessões de fisioterapia ou drenagem linfática estão incluídas?",
        answer: "Sim, dependendo do pacote escolhido, sessões de drenagem linfática ou fisioterapia estão incluídas ou oferecidas como opção para otimizar sua recuperação.",
        keywords: ["fisioterapia", "drenagem linfática", "sessões recuperação", "reabilitação"],
        imageUrl: "assets/img/chatbot/Post-Op-Care.png"
      },
      {
        question: "Onde ficará localizada a cicatriz após um tummy tuck?",
        answer: "A cicatriz é colocada baixa, geralmente no nível do biquíni, discretamente escondida sob a roupa íntima. O cirurgião explicará sua evolução e os cuidados necessários.",
        keywords: ["cicatriz tummy tuck", "localização cicatriz", "cicatriz abdominoplastia", "cicatrização"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "O que acontece em caso de complicações?",
        answer: "Em caso de complicações, a agência garante acompanhamento médico imediato, acesso ao cirurgião e gerenciamento conforme protocolos médicos estabelecidos, com assistência 24/7.",
        keywords: ["complicações", "problemas pós-operatórios", "emergência médica", "assistência complicações"],
        imageUrl: "assets/img/chatbot/Emergency-en.png"
      },
      {
        question: "Terei assistência no local?",
        answer: "Sim, um coordenador médico está disponível 24 horas por dia durante toda sua estadia para auxiliá-lo e atender suas necessidades.",
        keywords: ["assistência local", "coordenador médico", "ajuda local", "suporte"],
        imageUrl: "assets/img/chatbot/Assistance.png"
      },
      {
        question: "Sou uma boa candidata para blefaroplastia superior e inferior?",
        answer: "Após revisar suas fotos, idade, qualidade da pele e histórico médico, o cirurgião confirmará sua elegibilidade para blefaroplastia de pálpebras superiores e inferiores.",
        keywords: ["blefaroplastia", "pálpebras", "olhos", "candidata blefaroplastia", "superior inferior"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Qual técnica será usada para pálpebras superiores e inferiores?",
        answer: "O cirurgião explicará a técnica apropriada: incisão na dobra natural da pálpebra superior, e incisão sob os cílios ou abordagem transconjuntival para a pálpebra inferior, dependendo do seu caso.",
        keywords: ["técnica blefaroplastia", "pálpebras superiores", "pálpebras inferiores", "método"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Preciso ficar hospitalizada após blefaroplastia?",
        answer: "Na maioria dos casos, é cirurgia ambulatorial. Uma noite pode ser recomendada dependendo do seu estado geral e opinião do cirurgião.",
        keywords: ["hospitalização blefaroplastia", "noite clínica", "ambulatorial", "estadia clínica"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Quais são os efeitos após blefaroplastia (inchaço, hematomas)?",
        answer: "Inchaço e hematomas são normais após o procedimento e diminuem gradualmente em 10 a 15 dias. Compressas frias são recomendadas nos primeiros dias.",
        keywords: ["inchaço pálpebras", "hematomas olhos", "efeitos colaterais", "recuperação blefaroplastia"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Quando posso retomar atividades normais após blefaroplastia?",
        answer: "Geralmente após 7 a 10 dias para atividades leves, dependendo do seu progresso e velocidade de recuperação.",
        keywords: ["retomar atividades", "tempo recuperação", "retorno trabalho", "convalescença"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Onde ficarão localizadas as cicatrizes após blefaroplastia?",
        answer: "As cicatrizes são muito discretas: na dobra natural da pálpebra superior, e sob os cílios ou dentro da pálpebra inferior, dependendo da técnica usada.",
        keywords: ["cicatrizes pálpebras", "cicatrização olhos", "cicatrizes discretas", "localização cicatrizes"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Sou uma boa candidata para transplante capilar?",
        answer: "Sim, após análise personalizada baseada em suas fotos, histórico médico, tipo de queda de cabelo e qualidade da área doadora. Uma consulta com o médico é obrigatória antes da confirmação.",
        keywords: ["candidata transplante", "elegibilidade transplante", "boa candidata", "qualificação transplante"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "É feito um diagnóstico médico antes da minha chegada para transplante capilar?",
        answer: "Sim. É realizada uma pré-avaliação remota (fotos + questionário médico), depois uma consulta final na clínica antes do procedimento para confirmar o diagnóstico.",
        keywords: ["diagnóstico transplante", "avaliação prévia", "análise fotos", "consulta prévia"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Qual técnica será usada para transplante capilar (FUE, DHI, Sapphire) e por quê?",
        answer: "A escolha depende do seu caso: FUE (técnica mais usada, natural e minimamente invasiva), DHI (implantação direta) ou Sapphire FUE (cicatrização mais rápida). O médico escolhe a técnica mais adequada ao seu couro cabeludo e objetivos.",
        keywords: ["técnica transplante", "fue", "dhi", "sapphire", "método transplante"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Quem realiza exatamente o transplante capilar?",
        answer: "O transplante é realizado por um médico especializado em transplante capilar, assistido por uma equipe médica qualificada. O médico intervém pessoalmente nas etapas-chave (design, extração, implantação).",
        keywords: ["médico transplante", "equipe médica", "especialista transplante", "quem realiza"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Quantos enxertos receberei durante um transplante capilar?",
        answer: "O número exato é confirmado após análise médica. Em média, varia entre 1.500 e 4.000 enxertos, dependendo da densidade desejada e área a tratar.",
        keywords: ["número enxertos", "quantidade cabelo", "enxertos", "densidade"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "O resultado de um transplante capilar será natural?",
        answer: "Sim. A linha frontal é desenhada sob medida, respeitando sua morfologia e a implantação natural do cabelo para um resultado harmonioso e natural.",
        keywords: ["resultado natural", "aparência natural", "harmonia", "design frontal"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Um transplante capilar é doloroso?",
        answer: "Não. O procedimento é feito sob anestesia local. Você pode sentir um leve desconforto durante a anestesia, mas nenhuma dor significativa durante o procedimento.",
        keywords: ["dor transplante", "desconforto", "anestesia local", "conforto"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Hospedagem e traslados estão incluídos para transplante capilar?",
        answer: "Sim. O pacote inclui: traslados aeroporto - hotel - clínica, hotel (3 a 5 estrelas dependendo do pacote), assistência e apoio durante toda sua estadia.",
        keywords: ["hospedagem transplante", "traslados incluídos", "pacote completo", "logística"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "O que acontece após um transplante capilar?",
        answer: "Você se beneficia de: medicamentos pós-operatórios, primeira lavagem na clínica, instruções detalhadas e acompanhamento remoto durante vários meses.",
        keywords: ["após transplante", "cuidados pós-operatórios", "acompanhamento", "recuperação"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Há um período de queda do cabelo após um transplante?",
        answer: "Sim. A queda temporária (shock loss) é normal entre 2 e 6 semanas. O cabelo volta a crescer gradualmente a partir do 3º mês.",
        keywords: ["queda temporária", "shock loss", "queda cabelo", "fase queda"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Quando verei os resultados definitivos de um transplante capilar?",
        answer: "Primeiros sinais: 3-4 meses, resultado visível: 6 meses, resultado final: 12 meses após o procedimento.",
        keywords: ["resultados definitivos", "prazo resultados", "evolução crescimento", "tempo crescimento"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "O que inclui exatamente o preço de um transplante capilar?",
        answer: "O preço inclui: transplante capilar, honorários médicos, medicamentos, hotel, traslados e acompanhamento pós-operatório. Sem custos ocultos.",
        keywords: ["preço transplante", "incluído preço", "custo", "transparência"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Há garantia para transplante capilar?",
        answer: "Sim, a agência garante a qualidade do atendimento e acompanhamento médico. Alguns centros também oferecem garantia de enxertos.",
        keywords: ["garantia transplante", "asseguração qualidade", "compromisso", "segurança"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Sou uma boa candidata para avanço da linha frontal?",
        answer: "Uma avaliação é feita a partir de suas fotos, altura da testa, elasticidade do couro cabeludo, densidade capilar e ausência de queda ativa de cabelo. O cirurgião confirmará a elegibilidade durante a consulta.",
        keywords: ["avanço linha frontal", "linha capilar", "testa", "candidata linha frontal"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Há contraindicações para o avanço da linha frontal?",
        answer: "Histórico de queda severa de cabelo, alopecia progressiva, cicatrização difícil ou doenças do couro cabeludo devem ser relatados e avaliados pelo cirurgião.",
        keywords: ["contraindicações", "contraindicação linha frontal", "riscos", "precauções"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Quem realizará o avanço da linha frontal e quais são suas qualificações?",
        answer: "Um cirurgião especializado em cirurgia estética e cirurgia do couro cabeludo, com experiência confirmada em avanço de linha frontal.",
        keywords: ["cirurgião linha frontal", "qualificações", "especialista", "experiência"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "A clínica é certificada para avanço de linha frontal?",
        answer: "Sim, a cirurgia é realizada em uma clínica certificada, respeitando normas internacionais de higiene e segurança.",
        keywords: ["clínica certificada", "certificação", "normas segurança", "qualidade"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Qual técnica será usada para avanço de linha frontal?",
        answer: "Avanço cirúrgico da linha frontal com incisão discreta no nível da linha capilar, permitindo a descida natural da testa.",
        keywords: ["técnica linha frontal", "método avanço", "cirurgia linha frontal", "procedimento"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Quantos centímetros pode-se avançar a linha frontal?",
        answer: "Em média entre 1.5 e 3 cm, dependendo da elasticidade do couro cabeludo e sua morfologia de testa.",
        keywords: ["centímetros avanço", "descida testa", "distância", "medição"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "O avanço da linha frontal deixa uma cicatriz visível?",
        answer: "A cicatriz é colocada dentro da linha capilar e geralmente se torna muito discreta com o tempo, escondida pelo cabelo.",
        keywords: ["cicatriz linha frontal", "visibilidade cicatriz", "cicatrização", "cicatriz discreta"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Que tipo de anestesia é usada para avanço de linha frontal?",
        answer: "Anestesia geral ou anestesia local com sedação, dependendo do caso e opinião do cirurgião após avaliação pré-operatória.",
        keywords: ["anestesia linha frontal", "tipo anestesia", "sedação", "anestesia geral"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "É necessária uma estadia na clínica após avanço de linha frontal?",
        answer: "Geralmente 1 noite na clínica para monitoramento, depois traslado ao hotel para o resto da convalescença.",
        keywords: ["estadia clínica", "noite clínica", "hospitalização", "monitoramento"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "A dor é significativa após o avanço da linha frontal?",
        answer: "A dor é geralmente moderada e bem controlada pelos tratamentos prescritos. Pode-se sentir algum desconforto nos primeiros dias.",
        keywords: ["dor linha frontal", "desconforto", "incômodo pós-operatório", "analgésicos"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Haverá inchaço ou hematomas após o avanço da linha frontal?",
        answer: "Sim, edema da testa e às vezes inchaço das pálpebras são comuns nos primeiros dias e desaparecem gradualmente em aproximadamente uma semana.",
        keywords: ["inchaço linha frontal", "hematomas", "edema testa", "manchas roxas"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "O resultado do avanço da linha frontal é permanente?",
        answer: "Sim, o avanço da linha frontal é permanente, sujeito à estabilidade capilar e ausência de queda progressiva de cabelo.",
        keywords: ["linha frontal permanente", "definitivo", "durabilidade", "resultado duradouro"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Sou uma boa candidata para um Lip Lift?",
        answer: "Antes de qualquer confirmação, sua elegibilidade será avaliada pelo cirurgião a partir de suas fotos médicas e histórico de saúde. O Lip Lift é geralmente recomendado para pacientes que apresentam: lábio superior fino ou alongado, espaço significativo entre o nariz e o lábio superior, falta de definição do arco do cupido. Uma consulta pré-operatória com o cirurgião será organizada à sua chegada para confirmar a indicação.",
        keywords: ["lip lift", "candidata lip lift", "elegibilidade lip lift", "boa candidata lip lift", "lifting lábio"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Qual é a qualificação e experiência do cirurgião para Lip Lift?",
        answer: "Colaboramos apenas com cirurgiões especializados em cirurgia estética facial, certificados e experientes no procedimento de Lip Lift. Você receberá: o perfil do cirurgião, seus anos de experiência, fotos antes/depois de casos semelhantes, antes de confirmar sua estadia.",
        keywords: ["qualificação cirurgião lip lift", "experiência cirurgião", "cirurgião lip lift", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de Lip Lift?",
        answer: "Seu procedimento será realizado em uma clínica acreditada que respeita as normas internacionais de higiene e segurança, equipada com um bloco cirúrgico moderno e equipe médica qualificada.",
        keywords: ["clínica lip lift", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Qual técnica será usada para meu Lip Lift?",
        answer: "A técnica mais comumente usada é o Lip Lift subnasal (técnica Bullhorn). O cirurgião explicará: a técnica adaptada à sua morfologia, a localização da cicatriz (oculta sob a base do nariz), o resultado esperado durante a consulta pré-operatória.",
        keywords: ["técnica lip lift", "técnica bullhorn", "lip lift subnasal", "método lip lift"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Que tipo de anestesia será usada para Lip Lift?",
        answer: "O Lip Lift é geralmente realizado sob anestesia local, às vezes com sedação leve dependendo do seu conforto e da opinião do cirurgião.",
        keywords: ["anestesia lip lift", "tipo anestesia", "sedação", "anestesia local"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quanto tempo dura o procedimento de Lip Lift e a estadia?",
        answer: "Duração do procedimento: aproximadamente 45 minutos a 1 hora. Estadia clínica: ambulatorial (alta no mesmo dia). Duração recomendada da estadia na Tunísia: 5 a 6 dias. Isto inclui: consulta pré-operatória, procedimento, acompanhamento pós-operatório, remoção de pontos se necessário.",
        keywords: ["duração lip lift", "tempo operação", "estadia clínica", "quantos dias"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "O que o pacote médico para Lip Lift inclui?",
        answer: "Seu pacote inclui: consulta com o cirurgião, honorários da clínica e procedimento, medicamentos pós-operatórios, traslados VIP (aeroporto / clínica / hotel), hospedagem em hotel, assistência de um coordenador médico dedicado durante toda sua estadia.",
        keywords: ["pacote lip lift", "inclusões lip lift", "serviços", "pacote médico"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quais são os possíveis riscos ou complicações do Lip Lift?",
        answer: "Como qualquer procedimento cirúrgico, o Lip Lift apresenta certos riscos como: infecção, sangramento, cicatrização visível, assimetria. O cirurgião informará em detalhe durante a consulta pré-operatória e medidas são tomadas para minimizar esses riscos.",
        keywords: ["riscos lip lift", "complicações", "perigos lip lift", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Qual é o tempo de recuperação após um Lip Lift?",
        answer: "Inchaço e hematomas: 7 a 10 dias. Retomada das atividades sociais: após 10 a 14 dias. Resultado final: visível após algumas semanas à medida que o inchaço diminui.",
        keywords: ["recuperação lip lift", "convalescença", "retomar atividades", "tempo cura"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Há acompanhamento após meu retorno ao meu país após Lip Lift?",
        answer: "Sim, garantimos acompanhamento pós-operatório remoto com seu coordenador médico e o cirurgião se necessário, para garantir uma recuperação ideal.",
        keywords: ["acompanhamento lip lift", "após retorno", "acompanhamento remoto", "pós-operatório"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Sou uma boa candidata para um Neck Lift?",
        answer: "Sua elegibilidade será primeiro avaliada pelo cirurgião a partir de fotos médicas e seu histórico de saúde. Um Neck Lift é geralmente recomendado para pacientes que apresentam: flacidez cutânea na área do pescoço, papada, bandas musculares visíveis (platisma), perda de definição do ângulo cervico-mentoniano. Uma consulta pré-operatória na clínica será organizada à sua chegada para confirmar a indicação cirúrgica.",
        keywords: ["neck lift", "lifting pescoço", "candidata neck lift", "flacidez pescoço", "papada"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Qual é a qualificação do cirurgião que realizará meu Neck Lift?",
        answer: "Trabalhamos com cirurgiões especializados em cirurgia estética facial e de pescoço, certificados e experientes em procedimentos de Neck Lift. Antes de sua confirmação, você receberá: o perfil do cirurgião, seus anos de experiência, fotos antes/depois de casos semelhantes.",
        keywords: ["qualificação cirurgião neck lift", "experiência cirurgião pescoço", "cirurgião neck lift", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de Neck Lift?",
        answer: "Seu Neck Lift será realizado em uma clínica acreditada que respeita as normas internacionais de segurança, com um bloco cirúrgico moderno e equipe médica qualificada.",
        keywords: ["clínica neck lift", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Qual técnica será usada no meu caso para Neck Lift?",
        answer: "A técnica usada dependerá de sua anatomia e grau de flacidez cutânea. Pode incluir: apertamento do músculo platisma, remoção do excesso de pele, lipoaspiração do pescoço se necessário. O cirurgião explicará em detalhe a técnica recomendada durante sua consulta pré-operatória.",
        keywords: ["técnica neck lift", "platisma", "apertamento muscular", "técnica pescoço"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Que tipo de anestesia será usada para Neck Lift?",
        answer: "O Neck Lift é geralmente realizado sob anestesia geral para garantir seu conforto e segurança durante o procedimento.",
        keywords: ["anestesia neck lift", "tipo anestesia", "anestesia geral", "sedação"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quanto tempo dura o procedimento de Neck Lift e a estadia?",
        answer: "Duração do procedimento: 2 a 3 horas. Estadia em clínica: 1 noite. Estadia recomendada na Tunísia: 6 a 7 dias. Sua estadia incluirá: consulta pré-operatória, exames médicos, procedimento cirúrgico, acompanhamento pós-operatório, remoção de drenos e suturas se necessário.",
        keywords: ["duração neck lift", "tempo operação", "estadia clínica", "quantos dias"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "O que o pacote médico para Neck Lift inclui?",
        answer: "Seu pacote inclui: consulta com o cirurgião, honorários da clínica e procedimento, anestesia, medicamentos pós-operatórios, vestuário de compressão (mentoneira), traslados VIP (aeroporto / clínica / hotel), hospedagem em hotel, assistência de um coordenador médico dedicado durante toda sua estadia.",
        keywords: ["pacote neck lift", "inclusões neck lift", "serviços", "pacote médico"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quais são os riscos associados ao Neck Lift?",
        answer: "Como qualquer cirurgia, o Neck Lift apresenta certos riscos como: infecção, hematoma, inchaço prolongado, cicatrização visível, dormência temporária. Todas as medidas necessárias são tomadas para minimizar esses riscos e garantir sua segurança.",
        keywords: ["riscos neck lift", "complicações", "perigos neck lift", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Qual é o tempo de recuperação após um Neck Lift?",
        answer: "Inchaço e hematomas: 10 a 14 dias. Uso da mentoneira: recomendado por 2 a 3 semanas. Retomada das atividades sociais: após 2 semanas. Resultado final: visível progressivamente ao longo de 2 a 3 meses.",
        keywords: ["recuperação neck lift", "convalescença", "retomar atividades", "tempo cura"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Há acompanhamento após meu retorno ao meu país após Neck Lift?",
        answer: "Sim, garantimos acompanhamento pós-operatório remoto com seu coordenador médico e o cirurgião para acompanhar sua recuperação após seu retorno.",
        keywords: ["acompanhamento neck lift", "após retorno", "acompanhamento remoto", "pós-operatório"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Sou uma boa candidata para uma bichectomia?",
        answer: "Sua elegibilidade será avaliada pelo cirurgião a partir de fotos médicas e seu histórico de saúde. A bichectomia é geralmente recomendada para pacientes que apresentam: rosto redondo ou bochechas volumosas, excesso de gordura nas bolsas de Bichat, falta de definição nas maçãs do rosto ou oval facial. Uma consulta pré-operatória será organizada à sua chegada para confirmar a indicação cirúrgica.",
        keywords: ["bichectomia", "bolsas de Bichat", "bochechas", "rosto redondo", "afinar rosto"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Qual é a qualificação do cirurgião que realizará minha bichectomia?",
        answer: "Colaboramos com cirurgiões especializados em cirurgia estética facial, certificados e experientes no procedimento de bichectomia. Antes de qualquer confirmação, você receberá: o perfil do cirurgião, seus anos de experiência, fotos antes/depois de casos semelhantes.",
        keywords: ["qualificação cirurgião bichectomia", "experiência cirurgião", "cirurgião bichectomia", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de bichectomia?",
        answer: "Seu procedimento será realizado em uma clínica acreditada que respeita as normas internacionais de higiene e segurança, equipada com um bloco cirúrgico moderno e equipe médica qualificada.",
        keywords: ["clínica bichectomia", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Como é realizado o procedimento de bichectomia?",
        answer: "A bichectomia consiste em remover parte das bolsas de Bichat para afinar a parte inferior do rosto. As incisões são feitas dentro da boca, o que significa que não há cicatrizes visíveis na pele.",
        keywords: ["procedimento", "técnica", "incisão boca", "sem cicatrizes"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Que tipo de anestesia será usada para uma bichectomia?",
        answer: "A bichectomia é geralmente realizada sob anestesia local, às vezes com sedação leve dependendo do seu conforto e da opinião do cirurgião.",
        keywords: ["anestesia", "anestesia local", "sedação", "tipo anestesia"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Quanto tempo dura o procedimento de bichectomia e a estadia?",
        answer: "Duração do procedimento: 30 a 45 minutos. Estadia em clínica: ambulatorial (alta no mesmo dia). Estadia recomendada na Tunísia: 4 a 5 dias. Sua estadia inclui: consulta pré-operatória, exames médicos se necessários, procedimento cirúrgico, acompanhamento pós-operatório.",
        keywords: ["duração", "tempo operação", "estadia clínica", "quantos dias"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "O que o pacote médico para bichectomia inclui?",
        answer: "Seu pacote inclui: honorários do cirurgião, honorários da clínica, anestesia, medicamentos pós-operatórios, traslados VIP (aeroporto / clínica / hotel), hospedagem em hotel, assistência de um coordenador médico dedicado durante toda sua estadia.",
        keywords: ["pacote", "inclusões", "serviços", "pacote médico"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Quais são os possíveis riscos ou complicações de uma bichectomia?",
        answer: "Como qualquer procedimento cirúrgico, a bichectomia apresenta certos riscos como: infecção, inchaço, assimetria, dormência temporária. Todas as medidas são tomadas para minimizar esses riscos.",
        keywords: ["riscos", "complicações", "efeitos colaterais", "perigos"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Qual é o tempo de recuperação após uma bichectomia?",
        answer: "Inchaço: 7 a 10 dias. Retomada das atividades sociais: após 5 a 7 dias. Resultado final: visível progressivamente após 4 a 6 semanas.",
        keywords: ["recuperação", "convalescença", "retomar atividades", "tempo cura"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Sou uma boa candidata para uma cantopexia?",
        answer: "Sua elegibilidade será avaliada pelo cirurgião a partir de fotos médicas e seu histórico de saúde. A cantopexia é geralmente recomendada para pacientes que apresentam: flacidez da pálpebra inferior, olhar caído ou cansado, falta de suporte no canto externo do olho, desejo de melhorar a forma ou tensão da pálpebra inferior. Uma consulta pré-operatória será organizada à sua chegada para confirmar a indicação cirúrgica.",
        keywords: ["cantopexia", "pálpebra", "olhar", "canto olho", "pálpebra inferior"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Qual é a qualificação do cirurgião que realizará minha cantopexia?",
        answer: "Colaboramos com cirurgiões especializados em cirurgia estética de pálpebras e olhar, certificados e experientes no procedimento de cantopexia. Antes de qualquer confirmação, você receberá: o perfil do cirurgião, seus anos de experiência, fotos antes/depois de casos semelhantes.",
        keywords: ["qualificação cirurgião cantopexia", "experiência cirurgião pálpebra", "cirurgião cantopexia", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de cantopexia?",
        answer: "Seu procedimento será realizado em uma clínica acreditada que respeita as normas internacionais de higiene e segurança, equipada com um bloco cirúrgico moderno e equipe médica qualificada.",
        keywords: ["clínica cantopexia", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Como é realizado o procedimento de cantopexia?",
        answer: "A cantopexia consiste em tensionar e reposicionar o tendão do canto externo da pálpebra inferior para melhorar o suporte e a forma do olho. Pode ser realizada sozinha ou em combinação com blefaroplastia inferior dependendo do seu caso.",
        keywords: ["procedimento", "técnica", "tendão", "canto olho"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Que tipo de anestesia será usada para uma cantopexia?",
        answer: "A cantopexia é geralmente realizada sob anestesia local com sedação leve, ou sob anestesia geral dependendo da indicação e recomendações do cirurgião.",
        keywords: ["anestesia", "anestesia local", "sedação", "anestesia geral"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Quanto tempo dura o procedimento de cantopexia e a estadia?",
        answer: "Duração do procedimento: aproximadamente 1 hora. Estadia em clínica: ambulatorial (alta no mesmo dia). Estadia recomendada na Tunísia: 4 a 5 dias. Sua estadia inclui: consulta pré-operatória, procedimento cirúrgico, acompanhamento pós-operatório, remoção de suturas se necessário.",
        keywords: ["duração", "tempo operação", "estadia clínica", "quantos dias"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "O que o pacote médico para cantopexia inclui?",
        answer: "Seu pacote inclui: honorários do cirurgião, honorários da clínica, anestesia, medicamentos pós-operatórios, traslados VIP (aeroporto / clínica / hotel), hospedagem em hotel, assistência de um coordenador médico dedicado durante toda sua estadia.",
        keywords: ["pacote", "inclusões", "serviços", "pacote médico"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Quais são os possíveis riscos ou complicações de uma cantopexia?",
        answer: "Como qualquer procedimento cirúrgico, a cantopexia apresenta certos riscos como: infecção, inchaço, secura ocular temporária, assimetria, irritação ocular. Todas as medidas são tomadas para minimizar esses riscos.",
        keywords: ["riscos", "complicações", "efeitos colaterais", "perigos"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Qual é o tempo de recuperação após uma cantopexia?",
        answer: "Inchaço e hematomas: 7 a 10 dias. Retomada das atividades sociais: após 7 a 10 dias. Resultado final: visível progressivamente após algumas semanas.",
        keywords: ["recuperação", "convalescença", "retomar atividades", "tempo cura"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Sou uma boa candidata para um Facial Fat Grafting?",
        answer: "Sua elegibilidade será avaliada pelo cirurgião a partir de fotos médicas e seu histórico de saúde. O Facial Fat Grafting é geralmente recomendado para pacientes que apresentam: perda de volume no rosto, olheiras fundas, bochechas ou têmporas afundadas, sulcos nasogenianos marcados, falta de definição do oval facial. Uma consulta pré-operatória será organizada à sua chegada para confirmar a indicação e estabelecer um plano de tratamento personalizado.",
        keywords: ["facial fat grafting", "lipofilling facial", "gordura facial", "volume facial", "olheiras"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Qual é a qualificação do cirurgião que realizará meu Facial Fat Grafting?",
        answer: "Colaboramos com cirurgiões especializados em cirurgia estética facial, certificados e experientes em técnicas de lipofilling facial. Antes de qualquer confirmação, você receberá: o perfil do cirurgião, seus anos de experiência, fotos antes/depois de casos semelhantes.",
        keywords: ["qualificação cirurgião lipofilling", "experiência cirurgião facial", "cirurgião fat grafting", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de Facial Fat Grafting?",
        answer: "Seu procedimento será realizado em uma clínica acreditada que respeita as normas internacionais de higiene e segurança, equipada com um bloco cirúrgico moderno e equipe médica qualificada.",
        keywords: ["clínica lipofilling", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Como é realizado o procedimento de Facial Fat Grafting?",
        answer: "O Facial Fat Grafting consiste em remover gordura de uma área doadora (como abdômen ou coxas), purificá-la e depois reinjetá-la nas áreas faciais que precisam de volume, para obter um resultado natural e duradouro.",
        keywords: ["procedimento", "técnica", "remoção gordura", "reinjeção"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Que tipo de anestesia será usada para Facial Fat Grafting?",
        answer: "Este procedimento é geralmente realizado sob anestesia local com sedação leve ou sob anestesia geral, dependendo da extensão do tratamento e das recomendações do cirurgião.",
        keywords: ["anestesia", "anestesia local", "sedação", "anestesia geral"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Quanto tempo dura o procedimento de Facial Fat Grafting e a estadia?",
        answer: "Duração do procedimento: 1 a 2 horas. Estadia em clínica: ambulatorial ou 1 noite. Estadia recomendada na Tunísia: 5 a 6 dias. Sua estadia inclui: consulta pré-operatória, exames médicos se necessários, procedimento cirúrgico, acompanhamento pós-operatório.",
        keywords: ["duração", "tempo operação", "estadia clínica", "quantos dias"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "O que o pacote médico para Facial Fat Grafting inclui?",
        answer: "Seu pacote inclui: honorários do cirurgião, honorários da clínica, anestesia, medicamentos pós-operatórios, traslados VIP (aeroporto / clínica / hotel), hospedagem em hotel, assistência de um coordenador médico dedicado durante toda sua estadia.",
        keywords: ["pacote", "inclusões", "serviços", "pacote médico"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Quais são os possíveis riscos ou complicações do Facial Fat Grafting?",
        answer: "Como qualquer procedimento cirúrgico, o Facial Fat Grafting apresenta certos riscos como: infecção, inchaço, reabsorção parcial da gordura injetada, assimetria. Todas as medidas necessárias são tomadas para minimizar esses riscos.",
        keywords: ["riscos", "complicações", "efeitos colaterais", "perigos"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Qual é o tempo de recuperação após um Facial Fat Grafting?",
        answer: "Inchaço e hematomas: 7 a 14 dias. Retomada das atividades sociais: após 10 a 14 dias. Resultado final: visível progressivamente após algumas semanas à medida que o inchaço diminui.",
        keywords: ["recuperação", "convalescença", "retomar atividades", "tempo cura"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Sou uma boa candidata para um Brow Lift?",
        answer: "Sua elegibilidade será avaliada pelo cirurgião a partir de fotos médicas e seu histórico de saúde. O Brow Lift é geralmente recomendado para pacientes que apresentam: sobrancelhas caídas, olhar cansado ou triste, excesso de pele na testa, rugas frontais ou glabelares marcadas. Uma consulta pré-operatória será organizada à sua chegada para confirmar a indicação cirúrgica.",
        keywords: ["brow lift", "lifting sobrancelhas", "sobrancelhas caídas", "olhar cansado", "rugas testa"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Qual é a qualificação do cirurgião que realizará meu Brow Lift?",
        answer: "Colaboramos com cirurgiões especializados em cirurgia estética facial, certificados e experientes em procedimentos de lifting de sobrancelhas. Antes de qualquer confirmação, você receberá: o perfil do cirurgião, seus anos de experiência, fotos antes/depois de casos semelhantes.",
        keywords: ["qualificação cirurgião brow lift", "experiência cirurgião sobrancelhas", "cirurgião brow lift", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de Brow Lift?",
        answer: "Seu procedimento será realizado em uma clínica acreditada que respeita as normas internacionais de higiene e segurança, equipada com um bloco cirúrgico moderno e equipe médica qualificada.",
        keywords: ["clínica brow lift", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Qual técnica será usada no meu caso para Brow Lift?",
        answer: "A técnica usada dependerá de sua anatomia e resultado desejado. Pode incluir: lifting endoscópico de sobrancelhas, lifting temporal ou lifting frontal clássico. O cirurgião explicará a técnica recomendada durante sua consulta pré-operatória.",
        keywords: ["técnica brow lift", "lifting endoscópico", "lifting temporal", "lifting frontal"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Que tipo de anestesia será usada para Brow Lift?",
        answer: "O Brow Lift é geralmente realizado sob anestesia geral ou anestesia local com sedação leve dependendo da técnica usada.",
        keywords: ["anestesia brow lift", "tipo anestesia", "anestesia geral", "sedação"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Quanto tempo dura o procedimento de Brow Lift e a estadia?",
        answer: "Duração do procedimento: 1 a 2 horas. Estadia em clínica: ambulatorial ou 1 noite. Estadia recomendada na Tunísia: 5 a 6 dias. Sua estadia inclui: consulta pré-operatória, exames médicos se necessários, procedimento cirúrgico, acompanhamento pós-operatório, remoção de suturas se necessário.",
        keywords: ["duração brow lift", "tempo operação", "estadia clínica", "quantos dias"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "O que o pacote médico para Brow Lift inclui?",
        answer: "Seu pacote inclui: honorários do cirurgião, honorários da clínica, anestesia, medicamentos pós-operatórios, traslados VIP (aeroporto / clínica / hotel), hospedagem em hotel, assistência de um coordenador médico dedicado durante toda sua estadia.",
        keywords: ["pacote brow lift", "inclusões", "serviços", "pacote médico"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Quais são os possíveis riscos ou complicações do Brow Lift?",
        answer: "Como qualquer procedimento cirúrgico, o Brow Lift apresenta certos riscos como: infecção, inchaço, hematomas, assimetria, dormência temporária. Todas as medidas necessárias são tomadas para minimizar esses riscos.",
        keywords: ["riscos brow lift", "complicações", "efeitos colaterais", "perigos"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "Qual é o tempo de recuperação após um Brow Lift?",
        answer: "Inchaço e hematomas: 7 a 10 dias. Retomada das atividades sociais: após 10 a 14 dias. Resultado final: visível progressivamente após algumas semanas.",
        keywords: ["recuperação brow lift", "convalescença", "retomar atividades", "tempo cura"],
        imageUrl: "assets/img/chatbot/Brow-Lift.png"
      },
      {
        question: "O cirurgião é qualificado e experiente em otoplastia?",
        answer: "Sim, colaboramos com cirurgiões especializados em cirurgia estética e reconstrutiva, com vários anos de experiência realizando otoplastias com resultados naturais.",
        keywords: ["cirurgião otoplastia", "qualificações cirurgião", "experiência otoplastia", "cirurgião orelhas"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Posso ver fotos antes/depois de pacientes que fizeram otoplastia?",
        answer: "Claro, podemos compartilhar fotos antes/depois de casos semelhantes realizados pelo cirurgião, respeitando a confidencialidade dos pacientes.",
        keywords: ["fotos antes depois otoplastia", "resultados otoplastia", "galeria fotos", "casos semelhantes"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de otoplastia? É certificada?",
        answer: "O procedimento é realizado em uma clínica acreditada que respeita as normas internacionais de higiene e segurança.",
        keywords: ["clínica otoplastia", "instalação certificada", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "A otoplastia é realizada sob anestesia local ou geral?",
        answer: "A otoplastia é geralmente realizada sob anestesia local com sedação leve, mas a anestesia geral pode ser considerada dependendo do seu caso e da recomendação do cirurgião.",
        keywords: ["anestesia otoplastia", "tipo anestesia", "anestesia local", "anestesia geral"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Os resultados da otoplastia são permanentes?",
        answer: "Sim, os resultados da otoplastia são geralmente permanentes após a cicatrização completa.",
        keywords: ["resultados permanentes otoplastia", "durabilidade", "definitivo", "permanente"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Terei cicatrizes visíveis após a otoplastia?",
        answer: "As incisões são feitas atrás da orelha, portanto as cicatrizes são discretas e tornam-se quase invisíveis com o tempo.",
        keywords: ["cicatrizes otoplastia", "visibilidade cicatrizes", "incisões atrás orelha", "cicatrizes discretas"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Quantos dias devo ficar na Tunísia para uma otoplastia?",
        answer: "A estadia recomendada é geralmente de 5 a 7 dias: Dia 1: Chegada e traslado ao hotel, Dia 2: Consulta com cirurgião + exames médicos, Dia 3: Procedimento, Dia 4: Descanso, Dia 5: Primeiro controle pós-operatório, Dia 6-7: Autorização para voar após validação médica.",
        keywords: ["duração estadia otoplastia", "quantos dias", "cronograma", "itinerário"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Quanto tempo dura a cirurgia de otoplastia?",
        answer: "O procedimento dura em média entre 1 e 2 horas.",
        keywords: ["duração otoplastia", "tempo operação", "quanto tempo"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Vou passar a noite na clínica após a otoplastia?",
        answer: "A otoplastia é geralmente realizada em regime ambulatorial. Você pode sair da clínica no mesmo dia após observação médica.",
        keywords: ["noite clínica otoplastia", "hospitalização", "ambulatorial", "estadia clínica"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Vou sentir dor após a cirurgia de otoplastia?",
        answer: "Pode-se sentir um desconforto leve a moderado por alguns dias, mas é bem controlado com analgésicos.",
        keywords: ["dor otoplastia", "desconforto pós-operatório", "analgésicos", "conforto"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Precisarei usar uma bandagem após a otoplastia?",
        answer: "Sim, uma faixa de compressão deve ser usada: 24/7 por 5 a 7 dias, depois apenas à noite por 2 a 3 semanas.",
        keywords: ["bandagem otoplastia", "faixa compressão", "compressão", "cuidados pós-operatórios"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Quando posso retomar minhas atividades normais após a otoplastia?",
        answer: "Trabalho: após 5 a 7 dias. Esportes: após 3 a 4 semanas.",
        keywords: ["retomar atividades otoplastia", "voltar trabalho", "retomar esportes", "recuperação"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "O acompanhamento pós-operatório está incluído no pacote de otoplastia?",
        answer: "Sim, o acompanhamento pós-operatório está incluído, compreendendo: consulta de controle antes da sua partida, assistência médica remota após seu retorno, recomendações para cuidados pós-operatórios.",
        keywords: ["acompanhamento otoplastia", "incluído no pacote", "controle", "assistência"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Quais são os possíveis riscos de uma otoplastia?",
        answer: "Como qualquer procedimento cirúrgico, existem riscos raros como: infecção, hematoma, assimetria. Mas todas as precauções são tomadas para minimizar esses riscos.",
        keywords: ["riscos otoplastia", "complicações", "perigos otoplastia", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Otoplastie.png"
      },
      {
        question: "Sou uma boa candidata para uma dimpleplastia?",
        answer: "Uma avaliação personalizada será realizada a partir de fotos ou durante uma consulta com o cirurgião. O médico verificará: a elasticidade da sua pele, a estrutura das suas bochechas, suas expectativas estéticas para confirmar que o procedimento é adequado à sua morfologia facial.",
        keywords: ["dimpleplastia", "covinhas", "candidata dimpleplastia", "criação covinhas", "bochechas"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Quem realizará minha dimpleplastia e quais são suas qualificações?",
        answer: "A agência deve fornecer: o nome do cirurgião, seus anos de experiência, suas certificações, fotos antes/depois de pacientes que fizeram dimpleplastia.",
        keywords: ["cirurgião dimpleplastia", "qualificações", "experiência covinhas", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Onde será realizado o procedimento de dimpleplastia?",
        answer: "O procedimento é realizado em uma clínica acreditada que respeita as normas internacionais de higiene. Geralmente é um procedimento ambulatorial realizado sob anestesia local.",
        keywords: ["clínica dimpleplastia", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Quanto tempo dura o procedimento de dimpleplastia e a estadia?",
        answer: "Duração do procedimento: 20 a 40 minutos. Estadia recomendada: 3 a 5 dias. Chegada: consulta pré-operatória. Dia do procedimento: cirurgia. Dia 2-3: controle pós-operatório antes do retorno.",
        keywords: ["duração dimpleplastia", "tempo operação", "estadia clínica", "quantos dias"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Os resultados da dimpleplastia são permanentes?",
        answer: "Sim, os resultados são geralmente permanentes. As covinhas podem aparecer permanentemente no início, depois se tornar mais naturais com o tempo (visíveis apenas ao sorrir).",
        keywords: ["resultados permanentes dimpleplastia", "durabilidade covinhas", "definitivo", "permanente"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Quais são os riscos ou efeitos colaterais de uma dimpleplastia?",
        answer: "Inchaço temporário, dor leve, assimetria (raro), infecção (muito rara com boa higiene).",
        keywords: ["riscos dimpleplastia", "complicações", "efeitos colaterais", "perigos covinhas"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Qual é o tempo de recuperação após uma dimpleplastia?",
        answer: "Retomada das atividades normais: 2 a 3 dias. Resultado final: 4 a 6 semanas. Recomendações: evitar alimentos duros, manter boa higiene bucal.",
        keywords: ["recuperação dimpleplastia", "convalescença", "retomar atividades", "tempo cura"],
        imageUrl: "assets/img/chatbot/Dimpleplasty.png"
      },
      {
        question: "Sou uma boa candidata para uma genioplastia?",
        answer: "Você deve estar com boa saúde geral, não ter contraindicações cirúrgicas e apresentar um queixo retraído, muito proeminente ou assimétrico. Uma avaliação médica será realizada a partir de suas fotos e exames para confirmar sua elegibilidade.",
        keywords: ["genioplastia", "cirurgia queixo", "candidata genioplastia", "queixo retraído", "assimetria queixo"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Quais exames devo fazer antes de uma genioplastia?",
        answer: "Um exame de sangue completo, radiografia ou tomografia cefalométrica podem ser solicitados para analisar a estrutura óssea do seu queixo e planejar o procedimento com precisão.",
        keywords: ["exames genioplastia", "exame sangue", "tomografia queixo", "radiografia"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "O cirurgião é qualificado para genioplastia?",
        answer: "Sim, colaboramos apenas com cirurgiões maxilofaciais experientes, especializados em cirurgia de queixo e certificados pelas autoridades médicas competentes.",
        keywords: ["cirurgião genioplastia", "qualificação", "cirurgião maxilofacial", "experiência queixo"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de genioplastia?",
        answer: "O procedimento será realizado em uma clínica acreditada que respeita as normas internacionais de higiene, equipamento e segurança.",
        keywords: ["clínica genioplastia", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Quanto tempo dura a cirurgia de genioplastia e a hospitalização?",
        answer: "A genioplastia dura em média entre 1 a 2 horas sob anestesia geral. Uma hospitalização de uma noite é geralmente necessária para garantir a monitorização pós-operatória.",
        keywords: ["duração genioplastia", "tempo operação", "hospitalização", "noite clínica"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Como é o pós-operatório de uma genioplastia?",
        answer: "Inchaço, hematomas e desconforto temporário podem aparecer após o procedimento. Uma dieta branda é recomendada por alguns dias. O uso de uma bandagem de compressão pode ser necessário.",
        keywords: ["pós-operatório genioplastia", "inchaço", "hematomas", "dieta branda"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "O tratamento pós-operatório está incluído na genioplastia?",
        answer: "Sim, os medicamentos necessários (analgésicos, antibióticos), as consultas de acompanhamento e os cuidados pós-operatórios estão incluídos no seu pacote.",
        keywords: ["tratamento pós-operatório", "medicamentos incluídos", "acompanhamento genioplastia", "pacote"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Quais são os possíveis riscos de uma genioplastia?",
        answer: "Como qualquer procedimento cirúrgico, a genioplastia apresenta riscos como infecção, sangramento ou dormência temporária. Estes são raros e todas as precauções são tomadas para minimizá-los.",
        keywords: ["riscos genioplastia", "complicações", "perigos queixo", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Genioplastie.png"
      },
      {
        question: "Quem será meu cirurgião para bypass gástrico?",
        answer: "A agência deve fornecer: o nome completo do cirurgião, experiência em cirurgia bariátrica, número de procedimentos realizados, certificações e credenciamentos.",
        keywords: ["cirurgião bypass gástrico", "qualificações", "experiência bariátrica", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de bypass gástrico?",
        answer: "A agência deve fornecer: o nome da clínica, seu nível de equipamento, normas de higiene e segurança, presença de uma unidade de terapia intensiva.",
        keywords: ["clínica bypass gástrico", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Quais exames preciso fazer antes do bypass gástrico?",
        answer: "Lista completa de análises (exame de sangue, ECG, ultrassom...), consulta com cirurgião + anestesiologista, possível dieta pré-operatória obrigatória.",
        keywords: ["exames bypass gástrico", "exame sangue", "ECG", "consulta"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Quantos dias ficarei na clínica após o bypass gástrico?",
        answer: "2 a 3 noites em clínica (média), 5 a 7 noites em hotel para recuperação, retorno possível após validação médica.",
        keywords: ["hospitalização bypass gástrico", "noites clínica", "estadia", "recuperação"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Quais são os riscos associados ao bypass gástrico?",
        answer: "Explicação clara dos possíveis riscos, manejo imediato no local se necessário, acompanhamento médico incluído no pacote.",
        keywords: ["riscos bypass gástrico", "complicações", "perigos", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Vou me beneficiar de acompanhamento nutricional após o bypass gástrico?",
        answer: "Plano alimentar pós-operatório, acompanhamento remoto com nutricionista, assistência contínua após o retorno.",
        keywords: ["acompanhamento nutricional bypass gástrico", "dieta", "nutricionista", "alimentação"],
        imageUrl: "assets/img/chatbot/Bypass-Gastrique.png"
      },
      {
        question: "Sou uma boa candidata para sleeve gástrico?",
        answer: "Sua elegibilidade depende do seu IMC, histórico médico e estado geral de saúde. Uma avaliação pré-operatória completa será realizada à sua chegada (exames de sangue, ECG, ultrassom abdominal, etc.) para que o cirurgião possa confirmar se o procedimento pode ser realizado com segurança.",
        keywords: ["sleeve gástrico", "candidata sleeve", "cirurgia bariátrica", "perda peso", "obesidade"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Quem será meu cirurgião para sleeve gástrico e quais são suas qualificações?",
        answer: "A agência deve fornecer: o nome do cirurgião, experiência em cirurgia bariátrica, número de procedimentos realizados, credenciamentos e formação internacional. Uma consulta com o cirurgião está agendada antes da operação para discutir suas expectativas e validar o protocolo cirúrgico.",
        keywords: ["cirurgião sleeve", "qualificações", "experiência bariátrica", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de sleeve gástrico?",
        answer: "O procedimento é realizado em uma clínica acreditada que respeita as normas internacionais de higiene e segurança, equipada com um bloco cirúrgico moderno e unidade de terapia intensiva se necessário.",
        keywords: ["clínica sleeve", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Qual acompanhamento está previsto após a cirurgia de sleeve gástrico?",
        answer: "O acompanhamento inclui: visitas médicas pós-operatórias, assistência nutricional, medicação, recomendações alimentares, acompanhamento remoto após seu retorno ao seu país (WhatsApp / email).",
        keywords: ["acompanhamento sleeve", "pós-operatório", "nutrição", "assistência"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Quais são os possíveis riscos ou complicações do sleeve gástrico?",
        answer: "Como qualquer cirurgia, o sleeve gástrico apresenta riscos potenciais como: infecção, sangramento, fuga gástrica, deficiências nutricionais. Todas as precauções são tomadas para minimizar esses riscos, e a monitorização médica contínua é garantida durante sua hospitalização.",
        keywords: ["riscos sleeve", "complicações", "perigos", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Vou receber um programmea alimentar após a cirurgia de sleeve gástrico?",
        answer: "Sim, um plano nutricional progressivo será fornecido (líquido → pastoso → sólido), bem como conselhos dietéticos para garantir uma perda de peso saudável e sustentável.",
        keywords: ["dieta sleeve", "plano nutricional", "conselhos dietéticos", "alimentação"],
        imageUrl: "assets/img/chatbot/Sleeve-Gastrique.png"
      },
      {
        question: "Vocês trabalham com cirurgiões especializados em cirurgia de catarata?",
        answer: "Sim, colaboramos com oftalmologistas altamente qualificados, especializados em cirurgia de catarata, atuando em clínicas acreditadas que respeitam as normas internacionais de higiene e segurança.",
        keywords: ["catarata", "cirurgia catarata", "oftalmologista", "especialista catarata"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Qual técnica é usada para cirurgia de catarata?",
        answer: "A cirurgia é realizada por facoemulsificação, uma técnica moderna, rápida e minimamente invasiva, que permite remover o cristalino opacificado e substituí-lo por uma lente intraocular (implante).",
        keywords: ["técnica catarata", "facoemulsificação", "lente intraocular", "implante"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Que tipo de implante intraocular é oferecido para catarata?",
        answer: "Oferecemos diferentes tipos de implantes: monofocal (visão de longe), multifocal (visão de longe e perto), tórico (corrige astigmatismo). A escolha será determinada após uma avaliação oftalmológica completa realizada no local.",
        keywords: ["implantes catarata", "monofocal", "multifocal", "tórico", "lentes"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Quais são os possíveis riscos ou complicações da cirurgia de catarata?",
        answer: "A cirurgia de catarata é um procedimento seguro com uma taxa de sucesso muito alta. Como qualquer procedimento, certos riscos existem (infecção, inflamação...), mas são raros e são gerenciados pela equipe médica.",
        keywords: ["riscos catarata", "complicações", "perigos", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Quando posso voltar de avião após uma cirurgia de catarata?",
        answer: "Geralmente você pode voltar de avião 24 a 48 horas após o procedimento, após validação do cirurgião durante o controle pós-operatório.",
        keywords: ["voo retorno catarata", "voo", "autorização", "prazo"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Quanto tempo dura a recuperação após uma cirurgia de catarata?",
        answer: "A melhora da visão é geralmente rápida, desde os primeiros dias. A recuperação completa pode levar algumas semanas.",
        keywords: ["recuperação catarata", "visão", "tempo cura", "convalescença"],
        imageUrl: "assets/img/chatbot/Cataracte.png"
      },
      {
        question: "Sou uma boa candidata para uma braquioplastia?",
        answer: "Você pode ser uma boa candidata se: tem flacidez cutânea significativa nos braços (muitas vezes após perda de peso ou envelhecimento), seu peso está estável há pelo menos 3 a 6 meses, está com boa saúde geral e não fuma (ou está disposta a parar antes e depois da cirurgia), tem expectativas realistas sobre cicatrizes e resultados.",
        keywords: ["braquioplastia", "lifting braços", "candidata braquioplastia", "flacidez braços", "cirurgia braços"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "O cirurgião é qualificado e experiente em braquioplastia?",
        answer: "O cirurgião é especializado em cirurgia plástica e reconstrutiva. Ele tem experiência confirmada em braquioplastia. Fotos antes/depois de pacientes que fizeram o mesmo procedimento podem ser fornecidas. Uma consulta pré-operatória será organizada à sua chegada para validar sua elegibilidade.",
        keywords: ["cirurgião braquioplastia", "qualificações", "experiência braços", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de braquioplastia?",
        answer: "O procedimento é realizado em uma clínica acreditada que respeita as normas internacionais de higiene e segurança. O bloco cirúrgico é equipado para cirurgia estética. O procedimento é feito sob anestesia geral com um anestesiologista qualificado.",
        keywords: ["clínica braquioplastia", "instalação", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Qual é o cronograma da estadia médica para uma braquioplastia?",
        answer: "Sua jornada deve ser claramente detalhada: Dia 1: Chegada + traslado ao hotel, Dia 2: Exames médicos + consulta com cirurgião, Dia 3: Procedimento cirúrgico, 1 a 2 noites de hospitalização em clínica, Retorno ao hotel com acompanhamento de enfermagem, Sessões de fisioterapia / drenagem linfática, Consultas pós-operatórias, Autorização para voar após validação médica (geralmente 7 a 10 dias).",
        keywords: ["jornada braquioplastia", "cronograma", "estadia", "etapas"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Quais são os possíveis riscos e complicações de uma braquioplastia?",
        answer: "Como qualquer cirurgia, a braquioplastia apresenta certos riscos: infecção, hematoma, cicatrização retardada, cicatrizes visíveis, assimetria, dormência temporária. Todas as precauções são tomadas para minimizar esses riscos.",
        keywords: ["riscos braquioplastia", "complicações", "perigos braços", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "As cicatrizes serão visíveis após uma braquioplastia?",
        answer: "A cicatriz geralmente está localizada na parte interna do braço. É permanente, mas desbota com o tempo. Cuidados com cicatrizes e sessões de fisioterapia podem ser incluídos para otimizar a cicatrização.",
        keywords: ["cicatrizes braquioplastia", "visibilidade", "cuidados cicatrizes", "parte interna braço"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "O que o acompanhamento pós-operatório de uma braquioplastia inclui?",
        answer: "Medicamentos pós-operatórios, vestuário de compressão, cuidados de enfermagem, drenagem linfática / fisioterapia, consultas de controle, assistência 24/7 com sua coordenadora durante toda sua estadia.",
        keywords: ["acompanhamento braquioplastia", "incluído", "cuidados", "assistência"],
        imageUrl: "assets/img/chatbot/Brachioplastie.png"
      },
      {
        question: "Sou uma boa candidata para LASIK?",
        answer: "Uma avaliação pré-operatória completa será realizada à sua chegada. Inclui: topografia corneana, paquimetria (espessura da córnea), teste de olho seco, análise de refração. O cirurgião confirmará se o LASIK é adequado ou proporá uma alternativa (PRK ou SMILE se necessário).",
        keywords: ["LASIK", "candidata LASIK", "cirurgia olhos", "correção visão", "miopia"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Quem é o cirurgião e qual é sua experiência em LASIK?",
        answer: "Seu procedimento será realizado por um oftalmologista especializado em cirurgia refrativa. O médico tem experiência significativa em LASIK e realizou um grande número de procedimentos com sucesso. Ele/ela é certificado(a) e atua em uma clínica acreditada.",
        keywords: ["cirurgião LASIK", "oftalmologista", "experiência", "qualificações"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento LASIK?",
        answer: "A cirurgia é realizada em uma clínica especializada em oftalmologia equipada com tecnologia laser de última geração. A clínica respeita rigorosas normas internacionais de higiene e segurança.",
        keywords: ["clínica LASIK", "tecnologia laser", "instalação", "normas segurança"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Qual tecnologia LASIK vocês utilizam?",
        answer: "O procedimento utiliza um laser de femtossegundo para a criação do flap. O remodelamento corneano é realizado com um laser excimer de alta precisão. A técnica é personalizada de acordo com seu perfil visual.",
        keywords: ["tecnologia LASIK", "laser femtossegundo", "laser excimer", "técnica"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Qual é o cronograma da estadia médica para LASIK?",
        answer: "Dia 1: Chegada + traslado ao hotel, Dia 2: Consulta pré-operatória + exames, Dia 3: Procedimento LASIK, Dia 4: Controle pós-operatório, Possível retorno em 3 a 5 dias conforme validação do cirurgião.",
        keywords: ["itinerário LASIK", "cronograma", "estadia", "etapas"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Quanto tempo dura o procedimento LASIK?",
        answer: "O procedimento dura aproximadamente 10 a 15 minutos para ambos os olhos. É realizado sob anestesia local com colírios.",
        keywords: ["duração LASIK", "tempo operação", "quanto tempo", "anestesia local"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "A recuperação após LASIK é dolorosa?",
        answer: "Um leve desconforto pode ser sentido por 24 a 48 horas. A visão geralmente melhora no dia seguinte. A recuperação completa pode levar algumas semanas.",
        keywords: ["recuperação LASIK", "dor", "visão", "tempo recuperação"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Quando posso voltar de avião e retornar ao trabalho após LASIK?",
        answer: "O voo de retorno é autorizado após o controle pós-operatório. O retorno ao trabalho é possível após 3 a 5 dias dependendo do seu conforto visual.",
        keywords: ["voo retorno LASIK", "voltar trabalho", "voo", "autorização"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },
      {
        question: "Quais cuidados pós-operatórios estão incluídos no pacote LASIK?",
        answer: "Medicamentos (colírios antibióticos e hidratantes), óculos de proteção se necessários, consulta de acompanhamento antes da partida, assistência 24/7 com sua coordenadora.",
        keywords: ["cuidados LASIK", "colírios", "acompanhamento", "incluído"],
        imageUrl: "assets/img/chatbot/LASIK.png"
      },



      {
        question: "Suis-je une bonne candidate pour une cruroplastie ?",
        answer: "Vous êtes généralement éligible si vous présentez : un relâchement cutané au niveau des cuisses, une perte de volume après amaigrissement ou grossesse, une peau qui ne se retend plus malgré le sport, un poids stable depuis au moins 6 mois. Une évaluation médicale préalable avec le chirurgien est obligatoire afin de confirmer l'indication opératoire.",
        keywords: ["cruroplastie", "lifting cuisses", "candidate cruroplastie", "relâchement cuisses", "chirurgie cuisses"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Qui est le chirurgien qui va m'opérer pour une cruroplastie ?",
        answer: "L'agence doit fournir : le nom du chirurgien, ses certifications, son expérience en chirurgie corporelle, des photos avant/après de patientes ayant subi une cruroplastie.",
        keywords: ["chirurgien cruroplastie", "qualifications", "expérience cuisses", "profil chirurgien"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Dans quelle clinique l'intervention de cruroplastie sera-t-elle réalisée ?",
        answer: "L'agence doit préciser : le nom de la clinique, les normes d'hygiène et de sécurité, l'accréditation de l'établissement, si une unité de soins intensifs est disponible en cas de besoin.",
        keywords: ["clinique cruroplastie", "établissement", "clinique accréditée", "normes sécurité"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quels examens dois-je effectuer avant une cruroplastie ?",
        answer: "Oui, un bilan préopératoire est requis comprenant : analyse sanguine, ECG, consultation avec l'anesthésiste. Ces examens peuvent être réalisés à votre arrivée en Tunisie.",
        keywords: ["examens cruroplastie", "bilan sanguin", "ECG", "consultation anesthésiste"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Combien de temps vais-je rester à la clinique après une cruroplastie ?",
        answer: "La durée de séjour en clinique est généralement de 1 à 2 nuits sous surveillance médicale.",
        keywords: ["hospitalisation cruroplastie", "nuits clinique", "séjour", "surveillance"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Que se passe-t-il après ma sortie de la clinique après une cruroplastie ?",
        answer: "L'agence doit inclure : transfert clinique → hôtel, suivi post-opératoire, visites de contrôle, soins infirmiers si nécessaires.",
        keywords: ["sortie clinique", "transfert hôtel", "suivi", "soins infirmiers"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Vais-je avoir besoin de soins post-opératoires après une cruroplastie ?",
        answer: "Oui, les soins post-opératoires incluent : pansements, port d'un vêtement de contention, séances de drainage lymphatique pour réduire l'œdème et favoriser la cicatrisation.",
        keywords: ["soins post-opératoires", "vêtement contention", "drainage lymphatique", "cicatrisation"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Combien de temps dois-je rester en Tunisie pour une cruroplastie ?",
        answer: "Le séjour recommandé est généralement de 7 à 10 jours afin d'assurer : le suivi post-opératoire, le retrait des drains si nécessaires, la validation médicale avant le retour.",
        keywords: ["durée séjour", "combien de jours", "retrait drains", "validation retour"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quels sont les risques liés à une cruroplastie ?",
        answer: "L'agence doit informer sur : infection, hématome, retard de cicatrisation, œdème temporaire. Et rassurer sur le fait qu'un suivi médical est assuré pendant tout le séjour.",
        keywords: ["risques cruroplastie", "complications", "danger cuisses", "effets secondaires"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Sou uma boa candidata para uma cruroplastia (lifting de coxas)?",
        answer: "Você é geralmente elegível se apresenta: flacidez cutânea nas coxas, perda de volume após emagrecimento ou gravidez, pele que não se retesa mais apesar do exercício, peso estável por pelo menos 6 meses. Uma avaliação médica prévia com o cirurgião é obrigatória para confirmar a indicação cirúrgica.",
        keywords: ["cruroplastia", "lifting coxas", "candidata cruroplastia", "flacidez coxas", "cirurgia coxas"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quem é o cirurgião que realizará minha cruroplastia?",
        answer: "A agência deve fornecer: o nome do cirurgião, suas certificações, experiência em cirurgia corporal, fotos antes/depois de pacientes que fizeram cruroplastia.",
        keywords: ["cirurgião cruroplastia", "cirurgião lifting coxas", "experiência coxas", "perfil cirurgião"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Em qual clínica será realizado o procedimento de cruroplastia?",
        answer: "A agência deve especificar: o nome da clínica, as normas de higiene e segurança, a acreditação do estabelecimento, se há uma unidade de terapia intensiva disponível se necessário.",
        keywords: ["clínica cruroplastia", "clínica lifting coxas", "clínica acreditada", "normas segurança"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quais exames devo fazer antes de uma cruroplastia?",
        answer: "Sim, é necessária uma avaliação pré-operatória que inclui: exame de sangue, ECG, consulta com o anestesiologista. Estes exames podem ser realizados à sua chegada na Tunísia.",
        keywords: ["exames cruroplastia", "exames lifting coxas", "exame sangue", "ECG", "anestesiologista"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quanto tempo ficarei na clínica após uma cruroplastia?",
        answer: "A duração da estadia na clínica é geralmente de 1 a 2 noites sob supervisão médica.",
        keywords: ["hospitalização cruroplastia", "estadia lifting coxas", "noites clínica", "supervisão"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "O que acontece após minha saída da clínica depois de uma cruroplastia?",
        answer: "A agência deve incluir: traslado clínica → hotel, acompanhamento pós-operatório, visitas de controle, cuidados de enfermagem se necessários.",
        keywords: ["saída clínica", "traslado hotel", "acompanhamento", "cuidados enfermagem"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Vou precisar de cuidados pós-operatórios após uma cruroplastia?",
        answer: "Sim, os cuidados pós-operatórios incluem: curativos, uso de vestuário de compressão, sessões de drenagem linfática para reduzir o inchaço e promover a cicatrização.",
        keywords: ["cuidados pós-operatórios", "vestuário compressão", "drenagem linfática", "cicatrização"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quanto tempo devo ficar na Tunísia para uma cruroplastia?",
        answer: "A estadia recomendada é geralmente de 7 a 10 dias para garantir: acompanhamento pós-operatório, remoção de drenos se necessário, validação médica antes do retorno.",
        keywords: ["duração estadia", "quantos dias", "remoção drenos", "validação retorno"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "Quais são os riscos associados a uma cruroplastia?",
        answer: "A agência deve informar sobre: infecção, hematoma, atraso na cicatrização, edema temporário. E tranquilizar que o acompanhamento médico é garantido durante toda a estadia.",
        keywords: ["riscos cruroplastia", "riscos lifting coxas", "complicações", "efeitos colaterais"],
        imageUrl: "assets/img/chatbot/Cruroplastie.png"
      },
      {
        question: "feedback_sim",
        answer: "Obrigado! 😊",
        keywords: ["feedback_sim"]
      },
      {
        question: "feedback_nao",
        answer: `<a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">Contate um agente TuniCure em (+44) 7403904850</a>`,
        keywords: ["feedback_nao"]
      },
      {
        question: "feedback_invalid",
        answer: "Por favor, responda 'sim' ou 'não'.",
        keywords: ["feedback_invalid"]
      },
      {
        question: "feedback_timeout",
        answer: "Continuo aqui se tiver mais perguntas! 😊",
        keywords: ["feedback_timeout"]
      }
    ],
    de: [
      // Ginoplastik / Gesichtsfeminisierung
      {
        question: "Worin besteht eine Ginoplastik bei der Feminisierung des Gesichts?",
        answer: "Die Ginoplastik ist ein Eingriff, der darauf abzielt, die Kieferwinkel zu verfeinern und zu glätten, indem der Unterkieferknochen neu geformt wird, um weichere, harmonischere und femininere Gesichtszüge zu erzielen.",
        keywords: ["Ginoplastik", "Gesichtsfeminisierung", "Kiefer", "Kieferwinkel", "Feminisierung Gesicht"],
        synonyms: ["Was ist Ginoplastik", "Definition Ginoplastik", "weibliche Kieferchirurgie"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Bin ich eine gute Kandidatin für eine Ginoplastik?",
        answer: "Sie können eine gute Kandidatin sein, wenn Ihr Kiefer breit, eckig oder stark ausgeprägt ist und Sie sich weichere Gesichtskonturen wünschen. Der Chirurg bestätigt dies nach medizinischer Analyse und Bewertung Ihrer Fotos.",
        keywords: ["gute Kandidatin", "Ginoplastik Kandidat", "Indikation Ginoplastik", "qualifiziert Ginoplastik"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Kann die Ginoplastik allein durchgeführt werden?",
        answer: "Ja, sie kann allein oder im Rahmen eines umfassenden Programms zur Gesichtsfeminisierung durchgeführt werden, in Kombination mit Kinn, Wangenknochen, Stirn, Nase oder Weichteilen, je nach Ihren Zielen.",
        keywords: ["Ginoplastik allein", "Kombination Eingriffe", "Programm Gesichtsfeminisierung", "kombinierte Chirurgie"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Welche chirurgische Technik wird bei der Ginoplastik verwendet?",
        answer: "Die Technik besteht darin, den Kieferknochen präzise zu modellieren. Die Schnitte werden meist im Mundinneren vorgenommen, sodass keine sichtbaren Narben im Gesicht entstehen.",
        keywords: ["Technik Ginoplastik", "intraorale Schnitte", "Kieferchirurgie", "Methode Ginoplastik"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Welche Risiken gibt es bei einer Ginoplastik?",
        answer: "Wie bei jeder Operation gibt es Risiken (Infektion, verlängerte Schwellung, vorübergehende Taubheit), die jedoch selten sind, wenn der Eingriff von einem erfahrenen Chirurgen in einer sicheren medizinischen Umgebung durchgeführt wird.",
        keywords: ["Risiken Ginoplastik", "Komplikationen", "Gefahr Kieferchirurgie", "Nebenwirkungen"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },

      // Rhinoplastik
      {
        question: "Worin besteht eine Rhinoplastik?",
        answer: "Die Rhinoplastik ist ein chirurgischer Eingriff zur Verbesserung der Nasenform und/oder der Atmung, unter Berücksichtigung der Gesichtsharmonie und Ihrer natürlichen Gesichtszüge.",
        keywords: ["Rhinoplastik", "Nasenchirurgie", "Nase", "Nasenkorrektur", "Nasenformung"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "Was ist der Unterschied zwischen klassischer Rhinoplastik und Piezo-Rhinoplastik?",
        answer: "Die Piezo-Rhinoplastik verwendet Ultraschall, um den Knochen präzise zu formen, ohne das umliegende Gewebe zu traumatisieren. Sie ermöglicht in der Regel weniger Blutergüsse, weniger Schwellungen und eine schnellere Genesung als die klassische Technik.",
        keywords: ["Piezo Rhinoplastik", "Piezo vs klassisch", "Ultraschall Nase", "Piezo Technologie"],
        synonyms: ["Unterschied Rhinoplastik", "welche Rhinoplastik wählen"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "Kann eine Rhinoplastik die Atmung verbessern?",
        answer: "Ja. Eine Rhinoplastik kann funktionell sein, insbesondere bei einer Nasenscheidewandverkrümmung (Septumplastik), und die Atmung deutlich verbessern.",
        keywords: ["funktionelle Rhinoplastik", "Nasenatmung", "Septumplastik", "funktionelle Nase"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "Wie lange dauert eine Rhinoplastik?",
        answer: "Die Operation dauert durchschnittlich 2 bis 3 Stunden. Eine Nacht in der Klinik ist in der Regel ausreichend.",
        keywords: ["Dauer Rhinoplastik", "Operationszeit Nase", "Länge Nasenchirurgie", "Krankenhausaufenthalt Rhinoplastik"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },

      // Mommy Makeover
      {
        question: "Was ist ein Mommy Makeover?",
        answer: "Das Mommy Makeover ist eine Reihe personalisierter Eingriffe zur Wiederherstellung der Silhouette nach einer oder mehreren Schwangerschaften. Es kombiniert in der Regel eine Bauchdeckenstraffung (Tummy Tuck), eine Brustoperation (Lifting, Vergrößerung oder Verkleinerung) und manchmal eine Fettabsaugung.",
        keywords: ["Mommy Makeover", "nach Schwangerschaft", "postpartale Formung", "postpartale Chirurgie"],
        synonyms: ["Was ist Mommy Makeover", "Makeover Mutter"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Welche Eingriffe können in ein Mommy Makeover einbezogen werden?",
        answer: "Das Programm ist vollständig personalisiert und kann umfassen: Bauchdeckenstraffung (mit oder ohne Muskelreparatur), Bruststraffung (mit oder ohne Implantate), gezielte Fettabsaugung (Bauch, Flanken, Rücken, Hüften). Der Chirurg wird die am besten geeignete Kombination für Ihre Ziele festlegen.",
        keywords: ["Eingriffe Mommy Makeover", "Kombination Operationen", "Paket Mommy Makeover", "enthaltene Verfahren"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Wird alles in einer einzigen Operation beim Mommy Makeover durchgeführt?",
        answer: "In den meisten Fällen ja. Die Eingriffe werden in einer einzigen Operation kombiniert, um die Anästhesie zu begrenzen und die Genesung zu optimieren, unter Einhaltung der Sicherheitsregeln.",
        keywords: ["eine Operation", "kombinierte Chirurgie", "Zeitpunkt Mommy Makeover", "Gleichzeitigkeit Eingriffe"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Wann kann ich nach einem Mommy Makeover meine Aktivitäten wieder aufnehmen?",
        answer: "Leichte Aktivitäten können nach 10 bis 14 Tagen wieder aufgenommen werden. Körperliche Anstrengungen und Sport sind in der Regel nach 6 bis 8 Wochen erlaubt, je nach Verlauf.",
        keywords: ["Genesung Mommy Makeover", "Wiederaufnahme Aktivitäten", "Rekonvaleszenz", "Heilungszeit"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },

      // Liposuktion
      {
        question: "Worin besteht eine Liposuktion?",
        answer: "Die Liposuktion ist ein chirurgischer Eingriff zur Entfernung lokalisierter Fettdepots, die gegen Sport und Ernährung resistent sind, um die Silhouette zu verfeinern und neu zu formen.",
        keywords: ["Liposuktion", "Fettabsaugung", "lokalisierte Fett", "Silhouette", "Fettchirurgie"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "Welche Bereiche können mit Liposuktion behandelt werden?",
        answer: "Die am häufigsten behandelten Bereiche sind Bauch, Flanken, Rücken, Oberschenkel, Hüften, Arme, Kinn und Knie. Der Chirurg wird die für Ihre Morphologie geeigneten Bereiche bestätigen.",
        keywords: ["Bereiche Liposuktion", "behandelte Regionen", "Körper Liposuktion", "Fettlokalisationen"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "Kann die Liposuktion mit einem anderen Eingriff kombiniert werden?",
        answer: "Ja, sie kann mit einer Bauchdeckenstraffung (Tummy Tuck), einem BBL (Lipofilling) oder anderen Eingriffen nach Ihren ästhetischen Zielen und medizinischen Empfehlungen kombiniert werden.",
        keywords: ["kombinierte Liposuktion", "Verbindung Operationen", "Lipo + andere", "mehrfache Chirurgie", "BBL"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },
      {
        question: "Ist das Ergebnis der Liposuktion dauerhaft?",
        answer: "Die entfernten Fettzellen kommen nicht zurück, aber eine Gewichtszunahme kann das Ergebnis verändern. Ein gesunder Lebensstil ist für die langfristige Aufrechterhaltung der Ergebnisse unerlässlich.",
        keywords: ["dauerhaftes Ergebnis", "Haltbarkeit Liposuktion", "Erhalt Ergebnisse", "Permanenz Lipo"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },

      // Tummy Tuck (Abdominoplastik)
      {
        question: "Was ist ein Tummy Tuck (Abdominoplastik)?",
        answer: "Der Tummy Tuck (oder Abdominoplastik) ist ein chirurgischer Eingriff, bei dem überschüssige Haut und Fett von der Bauchdecke entfernt und die Bauchmuskeln gestrafft werden, um einen flacheren und festeren Bauch zu erhalten.",
        keywords: ["Tummy Tuck", "Abdominoplastik", "flacher Bauch", "Bauchchirurgie", "Bauch"],
        synonyms: ["Was ist eine Abdominoplastik", "Definition Tummy Tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },

      // Body Lift
      {
        question: "Was ist ein Body Lift?",
        answer: "Der Body Lift ist ein umfassender chirurgischer Eingriff, der mehrere Körperbereiche (Bauch, Gesäß, Oberschenkel) in einer einzigen Operation neu formt und strafft. Er ist ideal nach einer erheblichen Gewichtsabnahme.",
        keywords: ["Body Lift", "Körperstraffung", "ganze Körperchirurgie", "Körperformung", "nach Gewichtsverlust"],
        synonyms: ["Körperstraffung", "Körperformungschirurgie"],
        imageUrl: "assets/img/chatbot/Body-Lift.png"
      },

      // Buttock Augmentation
      {
        question: "Was ist eine Buttock Augmentation?",
        answer: "Die Buttock Augmentation (oder Gesäßvergrößerung) ist ein chirurgischer Eingriff zur Vergrößerung des Volumens und Verbesserung der Gesäßform, entweder durch Implantate oder Fetttransfer (BBL).",
        keywords: ["Buttock Augmentation", "Gesäßvergrößerung", "Gesäß", "Gesäßimplantate", "BBL"],
        synonyms: ["Vergrößerung Gesäß", "Gesäßchirurgie"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },

      // Breast Augmentation
      {
        question: "Was ist eine Breast Augmentation?",
        answer: "Die Breast Augmentation (oder Brustvergrößerung) ist ein chirurgischer Eingriff, der die Größe der Brüste vergrößert und ihre Form mit Brustimplantaten oder Fetttransfer verbessert.",
        keywords: ["Breast Augmentation", "Brustvergrößerung", "Brustimplantate", "Brüste", "Brust"],
        synonyms: ["Vergrößerung der Brüste", "Brustchirurgie"],
        imageUrl: "assets/img/chatbot/Breast-Augmentation.png"
      },

      // Breast Reduction
      {
        question: "Was ist eine Breast Reduction?",
        answer: "Die Breast Reduction (oder Brustverkleinerung) ist ein chirurgischer Eingriff, der die Größe der Brüste reduziert, indem überschüssiges Fett-, Drüsen- und Hautgewebe entfernt wird, um Rückenschmerzen zu lindern und die Körperproportionen zu verbessern.",
        keywords: ["Breast Reduction", "Brustverkleinerung", "zu schwere Brüste", "Makromastie", "Rückenschmerzen"],
        synonyms: ["Verkleinerung der Brüste", "reduzierende Brustchirurgie"],
        imageUrl: "assets/img/chatbot/Breast-Reduction.png"
      },

      // Mastopexy / Breast Lift
      {
        question: "Was ist eine Mastopexy (Breast Lift)?",
        answer: "Die Mastopexy (oder Bruststraffung) ist ein chirurgischer Eingriff, der erschlaffte Brüste anhebt und strafft, indem überschüssige Haut entfernt und das Gewebe gestrafft wird, ohne das Volumen signifikant zu verändern.",
        keywords: ["Mastopexy", "Breast Lift", "Bruststraffung", "erschlaffte Brüste", "Brustptose"],
        synonyms: ["Anhebung der Brüste", "Brustaufrichtung"],
        imageUrl: "assets/img/chatbot/Mastopexy-Breast-Lift.png"
      },

      // Breast Reconstruction
      {
        question: "Was ist eine Breast Reconstruction?",
        answer: "Die Breast Reconstruction (oder Brustrekonstruktion) ist ein chirurgischer Eingriff, der Form, Volumen und Aussehen der Brust nach einer Mastektomie (Brustentfernung) aus medizinischen Gründen wiederherstellt.",
        keywords: ["Breast Reconstruction", "Brustrekonstruktion", "nach Mastektomie", "Brustkrebs", "Brustwiederherstellung"],
        synonyms: ["Rekonstruktion der Brüste", "rekonstruktive Chirurgie"],
        imageUrl: "assets/img/chatbot/Breast-Reconstruction.png"
      },

      // Breast Implant Exchange / Removal
      {
        question: "Was ist der Austausch oder die Entfernung von Brustimplantaten?",
        answer: "Der Austausch oder die Entfernung von Brustimplantaten ist ein chirurgischer Eingriff, bei dem vorhandene Implantate durch neue ersetzt oder vollständig entfernt werden, oft aus medizinischen, ästhetischen oder persönlichen Gründen.",
        keywords: ["Breast Implant Exchange", "Implantatentfernung", "Implantatersatz", "Explantation", "Kapsulektomie"],
        synonyms: ["Wechsel der Implantate", "Entfernung Brustimplantate"],
        imageUrl: "assets/img/chatbot/Breast-Implant-Exchange-Removal.png"
      },

      // Laser Vaginal Rejuvenation
      {
        question: "Was ist eine Laser Vaginal Rejuvenation?",
        answer: "Die Laser Vaginal Rejuvenation ist ein nicht-chirurgisches Verfahren, das Lasertechnologie zur Behandlung von vaginaler Erschlaffung, leichter Harninkontinenz und zur Verbesserung der Sexualfunktion nach der Geburt oder mit zunehmendem Alter einsetzt.",
        keywords: ["Laser Vaginal Rejuvenation", "vaginale Verjüngung", "Vaginalstraffung", "Inkontinenz", "vaginale Erschlaffung"],
        synonyms: ["Scheidenverjüngung", "Scheidenstraffung"],
        imageUrl: "assets/img/chatbot/Laser-Vaginal-Rejuvenation.png"
      },

      // Allgemeine Fragen
      {
        question: "Hallo",
        answer: "Hallo! 👋 Willkommen bei TuniCure. Wie kann ich Ihnen heute helfen?",
        keywords: ["hallo", "guten tag", "hi", "guten abend", "hallo"]
      },
      {
        question: "Wie kann ich einen Termin vereinbaren?",
        answer: `Sie können einen Termin auf zwei Arten vereinbaren:

📞 **Telefonisch**: <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">(+44) 7403904850</a>
📝 **Online**: <a href="${this.orderPageLink}" class="chat-link-order">Klicken Sie hier, um das Anfrageformular auszufüllen</a>

Unser Team wird sich so schnell wie möglich mit Ihnen in Verbindung setzen, um Ihren Termin zu bestätigen.`,
        keywords: ["Termin", "Terminvereinbarung", "wie Termin machen", "einen Termin vereinbaren", "Beratung", "Termin buchen"]
      },
      {
        question: "Welche Verfahren bieten Sie an?",
        answer: "Wir bieten folgende Verfahren an:\n\n• Rhinoplastik (klassisch & Piezo)\n• Fettabsaugung (Liposuktion)\n• Ginoplastik\n• Mommy Makeover\n• Tummy Tuck (Abdominoplastik)\n• Body Lift\n• Brustvergrößerung\n• Brustverkleinerung\n• Bruststraffung (Mastopexy)\n• BBL (Brazilian Butt Lift)\n• Haartransplantation\n• Blepharoplastik (Augenlidstraffung)\n• Haaransatzvorverlegung\n• Laser Vaginal Rejuvenation\n• Schlauchmagen (Sleeve-Gastrektomie)\n\nWir bieten auch viele weitere Verfahren, die auf Ihre Bedürfnisse zugeschnitten sind.",
        keywords: ["Verfahren", "Eingriffe", "Operationen", "Behandlungen", "Therapien", "Chirurgien"]
      },
      {
        question: "Welche Art von Tummy Tuck ist für mich geeignet (vollständig, Mini, mit Muskelreparatur)?",
        answer: "Der Chirurg wird Ihnen die für Ihre Morphologie und Ihre Ziele am besten geeignete Technik nach vollständiger Bewertung während der präoperativen Beratung erklären.",
        keywords: ["Art Tummy Tuck", "vollständiger Tummy Tuck", "Mini Tummy Tuck", "Muskelreparatur", "welcher Tummy Tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Wie viele Nächte werde ich nach einem Tummy Tuck in der Klinik bleiben?",
        answer: "In der Regel 2 bis 3 Nächte in der Klinik zur optimalen medizinischen Überwachung nach dem Eingriff.",
        keywords: ["Kliniknächte", "Krankenhausaufenthalt Tummy Tuck", "Dauer Klinikaufenthalt", "wie viele Nächte"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Ist das Hotel in der Nähe der Klinik?",
        answer: "Ja, die Unterkunft wird in der Nähe der Klinik ausgewählt, um die Wege zu erleichtern und Ihren Komfort während der Genesungsphase zu gewährleisten.",
        keywords: ["Hotel nah", "Kliniknähe", "Unterkunft nahe Klinik", "Beherbergung"],
        imageUrl: "assets/img/chatbot/Accommodation.png"
      },
      {
        question: "Ist das Tragen einer Kompressionskleidung nach einem Tummy Tuck inbegriffen?",
        answer: "Ja, eine postoperative Kompressionskleidung wird bereitgestellt oder verschrieben, und ihre Verwendung ist in der postoperativen Nachsorge enthalten.",
        keywords: ["postoperative Kompressionskleidung", "Komprimierung Tummy Tuck", "Kompression", "Kompressionsbekleidung"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Sind Physiotherapie- oder Lymphdrainage-Sitzungen inbegriffen?",
        answer: "Ja, je nach gewähltem Paket sind Lymphdrainage- oder Physiotherapiesitzungen enthalten oder als Option zur Optimierung Ihrer Genesung angeboten.",
        keywords: ["Physiotherapie", "Lymphdrainage", "Genesungssitzungen", "Rehabilitation"],
        imageUrl: "assets/img/chatbot/Post-Op-Care.png"
      },
      {
        question: "Wo wird die Narbe nach einem Tummy Tuck liegen?",
        answer: "Die Narbe wird tief platziert, in der Regel auf Bikinihöhe, diskret unter der Unterwäsche versteckt. Der Chirurg wird Ihnen ihre Entwicklung und die erforderliche Pflege erklären.",
        keywords: ["Narbe Tummy Tuck", "Narbenposition", "Narbe Abdominoplastik", "Narbenbildung"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Was passiert im Falle von Komplikationen?",
        answer: "Im Falle von Komplikationen gewährleistet die Agentur eine sofortige medizinische Nachsorge, Zugang zum Chirurgen und Behandlung nach etablierten medizinischen Protokollen mit 24/7-Unterstützung.",
        keywords: ["Komplikationen", "postoperative Probleme", "medizinischer Notfall", "Komplikationshilfe"],
        imageUrl: "assets/img/chatbot/Emergency-en.png"
      },
      {
        question: "Werde ich Unterstützung vor Ort haben?",
        answer: "Ja, eine medizinische Koordinatorin ist während Ihres gesamten Aufenthalts 24 Stunden am Tag verfügbar, um Sie zu unterstützen und Ihre Bedürfnisse zu erfüllen.",
        keywords: ["Unterstützung vor Ort", "medizinische Koordinatorin", "örtliche Hilfe", "Support"],
        imageUrl: "assets/img/chatbot/Assistance.png"
      },

      // Blepharoplastik
      {
        question: "Bin ich eine gute Kandidatin für eine Blepharoplastik der oberen und unteren Augenlider?",
        answer: "Nach Prüfung Ihrer Fotos, Ihres Alters, Ihrer Hautqualität und Ihrer Krankengeschichte wird der Chirurg Ihre Eignung für eine Blepharoplastik der oberen und unteren Augenlider bestätigen.",
        keywords: ["Blepharoplastik", "Augenlider", "Augen", "Kandidatin Blepharoplastik", "obere untere"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Welche Technik wird für die oberen und unteren Augenlider verwendet?",
        answer: "Der Chirurg wird die geeignete Technik erklären: Schnitt in der natürlichen Falte des oberen Augenlids und Schnitt unter den Wimpern oder transkonjunktivaler Zugang für das untere Augenlid, je nach Ihrem Fall.",
        keywords: ["Technik Blepharoplastik", "obere Augenlider", "untere Augenlider", "Methode"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Muss ich nach einer Blepharoplastik im Krankenhaus bleiben?",
        answer: "In den meisten Fällen handelt es sich um eine ambulante Operation. Eine Nacht kann je nach Ihrem Allgemeinzustand und der Meinung des Chirurgen empfohlen werden.",
        keywords: ["Krankenhausaufenthalt Blepharoplastik", "Kliniknacht", "ambulant", "Klinikaufenthalt"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Welche Auswirkungen hat eine Blepharoplastik (Schwellung, Blutergüsse)?",
        answer: "Schwellungen und Blutergüsse sind nach dem Eingriff normal und klingen innerhalb von 10 bis 15 Tagen allmählich ab. Kalte Kompressen werden in den ersten Tagen empfohlen.",
        keywords: ["Schwellung Augenlider", "Blutergüsse Augen", "Nebenwirkungen", "Genesung Blepharoplastik"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Wann kann ich meine normalen Aktivitäten nach einer Blepharoplastik wieder aufnehmen?",
        answer: "In der Regel nach 7 bis 10 Tagen für leichte Aktivitäten, je nach Ihrem Fortschritt und Ihrer Genesungsgeschwindigkeit.",
        keywords: ["Wiederaufnahme Aktivitäten", "Genesungszeit", "Rückkehr Arbeit", "Rekonvaleszenz"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Wo werden die Narben nach einer Blepharoplastik liegen?",
        answer: "Die Narben sind sehr diskret: in der natürlichen Falte des oberen Augenlids und unter den Wimpern oder im unteren Augenlid, je nach verwendeter Technik.",
        keywords: ["Narben Augenlider", "Narbenbildung Augen", "diskrete Narben", "Narbenposition"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },

      // Haartransplantation
      {
        question: "Bin ich eine gute Kandidatin für eine Haartransplantation?",
        answer: "Ja, nach einer personalisierten Analyse basierend auf Ihren Fotos, Ihrer Krankengeschichte, der Art des Haarausfalls und der Qualität des Spenderbereichs. Eine Konsultation mit dem Arzt ist vor der Bestätigung obligatorisch.",
        keywords: ["Kandidatin Haartransplantation", "Eignung Transplantation", "gute Kandidatin", "Qualifikation Transplantation"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Wird vor meiner Ankunft für eine Haartransplantation eine medizinische Diagnose gestellt?",
        answer: "Ja. Es wird eine Fernvorabstimmung durchgeführt (Fotos + medizinischer Fragebogen), dann eine abschließende Konsultation in der Klinik vor dem Eingriff zur Bestätigung der Diagnose.",
        keywords: ["Diagnose Transplantation", "vorherige Bewertung", "Fotoanalyse", "vorherige Konsultation"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Welche Technik wird für die Haartransplantation verwendet (FUE, DHI, Sapphire) und warum?",
        answer: "Die Wahl hängt von Ihrem Fall ab: FUE (am häufigsten verwendete Technik, natürlich und minimalinvasiv), DHI (direkte Implantation) oder Sapphire FUE (schnellere Heilung). Der Arzt wählt die am besten geeignete Technik für Ihre Kopfhaut und Ihre Ziele.",
        keywords: ["Technik Transplantation", "FUE", "DHI", "Sapphire", "Methode Transplantation"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Wer führt die Haartransplantation genau durch?",
        answer: "Die Transplantation wird von einem auf Haartransplantation spezialisierten Arzt durchgeführt, unterstützt von einem qualifizierten medizinischen Team. Der Arzt greift persönlich in die Schlüsselschritte ein (Design, Extraktion, Implantation).",
        keywords: ["Arzt Transplantation", "medizinisches Team", "Transplantationsspezialist", "wer führt durch"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Wie viele Transplantate werde ich bei einer Haartransplantation erhalten?",
        answer: "Die genaue Anzahl wird nach medizinischer Analyse bestätigt. Im Durchschnitt variiert sie zwischen 1.500 und 4.000 Transplantaten, je nach gewünschter Dichte und zu behandelndem Bereich.",
        keywords: ["Anzahl Transplantate", "Haarmenge", "Transplantate", "Dichte"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Wird das Ergebnis einer Haartransplantation natürlich sein?",
        answer: "Ja. Der Haaransatz wird maßgeschneidert entworfen, unter Berücksichtigung Ihrer Morphologie und der natürlichen Haarimplantation für ein harmonisches und natürliches Ergebnis.",
        keywords: ["natürliches Ergebnis", "natürliches Aussehen", "Harmonie", "frontales Design"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Ist eine Haartransplantation schmerzhaft?",
        answer: "Nein. Der Eingriff wird unter örtlicher Betäubung durchgeführt. Sie können während der Betäubung ein leichtes Unbehagen verspüren, aber während des Eingriffs keine starken Schmerzen.",
        keywords: ["Schmerz Transplantation", "Unbehagen", "örtliche Betäubung", "Komfort"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Sind Unterkunft und Transfers bei einer Haartransplantation inbegriffen?",
        answer: "Ja. Das Paket umfasst: Transfers Flughafen - Hotel - Klinik, Hotel (3 bis 5 Sterne je nach Paket), Unterstützung und Begleitung während des gesamten Aufenthalts.",
        keywords: ["Unterkunft Transplantation", "Transfers inbegriffen", "Komplettpaket", "Logistik"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Was passiert nach einer Haartransplantation?",
        answer: "Sie profitieren von: postoperativen Medikamenten, erster Wäsche in der Klinik, detaillierten Anweisungen und Fernbetreuung über mehrere Monate.",
        keywords: ["nach Transplantation", "postoperative Pflege", "Nachsorge", "Genesung"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Gibt es eine Phase des Haarausfalls nach einer Transplantation?",
        answer: "Ja. Ein vorübergehender Haarausfall (Schockverlust) ist zwischen 2 und 6 Wochen normal. Die Haare wachsen ab dem 3. Monat allmählich nach.",
        keywords: ["vorübergehender Haarausfall", "Schockverlust", "Haarausfall", "Ausfallphase"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Wann werde ich die endgültigen Ergebnisse einer Haartransplantation sehen?",
        answer: "Erste Anzeichen: 3-4 Monate, sichtbares Ergebnis: 6 Monate, endgültiges Ergebnis: 12 Monate nach dem Eingriff.",
        keywords: ["endgültige Ergebnisse", "Ergebniszeitraum", "Haarwachstumsentwicklung", "Wachstumszeit"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Was ist genau im Preis einer Haartransplantation enthalten?",
        answer: "Der Preis beinhaltet: Haartransplantation, ärztliche Honorare, Medikamente, Hotel, Transfers und postoperative Nachsorge. Keine versteckten Kosten.",
        keywords: ["Preis Transplantation", "im Preis enthalten", "Kosten", "Transparenz"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Gibt es eine Garantie für eine Haartransplantation?",
        answer: "Ja, die Agentur garantiert die Qualität der Betreuung und der medizinischen Nachsorge. Einige Zentren bieten auch eine Transplantatgarantie an.",
        keywords: ["Garantie Transplantation", "Qualitätssicherung", "Engagement", "Sicherheit"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },

      // Haaransatzvorverlegung
      {
        question: "Bin ich eine gute Kandidatin für eine Haaransatzvorverlegung?",
        answer: "Eine Bewertung erfolgt anhand Ihrer Fotos, der Stirnhöhe, der Elastizität der Kopfhaut, Ihrer Haardichte und des Fehlens von aktivem Haarausfall. Der Chirurg wird die Eignung während der Konsultation bestätigen.",
        keywords: ["Haaransatzvorverlegung", "Haaransatz", "Stirn", "Kandidatin Haaransatz"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Gibt es Kontraindikationen für die Haaransatzvorverlegung?",
        answer: "Vorgeschichte von starkem Haarausfall, fortschreitender Alopezie, schwieriger Heilung oder Kopfhauterkrankungen sollten dem Chirurgen gemeldet und von ihm bewertet werden.",
        keywords: ["Kontraindikationen", "Kontraindikation Haaransatz", "Risiken", "Vorsichtsmaßnahmen"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Wer wird die Haaransatzvorverlegung durchführen und welche Qualifikationen hat er?",
        answer: "Ein auf ästhetische Chirurgie und Kopfhautchirurgie spezialisierter Chirurg mit nachgewiesener Erfahrung in der Haaransatzvorverlegung.",
        keywords: ["Chirurg Haaransatz", "Qualifikationen", "Spezialist", "Erfahrung"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Ist die Klinik für die Haaransatzvorverlegung zertifiziert?",
        answer: "Ja, die Operation wird in einer zertifizierten Klinik durchgeführt, die internationale Hygiene- und Sicherheitsstandards einhält.",
        keywords: ["zertifizierte Klinik", "Zertifizierung", "Sicherheitsstandards", "Qualität"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Welche Technik wird für die Haaransatzvorverlegung verwendet?",
        answer: "Chirurgische Vorverlegung des Haaransatzes mit diskretem Schnitt auf Höhe des Haaransatzes, der eine natürliche Absenkung der Stirn ermöglicht.",
        keywords: ["Technik Haaransatz", "Methode Vorverlegung", "Chirurgie Haaransatz", "Verfahren"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Wie viele Zentimeter kann der Haaransatz vorverlegt werden?",
        answer: "Im Durchschnitt zwischen 1,5 und 3 cm, abhängig von der Elastizität der Kopfhaut und Ihrer Stirnmorphologie.",
        keywords: ["Zentimeter Vorverlegung", "Stirnabsenkung", "Distanz", "Messung"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Hinterlässt die Haaransatzvorverlegung eine sichtbare Narbe?",
        answer: "Die Narbe wird im Haaransatz platziert und wird mit der Zeit in der Regel sehr diskret, vom Haar verdeckt.",
        keywords: ["Narbe Haaransatz", "Narbensichtbarkeit", "Narbenbildung", "diskrete Narbe"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Welche Art von Anästhesie wird für die Haaransatzvorverlegung verwendet?",
        answer: "Vollnarkose oder örtliche Betäubung mit Sedierung, je nach Fall und Meinung des Chirurgen nach präoperativer Bewertung.",
        keywords: ["Anästhesie Haaransatz", "Anästhesieart", "Sedierung", "Vollnarkose"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Ist ein Klinikaufenthalt nach einer Haaransatzvorverlegung notwendig?",
        answer: "In der Regel 1 Nacht in der Klinik zur Überwachung, dann Transfer ins Hotel für den Rest der Rekonvaleszenz.",
        keywords: ["Klinikaufenthalt", "Kliniknacht", "Krankenhausaufenthalt", "Überwachung"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Sind die Schmerzen nach der Haaransatzvorverlegung stark?",
        answer: "Die Schmerzen sind in der Regel mäßig und werden durch die verschriebenen Behandlungen gut kontrolliert. In den ersten Tagen kann ein Unbehagen auftreten.",
        keywords: ["Schmerz Haaransatz", "Unbehagen", "postoperatives Unbehagen", "Schmerzmittel"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Wird es nach der Haaransatzvorverlegung Schwellungen oder Blutergüsse geben?",
        answer: "Ja, ein Ödem der Stirn und manchmal der Augenlider ist in den ersten Tagen häufig und verschwindet innerhalb etwa einer Woche allmählich.",
        keywords: ["Schwellung Haaransatz", "Blutergüsse", "Stirnödem", "blaue Flecken"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Ist das Ergebnis der Haaransatzvorverlegung dauerhaft?",
        answer: "Ja, die Haaransatzvorverlegung ist dauerhaft, vorbehaltlich der Haarestabilität und des Fehlens von fortschreitendem Haarausfall.",
        keywords: ["dauerhafter Haaransatz", "definitiv", "Haltbarkeit", "langanhaltendes Ergebnis"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },

      // Lip Lift
      {
        question: "Bin ich eine gute Kandidatin für einen Lip Lift?",
        answer: "Vor jeder Bestätigung wird Ihre Eignung vom Chirurgen anhand Ihrer medizinischen Fotos und Ihrer Krankengeschichte beurteilt. Ein Lip Lift wird im Allgemeinen für Patientinnen empfohlen, die folgende Merkmale aufweisen: eine dünne oder verlängerte Oberlippe, einen erheblichen Abstand zwischen Nase und Oberlippe, einen Mangel an Definition des Amorbogens. Eine präoperative Konsultation mit dem Chirurgen wird bei Ihrer Ankunft organisiert, um die Indikation zu bestätigen.",
        keywords: ["Lip Lift", "Kandidatin Lip Lift", "Eignung Lip Lift", "gute Kandidatin Lip Lift", "Lippenlifting"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Welche Qualifikation und Erfahrung hat der Chirurg für einen Lip Lift?",
        answer: "Wir arbeiten ausschließlich mit auf ästhetische Gesichtschirurgie spezialisierten Chirurgen zusammen, die für das Lip Lift-Verfahren zertifiziert und erfahren sind. Sie erhalten vor Bestätigung Ihres Aufenthalts: das Profil des Chirurgen, seine Berufserfahrung, Vorher-/Nachher-Fotos ähnlicher Fälle.",
        keywords: ["Qualifikation Chirurg Lip Lift", "Erfahrung Chirurg", "Chirurg Lip Lift", "Chirurgenprofil"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "In welcher Klinik wird der Lip Lift durchgeführt?",
        answer: "Ihr Eingriff wird in einer akkreditierten Klinik durchgeführt, die internationale Hygiene- und Sicherheitsstandards einhält, mit einem modernen Operationssaal und einem qualifizierten medizinischen Team.",
        keywords: ["Klinik Lip Lift", "Einrichtung", "akkreditierte Klinik", "Sicherheitsstandards"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Welche Technik wird für meinen Lip Lift verwendet?",
        answer: "Die am häufigsten verwendete Technik ist der subnasale Lip Lift (Bullhorn-Technik). Der Chirurg wird Ihnen erklären: die für Ihre Morphologie geeignete Technik, die Lage der Narbe (unter der Nasenbasis versteckt), das erwartete Ergebnis während der präoperativen Konsultation.",
        keywords: ["Technik Lip Lift", "Bullhorn-Technik", "subnasaler Lip Lift", "Methode Lip Lift"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Welche Art von Anästhesie wird für einen Lip Lift verwendet?",
        answer: "Der Lip Lift wird in der Regel unter örtlicher Betäubung durchgeführt, manchmal mit leichter Sedierung, je nach Ihrem Komfort und der Meinung des Chirurgen.",
        keywords: ["Anästhesie Lip Lift", "Anästhesieart", "Sedierung", "örtliche Betäubung"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Wie lange dauert der Lip Lift und der Aufenthalt?",
        answer: "Dauer des Eingriffs: etwa 45 Minuten bis 1 Stunde. Klinikaufenthalt: ambulant (Entlassung am selben Tag). Empfohlene Aufenthaltsdauer in Tunesien: 5 bis 6 Tage. Dies beinhaltet: präoperative Konsultation, Eingriff, postoperative Nachsorge, ggf. Fadenentfernung.",
        keywords: ["Dauer Lip Lift", "Operationszeit", "Klinikaufenthalt", "wie viele Tage"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Was beinhaltet das medizinische Paket für einen Lip Lift?",
        answer: "Ihr Paket beinhaltet: Konsultation mit dem Chirurgen, Klinik- und Verfahrensgebühren, postoperative Medikamente, VIP-Transfers (Flughafen / Klinik / Hotel), Hotelunterkunft, Unterstützung durch einen engagierten medizinischen Koordinator während Ihres gesamten Aufenthalts.",
        keywords: ["Paket Lip Lift", "Inklusivleistungen Lip Lift", "Leistungen", "medizinisches Paket"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Was sind die möglichen Risiken oder Komplikationen eines Lip Lift?",
        answer: "Wie jeder chirurgische Eingriff birgt auch der Lip Lift bestimmte Risiken wie: Infektion, Blutung, sichtbare Narbenbildung, Asymmetrie. Der Chirurg wird Sie während der präoperativen Konsultation ausführlich informieren, und es werden Maßnahmen ergriffen, um diese Risiken zu minimieren.",
        keywords: ["Risiken Lip Lift", "Komplikationen", "Gefahren Lip Lift", "Nebenwirkungen"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Wie ist die Genesungszeit nach einem Lip Lift?",
        answer: "Schwellung und Blutergüsse: 7 bis 10 Tage. Wiederaufnahme sozialer Aktivitäten: nach 10 bis 14 Tagen. Endgültiges Ergebnis: nach einigen Wochen sichtbar, wenn die Schwellung nachlässt.",
        keywords: ["Genesung Lip Lift", "Rekonvaleszenz", "Wiederaufnahme Aktivitäten", "Heilungszeit"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Gibt es eine Nachsorge nach meiner Rückkehr in mein Heimatland nach einem Lip Lift?",
        answer: "Ja, wir gewährleisten eine postoperative Fernbetreuung mit Ihrem medizinischen Koordinator und ggf. dem Chirurgen, um eine optimale Genesung zu gewährleisten.",
        keywords: ["Nachsorge Lip Lift", "nach Rückkehr", "Fernbetreuung", "postoperativ"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },

      // Neck Lift
      {
        question: "Bin ich eine gute Kandidatin für einen Neck Lift?",
        answer: "Ihre Eignung wird zunächst vom Chirurgen anhand von medizinischen Fotos und Ihrer Krankengeschichte beurteilt. Ein Neck Lift wird im Allgemeinen für Patientinnen empfohlen, die folgende Merkmale aufweisen: Hauterschlaffung im Halsbereich, Doppelkinn, sichtbare Muskelbänder (Platysma), Verlust der Definition des Kinn-Hals-Winkels. Eine präoperative Konsultation in der Klinik wird bei Ihrer Ankunft organisiert, um die chirurgische Indikation zu bestätigen.",
        keywords: ["Neck Lift", "Halsstraffung", "Kandidatin Neck Lift", "Hauterschlaffung Hals", "Doppelkinn"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Welche Qualifikation hat der Chirurg, der meinen Neck Lift durchführen wird?",
        answer: "Wir arbeiten mit auf ästhetische Gesichts- und Halschirurgie spezialisierten Chirurgen zusammen, die für Neck Lift-Verfahren zertifiziert und erfahren sind. Vor Ihrer Bestätigung erhalten Sie: das Profil des Chirurgen, seine Berufserfahrung, Vorher-/Nachher-Fotos ähnlicher Fälle.",
        keywords: ["Qualifikation Chirurg Neck Lift", "Erfahrung Chirurg Hals", "Chirurg Neck Lift", "Chirurgenprofil"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "In welcher Klinik wird der Neck Lift durchgeführt?",
        answer: "Ihr Neck Lift wird in einer akkreditierten Klinik durchgeführt, die internationale Sicherheitsstandards einhält, mit einem modernen Operationssaal und einem qualifizierten medizinischen Team.",
        keywords: ["Klinik Neck Lift", "Einrichtung", "akkreditierte Klinik", "Sicherheitsstandards"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Welche Technik wird in meinem Fall für den Neck Lift verwendet?",
        answer: "Die verwendete Technik hängt von Ihrer Anatomie und dem Grad der Hauterschlaffung ab. Sie kann umfassen: Straffung des Platysma-Muskels, Entfernung von überschüssiger Haut, ggf. Fettabsaugung des Halses. Der Chirurg wird Ihnen die empfohlene Technik während Ihrer präoperativen Konsultation im Detail erklären.",
        keywords: ["Technik Neck Lift", "Platysma", "Muskelstraffung", "Halstechnik"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Welche Art von Anästhesie wird für einen Neck Lift verwendet?",
        answer: "Der Neck Lift wird in der Regel unter Vollnarkose durchgeführt, um Ihren Komfort und Ihre Sicherheit während des Eingriffs zu gewährleisten.",
        keywords: ["Anästhesie Neck Lift", "Anästhesieart", "Vollnarkose", "Sedierung"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Wie lange dauert der Neck Lift und der Aufenthalt?",
        answer: "Dauer des Eingriffs: 2 bis 3 Stunden. Klinikaufenthalt: 1 Nacht. Empfohlener Aufenthalt in Tunesien: 6 bis 7 Tage. Ihr Aufenthalt umfasst: präoperative Konsultation, medizinische Tests, chirurgischen Eingriff, postoperative Nachsorge, ggf. Entfernung von Drainagen und Nähten.",
        keywords: ["Dauer Neck Lift", "Operationszeit", "Klinikaufenthalt", "wie viele Tage"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Was beinhaltet das medizinische Paket für einen Neck Lift?",
        answer: "Ihr Paket beinhaltet: Konsultation mit dem Chirurgen, Klinik- und Verfahrensgebühren, Anästhesie, postoperative Medikamente, Kompressionskleidung (Kinnriemen), VIP-Transfers (Flughafen / Klinik / Hotel), Hotelunterkunft, Unterstützung durch einen engagierten medizinischen Koordinator während Ihres gesamten Aufenthalts.",
        keywords: ["Paket Neck Lift", "Inklusivleistungen Neck Lift", "Leistungen", "medizinisches Paket"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Welche Risiken sind mit einem Neck Lift verbunden?",
        answer: "Wie jede Operation birgt auch der Neck Lift bestimmte Risiken wie: Infektion, Hämatom, verlängerte Schwellung, sichtbare Narbenbildung, vorübergehende Taubheit. Es werden alle notwendigen Maßnahmen ergriffen, um diese Risiken zu minimieren und Ihre Sicherheit zu gewährleisten.",
        keywords: ["Risiken Neck Lift", "Komplikationen", "Gefahren Neck Lift", "Nebenwirkungen"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Wie ist die Genesungszeit nach einem Neck Lift?",
        answer: "Schwellung und Blutergüsse: 10 bis 14 Tage. Tragen des Kinnriemens: für 2 bis 3 Wochen empfohlen. Wiederaufnahme sozialer Aktivitäten: nach 2 Wochen. Endgültiges Ergebnis: über 2 bis 3 Monate allmählich sichtbar.",
        keywords: ["Genesung Neck Lift", "Rekonvaleszenz", "Wiederaufnahme Aktivitäten", "Heilungszeit"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Wird nach meiner Rückkehr in mein Heimatland eine Nachsorge gewährleistet?",
        answer: "Ja, wir gewährleisten eine postoperative Fernbetreuung mit Ihrem medizinischen Koordinator und dem Chirurgen, um Ihre Genesung nach Ihrer Rückkehr zu begleiten.",
        keywords: ["Nachsorge Neck Lift", "nach Rückkehr", "Fernbetreuung", "postoperativ"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },

      // Buccal Fat Removal (Bichektomie)
      {
        question: "Bin ich eine gute Kandidatin für eine Wangenfettentfernung (Bichektomie)?",
        answer: "Ihre Eignung wird vom Chirurgen anhand von medizinischen Fotos und Ihrer Krankengeschichte beurteilt. Die Wangenfettentfernung wird im Allgemeinen für Patientinnen empfohlen, die folgende Merkmale aufweisen: ein rundes Gesicht oder volle Wangen, überschüssiges Fett in den Wangenfettpolstern (Bichat-Polster), mangelnde Definition der Wangenknochen oder des Gesichtsovals. Eine präoperative Konsultation wird bei Ihrer Ankunft organisiert, um die chirurgische Indikation zu bestätigen.",
        keywords: ["Wangenfettentfernung", "Bichektomie", "Wangen", "rundes Gesicht", "Gesicht verschlanken"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Welche Qualifikation hat der Chirurg, der meine Bichektomie durchführen wird?",
        answer: "Wir arbeiten mit auf ästhetische Gesichtschirurgie spezialisierten Chirurgen zusammen, die für das Bichektomie-Verfahren zertifiziert und erfahren sind. Vor jeder Bestätigung erhalten Sie: das Profil des Chirurgen, seine Berufserfahrung, Vorher-/Nachher-Fotos ähnlicher Fälle.",
        keywords: ["Qualifikation Chirurg Bichektomie", "Erfahrung Chirurg", "Chirurg Bichektomie", "Chirurgenprofil"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "In welcher Klinik wird die Bichektomie durchgeführt?",
        answer: "Ihr Eingriff wird in einer akkreditierten Klinik durchgeführt, die internationale Hygiene- und Sicherheitsstandards einhält, mit einem modernen Operationssaal und einem qualifizierten medizinischen Team.",
        keywords: ["Klinik Bichektomie", "Einrichtung", "akkreditierte Klinik", "Sicherheitsstandards"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Wie wird die Bichektomie durchgeführt?",
        answer: "Die Bichektomie besteht darin, einen Teil der Wangenfettpolster (Bichat-Polster) zu entfernen, um den unteren Teil des Gesichts zu verschlanken. Die Schnitte werden im Mundinneren vorgenommen, sodass keine sichtbaren Narben auf der Haut entstehen.",
        keywords: ["Ablauf Bichektomie", "Technik", "Schnitt Mund", "keine Narben"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Welche Art von Anästhesie wird für eine Bichektomie verwendet?",
        answer: "Die Bichektomie wird in der Regel unter örtlicher Betäubung durchgeführt, manchmal mit leichter Sedierung, je nach Ihrem Komfort und der Meinung des Chirurgen.",
        keywords: ["Anästhesie Bichektomie", "Anästhesieart", "örtliche Betäubung", "Sedierung"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Wie lange dauert die Bichektomie und der Aufenthalt?",
        answer: "Dauer des Eingriffs: 30 bis 45 Minuten. Klinikaufenthalt: ambulant (Entlassung am selben Tag). Empfohlene Aufenthaltsdauer in Tunesien: 4 bis 5 Tage. Ihr Aufenthalt umfasst: präoperative Konsultation, ggf. medizinische Tests, chirurgischen Eingriff, postoperative Nachsorge.",
        keywords: ["Dauer Bichektomie", "Operationszeit", "Klinikaufenthalt", "wie viele Tage"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Was beinhaltet das medizinische Paket für eine Bichektomie?",
        answer: "Ihr Paket beinhaltet: Honorare des Chirurgen, Klinikgebühren, Anästhesie, postoperative Medikamente, VIP-Transfers (Flughafen / Klinik / Hotel), Hotelunterkunft, Unterstützung durch einen engagierten medizinischen Koordinator während Ihres gesamten Aufenthalts.",
        keywords: ["Paket Bichektomie", "Inklusivleistungen Bichektomie", "Leistungen", "medizinisches Paket"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Was sind die möglichen Risiken oder Komplikationen einer Bichektomie?",
        answer: "Wie jeder chirurgische Eingriff birgt auch die Bichektomie bestimmte Risiken wie: Infektion, Schwellung, Asymmetrie, vorübergehende Taubheit. Es werden alle Maßnahmen ergriffen, um diese Risiken zu minimieren.",
        keywords: ["Risiken Bichektomie", "Komplikationen", "Gefahren Bichektomie", "Nebenwirkungen"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Wie ist die Genesungszeit nach einer Bichektomie?",
        answer: "Schwellung: 7 bis 10 Tage. Wiederaufnahme sozialer Aktivitäten: nach 5 bis 7 Tagen. Endgültiges Ergebnis: nach 4 bis 6 Wochen allmählich sichtbar.",
        keywords: ["Genesung Bichektomie", "Rekonvaleszenz", "Wiederaufnahme Aktivitäten", "Heilungszeit"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },

      // Feedback für Deutsch
      {
        question: "feedback_ja",
        answer: "Danke! 😊",
        keywords: ["feedback_ja"]
      },
      {
        question: "feedback_nein",
        answer: `<a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">Kontaktieren Sie einen TuniCure-Agenten unter (+44) 7403904850</a>`,
        keywords: ["feedback_nein"]
      },
      {
        question: "feedback_invalid",
        answer: "Bitte antworten Sie mit 'ja' oder 'nein'.",
        keywords: ["feedback_invalid"]
      },
      {
        question: "feedback_timeout",
        answer: "Ich bin noch da, falls Sie weitere Fragen haben! 😊",
        keywords: ["feedback_timeout"]
      }
    ],
    it: [
      // Ginoplastica / Femminilizzazione del viso
      {
        question: "In cosa consiste una ginoplastica nella femminilizzazione del viso?",
        answer: "La ginoplastica è un intervento che mira ad ammorbidire e affinare gli angoli della mandibola rimodellando l'osso mandibolare, per ottenere tratti più femminili, armoniosi ed equilibrati.",
        keywords: ["ginoplastica", "femminilizzazione viso", "mandibola", "angolo mandibolare", "femminilizzazione del viso"],
        synonyms: ["cos'è la ginoplastica", "definizione ginoplastica", "chirurgia mandibola femminile"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Sono una buona candidata per una ginoplastica?",
        answer: "Puoi essere una buona candidata se la tua mandibola è larga, squadrata o molto marcata e desideri un contorno del viso più morbido. Il chirurgo confermerà l'indicazione dopo un'analisi medica e lo studio delle tue foto.",
        keywords: ["buona candidata", "candidatura ginoplastica", "indicazione ginoplastica", "qualificata ginoplastica"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "La ginoplastica può essere eseguita da sola?",
        answer: "Sì, può essere eseguita da sola oppure integrata in un programma completo di femminilizzazione del viso, in combinazione con mento, zigomi, fronte, naso o tessuti molli, in base ai tuoi obiettivi.",
        keywords: ["ginoplastica singola", "combinazione interventi", "programma femminilizzazione viso", "chirurgia combinata"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Quale tecnica chirurgica viene utilizzata per la ginoplastica?",
        answer: "La tecnica consiste nel rimodellare con precisione l'osso dell'angolo mandibolare. Le incisioni sono generalmente effettuate all'interno della bocca, evitando cicatrici visibili sul viso.",
        keywords: ["tecnica ginoplastica", "incisione intraorale", "chirurgia mandibola", "metodo ginoplastica"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },
      {
        question: "Quali sono i rischi della ginoplastica?",
        answer: "Come ogni intervento chirurgico, esistono rischi (infezione, edema prolungato, intorpidimento temporaneo), ma sono rari se eseguito da un chirurgo esperto in un ambiente medico sicuro.",
        keywords: ["rischi ginoplastica", "complicazioni", "pericolo chirurgia mandibola", "effetti collaterali"],
        imageUrl: "assets/img/chatbot/Ginoplastie.png"
      },

      // Rinoplastica
      {
        question: "In cosa consiste una rinoplastica?",
        answer: "La rinoplastica è un intervento chirurgico volto a migliorare la forma del naso e/o la respirazione, rispettando l'armonia del viso e i tuoi tratti naturali.",
        keywords: ["rinoplastica", "chirurgia naso", "naso", "rino", "rimodellamento naso"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "Qual è la differenza tra rinoplastica classica e rinoplastica Piezo?",
        answer: "La rinoplastica Piezo utilizza ultrasuoni per rimodellare l'osso con grande precisione, senza traumatizzare i tessuti circostanti. Generalmente permette meno ecchimosi, meno gonfiore e un recupero più rapido rispetto alla tecnica classica.",
        keywords: ["rinoplastica piezo", "piezo vs classica", "ultrasuoni naso", "tecnologia piezo"],
        synonyms: ["differenza rinoplastica", "quale rinoplastica scegliere"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "La rinoplastica può migliorare la respirazione?",
        answer: "Sì. Una rinoplastica può essere funzionale, soprattutto in caso di deviazione del setto nasale (settoplastica), e migliorare significativamente la respirazione.",
        keywords: ["rinoplastica funzionale", "respirazione naso", "settoplastica", "naso funzionale"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },
      {
        question: "Quanto dura un intervento di rinoplastica?",
        answer: "L'intervento dura in media 2-3 ore. Una notte in clinica è generalmente sufficiente.",
        keywords: ["durata rinoplastica", "tempo operazione naso", "lunghezza chirurgia naso", "ricovero rinoplastica"],
        imageUrl: "assets/img/chatbot/Rhinoplastie.png"
      },

      // Mommy Makeover
      {
        question: "Cos'è un Mommy Makeover?",
        answer: "Il Mommy Makeover è un insieme di interventi personalizzati volti a ripristinare la silhouette dopo una o più gravidanze. Generalmente associa un'addominoplastica (tummy tuck), una chirurgia mammaria (lifting, aumento o riduzione) e talvolta una liposuzione.",
        keywords: ["mommy makeover", "dopo gravidanza", "rimessa in forma post-gravidanza", "chirurgia post-partum"],
        synonyms: ["cos'è mommy makeover", "makeover mamma"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Quali interventi possono essere inclusi in un Mommy Makeover?",
        answer: "Il programma è interamente personalizzato e può includere: Tummy tuck (con o senza riparazione dei muscoli), Lifting del seno (con o senza protesi), Liposuzione mirata (addome, fianchi, schiena, anche). Il chirurgo definirà la combinazione più adatta ai tuoi obiettivi.",
        keywords: ["interventi mommy makeover", "combinazione chirurgie", "pacchetto mommy makeover", "procedure incluse"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Tutto viene eseguito in un unico intervento per il Mommy Makeover?",
        answer: "Nella maggior parte dei casi, sì. Gli interventi vengono combinati in un'unica operazione per limitare l'anestesia e ottimizzare il recupero, nel rispetto delle regole di sicurezza.",
        keywords: ["unico intervento", "chirurgia combinata", "tempi mommy makeover", "simultaneità interventi"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },
      {
        question: "Quando potrò riprendere le mie attività dopo un Mommy Makeover?",
        answer: "Le attività leggere possono essere riprese dopo 10-14 giorni. Gli sforzi fisici e lo sport sono generalmente autorizzati dopo 6-8 settimane, a seconda dell'evoluzione.",
        keywords: ["recupero mommy makeover", "ripresa attività", "convalescenza", "tempo di guarigione"],
        imageUrl: "assets/img/chatbot/Mommy-Makeover.png"
      },

      // Liposuzione
      {
        question: "In cosa consiste una liposuzione?",
        answer: "La liposuzione è un intervento chirurgico volto a eliminare gli accumuli di grasso localizzati resistenti allo sport e all'alimentazione, per affinare e ridisegnare la silhouette.",
        keywords: ["liposuzione", "lipoaspirazione", "grasso localizzato", "silhouette", "chirurgia grasso"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "Quali zone possono essere trattate con la liposuzione?",
        answer: "Le zone più comunemente trattate sono addome, fianchi, schiena, cosce, anche, braccia, mento e ginocchia. Il chirurgo confermerà le zone adatte alla tua morfologia.",
        keywords: ["zone liposuzione", "regioni trattate", "corpo liposuzione", "localizzazioni grasso"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },
      {
        question: "Si può associare la liposuzione ad un altro intervento?",
        answer: "Sì, può essere associata a un tummy tuck (addominoplastica), un BBL (lipofilling) o altri interventi secondo i tuoi obiettivi estetici e le raccomandazioni mediche.",
        keywords: ["liposuzione combinata", "associazione chirurgie", "lipo + altro", "chirurgia multipla", "BBL"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },
      {
        question: "Il risultato della liposuzione è definitivo?",
        answer: "Le cellule adipose rimosse non tornano, ma un aumento di peso può modificare il risultato. Uno stile di vita sano è essenziale per mantenere i risultati a lungo termine.",
        keywords: ["risultato definitivo", "durata liposuzione", "mantenimento risultati", "permanenza lipo"],
        imageUrl: "assets/img/chatbot/Liposuccion.png"
      },

      // Tummy Tuck (Addominoplastica)
      {
        question: "Cos'è un Tummy Tuck (Addominoplastica)?",
        answer: "Il Tummy Tuck (o addominoplastica) è un intervento chirurgico che consiste nel rimuovere l'eccesso di pelle e grasso della parete addominale e nel riavvicinare i muscoli addominali per ottenere una pancia più piatta e soda.",
        keywords: ["tummy tuck", "addominoplastica", "pancia piatta", "chirurgia addome", "ventre", "addominale"],
        synonyms: ["cos'è un'addominoplastica", "definizione tummy tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },

      // Body Lift
      {
        question: "Cos'è un Body Lift?",
        answer: "Il Body Lift è un intervento chirurgico completo che ridisegna e rassoda diverse zone del corpo (addome, glutei, cosce) in un'unica operazione. È ideale dopo una notevole perdita di peso.",
        keywords: ["body lift", "lifting corporeo", "chirurgia corpo intero", "rimodellamento corpo", "dopo perdita peso"],
        synonyms: ["lifting del corpo", "chirurgia di rimodellamento corporeo"],
        imageUrl: "assets/img/chatbot/Body-Lift.png"
      },

      // Buttock Augmentation
      {
        question: "Cos'è la Buttock Augmentation?",
        answer: "La Buttock Augmentation (o aumento dei glutei) è una procedura chirurgica volta ad aumentare il volume e migliorare la forma dei glutei, sia con protesi che con trasferimento di grasso (BBL).",
        keywords: ["buttock augmentation", "aumento glutei", "glutei", "protesi glutei", "BBL"],
        synonyms: ["aumento dei glutei", "chirurgia dei glutei"],
        imageUrl: "assets/img/chatbot/Buttock-Augmentation.png"
      },

      // Breast Augmentation
      {
        question: "Cos'è la Breast Augmentation?",
        answer: "La Breast Augmentation (o aumento del seno) è un intervento chirurgico che aumenta le dimensioni e migliora la forma del seno utilizzando protesi mammarie o trasferimento di grasso.",
        keywords: ["breast augmentation", "aumento seno", "protesi mammarie", "seno", "petto"],
        synonyms: ["ingrandimento del seno", "chirurgia mammaria"],
        imageUrl: "assets/img/chatbot/Breast-Augmentation.png"
      },

      // Breast Reduction
      {
        question: "Cos'è la Breast Reduction?",
        answer: "La Breast Reduction (o riduzione del seno) è un intervento chirurgico che riduce le dimensioni del seno rimuovendo l'eccesso di tessuto adiposo, ghiandolare e cutaneo, per alleviare i dolori alla schiena e migliorare le proporzioni corporee.",
        keywords: ["breast reduction", "riduzione seno", "seno troppo pesante", "macromastia", "dolori schiena"],
        synonyms: ["riduzione del seno", "chirurgia riduttiva mammaria"],
        imageUrl: "assets/img/chatbot/Breast-Reduction.png"
      },

      // Mastopexy / Breast Lift
      {
        question: "Cos'è una Mastopexy (Breast Lift)?",
        answer: "La Mastopexy (o lifting del seno) è un intervento chirurgico che solleva e rimodella il seno cadente rimuovendo l'eccesso di pelle e riavvicinando i tessuti, senza modificarne significativamente il volume.",
        keywords: ["mastopexy", "breast lift", "lifting seno", "seno cadente", "ptosi mammaria"],
        synonyms: ["sollevamento del seno", "rimodellamento seno"],
        imageUrl: "assets/img/chatbot/Mastopexy-Breast-Lift.png"
      },

      // Breast Reconstruction
      {
        question: "Cos'è la Breast Reconstruction?",
        answer: "La Breast Reconstruction (o ricostruzione mammaria) è una procedura chirurgica che ripristina la forma, il volume e l'aspetto del seno dopo una mastectomia (asportazione del seno) per motivi medici.",
        keywords: ["breast reconstruction", "ricostruzione mammaria", "dopo mastectomia", "cancro al seno", "ricostruzione seno"],
        synonyms: ["ricostruzione del seno", "chirurgia ricostruttiva"],
        imageUrl: "assets/img/chatbot/Breast-Reconstruction.png"
      },

      // Breast Implant Exchange / Removal
      {
        question: "Cos'è lo scambio o la rimozione di protesi mammarie?",
        answer: "Lo scambio o la rimozione di protesi mammarie è un intervento chirurgico che consiste nel sostituire le protesi esistenti con nuove, o nel rimuoverle completamente, spesso per ragioni mediche, estetiche o personali.",
        keywords: ["breast implant exchange", "rimozione protesi", "sostituzione protesi", "espianto", "capsulectomia"],
        synonyms: ["cambio di protesi", "rimozione protesi mammarie"],
        imageUrl: "assets/img/chatbot/Breast-Implant-Exchange-Removal.png"
      },

      // Laser Vaginal Rejuvenation
      {
        question: "Cos'è la Laser Vaginal Rejuvenation?",
        answer: "La Laser Vaginal Rejuvenation è una procedura non chirurgica che utilizza la tecnologia laser per trattare il rilassamento vaginale, l'incontinenza urinaria lieve e migliorare la funzione sessuale dopo il parto o con l'età.",
        keywords: ["laser vaginal rejuvenation", "ringiovanimento vaginale", "restringimento vaginale", "incontinenza", "rilassamento vaginale"],
        synonyms: ["ringiovanimento vaginale", "restringimento vaginale"],
        imageUrl: "assets/img/chatbot/Laser-Vaginal-Rejuvenation.png"
      },

      // Domande generali
      {
        question: "ciao",
        answer: "Ciao! 👋 Benvenuto da TuniCure. Come posso aiutarti oggi?",
        keywords: ["ciao", "salve", "buongiorno", "buonasera"]
      },
      {
        question: "come prendere appuntamento",
        answer: `Puoi prenotare in due modi:

📞 **Telefono**: <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">(+44) 7403904850</a>
📝 **Online**: <a href="${this.orderPageLink}" class="chat-link-order">Clicca qui per compilare il modulo di richiesta</a>

Il nostro team ti contatterà il prima possibile per confermare il tuo appuntamento.`,
        keywords: ["appuntamento", "presa appuntamento", "come prenotare", "prenotare appuntamento", "consultazione", "prenotazione"]
      },
      {
        question: "quali procedure offrite",
        answer: "Offriamo le seguenti procedure:\n\n• Rinoplastica (classica & Piezo)\n• Liposuzione\n• Ginoplastica\n• Mommy Makeover\n• Tummy Tuck (Addominoplastica)\n• Body Lift\n• Aumento seno\n• Riduzione seno\n• Lifting seno (Mastopexy)\n• BBL (Brazilian Butt Lift)\n• Trapianto di capelli\n• Blefaroplastica\n• Avanzamento dell'attaccatura dei capelli\n• Laser Vaginal Rejuvenation\n• Sleeve gastrico\n\nOffriamo anche molte altre procedure personalizzate in base alle tue esigenze.",
        keywords: ["procedure", "interventi", "operazioni", "cure", "trattamenti", "chirurgie"]
      },
      {
        question: "Quale tipo di tummy tuck è adatto a me (completo, mini, con riparazione muscolare)?",
        answer: "Il chirurgo ti spiegherà la tecnica più adatta alla tua morfologia e ai tuoi obiettivi dopo una valutazione completa durante la consulenza preoperatoria.",
        keywords: ["tipo tummy tuck", "tummy tuck completo", "tummy tuck mini", "riparazione muscolare", "quale tummy tuck"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Quante notti rimarrò in clinica dopo un tummy tuck?",
        answer: "Generalmente 2-3 notti in clinica per un monitoraggio medico ottimale dopo l'intervento.",
        keywords: ["notti clinica", "ricovero tummy tuck", "durata soggiorno clinica", "quante notti"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "L'hotel è vicino alla clinica?",
        answer: "Sì, l'alloggio viene selezionato vicino alla clinica per facilitare gli spostamenti e garantire il tuo comfort durante il periodo di recupero.",
        keywords: ["hotel vicino", "prossimità clinica", "alloggio vicino clinica", "ospitalità"],
        imageUrl: "assets/img/chatbot/Accommodation.png"
      },
      {
        question: "L'uso della fascia è incluso dopo un tummy tuck?",
        answer: "Sì, una fascia post-operatoria viene fornita o prescritta e il suo utilizzo è incluso nel follow-up post-operatorio.",
        keywords: ["fascia post-operatoria", "compressione tummy tuck", "compressione", "indumento contenitivo"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Sono incluse sedute di fisioterapia o drenaggio linfatico?",
        answer: "Sì, a seconda del pacchetto scelto, sono incluse o offerte come opzione sedute di drenaggio linfatico o fisioterapia per ottimizzare il tuo recupero.",
        keywords: ["fisioterapia", "drenaggio linfatico", "sedute recupero", "rieducazione"],
        imageUrl: "assets/img/chatbot/Post-Op-Care.png"
      },
      {
        question: "Dove sarà posizionata la cicatrice dopo un tummy tuck?",
        answer: "La cicatrice è posizionata in basso, generalmente all'altezza del costume da bagno, discretamente nascosta sotto la biancheria intima. Il chirurgo ti spiegherà la sua evoluzione e le cure necessarie.",
        keywords: ["cicatrice tummy tuck", "posizione cicatrice", "cicatrice addominoplastica", "cicatrizzazione"],
        imageUrl: "assets/img/chatbot/Tummy-Tuck.png"
      },
      {
        question: "Cosa succede in caso di complicazioni?",
        answer: "In caso di complicazioni, l'agenzia garantisce un follow-up medico immediato, l'accesso al chirurgo e una gestione secondo protocolli medici stabiliti, con assistenza 24/7.",
        keywords: ["complicazioni", "problemi post-operatori", "emergenza medica", "assistenza complicazioni"],
        imageUrl: "assets/img/chatbot/Emergency-en.png"
      },
      {
        question: "Avrò assistenza sul posto?",
        answer: "Sì, una coordinatrice medica è disponibile 24 ore su 24 durante tutto il tuo soggiorno per assisterti e soddisfare le tue esigenze.",
        keywords: ["assistenza sul posto", "coordinatrice medica", "aiuto locale", "supporto"],
        imageUrl: "assets/img/chatbot/Assistance.png"
      },

      // Blefaroplastica
      {
        question: "Sono una buona candidata per una blefaroplastica upper & lower?",
        answer: "Dopo aver studiato le tue foto, la tua età, la qualità della tua pelle e la tua storia medica, il chirurgo confermerà la tua idoneità per una blefaroplastica delle palpebre superiori e inferiori.",
        keywords: ["blefaroplastica", "palpebre", "occhi", "candidata blefaroplastica", "upper lower"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Quale tecnica verrà utilizzata per le palpebre superiori e inferiori?",
        answer: "Il chirurgo spiegherà la tecnica appropriata: incisione nella piega naturale della palpebra superiore e incisione sotto le ciglia o per via transcongiuntivale per la palpebra inferiore, a seconda del tuo caso.",
        keywords: ["tecnica blefaroplastica", "palpebre superiori", "palpebre inferiori", "metodo"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Devo rimanere ricoverata dopo una blefaroplastica?",
        answer: "Nella maggior parte dei casi, si tratta di chirurgia ambulatoriale. Può essere consigliata una notte in base alle tue condizioni generali e al parere del chirurgo.",
        keywords: ["ricovero blefaroplastica", "notte clinica", "ambulatoriale", "soggiorno clinica"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Quali sono gli effetti dopo una blefaroplastica (gonfiore, ecchimosi)?",
        answer: "Gonfiore ed ecchimosi sono normali dopo l'intervento e diminuiscono gradualmente in 10-15 giorni. Impacchi freddi sono consigliati nei primi giorni.",
        keywords: ["gonfiore palpebre", "ecchimosi occhi", "effetti collaterali", "recupero blefaroplastica"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Quando potrò riprendere le normali attività dopo una blefaroplastica?",
        answer: "Generalmente dopo 7-10 giorni per attività leggere, a seconda della tua evoluzione e velocità di recupero.",
        keywords: ["ripresa attività", "tempo recupero", "ritorno lavoro", "convalescenza"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },
      {
        question: "Dove saranno posizionate le cicatrici dopo una blefaroplastica?",
        answer: "Le cicatrici sono molto discrete: nella piega naturale della palpebra superiore e sotto le ciglia o all'interno della palpebra inferiore, a seconda della tecnica utilizzata.",
        keywords: ["cicatrici palpebre", "cicatrizzazione occhi", "cicatrici discrete", "posizione cicatrici"],
        imageUrl: "assets/img/chatbot/Blepharoplasty.png"
      },

      // Trapianto di capelli
      {
        question: "Sono una buona candidata per un trapianto di capelli?",
        answer: "Sì, dopo un'analisi personalizzata basata sulle tue foto, la tua storia medica, il tipo di perdita di capelli e la qualità dell'area donatrice. Una consulenza con il medico è obbligatoria prima della conferma.",
        keywords: ["candidata trapianto", "eleggibilità trapianto", "buona candidata", "qualificazione trapianto"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Viene fatta una diagnosi medica prima del mio arrivo per un trapianto di capelli?",
        answer: "Sì. Viene effettuata una pre-valutazione a distanza (foto + questionario medico), poi una consulenza finale in clinica prima dell'intervento per confermare la diagnosi.",
        keywords: ["diagnosi trapianto", "valutazione preliminare", "analisi foto", "consulenza preliminare"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Quale tecnica verrà utilizzata per il trapianto di capelli (FUE, DHI, Sapphire) e perché?",
        answer: "La scelta dipende dal tuo caso: FUE (tecnica più utilizzata, naturale e poco invasiva), DHI (impianto diretto) o Sapphire FUE (cicatrizzazione più rapida). Il medico sceglie la tecnica più adatta al tuo cuoio capelluto e ai tuoi obiettivi.",
        keywords: ["tecnica trapianto", "fue", "dhi", "sapphire", "metodo trapianto"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Chi esegue esattamente il trapianto di capelli?",
        answer: "Il trapianto è eseguito da un medico specializzato in trapianto di capelli, assistito da un'équipe medica qualificata. Il medico interviene personalmente nelle fasi chiave (disegno, estrazione, impianto).",
        keywords: ["medico trapianto", "équipe medica", "specialista trapianto", "chi esegue"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Quanti innesti riceverò durante un trapianto di capelli?",
        answer: "Il numero esatto viene confermato dopo l'analisi medica. In media, varia tra 1.500 e 4.000 innesti, a seconda della densità desiderata e dell'area da trattare.",
        keywords: ["numero innesti", "quantità capelli", "innesti", "densità"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Il risultato di un trapianto di capelli sarà naturale?",
        answer: "Sì. La linea frontale viene disegnata su misura, rispettando la tua morfologia e l'impianto naturale dei capelli per un risultato armonioso e naturale.",
        keywords: ["risultato naturale", "aspetto naturale", "armonia", "disegno frontale"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Un trapianto di capelli è doloroso?",
        answer: "No. L'intervento viene eseguito in anestesia locale. Potresti avvertire un leggero fastidio durante l'anestesia, ma nessun dolore significativo durante l'intervento.",
        keywords: ["dolore trapianto", "fastidio", "anestesia locale", "comfort"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Alloggio e trasferimenti sono inclusi per un trapianto di capelli?",
        answer: "Sì. Il pacchetto include: trasferimenti aeroporto - hotel - clinica, hotel (3-5 stelle a seconda della formula), assistenza e supporto durante tutto il soggiorno.",
        keywords: ["alloggio trapianto", "trasferimenti inclusi", "pacchetto completo", "logistica"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Cosa succede dopo un trapianto di capelli?",
        answer: "Benefici di: farmaci post-operatori, primo lavaggio in clinica, istruzioni dettagliate e follow-up a distanza per diversi mesi.",
        keywords: ["dopo trapianto", "cure post-operatorie", "follow-up", "recupero"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "C'è un periodo di caduta dei capelli dopo un trapianto?",
        answer: "Sì. Una caduta temporanea (shock loss) è normale tra le 2 e le 6 settimane. I capelli ricrescono gradualmente a partire dal 3° mese.",
        keywords: ["caduta temporanea", "shock loss", "caduta capelli", "fase caduta"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Quando vedrò i risultati definitivi di un trapianto di capelli?",
        answer: "Primi segni: 3-4 mesi, risultato visibile: 6 mesi, risultato finale: 12 mesi dopo l'intervento.",
        keywords: ["risultati definitivi", "tempi risultati", "evoluzione capelli", "tempo crescita"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "Cosa include esattamente il prezzo di un trapianto di capelli?",
        answer: "Il prezzo include: trapianto di capelli, onorari medici, farmaci, hotel, trasferimenti e follow-up post-operatorio. Nessun costo nascosto.",
        keywords: ["prezzo trapianto", "incluso nel prezzo", "costo", "trasparenza"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },
      {
        question: "C'è una garanzia per un trapianto di capelli?",
        answer: "Sì, l'agenzia garantisce la qualità dell'assistenza e del follow-up medico. Alcuni centri offrono anche una garanzia di innesti.",
        keywords: ["garanzia trapianto", "assicurazione qualità", "impegno", "sicurezza"],
        imageUrl: "assets/img/chatbot/Hair-Transplant.png"
      },

      // Avanzamento dell'attaccatura dei capelli
      {
        question: "Sono una buona candidata per un avanzamento dell'attaccatura dei capelli?",
        answer: "Viene effettuata una valutazione dalle tue foto, dall'altezza della fronte, dall'elasticità del cuoio capelluto, dalla densità dei capelli e dall'assenza di perdita attiva di capelli. Il chirurgo confermerà l'idoneità durante la consulenza.",
        keywords: ["avanzamento attaccatura", "attaccatura capelli", "fronte", "candidata attaccatura"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Ci sono controindicazioni per l'avanzamento dell'attaccatura?",
        answer: "Storia di grave perdita di capelli, alopecia progressiva, difficoltà di cicatrizzazione o malattie del cuoio capelluto devono essere segnalate e valutate dal chirurgo.",
        keywords: ["controindicazioni", "controindicazione attaccatura", "rischi", "precauzioni"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Chi eseguirà l'avanzamento dell'attaccatura e quali sono le sue qualifiche?",
        answer: "Un chirurgo specializzato in chirurgia estetica e chirurgia del cuoio capelluto, con esperienza comprovata nell'avanzamento dell'attaccatura frontale.",
        keywords: ["chirurgo attaccatura", "qualifiche", "specialista", "esperienza"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "La clinica è accreditata per l'avanzamento dell'attaccatura?",
        answer: "Sì, l'intervento viene eseguito in una clinica certificata, che rispetta gli standard internazionali di igiene e sicurezza.",
        keywords: ["clinica accreditata", "certificazione", "norme sicurezza", "qualità"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Quale tecnica verrà utilizzata per l'avanzamento dell'attaccatura?",
        answer: "Avanzamento chirurgico dell'attaccatura frontale con incisione discreta a livello dell'attaccatura dei capelli, che consente di abbassare naturalmente la fronte.",
        keywords: ["tecnica attaccatura", "metodo avanzamento", "chirurgia attaccatura", "procedura"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Di quanti centimetri si può avanzare l'attaccatura?",
        answer: "In media tra 1,5 e 3 cm, a seconda dell'elasticità del cuoio capelluto e della morfologia della tua fronte.",
        keywords: ["centimetri avanzamento", "abbassamento fronte", "distanza", "misura"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "L'avanzamento dell'attaccatura lascia una cicatrice visibile?",
        answer: "La cicatrice è posizionata nell'attaccatura dei capelli e generalmente diventa molto discreta con il tempo, nascosta dai capelli.",
        keywords: ["cicatrice attaccatura", "visibilità cicatrice", "cicatrizzazione", "cicatrice discreta"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Che tipo di anestesia viene utilizzata per l'avanzamento dell'attaccatura?",
        answer: "Anestesia generale o locale con sedazione, a seconda del caso e del parere del chirurgo dopo valutazione preoperatoria.",
        keywords: ["anestesia attaccatura", "tipo anestesia", "sedazione", "anestesia generale"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "È necessario un soggiorno in clinica dopo un avanzamento dell'attaccatura?",
        answer: "Di solito 1 notte in clinica per monitoraggio, poi trasferimento in hotel per il resto della convalescenza.",
        keywords: ["soggiorno clinica", "notte clinica", "ricovero", "monitoraggio"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Il dolore è significativo dopo l'avanzamento dell'attaccatura?",
        answer: "I dolori sono generalmente moderati e ben controllati dai trattamenti prescritti. Può essere avvertito un disagio nei primi giorni.",
        keywords: ["dolore attaccatura", "disagio", "fastidio post-operatorio", "antidolorifici"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Ci saranno gonfiori o ecchimosi dopo l'avanzamento dell'attaccatura?",
        answer: "Sì, un edema della fronte e talvolta delle palpebre è frequente nei primi giorni e scompare gradualmente in circa una settimana.",
        keywords: ["gonfiore attaccatura", "ecchimosi", "edema fronte", "lividi"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },
      {
        question: "Il risultato dell'avanzamento dell'attaccatura è permanente?",
        answer: "Sì, l'avanzamento dell'attaccatura è definitivo, fatta salva la stabilità dei capelli e l'assenza di perdita progressiva di capelli.",
        keywords: ["permanente attaccatura", "definitivo", "durata", "risultato duraturo"],
        imageUrl: "assets/img/chatbot/Hairline-Advancement.png"
      },

      // Lip Lift
      {
        question: "Sono una buona candidata per un Lip Lift?",
        answer: "Prima di ogni conferma, la tua idoneità sarà valutata dal chirurgo sulla base delle tue foto mediche e della tua storia clinica. Il Lip Lift è generalmente raccomandato per pazienti che presentano: un labbro superiore sottile o allungato, uno spazio significativo tra il naso e il labbro superiore, una mancanza di definizione dell'arco di Cupido. Una consulenza preoperatoria con il chirurgo sarà organizzata al tuo arrivo per confermare l'indicazione.",
        keywords: ["lip lift", "candidata lip lift", "eleggibilità lip lift", "buona candidata lip lift", "lifting labbro"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Qual è la qualifica e l'esperienza del chirurgo per un Lip Lift?",
        answer: "Collaboriamo esclusivamente con chirurghi specializzati in chirurgia estetica facciale, certificati ed esperti nella procedura di Lip Lift. Riceverai: il profilo del chirurgo, i suoi anni di esperienza, foto prima/dopo di casi simili, prima di confermare il tuo soggiorno.",
        keywords: ["qualifica chirurgo lip lift", "esperienza chirurgo", "chirurgo lip lift", "profilo chirurgo"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "In quale clinica verrà eseguito l'intervento di Lip Lift?",
        answer: "Il tuo intervento sarà eseguito in una clinica accreditata che rispetta gli standard internazionali di igiene e sicurezza, dotata di una moderna sala operatoria e di un'équipe medica qualificata.",
        keywords: ["clinica lip lift", "struttura", "clinica accreditata", "norme sicurezza"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quale tecnica verrà utilizzata per il mio Lip Lift?",
        answer: "La tecnica più comunemente utilizzata è il Lip Lift subnasale (tecnica Bullhorn). Il chirurgo ti spiegherà: la tecnica adatta alla tua morfologia, la posizione della cicatrice (nascosta sotto la base del naso), il risultato atteso durante la consulenza preoperatoria.",
        keywords: ["tecnica lip lift", "tecnica bullhorn", "lip lift subnasale", "metodo lip lift"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Che tipo di anestesia verrà utilizzata per un Lip Lift?",
        answer: "Il Lip Lift è generalmente eseguito in anestesia locale, a volte con sedazione leggera a seconda del tuo comfort e del parere del chirurgo.",
        keywords: ["anestesia lip lift", "tipo anestesia", "sedazione", "anestesia locale"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quanto dura l'intervento di Lip Lift e il soggiorno?",
        answer: "Durata dell'intervento: circa 45 minuti a 1 ora. Soggiorno in clinica: ambulatoriale (dimissione lo stesso giorno). Durata consigliata del soggiorno in Tunisia: 5-6 giorni. Ciò include: consulenza preoperatoria, intervento, follow-up post-operatorio, rimozione dei punti se necessario.",
        keywords: ["durata lip lift", "tempo operazione", "soggiorno clinica", "quanti giorni"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Cosa include il pacchetto medico per un Lip Lift?",
        answer: "Il tuo pacchetto include: consulenza con il chirurgo, spese di clinica e intervento, farmaci post-operatori, trasferimenti VIP (aeroporto / clinica / hotel), alloggio in hotel, assistenza da un coordinatore medico dedicato durante tutto il tuo soggiorno.",
        keywords: ["pacchetto lip lift", "incluso lip lift", "prestazioni", "pacchetto medico"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Quali sono i possibili rischi o complicazioni di un Lip Lift?",
        answer: "Come ogni intervento chirurgico, il Lip Lift comporta alcuni rischi come: infezione, sanguinamento, cicatrizzazione visibile, asimmetria. Il chirurgo ti informerà dettagliatamente durante la consulenza preoperatoria e vengono adottate misure per minimizzare questi rischi.",
        keywords: ["rischi lip lift", "complicazioni", "pericoli lip lift", "effetti collaterali"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "Qual è il tempo di recupero dopo un Lip Lift?",
        answer: "Gonfiore ed ecchimosi: 7-10 giorni. Ripresa delle attività sociali: dopo 10-14 giorni. Risultato finale: visibile dopo alcune settimane man mano che l'edema diminuisce.",
        keywords: ["recupero lip lift", "convalescenza", "ripresa attività", "tempo guarigione"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },
      {
        question: "C'è un follow-up dopo il mio ritorno nel mio paese dopo un Lip Lift?",
        answer: "Sì, garantiamo un follow-up post-operatorio a distanza con il tuo coordinatore medico e il chirurgo se necessario, per garantire un recupero ottimale.",
        keywords: ["follow-up lip lift", "dopo ritorno", "follow-up a distanza", "post-operatorio"],
        imageUrl: "assets/img/chatbot/Lip-Lift.png"
      },

      // Neck Lift
      {
        question: "Sono una buona candidata per un Neck Lift?",
        answer: "La tua idoneità sarà prima valutata dal chirurgo sulla base di foto mediche e della tua storia clinica. Un Neck Lift è generalmente raccomandato per pazienti che presentano: rilassamento cutaneo nella zona del collo, doppio mento, bande muscolari visibili (platisma), perdita di definizione dell'angolo cervico-mentoniero. Una consulenza preoperatoria in clinica sarà organizzata al tuo arrivo per confermare l'indicazione chirurgica.",
        keywords: ["neck lift", "lifting collo", "candidata neck lift", "rilassamento collo", "doppio mento"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Qual è la qualifica del chirurgo che eseguirà il mio Neck Lift?",
        answer: "Lavoriamo con chirurghi specializzati in chirurgia estetica del viso e del collo, certificati ed esperti nelle procedure di Neck Lift. Prima della tua conferma, riceverai: il profilo del chirurgo, i suoi anni di esperienza, foto prima/dopo di casi simili.",
        keywords: ["qualifica chirurgo neck lift", "esperienza chirurgo collo", "chirurgo neck lift", "profilo chirurgo"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "In quale clinica verrà eseguito l'intervento di Neck Lift?",
        answer: "Il tuo Neck Lift sarà eseguito in una clinica accreditata che rispetta gli standard internazionali di sicurezza, con una moderna sala operatoria e un'équipe medica qualificata.",
        keywords: ["clinica neck lift", "struttura", "clinica accreditata", "norme sicurezza"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quale tecnica verrà utilizzata nel mio caso per il Neck Lift?",
        answer: "La tecnica utilizzata dipenderà dalla tua anatomia e dal grado di rilassamento cutaneo. Può includere: il riavvicinamento del muscolo platisma, la rimozione dell'eccesso di pelle, una liposuzione del collo se necessario. Il chirurgo ti spiegherà in dettaglio la tecnica raccomandata durante la tua consulenza preoperatoria.",
        keywords: ["tecnica neck lift", "platisma", "riavvicinamento muscolo", "tecnica collo"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Che tipo di anestesia verrà utilizzata per un Neck Lift?",
        answer: "Il Neck Lift è generalmente eseguito in anestesia generale per garantire il tuo comfort e la tua sicurezza durante l'intervento.",
        keywords: ["anestesia neck lift", "tipo anestesia", "anestesia generale", "sedazione"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quanto dura l'intervento di Neck Lift e il soggiorno?",
        answer: "Durata dell'intervento: 2-3 ore. Soggiorno in clinica: 1 notte. Soggiorno consigliato in Tunisia: 6-7 giorni. Il tuo soggiorno includerà: consulenza preoperatoria, esami medici, intervento chirurgico, follow-up post-operatorio, rimozione di drenaggi e suture se necessario.",
        keywords: ["durata neck lift", "tempo operazione collo", "soggiorno clinica", "quanti giorni"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Cosa include il pacchetto medico per un Neck Lift?",
        answer: "Il tuo pacchetto include: consulenza con il chirurgo, spese di clinica e intervento, anestesia, farmaci post-operatori, indumento contenitivo (mentoniera), trasferimenti VIP (aeroporto / clinica / hotel), alloggio in hotel, assistenza da un coordinatore medico dedicato durante tutto il tuo soggiorno.",
        keywords: ["pacchetto neck lift", "incluso neck lift", "prestazioni", "pacchetto medico"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Quali sono i rischi associati a un Neck Lift?",
        answer: "Come ogni chirurgia, il Neck Lift comporta alcuni rischi come: infezione, ematoma, gonfiore prolungato, cicatrizzazione visibile, intorpidimento temporaneo. Vengono adottate tutte le misure necessarie per minimizzare questi rischi e garantire la tua sicurezza.",
        keywords: ["rischi neck lift", "complicazioni collo", "pericoli neck lift", "effetti collaterali"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "Qual è il tempo di recupero dopo un Neck Lift?",
        answer: "Gonfiore ed ecchimosi: 10-14 giorni. Uso della mentoniera: consigliato per 2-3 settimane. Ripresa delle attività sociali: dopo 2 settimane. Risultato finale: visibile progressivamente in 2-3 mesi.",
        keywords: ["recupero neck lift", "convalescenza collo", "ripresa attività", "tempo guarigione"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },
      {
        question: "È garantito un follow-up dopo il mio ritorno nel mio paese dopo un Neck Lift?",
        answer: "Sì, garantiamo un follow-up post-operatorio a distanza con il tuo coordinatore medico e il chirurgo per accompagnare il tuo recupero dopo il tuo ritorno.",
        keywords: ["follow-up neck lift", "dopo ritorno", "follow-up a distanza", "post-operatorio"],
        imageUrl: "assets/img/chatbot/Neck-Lift.png"
      },

      // Bichectomia
      {
        question: "Sono una buona candidata per una bichectomia?",
        answer: "La tua idoneità sarà valutata dal chirurgo sulla base di foto mediche e della tua storia clinica. La bichectomia è generalmente raccomandata per pazienti che presentano: viso rotondo o guance voluminose, eccesso di grasso nelle bolle di Bichat, mancanza di definizione degli zigomi o dell'ovale del viso. Una consulenza preoperatoria sarà organizzata al tuo arrivo per confermare l'indicazione chirurgica.",
        keywords: ["bichectomia", "bolle di Bichat", "guance", "viso rotondo", "affinare viso"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Qual è la qualifica del chirurgo che eseguirà la mia bichectomia?",
        answer: "Collaboriamo con chirurghi specializzati in chirurgia estetica del viso, certificati ed esperti nella procedura di bichectomia. Prima di ogni conferma, riceverai: il profilo del chirurgo, i suoi anni di esperienza, foto prima/dopo di casi simili.",
        keywords: ["qualifica chirurgo bichectomia", "esperienza chirurgo", "chirurgo bichectomia", "profilo chirurgo"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "In quale clinica verrà eseguito l'intervento di bichectomia?",
        answer: "Il tuo intervento sarà eseguito in una clinica accreditata che rispetta gli standard internazionali di igiene e sicurezza, dotata di una moderna sala operatoria e di un'équipe medica qualificata.",
        keywords: ["clinica bichectomia", "struttura", "clinica accreditata", "norme sicurezza"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Come si svolge l'intervento di bichectomia?",
        answer: "La bichectomia consiste nel rimuovere una parte delle bolle di Bichat per affinare la parte inferiore del viso. Le incisioni vengono eseguite all'interno della bocca, il che significa che non ci sono cicatrici visibili sulla pelle.",
        keywords: ["svolgimento bichectomia", "tecnica", "incisione bocca", "nessuna cicatrice"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Che tipo di anestesia verrà utilizzata per una bichectomia?",
        answer: "La bichectomia è generalmente eseguita in anestesia locale, a volte con sedazione leggera a seconda del tuo comfort e del parere del chirurgo.",
        keywords: ["anestesia bichectomia", "tipo anestesia", "anestesia locale", "sedazione"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Quanto dura l'intervento di bichectomia e il soggiorno?",
        answer: "Durata dell'intervento: 30-45 minuti. Soggiorno in clinica: ambulatoriale (dimissione lo stesso giorno). Durata consigliata del soggiorno in Tunisia: 4-5 giorni. Il tuo soggiorno include: consulenza preoperatoria, esami medici se necessari, intervento chirurgico, follow-up post-operatorio.",
        keywords: ["durata bichectomia", "tempo operazione", "soggiorno clinica", "quanti giorni"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Cosa include il pacchetto medico per una bichectomia?",
        answer: "Il tuo pacchetto include: onorari del chirurgo, spese di clinica, anestesia, farmaci post-operatori, trasferimenti VIP (aeroporto / clinica / hotel), alloggio in hotel, assistenza da un coordinatore medico dedicato durante tutto il tuo soggiorno.",
        keywords: ["pacchetto bichectomia", "incluso bichectomia", "prestazioni", "pacchetto medico"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Quali sono i possibili rischi o complicazioni di una bichectomia?",
        answer: "Come ogni intervento chirurgico, la bichectomia comporta alcuni rischi come: infezione, gonfiore, asimmetria, intorpidimento temporaneo. Vengono adottate tutte le misure per minimizzare questi rischi.",
        keywords: ["rischi bichectomia", "complicazioni", "pericoli bichectomia", "effetti collaterali"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },
      {
        question: "Qual è il tempo di recupero dopo una bichectomia?",
        answer: "Gonfiore: 7-10 giorni. Ripresa delle attività sociali: dopo 5-7 giorni. Risultato finale: visibile progressivamente dopo 4-6 settimane.",
        keywords: ["recupero bichectomia", "convalescenza", "ripresa attività", "tempo guarigione"],
        imageUrl: "assets/img/chatbot/Bichectomie.png"
      },

      // Canthopexy
      {
        question: "Sono una buona candidata per una cantopessi?",
        answer: "La tua idoneità sarà valutata dal chirurgo sulla base di foto mediche e della tua storia clinica. La cantopessi è generalmente raccomandata per pazienti che presentano: rilassamento della palpebra inferiore, sguardo cadente o stanco, mancanza di supporto all'angolo esterno dell'occhio, desiderio di migliorare la forma o la tensione della palpebra inferiore. Una consulenza preoperatoria sarà organizzata al tuo arrivo per confermare l'indicazione chirurgica.",
        keywords: ["cantopessi", "palpebra", "sguardo", "angolo occhio", "palpebra inferiore"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Qual è la qualifica del chirurgo che eseguirà la mia cantopessi?",
        answer: "Collaboriamo con chirurghi specializzati in chirurgia estetica delle palpebre e dello sguardo, certificati ed esperti nella procedura di cantopessi. Prima di ogni conferma, riceverai: il profilo del chirurgo, i suoi anni di esperienza, foto prima/dopo di casi simili.",
        keywords: ["qualifica chirurgo cantopessi", "esperienza chirurgo palpebra", "chirurgo cantopessi", "profilo chirurgo"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "In quale clinica verrà eseguito l'intervento di cantopessi?",
        answer: "Il tuo intervento sarà eseguito in una clinica accreditata che rispetta gli standard internazionali di igiene e sicurezza, dotata di una moderna sala operatoria e di un'équipe medica qualificata.",
        keywords: ["clinica cantopessi", "struttura", "clinica accreditata", "norme sicurezza"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Come si svolge l'intervento di cantopessi?",
        answer: "La cantopessi consiste nel riavvicinare e riposizionare il tendone dell'angolo esterno della palpebra inferiore per migliorare il supporto e la forma dell'occhio. Può essere eseguita da sola o in combinazione con una blefaroplastica inferiore a seconda del tuo caso.",
        keywords: ["svolgimento cantopessi", "tecnica", "tendone", "angolo occhio"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Che tipo di anestesia verrà utilizzata per una cantopessi?",
        answer: "La cantopessi è generalmente eseguita in anestesia locale con sedazione leggera, o in anestesia generale a seconda dell'indicazione e delle raccomandazioni del chirurgo.",
        keywords: ["anestesia cantopessi", "tipo anestesia", "anestesia locale", "sedazione"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Quanto dura l'intervento di cantopessi e il soggiorno?",
        answer: "Durata dell'intervento: circa 1 ora. Soggiorno in clinica: ambulatoriale (dimissione lo stesso giorno). Durata consigliata del soggiorno in Tunisia: 4-5 giorni. Il tuo soggiorno include: consulenza preoperatoria, intervento chirurgico, follow-up post-operatorio, rimozione delle suture se necessaria.",
        keywords: ["durata cantopessi", "tempo operazione", "soggiorno clinica", "quanti giorni"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Cosa include il pacchetto medico per una cantopessi?",
        answer: "Il tuo pacchetto include: onorari del chirurgo, spese di clinica, anestesia, farmaci post-operatori, trasferimenti VIP (aeroporto / clinica / hotel), alloggio in hotel, assistenza da un coordinatore medico dedicato durante tutto il tuo soggiorno.",
        keywords: ["pacchetto cantopessi", "incluso cantopessi", "prestazioni", "pacchetto medico"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Quali sono i possibili rischi o complicazioni di una cantopessi?",
        answer: "Come ogni intervento chirurgico, la cantopessi comporta alcuni rischi come: infezione, gonfiore, secchezza oculare temporanea, asimmetria, irritazione oculare. Vengono adottate tutte le misure per minimizzare questi rischi.",
        keywords: ["rischi cantopessi", "complicazioni", "pericoli cantopessi", "effetti collaterali"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },
      {
        question: "Qual è il tempo di recupero dopo una cantopessi?",
        answer: "Gonfiore ed ecchimosi: 7-10 giorni. Ripresa delle attività sociali: dopo 7-10 giorni. Risultato finale: visibile progressivamente dopo alcune settimane.",
        keywords: ["recupero cantopessi", "convalescenza", "ripresa attività", "tempo guarigione"],
        imageUrl: "assets/img/chatbot/Canthopexie.png"
      },

      // Facial Fat Grafting
      {
        question: "Sono una buona candidata per un Facial Fat Grafting?",
        answer: "La tua idoneità sarà valutata dal chirurgo sulla base di foto mediche e della tua storia clinica. Il Facial Fat Grafting è generalmente raccomandato per pazienti che presentano: perdita di volume del viso, occhiaie infossate, guance o tempie incavate, pieghe naso-geniene marcate, mancanza di definizione dell'ovale del viso. Una consulenza preoperatoria sarà organizzata al tuo arrivo per confermare l'indicazione e stabilire un piano di trattamento personalizzato.",
        keywords: ["facial fat grafting", "lipofilling viso", "grasso viso", "volume viso", "occhiaie"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Qual è la qualifica del chirurgo che eseguirà il mio Facial Fat Grafting?",
        answer: "Collaboriamo con chirurghi specializzati in chirurgia estetica del viso, certificati ed esperti nelle tecniche di lipofilling facciale. Prima di ogni conferma, riceverai: il profilo del chirurgo, i suoi anni di esperienza, foto prima/dopo di casi simili.",
        keywords: ["qualifica chirurgo lipofilling", "esperienza chirurgo viso", "chirurgo fat grafting", "profilo chirurgo"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "In quale clinica verrà eseguito l'intervento di Facial Fat Grafting?",
        answer: "Il tuo intervento sarà eseguito in una clinica accreditata che rispetta gli standard internazionali di igiene e sicurezza, dotata di una moderna sala operatoria e di un'équipe medica qualificata.",
        keywords: ["clinica lipofilling", "struttura", "clinica accreditata", "norme sicurezza"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Come si svolge l'intervento di Facial Fat Grafting?",
        answer: "Il Facial Fat Grafting consiste nel prelevare grasso da una zona donatrice (come addome o cosce), purificarlo e poi reiniettarlo nelle zone del viso che necessitano di volume, per ottenere un risultato naturale e duraturo.",
        keywords: ["svolgimento lipofilling", "tecnica", "prelievo grasso", "reiezione"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Che tipo di anestesia verrà utilizzata per un Facial Fat Grafting?",
        answer: "Questa procedura è generalmente eseguita in anestesia locale con sedazione leggera o in anestesia generale, a seconda dell'estensione del trattamento e delle raccomandazioni del chirurgo.",
        keywords: ["anestesia lipofilling", "tipo anestesia", "anestesia locale", "sedazione"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Quanto dura l'intervento di Facial Fat Grafting e il soggiorno?",
        answer: "Durata dell'intervento: 1-2 ore. Soggiorno in clinica: ambulatoriale o 1 notte. Durata consigliata del soggiorno in Tunisia: 5-6 giorni. Il tuo soggiorno include: consulenza preoperatoria, esami medici se necessari, intervento chirurgico, follow-up post-operatorio.",
        keywords: ["durata lipofilling", "tempo operazione", "soggiorno clinica", "quanti giorni"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Cosa include il pacchetto medico per un Facial Fat Grafting?",
        answer: "Il tuo pacchetto include: onorari del chirurgo, spese di clinica, anestesia, farmaci post-operatori, trasferimenti VIP (aeroporto / clinica / hotel), alloggio in hotel, assistenza da un coordinatore medico dedicato durante tutto il tuo soggiorno.",
        keywords: ["pacchetto lipofilling", "incluso fat grafting", "prestazioni", "pacchetto medico"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Quali sono i possibili rischi o complicazioni di un Facial Fat Grafting?",
        answer: "Come ogni intervento chirurgico, il Facial Fat Grafting comporta alcuni rischi come: infezione, gonfiore, riassorbimento parziale del grasso iniettato, asimmetria. Vengono adottate tutte le misure necessarie per minimizzare questi rischi.",
        keywords: ["rischi lipofilling", "complicazioni", "pericoli fat grafting", "effetti collaterali"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },
      {
        question: "Qual è il tempo di recupero dopo un Facial Fat Grafting?",
        answer: "Gonfiore ed ecchimosi: 7-14 giorni. Ripresa delle attività sociali: dopo 10-14 giorni. Risultato finale: visibile progressivamente dopo alcune settimane man mano che l'edema diminuisce.",
        keywords: ["recupero lipofilling", "convalescenza", "ripresa attività", "tempo guarigione"],
        imageUrl: "assets/img/chatbot/Facial-Fat-Grafting.png"
      },

      // Feedback per Italiano
      {
        question: "feedback_si",
        answer: "Grazie! 😊",
        keywords: ["feedback_si"]
      },
      {
        question: "feedback_no",
        answer: `<a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">Contatta un agente TuniCure al (+44) 7403904850</a>`,
        keywords: ["feedback_no"]
      },
      {
        question: "feedback_invalid",
        answer: "Per favore, rispondi con 'sì' o 'no'.",
        keywords: ["feedback_invalid"]
      },
      {
        question: "feedback_timeout",
        answer: "Sono ancora qui se hai altre domande! 😊",
        keywords: ["feedback_timeout"]
      }
    ],
  };

  quickQuestionsByLanguage = {
    fr: [
      'Bonjour',
      'Comment prendre rendez-vous ?',
      'Quelles sont vos procédures ?',
      'Que se passe-t-il en cas de complication ?',
      'Aurai-je une assistance sur place ?',
    ],
    en: [
      'Hello',
      'How to make an appointment?',
      'What procedures do you offer?',
      'What happens in case of complications?',
      'Will I have on-site assistance?',
    ],
    es: [
      'Hola',
      '¿Cómo sacar una cita?',
      '¿Qué procedimientos ofrecen?',
      '¿Qué sucede en caso de complicaciones?',
      '¿Tendré asistencia en el lugar?',
    ],
    pt: [
      'Olá',
      'Como marcar consulta?',
      'Quais procedimentos oferecem?',
      'O que acontece em caso de complicações?',
      'Terei assistência no local?',
    ],
    it: [
      'Ciao',
      'Come prenotare un appuntamento?',
      'Quali procedure offrite?',
      'Cosa succede in caso di complicazioni?',
      'Avrò assistenza sul posto?',
    ],
    de: [
      'Hallo',
      'Wie kann ich einen Termin vereinbaren?',
      'Welche Verfahren bieten Sie an?',
      'Was passiert im Falle von Komplikationen?',
      'Werde ich vor Ort Unterstützung erhalten?',
    ]
  };

  private getRandomQuickQuestions(count: number = 3): string[] {
    const allQuestions = this.quickQuestionsByLanguage[this.selectedLanguage as keyof typeof this.quickQuestionsByLanguage] ||
      this.quickQuestionsByLanguage.fr;

    // Mélanger le tableau et prendre 'count' éléments aléatoires
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allQuestions.length));
  }

  ngOnInit() {
    this.loadHistory();
  }

  ngOnDestroy() {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      setTimeout(() => {
        this.sendWelcomeMessage();
      }, 300);
    }
  }

  changeLanguage() {
    localStorage.setItem('chatbot_language', this.selectedLanguage);
    this.addSystemMessage(`🌐 Langue changée en ${this.getLanguageName(this.selectedLanguage)}`);
    this.currentQuickQuestions = this.getRandomQuickQuestions(3);
  }

  getCurrentQuickQuestions(): string[] {
    return this.quickQuestionsByLanguage[this.selectedLanguage as keyof typeof this.quickQuestionsByLanguage] ||
      this.quickQuestionsByLanguage.fr;
  }

  getLanguageName(code: string): string {
    const lang = this.languages.find(l => l.code === code);
    return lang ? lang.name : 'Français';
  }

  sendMessage() {
    // Gestion du feedback
    if (this.awaitingFeedback) {
      const input = this.userInput.toLowerCase().trim();
      const knowledgeBase = this.knowledgeBase[this.selectedLanguage] || this.knowledgeBase['fr'];

      let feedbackResponse = "";

      // Chercher la réponse de feedback appropriée selon la langue
      if (input === 'oui' || input === 'yes' || input === 'sí' || input === 'sim' || input === 'ja' || input === 'sì') {
        const feedbackItem = knowledgeBase.find(item =>
          item.question === 'feedback_oui' ||
          item.question === 'feedback_yes' ||
          item.question === 'feedback_si' ||
          item.question === 'feedback_sim' ||
          item.question === 'feedback_ja' ||
          item.question === 'feedback_si' // pour l'italien (déjà dans la condition)
        );
        feedbackResponse = feedbackItem ? feedbackItem.answer : "Merci 😊";
      }
      else if (input === 'non' || input === 'no' || input === 'não' || input === 'nein') {
        const feedbackItem = knowledgeBase.find(item =>
          item.question === 'feedback_non' ||
          item.question === 'feedback_no' ||
          item.question === 'feedback_nao' ||
          item.question === 'feedback_nein'
        );
        feedbackResponse = feedbackItem ? feedbackItem.answer : `<a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">Contactez un agent TuniCure au (+44) 7403904850</a>`;
      }
      else {
        const feedbackItem = knowledgeBase.find(item => item.question === 'feedback_invalid');
        feedbackResponse = feedbackItem ? feedbackItem.answer : "Veuillez répondre par 'oui' ou 'non' s'il vous plaît.";
        this.awaitingFeedback = true;
        this.addBotMessage(feedbackResponse);
        this.userInput = '';
        return;
      }

      this.addBotMessage(feedbackResponse);
      this.awaitingFeedback = false;
      this.userInput = '';
      return;
    }

    // Logique normale d'envoi de message
    const message = this.userInput.trim();
    if (!message || this.isTyping) return;

    this.addUserMessage(message);
    this.userInput = '';

    this.isTyping = true;

    setTimeout(() => {
      const response = this.findResponse(message);

      // Sauvegarder la réponse en attente
      this.pendingBotResponse = {
        text: response.text,
        imageUrl: response.imageUrl
      };

      // Ajouter le message bot SANS la question de satisfaction immédiatement
      this.addBotMessage(response.text, response.imageUrl, false);

      // Vérifier si c'est une salutation pour ne PAS demander de feedback
      const greeting = this.detectGreeting(message);

      // Ne demander le feedback que si ce n'est pas une salutation
      if (!greeting.isGreeting) {
        // Déclencher la question de satisfaction après 2 secondes
        setTimeout(() => {
          this.askForFeedback();
        }, 2000);
      }

      this.isTyping = false;
    }, 500);
  }


  private askForFeedback() {
    if (this.awaitingFeedback) return;

    // Nettoyer le timeout précédent s'il existe
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    const knowledgeBase = this.knowledgeBase[this.selectedLanguage] || this.knowledgeBase['fr'];

    let question = "Êtes-vous satisfait de cette réponse ? (oui / non)";

    // Chercher la question de feedback appropriée selon la langue
    const satisfactionQuestions = {
      fr: "Êtes-vous satisfait de cette réponse ? (oui / non)",
      en: "Are you satisfied with this answer? (yes / no)",
      es: "¿Está satisfecho con esta respuesta? (sí / no)",
      pt: "Você está satisfeito com esta resposta? (sim / não)",
      de: "Sind Sie mit dieser Antwort zufrieden? (ja / nein)",
      it: "Sei soddisfatto di questa risposta? (sì / no)"

    };

    question = satisfactionQuestions[this.selectedLanguage as keyof typeof satisfactionQuestions] || satisfactionQuestions.fr;

    const message: ChatMessage = {
      id: (Date.now() + 2).toString(),
      text: question,
      sender: 'bot',
      timestamp: new Date()
    };

    this.messages.push(message);
    this.awaitingFeedback = true;
    this.saveHistory();
    this.scrollToBottom();

    // Timeout de sécurité : après 30 secondes sans réponse, sortir du mode feedback
    this.feedbackTimeout = setTimeout(() => {
      if (this.awaitingFeedback) {
        this.awaitingFeedback = false;
        const timeoutItem = knowledgeBase.find(item => item.question === 'feedback_timeout');
        const timeoutMessage = timeoutItem ? timeoutItem.answer : "Je reste disponible si vous avez d'autres questions ! 😊";
        this.addBotMessage(timeoutMessage);
      }
    }, 30000);
  }
  sendQuickQuestion(question: string) {
    this.userInput = question;
    this.sendMessage();
  }


  private detectGreeting(message: string): { isGreeting: boolean, response?: string } {
    const userMsg = message.toLowerCase().trim();
    const currentLang = this.selectedLanguage as keyof typeof this.greetings;
    const langGreetings = this.greetings[currentLang] || this.greetings.fr;

    // Vérifier si le message correspond à un pattern de salutation
    const isGreeting = langGreetings.patterns.some(pattern =>
      userMsg === pattern ||
      userMsg.includes(pattern) ||
      pattern.includes(userMsg)
    );

    if (isGreeting) {
      const responses = langGreetings.responses;
      return {
        isGreeting: true,
        response: responses[Math.floor(Math.random() * responses.length)]
      };
    }

    return { isGreeting: false };
  }


  // ================ MÉTHODES AMÉLIORÉES POUR LA RECHERCHE ================

  private findResponse(userMessage: string): { text: string, imageUrl?: string } {
    const userMsg = userMessage.toLowerCase().trim();

    // CORRECTION ORTHOGRAPHIQUE : Dictionnaire des fautes courantes par langue
    const spellingCorrections: Record<string, Record<string, string>> = {
      fr: {
        'procédures': 'procédures',
        'procedures': 'procédures', // sans accent
        'prosedures': 'procédures',
        'procedur': 'procédures',
        'procedure': 'procédures',
        'prosedure': 'procédures',
        'rendez-vous': 'rendez-vous',
        'rendezvous': 'rendez-vous',
        'rdv': 'rendez-vous',
        'complication': 'complication',
        'complicasion': 'complication',
        'assistance': 'assistance',
        'asistance': 'assistance'
      },
      en: {
        'procedures': 'procedures',
        'prosedures': 'procedures',
        'procedur': 'procedures',
        'procedure': 'procedures',
        'prosedure': 'procedures',
        'appointment': 'appointment',
        'apointment': 'appointment',
        'complications': 'complications',
        'complicasions': 'complications',
        'assistance': 'assistance',
        'asistance': 'assistance'
      },
      es: {
        'procedimientos': 'procedimientos',
        'prosedimientos': 'procedimientos',
        'procedimiento': 'procedimientos',
        'cita': 'cita',
        'citas': 'cita',
        'complicaciones': 'complicaciones',
        'complicasiones': 'complicaciones',
        'asistencia': 'asistencia',
        'asistensia': 'asistencia'
      },
      pt: {
        'procedimentos': 'procedimentos',
        'prosedimentos': 'procedimentos',
        'procedimento': 'procedimentos',
        'consulta': 'consulta',
        'consutas': 'consulta',
        'complicações': 'complicações',
        'complicacoes': 'complicações',
        'assistência': 'assistência',
        'assistencia': 'assistência'
      },
      de: {
        'verfahren': 'verfahren',
        'prozeduren': 'prozeduren',
        'termin': 'termin',
        'komplikationen': 'komplikationen',
        'hilfe': 'hilfe'
      },
      it: {
        'procedure': 'procedure',
        'procedimenti': 'procedure',
        'appuntamento': 'appuntamento',
        'complicazioni': 'complicazioni',
        'assistenza': 'assistenza'
      }
    };

    // Appliquer les corrections orthographiques pour la langue actuelle
    let correctedMsg = userMsg;
    const corrections = spellingCorrections[this.selectedLanguage];
    if (corrections) {
      for (const [misspelling, correct] of Object.entries(corrections)) {
        // Remplacer les fautes courantes par la forme correcte
        const regex = new RegExp(`\\b${misspelling}\\b`, 'gi');
        correctedMsg = correctedMsg.replace(regex, correct);
      }
    }

    // NETTOYAGE AVANCÉ DU MESSAGE UTILISATEUR (avec le message corrigé)
    const cleanMsg = correctedMsg
      .replace(/[?,.!;:]/g, '')
      .replace(/\b(le|la|les|un|une|des|du|de|je|tu|il|elle|nous|vous|ils|elles|ce|cet|cette|ces|mon|ton|son|ma|ta|sa|mes|tes|ses|et|ou|mais|donc|car|pour|dans|sur|sous|avec|sans|chez|quoi|qui|que|dont|où|est|sont|ai|as|a|avons|avez|ont|au|aux|en|y)\b/g, '')
      .trim();

    const knowledgeBase = this.knowledgeBase[this.selectedLanguage] || this.knowledgeBase['fr'];

    // 1. DÉTECTION DES QUESTIONS MULTIPLES (avec le message original ou corrigé)
    const sentences = this.splitQuestions(correctedMsg);
    if (sentences.length > 1) {
      return this.handleMultipleQuestions(sentences);
    }

    // 2. RECHERCHE PAR CORRESPONDANCE EXACTE (questions + synonyms)
    for (const qna of knowledgeBase) {
      // Vérifier avec le message corrigé
      if (qna.question.toLowerCase() === correctedMsg) {
        return { text: qna.answer, imageUrl: qna.imageUrl };
      }

      if (qna.synonyms?.some(synonym => synonym.toLowerCase() === correctedMsg)) {
        return { text: qna.answer, imageUrl: qna.imageUrl };
      }
    }

    // 3. RECHERCHE PAR MOTS-CLÉS AVEC SCORE
    let bestMatch: { qna: QnAPair, score: number } | null = null;

    for (const qna of knowledgeBase) {
      const score = this.calculateMatchScore(cleanMsg, qna);

      if (score > 0.7) {
        return { text: qna.answer, imageUrl: qna.imageUrl };
      }

      if (score > 0.3 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { qna, score };
      }
    }

    // 4. SI UNE CORRESPONDANCE PARTIELLE EST TROUVÉE
    if (bestMatch) {
      return {
        text: this.formatFriendlyResponse(bestMatch.qna.answer, bestMatch.score),
        imageUrl: bestMatch.qna.imageUrl
      };
    }

    // 5. RECHERCHE PAR SIMILARITÉ SÉMANTIQUE
    for (const qna of knowledgeBase) {
      if (this.calculateSemanticSimilarity(cleanMsg, qna.question.toLowerCase())) {
        return { text: qna.answer, imageUrl: qna.imageUrl };
      }
    }

    return {
      text: this.getDefaultResponse(),
      imageUrl: undefined
    };
  }

  private calculateMatchScore(cleanMsg: string, qna: QnAPair): number {
    const words = cleanMsg.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return 0;

    // Combiner tous les mots-clés pertinents
    const allKeywords = [
      ...qna.keywords,
      ...(qna.synonyms || []),
      ...this.expandKeywords(qna.keywords)
    ].map(k => k.toLowerCase());

    let matchCount = 0;
    for (const word of words) {
      for (const keyword of allKeywords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          matchCount++;
          break;
        }
      }
    }

    // Bonus pour les correspondances exactes
    for (const keyword of allKeywords) {
      if (cleanMsg.includes(keyword)) {
        matchCount += 0.5;
      }
    }

    return matchCount / words.length;
  }

  private expandKeywords(keywords: string[]): string[] {
    const expansions: Record<string, string[]> = {
      'rhinoplastie': ['nez', 'rhino', 'nasale', 'narine', 'nose'],
      'liposuccion': ['lipo', 'graisse', 'aspiration', 'amas graisseux', 'fat'],
      'mommy makeover': ['post-partum', 'après grossesse', 'maman', 'after pregnancy'],
      'tummy tuck': ['ventre', 'abdominoplastie', 'abdominal', 'stomach'],
      'ginoplastie': ['mâchoire', 'mandibule', 'angle', 'jaw'],
      'greffe': ['cheveux', 'capillaire', 'greffons', 'implant capillaire', 'hair'],
      'blépharoplastie': ['paupière', 'yeux', 'poches', 'eyelid'],
      'implants': ['seins', 'mammaire', 'poitrine', 'breast'],
      'réduction': ['mammaire', 'seins lourds', 'reduction'],
      'bbl': ['fesses', 'gluteaux', 'brésilien', 'butt'],
      'procédures': ['interventions', 'opérations', 'soins', 'chirurgies', 'procedures', 'treatments']
    };

    const expanded: string[] = [];
    for (const keyword of keywords) {
      for (const [key, values] of Object.entries(expansions)) {
        if (keyword.toLowerCase().includes(key) || key.includes(keyword.toLowerCase())) {
          expanded.push(...values);
        }
      }
    }

    return expanded;
  }

  private calculateSemanticSimilarity(msg: string, question: string): boolean {
    // Vérifier si la question contient des mots significatifs du message
    const msgWords = new Set(msg.split(/\s+/).filter(w => w.length > 3));
    const questionWords = new Set(question.split(/\s+/).filter(w => w.length > 3));

    let commonWords = 0;
    for (const word of msgWords) {
      if (questionWords.has(word)) {
        commonWords++;
      }
    }

    return commonWords >= 2; // Au moins 2 mots en commun
  }

  private splitQuestions(userMessage: string): string[] {
    // Détecter les séparateurs de questions
    const separators = [
      /\bet\b/i, /\bet\s+aussi\b/i, /\bou\b/i,
      /\?/g, /\bet\s+si\b/i, /\bpuis\b/i
    ];

    let messages = [userMessage];

    for (const separator of separators) {
      const newMessages: string[] = [];
      for (const msg of messages) {
        if (separator instanceof RegExp && separator.toString().includes('?')) {
          // Pour les points d'interrogation, on split mais on garde le ?
          const parts = msg.split(/(\?)/g);
          for (let i = 0; i < parts.length; i += 2) {
            if (parts[i].trim()) {
              newMessages.push(parts[i].trim() + (parts[i + 1] || ''));
            }
          }
        } else {
          const parts = msg.split(separator);
          newMessages.push(...parts.filter(p => p.trim()));
        }
      }
      messages = newMessages;
    }

    // Filtrer les messages vides
    return messages.filter(m => m.trim().length > 3);
  }

  private handleMultipleQuestions(sentences: string[]): { text: string, imageUrl?: string } {
    const knowledgeBase = this.knowledgeBase[this.selectedLanguage] || this.knowledgeBase['fr'];
    const responses: string[] = [];
    let mainImage: string | undefined;

    for (const sentence of sentences) {
      const cleanSentence = sentence.toLowerCase().trim();

      // Chercher une réponse pour chaque partie
      for (const qna of knowledgeBase) {
        const hasKeyword = qna.keywords.some(keyword =>
          cleanSentence.includes(keyword.toLowerCase())
        );

        if (hasKeyword) {
          responses.push(qna.answer);
          if (qna.imageUrl && !mainImage) {
            mainImage = qna.imageUrl;
          }
          break;
        }
      }
    }

    if (responses.length > 0) {
      const combinedResponse = responses.length === 1
        ? responses[0]
        : "Je vois que vous avez plusieurs questions ! 😊\n\n" +
        responses.map((r, i) => `${i + 1}. ${r}`).join('\n\n') +
        "\n\nEst-ce que cela répond à toutes vos interrogations ?";

      // Le WhatsApp sera ajouté automatiquement dans addBotMessage
      return { text: combinedResponse, imageUrl: mainImage };
    }

    return { text: this.getDefaultResponse() };
  }

  // ================ MÉTHODES DE FORMATAGE FRIENDLY ================

  private formatFriendlyResponse(answer: string, confidenceScore: number): string {
    // Retirer les salutations de la méthode car on les gère dans addBotMessage
    const confirmations = [
      "Ai-je bien répondu à votre question ? ",
      "Est-ce que cela répond à votre interrogation ? ",
      "N'hésitez pas si vous voulez plus de détails ! ",
      "Souhaitez-vous en savoir davantage ? "
    ];

    const friendlyTone = confidenceScore > 0.5
      ? "" // Plus besoin de salutation ici
      : "Je pense avoir compris votre question. ";

    const confirmation = Math.random() > 0.7
      ? confirmations[Math.floor(Math.random() * confirmations.length)]
      : "";

    return `${friendlyTone}${answer} ${confirmation}`.trim();
  }

  private getFriendlyFallback(): string {
    const fallbacks = {
      fr: [
        "Je ne suis pas sûr(e) d'avoir bien compris... Pouvez-vous reformuler votre question ? 😊",
        "Désolé(e), je n'ai pas la réponse exacte. Pourriez-vous être plus précis(e) ?",
        "Hum, je ne connais pas encore la réponse à cette question. Pouvez-vous me demander autre chose ?",
        "Je n'ai pas d'information sur ce sujet précis. Par contre, je peux vous renseigner sur nos procédures !",
        "Cette question est un peu hors de mon domaine. Demandez-moi plutôt sur une intervention spécifique !"
      ],
      en: [
        "I'm not sure I understood correctly... Could you rephrase your question? 😊",
        "Sorry, I don't have the exact answer. Could you be more specific?",
        "Hmm, I don't know the answer to that question yet. Could you ask me something else?",
        "I don't have information on this specific topic. However, I can inform you about our procedures!",
        "This question is a bit outside my domain. Ask me about a specific procedure instead!"
      ],
      es: [
        "No estoy seguro(a) de haber entendido bien... ¿Podría reformular su pregunta? 😊",
        "Lo siento, no tengo la respuesta exacta. ¿Podría ser más específico(a)?",
        "No conozco la respuesta a esa pregunta todavía. ¿Podría preguntarme otra cosa?",
        "No tengo información sobre este tema específico. ¡Pero puedo informarle sobre nuestros procedimientos!",
        "Esta pregunta está un poco fuera de mi dominio. ¡Pregúnteme mejor sobre una intervención específica!"
      ],
      pt: [
        "Não tenho certeza se entendi corretamente... Você poderia reformular sua pergunta? 😊",
        "Desculpe, não tenho a resposta exata. Você poderia ser mais específico(a)?",
        "Hmm, ainda não conheço a resposta para essa pergunta. Você poderia me perguntar outra coisa?",
        "Não tenho informações sobre este tópico específico. No entanto, posso informá-lo sobre nossos procedimentos!",
        "Esta pergunta está um pouco fora do meu domínio. Pergunte-me sobre um procedimento específico!"
      ],

      de: [
        "Ich bin nicht sicher, ob ich richtig verstanden habe... Könnten Sie Ihre Frage umformulieren? 😊",
        "Entschuldigung, ich habe keine genaue Antwort. Könnten Sie spezifischer sein?",
        "Hmm, ich kenne die Antwort auf diese Frage noch nicht. Könnten Sie mich etwas anderes fragen?",
        "Ich habe keine Informationen zu diesem speziellen Thema. Ich kann Sie aber über unsere Verfahren informieren!",
        "Diese Frage liegt etwas außerhalb meines Bereichs. Fragen Sie mich stattdessen nach einem bestimmten Eingriff!"
      ],
      it: [
        "Non sono sicuro di aver capito bene... Potresti riformulare la tua domanda? 😊",
        "Mi dispiace, non ho la risposta esatta. Potresti essere più specifico(a)?",
        "Hmm, non conosco ancora la risposta a questa domanda. Potresti chiedermi qualcos'altro?",
        "Non ho informazioni su questo argomento specifico. Posso però informarti sulle nostre procedure!",
        "Questa domanda è un po' fuori dal mio dominio. Chiedimi piuttosto su un intervento specifico!"
      ]
    };

    const currentFallbacks = fallbacks[this.selectedLanguage as keyof typeof fallbacks] || fallbacks.fr;
    return currentFallbacks[Math.floor(Math.random() * currentFallbacks.length)];
  }

  private sendWelcomeMessage() {
    const welcomeMessages = {
      fr: [
        "Je suis l'assistant de la TuniCure. Posez-moi vos questions sur nos procédures !",
        "Je suis là pour vous renseigner sur toutes nos interventions esthétiques. Comment puis-je vous aider ?",
        "Bienvenue ! Je peux vous informer sur nos procédures médicales et esthétiques."
      ],
      en: [
        "I am the TuniCure assistant. Ask me your questions about our procedures!",
        "I'm here to inform you about all our aesthetic procedures. How can I help you?",
        "Welcome! I can provide information about our medical and aesthetic procedures."
      ],
      es: [
        "Soy el asistente de TuniCure. ¡Hazme tus preguntas sobre nuestros procedimientos!",
        "Estoy aquí para informarte sobre todas nuestras intervenciones estéticas. ¿Cómo puedo ayudarte?",
        "¡Bienvenida! Puedo informarte sobre nuestros procedimientos médicos y estéticos."
      ],
      pt: [
        "Sou o assistente da TuniCure. Faça suas perguntas sobre nossos procedimentos!",
        "Estou aqui para informar sobre todas as nossas intervenções estéticas. Como posso ajudar?",
        "Bem-vinda! Posso informar sobre nossos procedimentos médicos e estéticos."
      ],
      de: [
        "Ich bin der TuniCure-Assistent. Stellen Sie mir Ihre Fragen zu unseren Verfahren!",
        "Ich bin hier, um Sie über alle unsere ästhetischen Eingriffe zu informieren. Wie kann ich Ihnen helfen?",
        "Willkommen! Ich kann Sie über unsere medizinischen und ästhetischen Verfahren informieren."
      ],
      it: [
        "Sono l'assistente di TuniCure. Fammi le tue domande sulle nostre procedure!",
        "Sono qui per informarti su tutti i nostri interventi estetici. Come posso aiutarti?",
        "Benvenuto! Posso fornirti informazioni sulle nostre procedure mediche ed estetiche."
      ]
    };

    const currentWelcome = welcomeMessages[this.selectedLanguage as keyof typeof welcomeMessages] || welcomeMessages.fr;
    const randomWelcome = currentWelcome[Math.floor(Math.random() * currentWelcome.length)];

    const message: ChatMessage = {
      id: Date.now().toString(),
      text: randomWelcome,
      sender: 'bot',
      timestamp: new Date()
    };
    this.messages.push(message);

    this.currentQuickQuestions = this.getRandomQuickQuestions(3);
    this.showQuickQuestions = true;

    this.saveHistory();
    this.scrollToBottom();
  }


  refreshQuickQuestions() {
    this.currentQuickQuestions = this.getRandomQuickQuestions(3);
  }
  private getDefaultResponse(): string {
    return this.getFriendlyFallback();
  }

  // ================ MÉTHODES EXISTANTES ================

  private addUserMessage(text: string) {
    const message: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    this.messages.push(message);

    this.showQuickQuestions = false;

    this.saveHistory();
    this.scrollToBottom();
  }

  private addBotMessage(text: string, imageUrl?: string, addWhatsApp: boolean = true) {
    const hasWhatsApp = text.includes('WhatsApp') || text.includes('Whatsapp');
    const currentGreetings = this.greetings[this.selectedLanguage as keyof typeof this.greetings] || this.greetings.fr;

    // Vérifier si c'est un message système ou de feedback
    const isSystemMessage = text.includes('🌐') || text.includes('🗑️') || text.includes('Historique');
    const isFeedbackMessage = text.includes('Êtes-vous satisfait') || text.includes('Merci') || text.includes('Contactez un agent');
    const isShortResponse = text.length < 50; // Messages courts comme "Merci 😊"

    let finalText = text;

    // N'AJOUTER UNE SALUTATION QUE SI :
    // - Ce n'est pas un message système
    // - Ce n'est pas un message de feedback
    // - Ce n'est pas une réponse courte
    // - Le texte ne commence pas déjà par une salutation
    if (!isSystemMessage && !isFeedbackMessage && !isShortResponse) {
      const startsWithGreeting = currentGreetings.responses.some(greeting =>
        text.startsWith(greeting.substring(0, 15))
      );

      if (!startsWithGreeting) {
        // NE PAS ajouter de salutation aléatoire
        // finalText = text; // On garde le texte tel quel
      }
    }

    // AJOUTER LE MESSAGE WHATSAPP UNIQUEMENT SI :
    // - addWhatsApp est true
    // - Ce n'est pas un message système
    // - Ce n'est pas un message de feedback
    // - Le texte ne contient pas déjà WhatsApp
    // - Ce n'est pas une réponse négative (non)
    if (addWhatsApp && !isSystemMessage && !isFeedbackMessage && !hasWhatsApp && !text.includes('non')) {
      // Ne pas ajouter WhatsApp aux réponses "non" ou "merci"
      const whatsappText = `\n\n${this.getWhatsappMessage(this.selectedLanguage)} ${this.whatsappNumber}`;

      // Ajouter WhatsApp uniquement si le texte n'est pas trop court
      if (text.length > 30) {
        finalText = text + whatsappText;
      } else {
        finalText = text;
      }
    } else {
      finalText = text;
    }

    const message: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: finalText,
      sender: 'bot',
      timestamp: new Date(),
      imageUrl: imageUrl
    };

    this.messages.push(message);
    this.saveHistory();
    this.scrollToBottom();
  }

  private addSystemMessage(text: string) {
    const message: ChatMessage = {
      id: `sys_${Date.now()}`,
      text: text,
      sender: 'bot',
      timestamp: new Date()
    };
    this.messages.push(message);
    this.saveHistory();
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      setTimeout(() => {
        if (this.scrollContainer?.nativeElement) {
          const element = this.scrollContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  private saveHistory() {
    localStorage.setItem('chatbot_history', JSON.stringify(this.messages));
  }

  private loadHistory() {
    const saved = localStorage.getItem('chatbot_history');
    const lang = localStorage.getItem('chatbot_language');

    if (lang) {
      this.selectedLanguage = lang;
    }

    if (saved) {
      try {
        this.messages = JSON.parse(saved).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error('Erreur chargement historique:', e);
      }
    }
  }

  clearChat() {
    this.messages = [];
    localStorage.removeItem('chatbot_history');

    const confirmationMessages = {
      fr: '🗑️ Historique effacé. Comment puis-je vous aider ?',
      en: '🗑️ History cleared. How can I help you?',
      es: '🗑️ Historial borrado. ¿Cómo puedo ayudarte?',
      pt: '🗑️ Histórico limpo. Como posso ajudá-lo?',
      de: '🗑️ Verlauf gelöscht. Wie kann ich Ihnen helfen?',
      it: '🗑️ Cronologia cancellata. Come posso aiutarti?'

    };

    this.addBotMessage(
      confirmationMessages[this.selectedLanguage as keyof typeof confirmationMessages] ||
      confirmationMessages.fr
    );
  }

  get clinicProcedures() {
    return [
      'Ginoplastie',
      'Rhinoplastie (Piezo & Classique)',
      'Mommy Makeover',
      'Liposuccion',
      'Tummy Tuck (Abdominoplastie)',
      'Body Lift',
      'Buttock Augmentation',
      'Breast Augmentation',
      'Breast Reduction',
      'Mastopexy / Breast Lift',
      'Breast Reconstruction',
      'Breast Implant Exchange / Removal',
      'Laser Vaginal Rejuvenation',
      'BBL (Brazilian Butt Lift)',
      'Sleeve gastrique',
      'Greffe capillaire',
      'Blépharoplastie',
      'Avancement de la ligne frontale',
      'Lip Lift',
      'Neck Lift',
      'Facial & Neck Lift',
      'Bichectomie',
      'Canthopexie',
      'Facial Fat Grafting (Lipofilling visage)',
      'Brow Lift (Lifting des sourcils)',
      'Otoplastie (oreilles décollées)',
      'Dimpleplastie (création de fossettes)',
      'Génioplastie (chirurgie du menton)',
      'Cruroplastie (lifting des cuisses)',
      'Brachioplastie (lifting des bras)',
      'LASIK',
      'Chirurgie de la cataracte',
      'Bypass gastrique'
    ];
  }

  addNewQnA(question: string, answer: string, language: string = 'fr') {
    const newPair: QnAPair = {
      question: question,
      answer: answer,
      keywords: question.toLowerCase().split(' ')
    };

    if (!this.knowledgeBase[language]) {
      this.knowledgeBase[language] = [];
    }

    this.knowledgeBase[language].push(newPair);
    localStorage.setItem('chatbot_knowledge', JSON.stringify(this.knowledgeBase));
  }

  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
    this.isImageModalOpen = true;
  }

  closeImageModal() {
    this.isImageModalOpen = false;
    this.selectedImage = null;
  }

  private getWhatsappMessage(language: string): string {
    const messages = {
      fr: `pour plus d'informations, <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">contactez-nous sur WhatsApp</a>`,
      en: `for more information, <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">contact us on WhatsApp</a>`,
      es: `para más información, <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">contáctenos en WhatsApp</a>`,
      pt: `para mais informações, <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">entre em contato conosco no WhatsApp</a> `,
      de: `für weitere Informationen, <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">kontaktieren Sie uns auf WhatsApp</a>`,
      it: `per maggiori informazioni, <a href="${this.whatsappLink}" target="_blank" class="whatsapp-link">contattaci su WhatsApp</a>`
    };
    return messages[language as keyof typeof messages] || messages.fr;
  }

  handleMessageClick(event: Event, message: ChatMessage) {
    const target = event.target as HTMLElement;

    // Vérifier si l'élément cliqué est un lien avec la classe chat-link-order
    if (target.tagName === 'A' && target.classList.contains('chat-link-order')) {
      event.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        this.router.navigateByUrl(href);
      }
      setTimeout(() => {
        const element = document.getElementById('order');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }

}

