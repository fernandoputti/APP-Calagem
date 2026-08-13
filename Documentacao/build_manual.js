const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, PageBreak, LevelFormat,
} = require("docx");
const fs = require("fs");

const VERDE = "1B5E20";
const MARROM = "6B4A34";
const CINZA_BORDA = "CCCCCC";

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: CINZA_BORDA },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: CINZA_BORDA },
  left: { style: BorderStyle.SINGLE, size: 4, color: CINZA_BORDA },
  right: { style: BorderStyle.SINGLE, size: 4, color: CINZA_BORDA },
};

function h1(texto) { return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 160 } }); }
function h2(texto) { return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } }); }
function p(texto, opts = {}) { return new Paragraph({ children: [new TextRun({ text: texto, ...opts })], spacing: { after: 160 } }); }
function bullet(texto) { return new Paragraph({ text: texto, numbering: { reference: "lista-padrao", level: 0 }, spacing: { after: 80 } }); }

function celula(texto, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.header ? { type: ShadingType.CLEAR, fill: VERDE } : undefined,
    borders: cellBorders,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: texto, bold: !!opts.header, color: opts.header ? "FFFFFF" : undefined, size: 20 })] })],
  });
}
function tabela(colWidths, linhas) {
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: linhas.map((linha, i) => new TableRow({ children: linha.map((texto, j) => celula(texto, { width: colWidths[j], header: i === 0 })) })),
  });
}

const capa = [
  new Paragraph({ spacing: { before: 2000 }, children: [] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CalTEC - Calagem", bold: true, size: 56, color: VERDE })], spacing: { after: 100 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Módulo IAC (Saturação por Bases)", size: 26, color: MARROM })], spacing: { after: 200 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Manual de Instalação e Uso", size: 32, color: MARROM })], spacing: { after: 600 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Versão 1.0 — 13/08/2026", size: 22 })], spacing: { after: 100 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Universidade Estadual Paulista (UNESP)", size: 22 })], spacing: { after: 40 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Universidade do Oeste Paulista (UNOESTE)", size: 22 })], spacing: { after: 40 } }),
  new Paragraph({ children: [new PageBreak()] }),
];

const doc = new Document({
  numbering: { config: [{ reference: "lista-padrao", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 480, hanging: 260 } } } }] }] },
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, color: VERDE }, paragraph: { spacing: { before: 320, after: 160 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, color: MARROM }, paragraph: { spacing: { before: 240, after: 120 } } },
    ],
  },
  sections: [{
    properties: {},
    children: [
      ...capa,

      h1("1. Introdução"),
      p("Este é o Módulo IAC do CalTEC-Calagem: um software para cálculo da necessidade de calagem (NC) em solos agrícolas pelo método da Saturação por Bases (V%), conforme o Boletim Técnico 100 do Instituto Agronômico de Campinas (IAC)."),
      p("Esta versão está disponível em duas plataformas:"),
      tabela([3200, 6300], [
        ["Variante", "Descrição"],
        ["CalculadoraCalagem_IAC.exe", "Aplicativo desktop para Windows, executável standalone"],
        ["iac.html", "Aplicativo web (PWA), funciona offline após o primeiro acesso"],
      ]),

      h1("2. Requisitos do Sistema"),
      h2("2.1 Versão Desktop"),
      bullet("Windows 10 ou 11 (64 bits)."),
      bullet("Não é necessário instalar Python: o executável é autossuficiente."),
      h2("2.2 Versão Web"),
      bullet("Navegador atualizado: Chrome, Edge ou Firefox."),
      bullet("Conexão à internet necessária apenas no primeiro acesso."),

      h1("3. Instalação"),
      h2("3.1 Versão Desktop (.exe)"),
      bullet("Copie o arquivo CalculadoraCalagem_IAC.exe para o computador e dê duplo clique — não há instalação."),
      bullet("Se o Windows exibir o aviso do SmartScreen, clique em \"Mais informações\" e depois em \"Executar assim mesmo\"."),
      h2("3.2 Versão Web (PWA)"),
      bullet("Acesse a página do aplicativo pelo navegador."),
      bullet("Para instalar no celular ou computador, use a opção \"Instalar aplicativo\" ou \"Adicionar à tela inicial\" do navegador."),

      h1("4. Utilização"),
      p("Campos solicitados:"),
      tabela([2600, 6900], [
        ["Campo", "Descrição"],
        ["CTC a pH 7,0", "Capacidade de troca catiônica do solo. Selecione a unidade correta: cmolc/dm³ ou mmolc/dm³ (comum em laudos padrão IAC/SP). Usar a unidade errada altera o resultado em 10 vezes."],
        ["V1 (%)", "Saturação por bases atual do solo, obtida no laudo de análise."],
        ["V2 (%)", "Saturação por bases desejada para a cultura (ex.: 70% para milho)."],
        ["PRNT (%)", "Poder Relativo de Neutralização Total do calcário a ser utilizado."],
        ["Área (ha)", "Opcional. Se informada, o programa também calcula o total de calcário para a área."],
      ]),
      p("Fórmula aplicada: NC (t/ha) = CTC × (V2 − V1) / PRNT."),
      p("Exemplo: CTC = 14,02 cmolc/dm³; V1 = 42,22%; V2 = 70%; PRNT = 85% → NC = 4,582 t/ha."),
      p("Se V2 for menor ou igual a V1, o programa informa que não há necessidade de calagem."),

      h1("5. Mensagens do Sistema"),
      tabela([3400, 6100], [
        ["Mensagem", "Significado / o que fazer"],
        ["\"Preencha os campos numéricos corretamente.\"", "Algum campo está vazio ou contém texto não numérico. Use ponto ou vírgula como separador decimal."],
        ["\"Solo já está com saturação por bases igual ou acima da desejada...\"", "V2 ≤ V1: o solo já atingiu a saturação por bases desejada."],
      ]),

      h1("6. Referência Bibliográfica"),
      p("RAIJ, B. van; CANTARELLA, H.; QUAGGIO, J. A.; FURLANI, A. M. C. Recomendações de adubação e calagem para o estado de São Paulo. 2. ed. Campinas: Instituto Agronômico (IAC), 1996. (Boletim Técnico, 100)."),

      h1("7. Autoria e Suporte"),
      p("Titular: Fernando Ferrari Putti — Universidade Estadual Paulista (UNESP)."),
      p("Coautoria: Jéssica Pigatto de Queiroz Barcelos — Universidade do Oeste Paulista (UNOESTE)."),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Manual_Instalacao_Uso_CalTEC-Calagem-IAC.docx", buffer);
  console.log("Manual (IAC) gerado com sucesso.");
});
