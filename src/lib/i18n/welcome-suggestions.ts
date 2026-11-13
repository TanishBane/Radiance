import type { SuggestionItem } from "@/lib/chat/welcome-suggestions";
import type { UiLanguage } from "@/lib/i18n/ui";

type Category = "understand" | "create" | "explore";
type LocalizedCopy = Record<Category, Record<string, readonly [label: string, prompt: string]>>;
type Topic = Record<string, string>;

const LOCALES: Partial<Record<UiLanguage, { topics: Topic; copy: LocalizedCopy }>> = {
  hi: {
    topics: { technology: "टेक", travel: "यात्रा", cooking: "खाना", books: "किताबें", gardening: "पौधे", writing: "लेखन", games: "खेल", career: "करियर", design: "डिज़ाइन", general: "कुछ नया" },
    copy: {
      understand: {
        foundations: ["{topic} की बुनियाद", "{topic} को एक आसान उदाहरण से समझाएँ।"], misconceptions: ["{topic} के मिथक", "{topic} के आम मिथक क्या हैं और सच क्या है?"], "deep-dive": ["{topic} को करीब से जानें", "{topic} का छोटा परिचय और मुख्य बातें बताएँ।"], compare: ["{topic} के तरीकों की तुलना", "{topic} के उपयोगी तरीकों की तुलना करें।"], questions: ["{topic} पर सवाल", "{topic} सीखते समय मुझे क्या पूछना चाहिए?"], "real-world": ["{topic} का अभ्यास", "{topic} को रोज़मर्रा के उदाहरण से समझाएँ।"],
      },
      create: {
        "starter-plan": ["{topic} की शुरुआत", "{topic} के लिए आसान चरण-दर-चरण योजना बनाएँ।"], project: ["छोटा {topic} प्रोजेक्ट", "ऐसा छोटा {topic} प्रोजेक्ट सुझाएँ जो मैं इस सप्ताहांत पूरा कर सकूँ।"], checklist: ["{topic} की चेकलिस्ट", "{topic} में आगे बढ़ने के लिए छोटी चेकलिस्ट बनाएँ।"], routine: ["{topic} की साप्ताहिक दिनचर्या", "{topic} के लिए व्यावहारिक साप्ताहिक दिनचर्या सुझाएँ।"], "personal-guide": ["{topic} सीखने की गाइड", "मेरे {topic} लक्ष्यों के लिए सीखने की गाइड बनाएँ।"], challenge: ["{topic} चुनौती", "{topic} से जुड़ी व्यावहारिक चुनौती दें।"],
      },
      explore: {
        "new-directions": ["{topic} के नए विचार", "{topic} में कौन-सी दिलचस्प दिशाएँ खोजी जा सकती हैं?"], connections: ["{topic} के संबंध", "{topic} को किसी दूसरे उपयोगी क्षेत्र से जोड़ें।"], "real-world-uses": ["असली दुनिया में {topic}", "{topic} के कुछ चौंकाने वाले वास्तविक उपयोग बताएँ।"], "recent-ideas": ["{topic} में नया क्या है", "कौन-से नए विचार {topic} के बारे में सोच बदल रहे हैं?"], perspectives: ["{topic} के नज़रिए", "{topic} पर तीन अलग-अलग नज़रिए बताएँ।"], "next-steps": ["{topic} के अगले कदम", "{topic} को आगे जानने के कुछ उपयोगी कदम सुझाएँ।"],
      },
    },
  },
  es: {
    topics: { technology: "tecnología", travel: "viajes", cooking: "cocina", books: "libros", gardening: "plantas", writing: "escritura", games: "juegos", career: "carrera", design: "diseño", general: "algo nuevo" },
    copy: {
      understand: {
        foundations: ["Bases de {topic}", "Explícame las bases de {topic} con un ejemplo práctico."], misconceptions: ["Mitos de {topic}", "¿Qué mitos comunes hay sobre {topic} y qué es cierto?"], "deep-dive": ["Una mirada a {topic}", "Dame una introducción breve a {topic} y sus ideas clave."], compare: ["Compara enfoques de {topic}", "Compara enfoques útiles de {topic}."], questions: ["Preguntas sobre {topic}", "¿Qué debería preguntar al aprender {topic}?"], "real-world": ["{topic} en la práctica", "Muéstrame {topic} con un ejemplo cotidiano."],
      },
      create: {
        "starter-plan": ["Plan inicial de {topic}", "Crea un plan sencillo, paso a paso, para {topic}."], project: ["Mini proyecto de {topic}", "Sugiere un proyecto pequeño de {topic} que pueda terminar este fin de semana."], checklist: ["Lista de {topic}", "Crea una lista breve para avanzar con {topic}."], routine: ["Rutina semanal de {topic}", "Sugiere una rutina semanal realista para {topic}."], "personal-guide": ["Guía para aprender {topic}", "Crea una guía de aprendizaje para mis objetivos de {topic}."], challenge: ["Reto de {topic}", "Propón un reto práctico sobre {topic}."],
      },
      explore: {
        "new-directions": ["Nuevas ideas de {topic}", "¿Qué caminos interesantes puedo explorar en {topic}?"], connections: ["Conexiones de {topic}", "Relaciona {topic} con otro campo útil."], "real-world-uses": ["{topic} en el mundo real", "Comparte usos sorprendentes de {topic} en la vida real."], "recent-ideas": ["Novedades de {topic}", "¿Qué ideas nuevas están cambiando cómo se entiende {topic}?"], perspectives: ["Perspectivas de {topic}", "Muéstrame tres perspectivas sobre {topic}."], "next-steps": ["Próximos pasos en {topic}", "Recomienda próximos pasos para explorar {topic}."],
      },
    },
  },
  fr: {
    topics: { technology: "tech", travel: "voyages", cooking: "cuisine", books: "livres", gardening: "plantes", writing: "écriture", games: "jeux", career: "carrière", design: "design", general: "nouveau sujet" },
    copy: {
      understand: {
        foundations: ["Bases de {topic}", "Explique les bases de {topic} avec un exemple concret."], misconceptions: ["Idées reçues sur {topic}", "Quelles idées reçues sur {topic} sont fausses ?"], "deep-dive": ["Mieux comprendre {topic}", "Présente brièvement {topic} et ses idées clés."], compare: ["Comparer les approches de {topic}", "Compare les approches utiles de {topic}."], questions: ["Questions sur {topic}", "Que devrais-je demander pour apprendre {topic} ?"], "real-world": ["{topic} en pratique", "Illustre {topic} avec un exemple concret du quotidien."],
      },
      create: {
        "starter-plan": ["Débuter avec {topic}", "Crée un plan simple pour débuter avec {topic}."], project: ["Mini-projet de {topic}", "Propose un petit projet sur {topic} à terminer ce week-end."], checklist: ["Liste pour {topic}", "Crée une courte liste pour progresser en {topic}."], routine: ["Routine hebdo de {topic}", "Propose une routine hebdomadaire réaliste pour {topic}."], "personal-guide": ["Guide pour apprendre {topic}", "Crée un guide adapté à mes objectifs en {topic}."], challenge: ["Défi autour de {topic}", "Propose-moi un défi pratique autour de {topic}."],
      },
      explore: {
        "new-directions": ["Nouvelles idées en {topic}", "Quelles pistes intéressantes explorer en {topic} ?"], connections: ["Liens avec {topic}", "Relie {topic} à un autre domaine utile."], "real-world-uses": ["{topic} dans la vie réelle", "Donne des exemples surprenants de {topic} dans la vie réelle."], "recent-ideas": ["Quoi de neuf en {topic}", "Quelles idées nouvelles font évoluer {topic} ?"], perspectives: ["Regards sur {topic}", "Présente trois points de vue sur {topic}."], "next-steps": ["Suite de {topic}", "Suggère quelques étapes pour approfondir {topic}."],
      },
    },
  },
  de: {
    topics: { technology: "Technik", travel: "Reisen", cooking: "Kochen", books: "Bücher", gardening: "Pflanzen", writing: "Schreiben", games: "Spiele", career: "Karriere", design: "Design", general: "Neues" },
    copy: {
      understand: {
        foundations: ["{topic}-Grundlagen", "Erkläre die Grundlagen von {topic} an einem praktischen Beispiel."], misconceptions: ["{topic}-Mythen", "Welche verbreiteten Mythen über {topic} stimmen nicht?"], "deep-dive": ["{topic} genauer ansehen", "Gib mir eine kurze Einführung in {topic} und die wichtigsten Ideen."], compare: ["{topic}-Ansätze vergleichen", "Vergleiche hilfreiche Ansätze zu {topic}."], questions: ["Fragen zu {topic}", "Was sollte ich beim Lernen über {topic} fragen?"], "real-world": ["{topic} in der Praxis", "Zeige {topic} an einem praktischen Alltagsbeispiel."],
      },
      create: {
        "starter-plan": ["{topic}-Startplan", "Erstelle einen einfachen Schritt-für-Schritt-Plan für {topic}."], project: ["Kleines {topic}-Projekt", "Schlage ein kleines {topic}-Projekt fürs Wochenende vor."], checklist: ["{topic}-Checkliste", "Erstelle eine kurze Checkliste für Fortschritte bei {topic}."], routine: ["{topic}-Wochenplan", "Schlage eine realistische Wochenroutine für {topic} vor."], "personal-guide": ["{topic}-Lernhilfe", "Erstelle einen Lernleitfaden für meine {topic}-Ziele."], challenge: ["{topic}-Herausforderung", "Gib mir eine praktische Herausforderung zu {topic}."],
      },
      explore: {
        "new-directions": ["Neue {topic}-Ideen", "Welche spannenden Richtungen kann ich bei {topic} erkunden?"], connections: ["{topic}-Verbindungen", "Verbinde {topic} mit einem anderen nützlichen Bereich."], "real-world-uses": ["{topic} im Alltag", "Nenne überraschende Anwendungen von {topic} im Alltag."], "recent-ideas": ["Neues zu {topic}", "Welche neuen Ideen verändern den Blick auf {topic}?"], perspectives: ["{topic}-Perspektiven", "Zeige mir drei Perspektiven auf {topic}."], "next-steps": ["Nächste Schritte für {topic}", "Empfiehl nächste Schritte, um {topic} zu vertiefen."],
      },
    },
  },
  pt: {
    topics: { technology: "tecnologia", travel: "viagens", cooking: "culinária", books: "livros", gardening: "plantas", writing: "escrita", games: "jogos", career: "carreira", design: "design", general: "algo novo" },
    copy: {
      understand: {
        foundations: ["Fundamentos de {topic}", "Explique os fundamentos de {topic} com um exemplo prático."], misconceptions: ["Mitos sobre {topic}", "Quais mitos sobre {topic} não são verdadeiros?"], "deep-dive": ["Entenda melhor {topic}", "Apresente {topic} de forma breve e destaque as ideias principais."], compare: ["Compare abordagens de {topic}", "Compare abordagens úteis para {topic}."], questions: ["Perguntas sobre {topic}", "O que devo perguntar ao aprender {topic}?"], "real-world": ["{topic} na prática", "Mostre {topic} com um exemplo prático do dia a dia."],
      },
      create: {
        "starter-plan": ["Plano inicial de {topic}", "Crie um plano simples, passo a passo, para {topic}."], project: ["Mini projeto de {topic}", "Sugira um pequeno projeto de {topic} para terminar neste fim de semana."], checklist: ["Lista de {topic}", "Crie uma lista curta para avançar em {topic}."], routine: ["Rotina semanal de {topic}", "Sugira uma rotina semanal realista para {topic}."], "personal-guide": ["Guia de aprendizado de {topic}", "Crie um guia de aprendizado para meus objetivos em {topic}."], challenge: ["Desafio de {topic}", "Proponha um desafio prático sobre {topic}."],
      },
      explore: {
        "new-directions": ["Novas ideias de {topic}", "Que caminhos interessantes posso explorar em {topic}?"], connections: ["Conexões de {topic}", "Relacione {topic} a outra área útil."], "real-world-uses": ["{topic} no mundo real", "Compartilhe usos surpreendentes de {topic} no dia a dia."], "recent-ideas": ["Novidades em {topic}", "Que ideias novas estão mudando a forma de ver {topic}?"], perspectives: ["Perspectivas sobre {topic}", "Mostre três perspectivas sobre {topic}."], "next-steps": ["Próximos passos em {topic}", "Sugira próximos passos para explorar {topic}."],
      },
    },
  },
  ja: {
    topics: { technology: "テクノロジー", travel: "旅行", cooking: "料理", books: "本", gardening: "植物", writing: "文章", games: "ゲーム", career: "キャリア", design: "デザイン", general: "新しいこと" },
    copy: {
      understand: {
        foundations: ["{topic}の基本", "実例を使って{topic}の基本を説明してください。"], misconceptions: ["{topic}のよくある誤解", "{topic}についてのよくある誤解と事実を教えてください。"], "deep-dive": ["{topic}を詳しく知る", "{topic}の概要と重要な考え方を簡潔に教えてください。"], compare: ["{topic}の方法を比較", "{topic}の役立つ方法を比較してください。"], questions: ["{topic}についての質問", "{topic}を学ぶとき、何を質問すべきですか？"], "real-world": ["実生活での{topic}", "日常の例で{topic}を説明してください。"],
      },
      create: {
        "starter-plan": ["{topic}の始め方", "{topic}を始める簡単な手順を作ってください。"], project: ["小さな{topic}プロジェクト", "週末に完成できる小さな{topic}の企画を提案してください。"], checklist: ["{topic}のチェックリスト", "{topic}を進めるための短いチェックリストを作ってください。"], routine: ["{topic}の週間習慣", "{topic}に取り組む現実的な週間習慣を提案してください。"], "personal-guide": ["{topic}の学習ガイド", "私の{topic}の目標に合わせた学習ガイドを作ってください。"], challenge: ["{topic}のチャレンジ", "{topic}に関する実践的な課題を出してください。"],
      },
      explore: {
        "new-directions": ["新しい{topic}のアイデア", "{topic}で次に探求できる面白い方向性は何ですか？"], connections: ["{topic}とのつながり", "{topic}を別の役立つ分野と結びつけてください。"], "real-world-uses": ["現実世界での{topic}", "{topic}の意外な実用例を教えてください。"], "recent-ideas": ["最近の{topic}の動向", "{topic}への見方を変える新しい考え方は何ですか？"], perspectives: ["{topic}の視点", "{topic}について3つの視点を紹介してください。"], "next-steps": ["{topic}の次の一歩", "{topic}をさらに探るための次の一歩を提案してください。"],
      },
    },
  },
};

export function localizeWelcomeSuggestion(item: SuggestionItem, language: UiLanguage): SuggestionItem {
  const locale = LOCALES[language];
  if (!locale) return item;

  const [category, topicId, templateId] = item.id.split(":");
  const pair = locale.copy[category as Category]?.[templateId];
  if (!pair) return item;

  const topic = locale.topics[topicId] ?? locale.topics.general;
  return {
    ...item,
    label: pair[0].replaceAll("{topic}", topic),
    prompt: pair[1].replaceAll("{topic}", topic),
  };
}
